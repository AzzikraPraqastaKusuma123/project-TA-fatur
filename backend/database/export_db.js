const fs = require('fs');
const path = require('path');
const conn = require('./connection');

async function exportDatabase() {
    console.log('🚀 Memulai Export Database household_meal_planner...');
    
    let sql = `-- =========================================================\n`;
    sql += `-- DATABASE EXPORT: household_meal_planner\n`;
    sql += `-- Generated At: ${new Date().toISOString()}\n`;
    sql += `-- All-in-one Single File: Schema (22 Tabel) + Seed & Data Aktual\n`;
    sql += `-- Kompatibel: phpMyAdmin, MySQL Workbench, DBeaver, MySQL CLI\n`;
    sql += `-- =========================================================\n\n`;

    sql += `CREATE DATABASE IF NOT EXISTS \`household_meal_planner\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sql += `USE \`household_meal_planner\`;\n\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sql += `SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n`;
    sql += `SET NAMES utf8mb4;\n\n`;

    const [tables] = await conn.query('SHOW FULL TABLES WHERE Table_Type = "BASE TABLE"');
    const tableKey = Object.keys(tables[0])[0];

    for (const t of tables) {
        const tableName = t[tableKey];
        sql += `-- ---------------------------------------------------------\n`;
        sql += `-- Table structure for \`${tableName}\`\n`;
        sql += `-- ---------------------------------------------------------\n`;
        sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

        const [[createRes]] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
        let createTableSql = createRes['Create Table']
            .replace(/COLLATE=utf8mb4_0900_ai_ci/g, 'COLLATE=utf8mb4_unicode_ci')
            .replace(/utf8mb4_0900_ai_ci/g, 'utf8mb4_unicode_ci');
        sql += createTableSql + ';\n\n';

        const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
        if (rows.length > 0) {
            sql += `-- Dumping data for table \`${tableName}\` (${rows.length} rows)\n`;
            const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
            
            const valueRows = rows.map(row => {
                const vals = Object.values(row).map(val => {
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'number') return val;
                    if (typeof val === 'boolean') return val ? 1 : 0;
                    if (val instanceof Date) {
                        return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                    }
                    if (typeof val === 'object') {
                        const jsonStr = JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                        return `'${jsonStr}'`;
                    }
                    const str = String(val)
                        .replace(/\\/g, '\\\\')
                        .replace(/'/g, "\\'")
                        .replace(/\n/g, '\\n')
                        .replace(/\r/g, '\\r');
                    return `'${str}'`;
                });
                return `(${vals.join(', ')})`;
            });

            sql += `INSERT INTO \`${tableName}\` (${cols}) VALUES\n` + valueRows.join(',\n') + ';\n\n';
        }
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    sql += `-- =========================================================\n`;
    sql += `-- End of Database Export\n`;
    sql += `-- =========================================================\n`;

    const outputPath = path.join(__dirname, 'household_meal_planner_full.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');

    const stats = fs.statSync(outputPath);
    console.log(`✅ Berhasil diexport ke: ${outputPath}`);
    console.log(`📦 Ukuran File: ${(stats.size / 1024).toFixed(1)} KB`);
    process.exit(0);
}

exportDatabase().catch(err => {
    console.error('❌ Error saat export database:', err);
    process.exit(1);
});
