/**
 * DATASET MANAGEMENT API ROUTES
 * Semua endpoint hanya untuk role ADMIN.
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const router   = express.Router();
const { authenticateToken: authMw } = require('../middleware/auth');
const dsvc     = require('../services/datasetService');
const { importRecipesFromCSV } = require('../data_pipeline/csvImporter');

// ── Multer config — simpan di /tmp, validate extension ───────
const ALLOWED_EXTENSIONS = ['.csv', '.json'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const upload = multer({
    dest: path.join(__dirname, '..', 'tmp_uploads'),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return cb(new Error(`Format tidak didukung. Gunakan: ${ALLOWED_EXTENSIONS.join(', ')}`));
        }
        cb(null, true);
    },
});

// Middleware: hanya ADMIN
function adminOnly(req, res, next) {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Hanya Admin yang dapat mengakses fitur ini.' });
    }
    next();
}

// ── GET /api/dataset/sources ─────────────────────────────────
// Katalog semua dataset
router.get('/sources', authMw, adminOnly, async (req, res) => {
    try {
        const sources = await dsvc.getDatasetSources();
        res.json({ success: true, data: sources });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/dataset/sources/:slug ──────────────────────────
// Detail satu dataset
router.get('/sources/:slug', authMw, adminOnly, async (req, res) => {
    try {
        const source = await dsvc.getDatasetSourceBySlug(req.params.slug);
        if (!source) return res.status(404).json({ success: false, message: 'Dataset tidak ditemukan.' });

        // Ambil job history untuk sumber ini
        const jobs = await dsvc.getImportJobs(source.id, 10);
        res.json({ success: true, data: { source, jobs } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/dataset/stats ───────────────────────────────────
// Statistik database aktual (bukan dummy)
router.get('/stats', authMw, adminOnly, async (req, res) => {
    try {
        const stats = await dsvc.getDatabaseStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/dataset/jobs ────────────────────────────────────
// Riwayat semua import jobs
router.get('/jobs', authMw, adminOnly, async (req, res) => {
    try {
        const sourceId = req.query.source_id ? parseInt(req.query.source_id) : null;
        const jobs = await dsvc.getImportJobs(sourceId, 30);
        res.json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/dataset/jobs/:id/errors ────────────────────────
// Log error per job dengan pagination
router.get('/jobs/:id/errors', authMw, adminOnly, async (req, res) => {
    try {
        const page  = parseInt(req.query.page  || 1);
        const limit = parseInt(req.query.limit || 50);
        const result = await dsvc.getJobErrors(parseInt(req.params.id), page, limit);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/dataset/mappings/pending ────────────────────────
// Bahan yang belum terpetakan (perlu review manual)
router.get('/mappings/pending', authMw, adminOnly, async (req, res) => {
    try {
        const page  = parseInt(req.query.page  || 1);
        const limit = parseInt(req.query.limit || 20);
        const result = await dsvc.getPendingMappings(page, limit);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/dataset/mappings/:id/resolve ───────────────────
// Admin memutuskan approve/reject mapping bahan
router.post('/mappings/:id/resolve', authMw, adminOnly, async (req, res) => {
    try {
        const { decision, ingredient_id } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'decision harus APPROVED atau REJECTED.' });
        }
        await dsvc.resolveMappingDecision(
            parseInt(req.params.id),
            decision,
            req.user.id,
            ingredient_id ? parseInt(ingredient_id) : null
        );
        res.json({ success: true, message: 'Keputusan mapping disimpan.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/dataset/import/recipes ────────────────────────
// Upload file CSV resep dan mulai pipeline impor
router.post('/import/recipes', authMw, adminOnly, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'File CSV wajib diupload.' });
    }

    const { source_id } = req.body;
    if (!source_id) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'source_id wajib disertakan.' });
    }

    let jobId;
    try {
        // Buat job entry dulu sebelum proses
        jobId = await dsvc.createImportJob(
            parseInt(source_id),
            req.user.id,
            req.file.originalname,
            req.file.size,
            'CSV'
        );

        // Proses di latar belakang (non-blocking response)
        res.json({
            success: true,
            message: 'Impor dimulai. Cek status di riwayat job.',
            job_id: jobId,
        });

        // Jalankan import setelah response dikirim
        importRecipesFromCSV(req.file.path, parseInt(source_id), req.user.id, jobId)
            .then(stats => {
                console.log(`✅ Import job ${jobId} selesai:`, stats);
                // Hapus file temp
                try { fs.unlinkSync(req.file.path); } catch (e) {}
            })
            .catch(err => {
                console.error(`❌ Import job ${jobId} gagal:`, err);
                dsvc.updateImportJob(jobId, {
                    status: 'FAILED',
                    completed_at: new Date(),
                    error_summary: JSON.stringify({ fatal: err.message }),
                });
                try { fs.unlinkSync(req.file.path); } catch (e) {}
            });

    } catch (err) {
        if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

// ── GET /api/dataset/template/recipes ───────────────────────
// Download template CSV kosong untuk impor resep
router.get('/template/recipes', authMw, adminOnly, (req, res) => {
    const header = [
        'id',           // ID unik dari sumber (opsional, untuk idempotency)
        'name',         // Nama resep (wajib)
        'description',  // Deskripsi singkat
        'category',     // Kategori (e.g. Makanan Berat, Camilan)
        'meal_type',    // breakfast/lunch/dinner/snack/any
        'servings',     // Jumlah porsi (integer)
        'cooking_time', // Waktu memasak dalam menit
        'difficulty',   // easy/medium/hard
        'instructions', // Langkah memasak (teks panjang)
        'ingredients',  // Format: "NamaBahan:Kuantitas:Satuan,NamaBahan2:Kuantitas2:Satuan2"
        'calories',     // Total kalori per porsi (opsional)
        'protein',      // Total protein per porsi gram (opsional)
        'fat',          // Total lemak per porsi gram (opsional)
        'carbs',        // Total karbohidrat per porsi gram (opsional)
    ].join(',');

    const example = [
        'R001',
        'Nasi Goreng Kampung',
        'Nasi goreng sederhana khas kampung',
        'Makanan Berat',
        'lunch',
        '2',
        '20',
        'easy',
        '1. Panaskan minyak. 2. Tumis bawang. 3. Masukkan nasi. 4. Aduk rata.',
        'Beras:200:g,Telur:1:pcs,Bawang Merah:30:g,Minyak Goreng:15:ml',
        '350',
        '10',
        '8',
        '55',
    ].join(',');

    const csv = `${header}\n${example}\n`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fatrur_recipe_template.csv"');
    res.send(csv);
});

module.exports = router;
