-- =============================================================
-- MIGRATION: Dataset Management & Data Quality System
-- Tambahkan ke schema.sql SETELAH tabel yang sudah ada
-- =============================================================

USE household_meal_planner;

-- ── Dataset Sources (katalog sumber data) ──────────────────────
CREATE TABLE IF NOT EXISTS dataset_sources (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,           -- e.g. "Mendeley Indonesian Recipes v3"
    slug        VARCHAR(100) UNIQUE NOT NULL,    -- e.g. "mendeley-recipes-v3"
    type        ENUM('RECIPES','NUTRITION','PRICES','EQUIPMENT','OTHER') NOT NULL,
    description TEXT,
    source_url  VARCHAR(500),
    license     VARCHAR(200),                    -- e.g. "CC BY 4.0"
    version     VARCHAR(50),
    notes       TEXT,                            -- keterbatasan, catatan penggunaan
    status      ENUM('NOT_IMPORTED','IMPORTED','PARTIALLY_IMPORTED','FAILED','ACTIVE') DEFAULT 'NOT_IMPORTED',
    record_count    INT DEFAULT 0,               -- total record dari sumber
    valid_count     INT DEFAULT 0,               -- record yang valid
    review_count    INT DEFAULT 0,               -- record needs_review
    invalid_count   INT DEFAULT 0,
    last_imported_at DATETIME,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Dataset Import Jobs (riwayat pekerjaan impor) ──────────────
CREATE TABLE IF NOT EXISTS dataset_import_jobs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    dataset_source_id INT,
    triggered_by    INT,                         -- user_id yang memulai impor
    filename        VARCHAR(255),
    file_size_bytes BIGINT,
    file_format     ENUM('CSV','JSON','XLSX','OTHER') DEFAULT 'CSV',
    status          ENUM('PENDING','PROCESSING','COMPLETED','FAILED','ROLLED_BACK') DEFAULT 'PENDING',
    total_rows      INT DEFAULT 0,
    processed_rows  INT DEFAULT 0,
    valid_rows      INT DEFAULT 0,
    invalid_rows    INT DEFAULT 0,
    duplicate_rows  INT DEFAULT 0,
    review_rows     INT DEFAULT 0,
    error_summary   JSON,                        -- { field: count } ringkasan error
    started_at      DATETIME,
    completed_at    DATETIME,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_source_id) REFERENCES dataset_sources(id) ON DELETE SET NULL,
    FOREIGN KEY (triggered_by)      REFERENCES users(id) ON DELETE SET NULL
);

-- ── Dataset Import Errors (log error per record) ───────────────
CREATE TABLE IF NOT EXISTS dataset_import_errors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    import_job_id INT NOT NULL,
    row_number  INT,
    field_name  VARCHAR(100),
    error_code  VARCHAR(50),                     -- e.g. MISSING_NAME, INVALID_UNIT
    error_msg   TEXT,
    raw_value   TEXT,                            -- nilai asli dari file sumber
    FOREIGN KEY (import_job_id) REFERENCES dataset_import_jobs(id) ON DELETE CASCADE
);

-- ── Ingredient Master (normalized master bahan) ────────────────
-- Extends tabel ingredients yang sudah ada dengan flag data quality
ALTER TABLE ingredients
    ADD COLUMN IF NOT EXISTS source_id      INT,                       -- FK ke dataset_sources
    ADD COLUMN IF NOT EXISTS source_ref_id  VARCHAR(100),              -- ID dari sumber asli
    ADD COLUMN IF NOT EXISTS aliases        JSON,                      -- ["Tomat Segar","Tomat Merah"]
    ADD COLUMN IF NOT EXISTS data_status    ENUM('SEED','VALID','NEEDS_REVIEW','INVALID') DEFAULT 'SEED',
    ADD COLUMN IF NOT EXISTS is_active      BOOLEAN DEFAULT TRUE;

-- ── Ingredient Nutrition — tambah flag kualitas ────────────────
ALTER TABLE ingredient_nutrition
    ADD COLUMN IF NOT EXISTS source_id      INT,                       -- FK ke dataset_sources (e.g. TKPI)
    ADD COLUMN IF NOT EXISTS per_unit_weight FLOAT,                    -- berapa gram per unit bahan
    ADD COLUMN IF NOT EXISTS data_status    ENUM('SEED','VERIFIED','ESTIMATED','MISSING') DEFAULT 'SEED',
    ADD COLUMN IF NOT EXISTS missing_fields JSON;                      -- field mana yang NULL

-- ── Ingredient Prices — tambah metadata harga ─────────────────
ALTER TABLE ingredient_prices
    ADD COLUMN IF NOT EXISTS source_id      INT,
    ADD COLUMN IF NOT EXISTS market_area    VARCHAR(100),              -- e.g. "Jakarta", "Nasional"
    ADD COLUMN IF NOT EXISTS price_date     DATE,                      -- tanggal referensi harga
    ADD COLUMN IF NOT EXISTS data_status    ENUM('SEED','VALID','ESTIMATED','MISSING') DEFAULT 'SEED';

-- ── Recipes — tambah flag kualitas & sumber ───────────────────
ALTER TABLE recipes
    ADD COLUMN IF NOT EXISTS source_id      INT,
    ADD COLUMN IF NOT EXISTS source_ref_id  VARCHAR(100),              -- ID dari sumber asli
    ADD COLUMN IF NOT EXISTS data_status    ENUM('SEED','VALID','NEEDS_REVIEW','INVALID','IMPORTED') DEFAULT 'SEED',
    ADD COLUMN IF NOT EXISTS nutrition_completeness ENUM('FULL','PARTIAL','MISSING') DEFAULT 'FULL',
    ADD COLUMN IF NOT EXISTS price_completeness     ENUM('FULL','PARTIAL','MISSING') DEFAULT 'FULL',
    ADD COLUMN IF NOT EXISTS is_active      BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS image_url      VARCHAR(500);

-- ── Ingredient Mapping (bahan sumber → master bahan) ──────────
CREATE TABLE IF NOT EXISTS ingredient_mappings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    source_name     VARCHAR(200) NOT NULL,       -- nama asli dari dataset sumber
    source_id       INT,
    mapped_ingredient_id INT,                   -- FK ke ingredients.id
    confidence      FLOAT DEFAULT 0,            -- 0-1 (hasil fuzzy match)
    method          ENUM('EXACT','FUZZY','MANUAL','UNMATCHED') DEFAULT 'FUZZY',
    status          ENUM('PENDING','APPROVED','REJECTED','NEEDS_REVIEW') DEFAULT 'PENDING',
    reviewed_by     INT,
    reviewed_at     DATETIME,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id)            REFERENCES dataset_sources(id) ON DELETE SET NULL,
    FOREIGN KEY (mapped_ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by)          REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uq_source_mapping (source_name(100), source_id)
);

-- ── Unit Conversions (konversi satuan) ────────────────────────
CREATE TABLE IF NOT EXISTS unit_conversions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    from_unit   VARCHAR(30) NOT NULL,
    to_unit     VARCHAR(30) NOT NULL,
    factor      FLOAT NOT NULL,                  -- nilai = from_unit * factor → to_unit
    ingredient_id INT,                           -- NULL = berlaku umum
    notes       VARCHAR(200),
    UNIQUE KEY uq_conversion (from_unit, to_unit, ingredient_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL
);

-- ── Seed default unit conversions ────────────────────────────
INSERT IGNORE INTO unit_conversions (from_unit, to_unit, factor, notes) VALUES
    ('kg',  'g',    1000,    '1 kg = 1000 g'),
    ('g',   'kg',   0.001,   '1 g = 0.001 kg'),
    ('mg',  'g',    0.001,   '1 mg = 0.001 g'),
    ('L',   'ml',   1000,    '1 L = 1000 ml'),
    ('ml',  'L',    0.001,   '1 ml = 0.001 L'),
    ('sdm', 'ml',   15,      '1 sdm = 15 ml'),
    ('sdt', 'ml',   5,       '1 sdt = 5 ml'),
    ('gelas','ml',  240,     '1 gelas = 240 ml'),
    ('cangkir','ml',250,     '1 cangkir = 250 ml');

-- ── Seed Dataset Sources (katalog awal) ──────────────────────
INSERT IGNORE INTO dataset_sources (name, slug, type, description, source_url, license, version, notes, status) VALUES
(
    'Seed Data Internal (20 Resep)',
    'fatrur-seed-v1',
    'RECIPES',
    'Data seed bawaan aplikasi Fatrur berisi 20 resep masakan Indonesia dasar dengan data nutrisi dan harga yang diestimasi untuk keperluan pengujian awal algoritma.',
    NULL,
    'Internal',
    'v1.0',
    'Harga dan nutrisi merupakan estimasi untuk pengujian. Bukan data pasar aktual.',
    'ACTIVE'
),
(
    'Mendeley Indonesian Culinary Recipes v3',
    'mendeley-indonesian-recipes-v3',
    'RECIPES',
    'Dataset analisis nutrisi dan profil makro-mikro resep kuliner Indonesia dari Mendeley Data.',
    'https://data.mendeley.com/datasets/8b4ztns76h/3',
    'CC BY 4.0',
    'v3',
    'Perlu verifikasi format file dan kolom yang tersedia sebelum impor. Periksa kelengkapan data nutrisi per resep.',
    'NOT_IMPORTED'
),
(
    'LorthGyu Indonesian Recipes (HuggingFace)',
    'huggingface-lorthgyu-indonesian',
    'RECIPES',
    'Dataset resep Indonesia dari HuggingFace community. Berisi nama resep, bahan, dan instruksi memasak.',
    'https://huggingface.co/datasets/LorthGyu/indonesian-recipes',
    'Unknown — verifikasi sebelum digunakan',
    'unknown',
    'Perlu validasi lisensi dan pemeriksaan kolom sebelum digunakan dalam produksi.',
    'NOT_IMPORTED'
),
(
    'TKPI 2020 — Tabel Komposisi Pangan Indonesia',
    'kemkes-tkpi-2020',
    'NUTRITION',
    'Tabel komposisi pangan resmi dari Kemenkes RI (2020). Berisi nilai gizi per 100g dari ratusan bahan pangan Indonesia.',
    'https://repository.kemkes.go.id/book/668',
    'Pemerintah RI — verifikasi ketentuan penggunaan',
    '2020',
    'Sumber nutrisi resmi. Perlu pemetaan nama bahan dari resep ke nama TKPI. Banyak sinonim bahan harus diselesaikan manual.',
    'NOT_IMPORTED'
),
(
    'Data Harga Pasar (Manual/Upload)',
    'market-prices-manual',
    'PRICES',
    'Data harga bahan pangan yang dikumpulkan secara manual atau dari sumber terpercaya. Harus disertai tanggal referensi dan cakupan pasar.',
    NULL,
    'Internal',
    NULL,
    'Pengguna Admin dapat mengunggah CSV harga. Tanpa metadata lokasi dan tanggal, data tidak boleh digunakan sebagai harga aktual.',
    'NOT_IMPORTED'
);

-- Update seed recipes dengan source dan status yang benar
UPDATE recipes SET source_id = (SELECT id FROM dataset_sources WHERE slug = 'fatrur-seed-v1' LIMIT 1), data_status = 'SEED', is_active = TRUE WHERE data_status IS NULL OR data_status = 'SEED';
UPDATE ingredients SET source_id = (SELECT id FROM dataset_sources WHERE slug = 'fatrur-seed-v1' LIMIT 1), data_status = 'SEED', is_active = TRUE WHERE data_status IS NULL OR data_status = 'SEED';
