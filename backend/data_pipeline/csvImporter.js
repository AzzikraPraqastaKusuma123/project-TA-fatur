/**
 * CSV IMPORTER PIPELINE
 * Mendukung format: CSV dengan kolom yang dinormalisasi.
 * 
 * Kontrak keamanan:
 *  - Idempotent: menjalankan file yang sama tidak menduplikasi data
 *  - Nutrisi NULL tetap NULL (tidak diubah ke 0)
 *  - Harga NULL ditandai missing_price, bukan dianggap gratis
 *  - Staging: data masuk ke DB lalu ditandai status, bukan langsung aktif
 */

const db      = require('../database/connection');
const dsvc    = require('../services/datasetService');
const { parse } = require('csv-parse/sync');
const fs      = require('fs');

// ── Fuzzy match sederhana (Jaccard similarity pada kata-kata) ──
function jaccardSimilarity(a, b) {
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
}

// ── Normalisasi satuan ke bentuk standar ────────────────────
const UNIT_MAP = {
    'gram': 'g', 'grams': 'g', 'gr': 'g',
    'kilogram': 'kg', 'kilo': 'kg',
    'mililiter': 'ml', 'milliliter': 'ml', 'cc': 'ml',
    'liter': 'L', 'litre': 'L',
    'sendok makan': 'sdm', 'tablespoon': 'sdm', 'tbsp': 'sdm',
    'sendok teh': 'sdt', 'teaspoon': 'sdt', 'tsp': 'sdt',
    'buah': 'pcs', 'biji': 'pcs', 'butir': 'pcs', 'piece': 'pcs',
    'lembar': 'lembar', 'sheet': 'lembar',
    'ikat': 'ikat', 'bundle': 'ikat',
    'siung': 'siung', 'clove': 'siung',
};

function normalizeUnit(raw) {
    if (!raw) return null;
    const cleaned = raw.trim().toLowerCase();
    return UNIT_MAP[cleaned] || cleaned;
}

function normalizeText(str) {
    if (!str) return null;
    return str.trim().replace(/\s+/g, ' ').slice(0, 500);
}

// ── Validate one recipe row ──────────────────────────────────
function validateRecipeRow(row, rowNum) {
    const errors = [];

    if (!row.name || !String(row.name).trim()) {
        errors.push({ rowNumber: rowNum, fieldName: 'name', errorCode: 'MISSING_NAME', errorMsg: 'Nama resep kosong', rawValue: row.name });
    }

    const servings = parseInt(row.servings);
    if (row.servings !== undefined && (isNaN(servings) || servings <= 0)) {
        errors.push({ rowNumber: rowNum, fieldName: 'servings', errorCode: 'INVALID_SERVINGS', errorMsg: `Jumlah porsi tidak valid: ${row.servings}`, rawValue: row.servings });
    }

    const cookTime = parseInt(row.cooking_time);
    if (row.cooking_time !== undefined && (isNaN(cookTime) || cookTime < 0)) {
        errors.push({ rowNumber: rowNum, fieldName: 'cooking_time', errorCode: 'INVALID_COOK_TIME', errorMsg: `Waktu memasak tidak valid: ${row.cooking_time}`, rawValue: row.cooking_time });
    }

    return errors;
}

// ── Find or create ingredient master ────────────────────────
async function findOrCreateIngredient(name, unit, sourceId, jobId, rowNum) {
    if (!name) return null;
    const normalized = normalizeText(name);

    // Cek exact match dulu
    const [exact] = await db.query(
        'SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?) AND is_active = 1 LIMIT 1',
        [normalized]
    );
    if (exact.length) return exact[0].id;

    // Cek aliases di JSON field
    const [aliases] = await db.query(
        'SELECT id FROM ingredients WHERE JSON_SEARCH(aliases, "one", ?) IS NOT NULL LIMIT 1',
        [normalized]
    );
    if (aliases.length) return aliases[0].id;

    // Cek pending mapping yang sudah di-approve
    const [approved] = await db.query(
        `SELECT im.mapped_ingredient_id FROM ingredient_mappings im
         WHERE im.source_name = ? AND im.status = 'APPROVED' AND im.mapped_ingredient_id IS NOT NULL LIMIT 1`,
        [normalized]
    );
    if (approved.length) return approved[0].mapped_ingredient_id;

    // Fuzzy match terhadap semua ingredient aktif
    const [allIngredients] = await db.query('SELECT id, name FROM ingredients WHERE is_active = 1');
    let bestMatch = null;
    let bestScore = 0;
    for (const ing of allIngredients) {
        const score = jaccardSimilarity(normalized, ing.name);
        if (score > bestScore) { bestScore = score; bestMatch = ing; }
    }

    // Score > 0.7 dianggap cukup yakin
    if (bestScore >= 0.7 && bestMatch) {
        // Simpan mapping otomatis (perlu review jika < 0.9)
        const status = bestScore >= 0.9 ? 'APPROVED' : 'PENDING';
        await db.query(
            `INSERT IGNORE INTO ingredient_mappings 
                (source_name, source_id, mapped_ingredient_id, confidence, method, status)
             VALUES (?, ?, ?, ?, 'FUZZY', ?)`,
            [normalized, sourceId, bestMatch.id, bestScore, status]
        );
        if (status === 'APPROVED') return bestMatch.id;

        // Masuk PENDING → catat sebagai needs_review
        await dsvc.logImportError(jobId, rowNum, 'ingredient', 'FUZZY_MATCH_PENDING',
            `"${normalized}" cocok dengan "${bestMatch.name}" (${(bestScore * 100).toFixed(0)}%) — perlu review`, name);
        return null; // Tidak digunakan dulu sampai di-approve
    }

    // Score rendah → buat bahan baru berstatus NEEDS_REVIEW
    await db.query(
        `INSERT IGNORE INTO ingredient_mappings 
            (source_name, source_id, mapped_ingredient_id, confidence, method, status)
         VALUES (?, ?, NULL, ?, 'UNMATCHED', 'PENDING')`,
        [normalized, sourceId, bestScore]
    );
    await dsvc.logImportError(jobId, rowNum, 'ingredient', 'UNMATCHED_INGREDIENT',
        `Bahan "${normalized}" tidak ditemukan di master. Perlu pemetaan manual.`, name);
    return null;
}

// ── MAIN: Import CSV recipes ─────────────────────────────────
/**
 * @param {string} filePath  - path file CSV di server
 * @param {number} sourceId  - ID dari dataset_sources
 * @param {number} userId    - siapa yang mengimpor
 * @param {number} jobId     - ID dari import_job yang sudah dibuat
 */
async function importRecipesFromCSV(filePath, sourceId, userId, jobId) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let records;
    try {
        records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
        });
    } catch (parseErr) {
        await dsvc.updateImportJob(jobId, {
            status: 'FAILED',
            completed_at: new Date(),
            error_summary: JSON.stringify({ parse_error: parseErr.message }),
        });
        throw new Error(`File CSV tidak dapat di-parse: ${parseErr.message}`);
    }

    const stats = { total: records.length, valid: 0, invalid: 0, duplicate: 0, review: 0 };
    await dsvc.updateImportJob(jobId, { total_rows: stats.total });

    for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNum = i + 2; // +2 karena baris 1 = header

        // 1. Validasi dasar
        const rowErrors = validateRecipeRow(row, rowNum);
        if (rowErrors.length) {
            stats.invalid++;
            for (const e of rowErrors) {
                await dsvc.logImportError(jobId, e.rowNumber, e.fieldName, e.errorCode, e.errorMsg, e.rawValue);
            }
            continue;
        }

        const recipeName = normalizeText(row.name);

        // 2. Cek duplikat berdasarkan source_ref_id atau nama
        const sourceRefId = row.id || row.source_id || null;
        let isDuplicate = false;
        if (sourceRefId) {
            const [dup] = await db.query(
                'SELECT id FROM recipes WHERE source_ref_id = ? AND source_id = ? LIMIT 1',
                [sourceRefId, sourceId]
            );
            if (dup.length) isDuplicate = true;
        }
        if (!isDuplicate) {
            const [dupName] = await db.query(
                'SELECT id FROM recipes WHERE LOWER(name) = LOWER(?) AND source_id = ? LIMIT 1',
                [recipeName, sourceId]
            );
            if (dupName.length) isDuplicate = true;
        }

        if (isDuplicate) {
            stats.duplicate++;
            continue;
        }

        // 3. Tentukan meal_type
        const mealTypeMap = {
            'breakfast': 'BREAKFAST', 'sarapan': 'BREAKFAST',
            'lunch': 'LUNCH', 'makan siang': 'LUNCH', 'siang': 'LUNCH',
            'dinner': 'DINNER', 'makan malam': 'DINNER', 'malam': 'DINNER',
            'snack': 'SNACK', 'camilan': 'SNACK',
        };
        const rawMealType = String(row.meal_type || '').trim().toLowerCase();
        const mealType = mealTypeMap[rawMealType] || 'ANY';

        // 4. Tandai kelengkapan nutrisi
        const hasNutrition = row.calories !== undefined && row.calories !== '' && row.calories !== null;
        const nutritionCompleteness = hasNutrition ? 'FULL' : 'MISSING';

        // 5. Insert resep dengan status IMPORTED (belum VALID)
        let recipeId;
        try {
            const [result] = await db.query(
                `INSERT INTO recipes 
                    (name, description, category, meal_type, servings, cooking_time, difficulty,
                     instructions, total_calories, total_protein, total_fat, total_carbs,
                     source_id, source_ref_id, data_status, nutrition_completeness, price_completeness, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'IMPORTED', ?, 'MISSING', 0)`,
                [
                    recipeName,
                    normalizeText(row.description),
                    normalizeText(row.category),
                    mealType,
                    parseInt(row.servings) || 1,
                    parseInt(row.cooking_time) || 0,
                    ['EASY','MEDIUM','HARD'].includes(String(row.difficulty || '').toUpperCase())
                        ? String(row.difficulty).toUpperCase() : 'MEDIUM',
                    normalizeText(row.instructions),
                    hasNutrition ? parseFloat(row.calories) || null : null,
                    row.protein  ? parseFloat(row.protein) || null : null,
                    row.fat      ? parseFloat(row.fat)     || null : null,
                    row.carbs    ? parseFloat(row.carbs)   || null : null,
                    sourceId,
                    sourceRefId,
                    nutritionCompleteness,
                ]
            );
            recipeId = result.insertId;
        } catch (dbErr) {
            stats.invalid++;
            await dsvc.logImportError(jobId, rowNum, 'recipe', 'DB_INSERT_ERROR', dbErr.message, recipeName);
            continue;
        }

        // 6. Parse bahan-bahan (format CSV: "Ayam:200:g,Bawang:2:siung")
        let hasAllPrices = true;
        if (row.ingredients) {
            const ingParts = String(row.ingredients).split(',');
            for (const part of ingParts) {
                const [ingName, qty, unit] = part.split(':').map(s => s?.trim());
                if (!ingName) continue;

                const normalizedUnit = normalizeUnit(unit);
                const quantity = parseFloat(qty);

                if (isNaN(quantity) || quantity <= 0) {
                    await dsvc.logImportError(jobId, rowNum, 'ingredient_quantity',
                        'INVALID_QUANTITY', `Kuantitas tidak valid untuk "${ingName}": ${qty}`, qty);
                    hasAllPrices = false;
                    continue;
                }

                if (!normalizedUnit) {
                    await dsvc.logImportError(jobId, rowNum, 'ingredient_unit',
                        'MISSING_UNIT', `Satuan tidak ada untuk "${ingName}"`, unit);
                    hasAllPrices = false;
                    continue;
                }

                const ingredientId = await findOrCreateIngredient(ingName, normalizedUnit, sourceId, jobId, rowNum);

                if (!ingredientId) {
                    hasAllPrices = false; // bahan tidak terpetakan = harga tidak diketahui
                    continue;
                }

                // Cek apakah bahan punya harga
                const [priceCheck] = await db.query(
                    `SELECT ip.data_status FROM ingredient_prices ip WHERE ip.ingredient_id = ? LIMIT 1`,
                    [ingredientId]
                );
                if (!priceCheck.length || priceCheck[0].data_status === 'MISSING') {
                    hasAllPrices = false;
                }

                await db.query(
                    'INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
                    [recipeId, ingredientId, quantity, normalizedUnit]
                );
            }
        }

        // 7. Update kelengkapan harga
        const priceCompleteness = hasAllPrices ? 'FULL' : 'MISSING';
        await db.query(
            `UPDATE recipes SET 
                price_completeness = ?,
                data_status = CASE WHEN ? = 'MISSING' OR nutrition_completeness = 'MISSING' THEN 'NEEDS_REVIEW' ELSE 'IMPORTED' END
             WHERE id = ?`,
            [priceCompleteness, priceCompleteness, recipeId]
        );

        if (priceCompleteness === 'MISSING' || nutritionCompleteness === 'MISSING') {
            stats.review++;
        } else {
            stats.valid++;
        }
    }

    // 8. Finalize job
    await dsvc.updateImportJob(jobId, {
        status: 'COMPLETED',
        completed_at: new Date(),
        processed_rows: stats.total,
        valid_rows: stats.valid,
        invalid_rows: stats.invalid,
        duplicate_rows: stats.duplicate,
        review_rows: stats.review,
        error_summary: JSON.stringify({
            total: stats.total,
            valid: stats.valid,
            invalid: stats.invalid,
            duplicate: stats.duplicate,
            needs_review: stats.review,
        }),
    });

    // 9. Update source stats
    await dsvc.updateSourceStatus(sourceId, 'PARTIALLY_IMPORTED', {
        record_count: stats.total,
        valid_count: stats.valid,
        review_count: stats.review,
        invalid_count: stats.invalid,
    });

    return stats;
}

module.exports = { importRecipesFromCSV, normalizeUnit, normalizeText, jaccardSimilarity };
