/**
 * DATASET MANAGEMENT SERVICE
 * Handles: dataset source catalog, import jobs, quality tracking.
 * 
 * SAFETY RULES (sesuai Master Prompt):
 *  - NULL nutrition ≠ 0  → ditandai MISSING, bukan diubah menjadi nol
 *  - NULL price ≠ free  → ditandai missing_price, resep tidak masuk optimizer
 *  - Impor idempotent   → menjalankan file yang sama dua kali tidak menduplikasi data
 */

const db = require('../database/connection');
const crypto = require('crypto');

// ── READ: Dataset Sources Catalog ─────────────────────────────
async function getDatasetSources() {
    const [rows] = await db.query(`
        SELECT 
            ds.*,
            (SELECT COUNT(*) FROM dataset_import_jobs dij WHERE dij.dataset_source_id = ds.id) AS import_count,
            (SELECT MAX(dij.created_at) FROM dataset_import_jobs dij WHERE dij.dataset_source_id = ds.id) AS last_job_at
        FROM dataset_sources ds
        ORDER BY ds.type, ds.name
    `);
    return rows;
}

async function getDatasetSourceBySlug(slug) {
    const [rows] = await db.query(`
        SELECT ds.*,
            (SELECT COUNT(*) FROM dataset_import_jobs dij WHERE dij.dataset_source_id = ds.id AND dij.status = 'COMPLETED') AS completed_imports
        FROM dataset_sources ds WHERE ds.slug = ?
    `, [slug]);
    return rows[0] || null;
}

// ── READ: Database Summary Stats (real numbers) ─────────────
async function getDatabaseStats() {
    const [[recipeStats]] = await db.query(`
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN data_status = 'VALID' OR data_status = 'SEED' THEN 1 ELSE 0 END) AS valid_count,
            SUM(CASE WHEN data_status = 'NEEDS_REVIEW' THEN 1 ELSE 0 END) AS review_count,
            SUM(CASE WHEN data_status = 'INVALID' THEN 1 ELSE 0 END) AS invalid_count,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_count,
            SUM(CASE WHEN nutrition_completeness = 'MISSING' THEN 1 ELSE 0 END) AS missing_nutrition,
            SUM(CASE WHEN price_completeness = 'MISSING' THEN 1 ELSE 0 END) AS missing_price
        FROM recipes
    `);

    const [[ingStats]] = await db.query(`
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN data_status = 'NEEDS_REVIEW' THEN 1 ELSE 0 END) AS review_count,
            COUNT(DISTINCT category) AS categories
        FROM ingredients
    `);

    const [[nutritionStats]] = await db.query(`
        SELECT COUNT(*) AS total FROM ingredient_nutrition
        WHERE data_status != 'MISSING'
    `);

    const [[priceStats]] = await db.query(`
        SELECT COUNT(*) AS total FROM ingredient_prices
        WHERE data_status != 'MISSING'
    `);

    const [[mappingStats]] = await db.query(`
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
        FROM ingredient_mappings
    `);

    // Recipe that optimizer CAN safely use (has price + nutrition)
    const [[optimizerReady]] = await db.query(`
        SELECT COUNT(*) AS count FROM recipes 
        WHERE is_active = 1 
          AND data_status IN ('SEED','VALID','IMPORTED')
          AND nutrition_completeness != 'MISSING'
          AND price_completeness != 'MISSING'
    `);

    return {
        recipes: {
            total: recipeStats.total || 0,
            valid: recipeStats.valid_count || 0,
            needs_review: recipeStats.review_count || 0,
            invalid: recipeStats.invalid_count || 0,
            inactive: recipeStats.inactive_count || 0,
            missing_nutrition: recipeStats.missing_nutrition || 0,
            missing_price: recipeStats.missing_price || 0,
            optimizer_ready: optimizerReady.count || 0,
        },
        ingredients: {
            total: ingStats.total || 0,
            needs_review: ingStats.review_count || 0,
            categories: ingStats.categories || 0,
        },
        nutrition_records: nutritionStats.total || 0,
        price_records: priceStats.total || 0,
        mappings: mappingStats || { total: 0, pending: 0, approved: 0, rejected: 0 },
        last_updated: new Date().toISOString(),
    };
}

// ── READ: Import Jobs ────────────────────────────────────────
async function getImportJobs(sourceId = null, limit = 20) {
    const where = sourceId ? 'WHERE dij.dataset_source_id = ?' : '';
    const params = sourceId ? [sourceId, limit] : [limit];
    const [rows] = await db.query(`
        SELECT dij.*, u.name AS triggered_by_name, ds.name AS source_name
        FROM dataset_import_jobs dij
        LEFT JOIN users u ON u.id = dij.triggered_by
        LEFT JOIN dataset_sources ds ON ds.id = dij.dataset_source_id
        ${where}
        ORDER BY dij.created_at DESC
        LIMIT ?
    `, params);
    return rows;
}

async function getJobErrors(jobId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await db.query(
        'SELECT COUNT(*) AS total FROM dataset_import_errors WHERE import_job_id = ?', [jobId]
    );
    const [rows] = await db.query(
        `SELECT * FROM dataset_import_errors WHERE import_job_id = ? ORDER BY row_number LIMIT ? OFFSET ?`,
        [jobId, limit, offset]
    );
    return { total, page, limit, errors: rows };
}

// ── READ: Ingredient Mappings (perlu review) ─────────────────
async function getPendingMappings(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM ingredient_mappings WHERE status = 'PENDING'`
    );
    const [rows] = await db.query(`
        SELECT im.*, i.name AS mapped_name, i.category AS mapped_category, ds.name AS source_name
        FROM ingredient_mappings im
        LEFT JOIN ingredients i ON i.id = im.mapped_ingredient_id
        LEFT JOIN dataset_sources ds ON ds.id = im.source_id
        WHERE im.status = 'PENDING'
        ORDER BY im.confidence DESC, im.created_at ASC
        LIMIT ? OFFSET ?
    `, [limit, offset]);
    return { total, page, limit, items: rows };
}

// ── WRITE: Approve / Reject Mapping ─────────────────────────
async function resolveMappingDecision(mappingId, decision, reviewerId, targetIngredientId = null) {
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
        throw new Error('decision must be APPROVED or REJECTED');
    }
    const updates = {
        status: decision,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
    };
    if (decision === 'APPROVED' && targetIngredientId) {
        updates.mapped_ingredient_id = targetIngredientId;
    }
    await db.query('UPDATE ingredient_mappings SET ? WHERE id = ?', [updates, mappingId]);
    return { ok: true };
}

// ── WRITE: Create Import Job ──────────────────────────────────
async function createImportJob(sourceId, userId, filename, fileSize, format) {
    const [result] = await db.query(
        `INSERT INTO dataset_import_jobs 
            (dataset_source_id, triggered_by, filename, file_size_bytes, file_format, status, started_at)
         VALUES (?, ?, ?, ?, ?, 'PROCESSING', NOW())`,
        [sourceId, userId, filename, fileSize, format]
    );
    return result.insertId;
}

async function updateImportJob(jobId, updates) {
    await db.query('UPDATE dataset_import_jobs SET ? WHERE id = ?', [updates, jobId]);
}

async function logImportError(jobId, rowNumber, fieldName, errorCode, errorMsg, rawValue) {
    await db.query(
        `INSERT INTO dataset_import_errors (import_job_id, row_number, field_name, error_code, error_msg, raw_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [jobId, rowNumber, fieldName, errorCode, errorMsg, String(rawValue || '').slice(0, 500)]
    );
}

// ── WRITE: Update Dataset Source Status ──────────────────────
async function updateSourceStatus(sourceId, status, counts = {}) {
    const updates = {
        status,
        last_imported_at: new Date(),
        ...counts,
    };
    await db.query('UPDATE dataset_sources SET ? WHERE id = ?', [updates, sourceId]);
}

module.exports = {
    getDatasetSources,
    getDatasetSourceBySlug,
    getDatabaseStats,
    getImportJobs,
    getJobErrors,
    getPendingMappings,
    resolveMappingDecision,
    createImportJob,
    updateImportJob,
    logImportError,
    updateSourceStatus,
};
