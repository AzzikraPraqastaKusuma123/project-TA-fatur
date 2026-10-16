/**
 * run_migration.js — Jalankan sekali dengan: node database/run_migration.js
 */
const mysql  = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const conn = await mysql.createConnection({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log('🚀 Running Dataset Management Migration...');

    // ── 1. Create new tables ──────────────────────────────────
    const creates = [
        `CREATE TABLE IF NOT EXISTS dataset_sources (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            name         VARCHAR(150) NOT NULL,
            slug         VARCHAR(100) UNIQUE NOT NULL,
            type         ENUM('RECIPES','NUTRITION','PRICES','EQUIPMENT','OTHER') NOT NULL,
            description  TEXT,
            source_url   VARCHAR(500),
            license      VARCHAR(200),
            version      VARCHAR(50),
            notes        TEXT,
            status       ENUM('NOT_IMPORTED','IMPORTED','PARTIALLY_IMPORTED','FAILED','ACTIVE') DEFAULT 'NOT_IMPORTED',
            record_count INT DEFAULT 0,
            valid_count  INT DEFAULT 0,
            review_count INT DEFAULT 0,
            invalid_count INT DEFAULT 0,
            last_imported_at DATETIME,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS dataset_import_jobs (
            id                 INT AUTO_INCREMENT PRIMARY KEY,
            dataset_source_id  INT,
            triggered_by       INT,
            filename           VARCHAR(255),
            file_size_bytes    BIGINT,
            file_format        ENUM('CSV','JSON','XLSX','OTHER') DEFAULT 'CSV',
            status             ENUM('PENDING','PROCESSING','COMPLETED','FAILED','ROLLED_BACK') DEFAULT 'PENDING',
            total_rows         INT DEFAULT 0,
            processed_rows     INT DEFAULT 0,
            valid_rows         INT DEFAULT 0,
            invalid_rows       INT DEFAULT 0,
            duplicate_rows     INT DEFAULT 0,
            review_rows        INT DEFAULT 0,
            error_summary      JSON,
            started_at         DATETIME,
            completed_at       DATETIME,
            created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dataset_source_id) REFERENCES dataset_sources(id) ON DELETE SET NULL,
            FOREIGN KEY (triggered_by)      REFERENCES users(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE IF NOT EXISTS dataset_import_errors (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            import_job_id INT NOT NULL,
            row_number    INT,
            field_name    VARCHAR(100),
            error_code    VARCHAR(50),
            error_msg     TEXT,
            raw_value     TEXT,
            FOREIGN KEY (import_job_id) REFERENCES dataset_import_jobs(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS ingredient_mappings (
            id                   INT AUTO_INCREMENT PRIMARY KEY,
            source_name          VARCHAR(200) NOT NULL,
            source_id            INT,
            mapped_ingredient_id INT,
            confidence           FLOAT DEFAULT 0,
            method               ENUM('EXACT','FUZZY','MANUAL','UNMATCHED') DEFAULT 'FUZZY',
            status               ENUM('PENDING','APPROVED','REJECTED','NEEDS_REVIEW') DEFAULT 'PENDING',
            reviewed_by          INT,
            reviewed_at          DATETIME,
            notes                TEXT,
            created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_id)            REFERENCES dataset_sources(id) ON DELETE SET NULL,
            FOREIGN KEY (mapped_ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL,
            FOREIGN KEY (reviewed_by)          REFERENCES users(id) ON DELETE SET NULL,
            UNIQUE KEY uq_source_mapping (source_name(100), source_id)
        )`,
        `CREATE TABLE IF NOT EXISTS unit_conversions (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            from_unit     VARCHAR(30) NOT NULL,
            to_unit       VARCHAR(30) NOT NULL,
            factor        FLOAT NOT NULL,
            ingredient_id INT,
            notes         VARCHAR(200),
            UNIQUE KEY uq_conversion (from_unit, to_unit, ingredient_id),
            FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL
        )`,
    ];

    for (const sql of creates) {
        try {
            await conn.query(sql);
            const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
            console.log(`  ✅ Table ready: ${tableName}`);
        } catch (err) {
            console.error(`  ❌ Create table error: ${err.message.slice(0, 100)}`);
        }
    }

    // ── 2. ALTER existing tables (safe, ignore duplicates) ────
    const alters = [
        { table: 'ingredients', col: 'source_id',    sql: 'ALTER TABLE ingredients ADD COLUMN source_id INT'                                                       },
        { table: 'ingredients', col: 'source_ref_id',sql: 'ALTER TABLE ingredients ADD COLUMN source_ref_id VARCHAR(100)'                                          },
        { table: 'ingredients', col: 'aliases',      sql: 'ALTER TABLE ingredients ADD COLUMN aliases JSON'                                                         },
        { table: 'ingredients', col: 'data_status',  sql: "ALTER TABLE ingredients ADD COLUMN data_status ENUM('SEED','VALID','NEEDS_REVIEW','INVALID') DEFAULT 'SEED'" },
        { table: 'ingredients', col: 'is_active',    sql: 'ALTER TABLE ingredients ADD COLUMN is_active BOOLEAN DEFAULT TRUE'                                       },
        { table: 'ingredient_nutrition', col: 'source_id',       sql: 'ALTER TABLE ingredient_nutrition ADD COLUMN source_id INT'                                   },
        { table: 'ingredient_nutrition', col: 'per_unit_weight',  sql: 'ALTER TABLE ingredient_nutrition ADD COLUMN per_unit_weight FLOAT'                          },
        { table: 'ingredient_nutrition', col: 'data_status',      sql: "ALTER TABLE ingredient_nutrition ADD COLUMN data_status ENUM('SEED','VERIFIED','ESTIMATED','MISSING') DEFAULT 'SEED'" },
        { table: 'ingredient_nutrition', col: 'missing_fields',   sql: 'ALTER TABLE ingredient_nutrition ADD COLUMN missing_fields JSON'                             },
        { table: 'ingredient_prices',    col: 'source_id',        sql: 'ALTER TABLE ingredient_prices ADD COLUMN source_id INT'                                     },
        { table: 'ingredient_prices',    col: 'market_area',      sql: 'ALTER TABLE ingredient_prices ADD COLUMN market_area VARCHAR(100)'                          },
        { table: 'ingredient_prices',    col: 'price_date',       sql: 'ALTER TABLE ingredient_prices ADD COLUMN price_date DATE'                                   },
        { table: 'ingredient_prices',    col: 'data_status',      sql: "ALTER TABLE ingredient_prices ADD COLUMN data_status ENUM('SEED','VALID','ESTIMATED','MISSING') DEFAULT 'SEED'" },
        { table: 'recipes', col: 'source_id',              sql: 'ALTER TABLE recipes ADD COLUMN source_id INT'                                                      },
        { table: 'recipes', col: 'source_ref_id',          sql: 'ALTER TABLE recipes ADD COLUMN source_ref_id VARCHAR(100)'                                         },
        { table: 'recipes', col: 'data_status',            sql: "ALTER TABLE recipes ADD COLUMN data_status ENUM('SEED','VALID','NEEDS_REVIEW','INVALID','IMPORTED') DEFAULT 'SEED'" },
        { table: 'recipes', col: 'nutrition_completeness', sql: "ALTER TABLE recipes ADD COLUMN nutrition_completeness ENUM('FULL','PARTIAL','MISSING') DEFAULT 'FULL'" },
        { table: 'recipes', col: 'price_completeness',     sql: "ALTER TABLE recipes ADD COLUMN price_completeness ENUM('FULL','PARTIAL','MISSING') DEFAULT 'FULL'" },
        { table: 'recipes', col: 'is_active',              sql: 'ALTER TABLE recipes ADD COLUMN is_active BOOLEAN DEFAULT TRUE'                                     },
        { table: 'recipes', col: 'image_url',              sql: 'ALTER TABLE recipes ADD COLUMN image_url VARCHAR(500)'                                             },
    ];

    for (const { table, col, sql } of alters) {
        try {
            await conn.query(sql);
            console.log(`  ✅ Column added: ${table}.${col}`);
        } catch (err) {
            if (err.message.includes('Duplicate column')) {
                console.log(`  ⏭️  Already exists: ${table}.${col}`);
            } else {
                console.error(`  ⚠️  ALTER failed: ${err.message.slice(0, 80)}`);
            }
        }
    }

    // ── 3. Seed unit_conversions ──────────────────────────────
    const conversions = [
        ['kg',      'g',    1000,  '1 kg = 1000 g'],
        ['g',       'kg',   0.001, '1 g = 0.001 kg'],
        ['mg',      'g',    0.001, '1 mg = 0.001 g'],
        ['L',       'ml',   1000,  '1 L = 1000 ml'],
        ['ml',      'L',    0.001, '1 ml = 0.001 L'],
        ['sdm',     'ml',   15,    '1 sdm ≈ 15 ml'],
        ['sdt',     'ml',   5,     '1 sdt ≈ 5 ml'],
        ['gelas',   'ml',   240,   '1 gelas = 240 ml'],
        ['cangkir', 'ml',   250,   '1 cangkir = 250 ml'],
    ];
    for (const [f, t, factor, notes] of conversions) {
        try {
            await conn.query(
                'INSERT IGNORE INTO unit_conversions (from_unit, to_unit, factor, notes) VALUES (?,?,?,?)',
                [f, t, factor, notes]
            );
        } catch (err) { /* ignore duplicates */ }
    }
    console.log('  ✅ Unit conversions seeded');

    // ── 4. Seed dataset_sources ───────────────────────────────
    const sources = [
        {
            name: 'Seed Data Internal (20 Resep)',
            slug: 'fatrur-seed-v1', type: 'RECIPES',
            description: 'Data seed bawaan aplikasi Fatrur berisi 20 resep Indonesia dasar untuk pengujian awal algoritma MILP dan Rule-Based Filtering.',
            source_url: null, license: 'Internal', version: 'v1.0',
            notes: 'Harga dan nutrisi merupakan estimasi untuk pengujian. Bukan data pasar aktual.',
            status: 'ACTIVE',
        },
        {
            name: 'Mendeley Indonesian Culinary Recipes v3',
            slug: 'mendeley-indonesian-recipes-v3', type: 'RECIPES',
            description: 'Dataset analisis nutrisi dan profil makro-mikro resep kuliner Indonesia dari Mendeley Data.',
            source_url: 'https://data.mendeley.com/datasets/8b4ztns76h/3',
            license: 'CC BY 4.0', version: 'v3',
            notes: 'Perlu verifikasi format file dan kolom sebelum impor. Periksa kelengkapan data nutrisi per resep.',
            status: 'NOT_IMPORTED',
        },
        {
            name: 'LorthGyu Indonesian Recipes (HuggingFace)',
            slug: 'huggingface-lorthgyu-indonesian', type: 'RECIPES',
            description: 'Dataset resep Indonesia dari HuggingFace community.',
            source_url: 'https://huggingface.co/datasets/LorthGyu/indonesian-recipes',
            license: 'Unknown — verifikasi sebelum digunakan', version: 'unknown',
            notes: 'Perlu validasi lisensi dan pemeriksaan kolom sebelum digunakan dalam produksi.',
            status: 'NOT_IMPORTED',
        },
        {
            name: 'TKPI 2020 — Tabel Komposisi Pangan Indonesia',
            slug: 'kemkes-tkpi-2020', type: 'NUTRITION',
            description: 'Tabel komposisi pangan resmi Kemenkes RI (2020). Nilai gizi per 100g ratusan bahan pangan Indonesia.',
            source_url: 'https://repository.kemkes.go.id/book/668',
            license: 'Pemerintah RI — verifikasi ketentuan penggunaan', version: '2020',
            notes: 'Sumber nutrisi resmi. Perlu pemetaan nama bahan dari resep ke nama TKPI. Banyak sinonim harus diselesaikan manual.',
            status: 'NOT_IMPORTED',
        },
        {
            name: 'Data Harga Pasar (Manual Upload)',
            slug: 'market-prices-manual', type: 'PRICES',
            description: 'Data harga bahan pangan dikumpulkan secara manual atau dari sumber terpercaya.',
            source_url: null, license: 'Internal', version: null,
            notes: 'Admin dapat unggah CSV harga. Tanpa metadata lokasi dan tanggal, data tidak boleh digunakan sebagai harga aktual.',
            status: 'NOT_IMPORTED',
        },
    ];

    for (const src of sources) {
        try {
            await conn.query(
                `INSERT IGNORE INTO dataset_sources 
                    (name, slug, type, description, source_url, license, version, notes, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [src.name, src.slug, src.type, src.description, src.source_url,
                 src.license, src.version, src.notes, src.status]
            );
        } catch (err) { console.warn('  Source insert skip:', err.message.slice(0, 60)); }
    }
    console.log('  ✅ Dataset sources catalog seeded');

    // ── 5. Tag existing seed data with source_id ──────────────
    try {
        const [[seedSrc]] = await conn.query(
            "SELECT id FROM dataset_sources WHERE slug = 'fatrur-seed-v1' LIMIT 1"
        );
        if (seedSrc) {
            const sid = seedSrc.id;
            await conn.query("UPDATE recipes SET source_id=?, data_status='SEED', is_active=1 WHERE source_id IS NULL", [sid]);
            await conn.query("UPDATE ingredients SET source_id=?, data_status='SEED', is_active=1 WHERE source_id IS NULL", [sid]);
            await conn.query("UPDATE ingredient_nutrition SET source_id=?, data_status='SEED' WHERE source_id IS NULL", [sid]);
            await conn.query("UPDATE ingredient_prices SET source_id=?, data_status='SEED' WHERE source_id IS NULL", [sid]);
            await conn.query("UPDATE dataset_sources SET record_count=20, valid_count=20 WHERE slug='fatrur-seed-v1'");
            console.log('  ✅ Existing seed data tagged with source_id=' + sid);
        }
    } catch (err) {
        console.error('  ⚠️  Tag seed error:', err.message);
    }

    console.log('\n🎉 Dataset Management Migration complete!');
    await conn.end();
}

runMigration().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
