const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('🌱 Seeding database...');

    // --- Equipment ---
    const equipmentData = [
        ['Kompor Gas', 'Kompor dengan bahan bakar gas'],
        ['Rice Cooker', 'Alat masak nasi otomatis'],
        ['Wajan', 'Wajan penggorengan serbaguna'],
        ['Panci', 'Panci untuk merebus dan memasak sup'],
        ['Oven', 'Oven untuk memanggang'],
        ['Blender', 'Blender untuk membuat jus dan saus'],
        ['Kukusan', 'Alat untuk mengukus makanan'],
        ['Talenan', 'Alas untuk memotong bahan'],
        ['Parutan', 'Alat untuk memarut kelapa dan keju'],
        ['Pressure Cooker', 'Panci tekanan untuk memasak cepat']
    ];
    for (const [name, desc] of equipmentData) {
        await conn.query('INSERT IGNORE INTO equipment (name, description) VALUES (?,?)', [name, desc]);
    }
    console.log('✅ Equipment seeded');

    // --- Ingredients with nutrition (per 100g unless noted) ---
    const ingredientsData = [
        // [name, category, unit, calories_per_unit, protein, fat, carbs, price_per_unit]
        // calories etc are PER GRAM, price is PER GRAM
        ['Beras', 'Karbohidrat', 'g', 3.6, 0.07, 0.005, 0.79, 0.15],
        ['Ayam', 'Protein', 'g', 2.15, 0.185, 0.14, 0, 0.35],
        ['Telur', 'Protein', 'pcs', 70, 6, 5, 0.4, 2000],      // per pcs (~70g)
        ['Tahu', 'Protein', 'g', 0.76, 0.08, 0.045, 0.019, 0.08],
        ['Tempe', 'Protein', 'g', 1.99, 0.19, 0.077, 0.099, 0.06],
        ['Bayam', 'Sayuran', 'g', 0.23, 0.029, 0.004, 0.036, 0.03],
        ['Kangkung', 'Sayuran', 'g', 0.19, 0.026, 0.003, 0.033, 0.025],
        ['Wortel', 'Sayuran', 'g', 0.41, 0.009, 0.002, 0.096, 0.04],
        ['Kentang', 'Karbohidrat', 'g', 0.77, 0.02, 0.001, 0.17, 0.07],
        ['Minyak Goreng', 'Bumbu', 'ml', 8.8, 0, 1, 0, 0.02],
        ['Bawang Merah', 'Bumbu', 'g', 0.4, 0.011, 0.001, 0.09, 0.08],
        ['Bawang Putih', 'Bumbu', 'g', 1.49, 0.063, 0.005, 0.331, 0.06],
        ['Cabai Merah', 'Bumbu', 'g', 0.31, 0.015, 0.003, 0.06, 0.05],
        ['Tomat', 'Sayuran', 'g', 0.18, 0.009, 0.002, 0.039, 0.04],
        ['Kecap Manis', 'Bumbu', 'ml', 2.62, 0.028, 0, 0.64, 0.03],
        ['Garam', 'Bumbu', 'g', 0, 0, 0, 0, 0.005],
        ['Gula Pasir', 'Bumbu', 'g', 3.87, 0, 0, 1, 0.01],
        ['Santan', 'Bahan Pelengkap', 'ml', 2.3, 0.023, 0.241, 0.06, 0.015],
        ['Ikan Teri', 'Protein', 'g', 2.17, 0.424, 0.03, 0, 0.2],
        ['Udang', 'Protein', 'g', 0.85, 0.18, 0.009, 0.009, 0.45],
        ['Daging Sapi', 'Protein', 'g', 2.5, 0.26, 0.15, 0, 0.65],
        ['Tahu Sutera', 'Protein', 'g', 0.55, 0.05, 0.03, 0.02, 0.07],
        ['Mie Telur', 'Karbohidrat', 'g', 1.38, 0.045, 0.02, 0.277, 0.1],
        ['Kol/Kubis', 'Sayuran', 'g', 0.25, 0.013, 0.001, 0.059, 0.02],
        ['Daun Bawang', 'Sayuran', 'g', 0.32, 0.018, 0.003, 0.073, 0.04],
        ['Jahe', 'Bumbu', 'g', 0.8, 0.018, 0.008, 0.178, 0.05],
        ['Kunyit', 'Bumbu', 'g', 3.12, 0.094, 0.1, 0.674, 0.04],
        ['Ketumbar', 'Bumbu', 'g', 2.98, 0.124, 0.178, 0.55, 0.06],
        ['Pisang', 'Buah', 'pcs', 105, 1.3, 0.4, 27, 2000],
        ['Oat', 'Karbohidrat', 'g', 3.89, 0.17, 0.07, 0.66, 0.12]
    ];

    const ingIds = {};
    for (const [name, category, unit, cal, pro, fat, carb, price] of ingredientsData) {
        const [r] = await conn.query('INSERT IGNORE INTO ingredients (name, category, unit) VALUES (?,?,?)', [name, category, unit]);
        let ingId = r.insertId;
        if (ingId === 0) {
            const [ex] = await conn.query('SELECT id FROM ingredients WHERE name=?', [name]);
            ingId = ex[0].id;
        }
        ingIds[name] = ingId;
        await conn.query('INSERT IGNORE INTO ingredient_nutrition (ingredient_id, calories, protein, fat, carbs) VALUES (?,?,?,?,?)', [ingId, cal, pro, fat, carb]);
        await conn.query('INSERT IGNORE INTO ingredient_prices (ingredient_id, price) VALUES (?,?)', [ingId, price]);
    }
    console.log('✅ Ingredients seeded');

    // Get equipment IDs
    const [eqRows] = await conn.query('SELECT id, name FROM equipment');
    const eqIds = {};
    for (const eq of eqRows) eqIds[eq.name] = eq.id;

    // --- Recipes ---
    const recipes = [
        {
            name: 'Nasi Putih',
            description: 'Nasi putih yang pulen dan lembut',
            category: 'Karbohidrat',
            meal_type: 'ANY',
            servings: 4,
            cooking_time: 30,
            difficulty: 'EASY',
            instructions: '1. Cuci beras hingga bersih. 2. Masukkan ke rice cooker dengan air secukupnya. 3. Tekan tombol cook dan tunggu hingga matang.',
            ingredients: [
                { name: 'Beras', qty: 400, unit: 'g' }
            ],
            equipment: ['Rice Cooker']
        },
        {
            name: 'Nasi Goreng Spesial',
            description: 'Nasi goreng dengan telur dan bumbu khas Indonesia',
            category: 'Nasi',
            meal_type: 'ANY',
            servings: 2,
            cooking_time: 20,
            difficulty: 'EASY',
            instructions: '1. Panaskan minyak di wajan. 2. Tumis bawang merah, bawang putih, dan cabai. 3. Masukkan telur, orak-arik. 4. Masukkan nasi, aduk rata. 5. Tambahkan kecap manis dan garam. 6. Sajikan panas.',
            ingredients: [
                { name: 'Beras', qty: 200, unit: 'g' },
                { name: 'Telur', qty: 2, unit: 'pcs' },
                { name: 'Bawang Merah', qty: 30, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Cabai Merah', qty: 10, unit: 'g' },
                { name: 'Kecap Manis', qty: 20, unit: 'ml' },
                { name: 'Minyak Goreng', qty: 30, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Ayam Kecap',
            description: 'Ayam masak kecap yang lezat dan gurih',
            category: 'Lauk',
            meal_type: 'LUNCH',
            servings: 4,
            cooking_time: 40,
            difficulty: 'MEDIUM',
            instructions: '1. Potong ayam menjadi beberapa bagian. 2. Tumis bawang merah, bawang putih, jahe. 3. Masukkan ayam, aduk hingga berubah warna. 4. Tambahkan kecap manis, gula, garam. 5. Masak hingga matang dan kuah mengental.',
            ingredients: [
                { name: 'Ayam', qty: 500, unit: 'g' },
                { name: 'Kecap Manis', qty: 60, unit: 'ml' },
                { name: 'Bawang Merah', qty: 50, unit: 'g' },
                { name: 'Bawang Putih', qty: 20, unit: 'g' },
                { name: 'Jahe', qty: 15, unit: 'g' },
                { name: 'Gula Pasir', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 30, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Telur Balado',
            description: 'Telur rebus dengan sambal balado pedas khas Padang',
            category: 'Lauk',
            meal_type: 'ANY',
            servings: 3,
            cooking_time: 25,
            difficulty: 'EASY',
            instructions: '1. Rebus telur hingga matang, kupas. 2. Goreng telur sebentar. 3. Haluskan cabai, bawang merah, bawang putih, tomat. 4. Tumis bumbu halus. 5. Masukkan telur, aduk rata.',
            ingredients: [
                { name: 'Telur', qty: 4, unit: 'pcs' },
                { name: 'Cabai Merah', qty: 50, unit: 'g' },
                { name: 'Bawang Merah', qty: 40, unit: 'g' },
                { name: 'Bawang Putih', qty: 15, unit: 'g' },
                { name: 'Tomat', qty: 50, unit: 'g' },
                { name: 'Minyak Goreng', qty: 40, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan', 'Panci']
        },
        {
            name: 'Tumis Kangkung',
            description: 'Sayur kangkung tumis bawang dan terasi',
            category: 'Sayur',
            meal_type: 'ANY',
            servings: 3,
            cooking_time: 15,
            difficulty: 'EASY',
            instructions: '1. Cuci kangkung bersih. 2. Panaskan minyak. 3. Tumis bawang merah, bawang putih, cabai. 4. Masukkan kangkung. 5. Tambahkan garam, aduk hingga layu.',
            ingredients: [
                { name: 'Kangkung', qty: 300, unit: 'g' },
                { name: 'Bawang Merah', qty: 30, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Cabai Merah', qty: 20, unit: 'g' },
                { name: 'Minyak Goreng', qty: 20, unit: 'ml' },
                { name: 'Garam', qty: 3, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Sayur Sop',
            description: 'Sup sayuran segar yang hangat dan bergizi',
            category: 'Sayur',
            meal_type: 'LUNCH',
            servings: 4,
            cooking_time: 30,
            difficulty: 'EASY',
            instructions: '1. Didihkan air. 2. Masukkan bawang merah, bawang putih. 3. Tambahkan wortel dan kentang, masak 10 menit. 4. Masukkan kol dan daun bawang. 5. Bumbui dengan garam.',
            ingredients: [
                { name: 'Wortel', qty: 150, unit: 'g' },
                { name: 'Kentang', qty: 200, unit: 'g' },
                { name: 'Kol/Kubis', qty: 100, unit: 'g' },
                { name: 'Daun Bawang', qty: 30, unit: 'g' },
                { name: 'Bawang Merah', qty: 30, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Panci']
        },
        {
            name: 'Soto Ayam',
            description: 'Soto ayam kuning berkuah bening khas Jawa',
            category: 'Sup',
            meal_type: 'BREAKFAST',
            servings: 4,
            cooking_time: 60,
            difficulty: 'MEDIUM',
            instructions: '1. Rebus ayam dengan bumbu kuning (kunyit, jahe, bawang). 2. Angkat ayam, suwir-suwir. 3. Saring kaldu. 4. Masukkan kembali ayam suwir. 5. Sajikan dengan bihun dan pelengkap.',
            ingredients: [
                { name: 'Ayam', qty: 400, unit: 'g' },
                { name: 'Kunyit', qty: 15, unit: 'g' },
                { name: 'Jahe', qty: 20, unit: 'g' },
                { name: 'Bawang Merah', qty: 60, unit: 'g' },
                { name: 'Bawang Putih', qty: 20, unit: 'g' },
                { name: 'Daun Bawang', qty: 30, unit: 'g' },
                { name: 'Garam', qty: 8, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Panci']
        },
        {
            name: 'Tempe Goreng',
            description: 'Tempe goreng crispy bumbu bawang',
            category: 'Lauk',
            meal_type: 'ANY',
            servings: 4,
            cooking_time: 15,
            difficulty: 'EASY',
            instructions: '1. Iris tempe sesuai selera. 2. Haluskan bawang putih dan kunyit. 3. Lumuri tempe dengan bumbu. 4. Goreng dalam minyak panas hingga kecoklatan.',
            ingredients: [
                { name: 'Tempe', qty: 300, unit: 'g' },
                { name: 'Bawang Putih', qty: 15, unit: 'g' },
                { name: 'Kunyit', qty: 5, unit: 'g' },
                { name: 'Minyak Goreng', qty: 100, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Tahu Sayur',
            description: 'Tumis tahu dengan sayuran segar',
            category: 'Sayur',
            meal_type: 'ANY',
            servings: 3,
            cooking_time: 20,
            difficulty: 'EASY',
            instructions: '1. Goreng tahu sebentar. 2. Tumis bawang merah dan bawang putih. 3. Masukkan wortel dan kol. 4. Tambahkan tahu. 5. Bumbui garam.',
            ingredients: [
                { name: 'Tahu', qty: 250, unit: 'g' },
                { name: 'Wortel', qty: 100, unit: 'g' },
                { name: 'Kol/Kubis', qty: 100, unit: 'g' },
                { name: 'Bawang Merah', qty: 30, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 30, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Capcay',
            description: 'Tumis sayuran campur ala chinese food',
            category: 'Sayur',
            meal_type: 'DINNER',
            servings: 4,
            cooking_time: 20,
            difficulty: 'EASY',
            instructions: '1. Panaskan minyak. 2. Tumis bawang. 3. Masukkan wortel, kol, daun bawang berurutan. 4. Bumbui dengan garam dan sedikit gula. 5. Sajikan segera.',
            ingredients: [
                { name: 'Wortel', qty: 100, unit: 'g' },
                { name: 'Kol/Kubis', qty: 150, unit: 'g' },
                { name: 'Daun Bawang', qty: 40, unit: 'g' },
                { name: 'Bawang Putih', qty: 15, unit: 'g' },
                { name: 'Minyak Goreng', qty: 30, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' },
                { name: 'Gula Pasir', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Mie Goreng',
            description: 'Mie goreng dengan telur dan sayuran',
            category: 'Mie',
            meal_type: 'ANY',
            servings: 2,
            cooking_time: 20,
            difficulty: 'EASY',
            instructions: '1. Rebus mie hingga al dente, tiriskan. 2. Tumis bawang, masukkan telur. 3. Masukkan mie dan sayuran. 4. Bumbui kecap dan garam. 5. Sajikan panas.',
            ingredients: [
                { name: 'Mie Telur', qty: 200, unit: 'g' },
                { name: 'Telur', qty: 2, unit: 'pcs' },
                { name: 'Kol/Kubis', qty: 80, unit: 'g' },
                { name: 'Daun Bawang', qty: 20, unit: 'g' },
                { name: 'Bawang Merah', qty: 25, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Kecap Manis', qty: 20, unit: 'ml' },
                { name: 'Minyak Goreng', qty: 30, unit: 'ml' },
                { name: 'Garam', qty: 3, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan', 'Panci']
        },
        {
            name: 'Sayur Bayam',
            description: 'Bayam bening berkuah bening yang menyehatkan',
            category: 'Sayur',
            meal_type: 'ANY',
            servings: 3,
            cooking_time: 15,
            difficulty: 'EASY',
            instructions: '1. Didihkan air. 2. Masukkan bawang merah iris. 3. Masukkan bayam. 4. Tambahkan garam. 5. Masak sebentar, jangan terlalu lama.',
            ingredients: [
                { name: 'Bayam', qty: 250, unit: 'g' },
                { name: 'Bawang Merah', qty: 20, unit: 'g' },
                { name: 'Garam', qty: 4, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Panci']
        },
        {
            name: 'Ayam Goreng',
            description: 'Ayam goreng krispy dengan bumbu rempah',
            category: 'Lauk',
            meal_type: 'ANY',
            servings: 4,
            cooking_time: 45,
            difficulty: 'MEDIUM',
            instructions: '1. Lumuri ayam dengan bumbu kunyit, ketumbar, garam. 2. Diamkan 30 menit. 3. Goreng dalam minyak panas hingga matang dan kecoklatan.',
            ingredients: [
                { name: 'Ayam', qty: 600, unit: 'g' },
                { name: 'Kunyit', qty: 10, unit: 'g' },
                { name: 'Ketumbar', qty: 10, unit: 'g' },
                { name: 'Bawang Putih', qty: 20, unit: 'g' },
                { name: 'Jahe', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 200, unit: 'ml' },
                { name: 'Garam', qty: 8, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Semur Daging',
            description: 'Daging sapi masak semur dengan kecap manis',
            category: 'Lauk',
            meal_type: 'LUNCH',
            servings: 4,
            cooking_time: 90,
            difficulty: 'HARD',
            instructions: '1. Potong daging. 2. Tumis bumbu. 3. Masukkan daging hingga berubah warna. 4. Tambahkan kecap manis, kentang. 5. Masak dengan air hingga empuk.',
            ingredients: [
                { name: 'Daging Sapi', qty: 400, unit: 'g' },
                { name: 'Kecap Manis', qty: 60, unit: 'ml' },
                { name: 'Kentang', qty: 200, unit: 'g' },
                { name: 'Bawang Merah', qty: 50, unit: 'g' },
                { name: 'Bawang Putih', qty: 15, unit: 'g' },
                { name: 'Jahe', qty: 10, unit: 'g' },
                { name: 'Gula Pasir', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 30, unit: 'ml' },
                { name: 'Garam', qty: 8, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Panci']
        },
        {
            name: 'Perkedel Kentang',
            description: 'Perkedel kentang goreng yang gurih dan lezat',
            category: 'Lauk',
            meal_type: 'ANY',
            servings: 4,
            cooking_time: 35,
            difficulty: 'MEDIUM',
            instructions: '1. Kukus/rebus kentang, haluskan. 2. Campur dengan bawang putih, daun bawang, garam. 3. Bentuk bulat pipih. 4. Celup ke kocokan telur. 5. Goreng hingga kecoklatan.',
            ingredients: [
                { name: 'Kentang', qty: 400, unit: 'g' },
                { name: 'Telur', qty: 2, unit: 'pcs' },
                { name: 'Daun Bawang', qty: 20, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 100, unit: 'ml' },
                { name: 'Garam', qty: 5, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan', 'Kukusan']
        },
        {
            name: 'Opor Ayam',
            description: 'Ayam masak santan kuning khas Lebaran',
            category: 'Lauk',
            meal_type: 'LUNCH',
            servings: 4,
            cooking_time: 60,
            difficulty: 'MEDIUM',
            instructions: '1. Haluskan bumbu opor. 2. Tumis bumbu halus hingga harum. 3. Masukkan ayam. 4. Tuang santan. 5. Masak hingga matang dan kuah mengental.',
            ingredients: [
                { name: 'Ayam', qty: 500, unit: 'g' },
                { name: 'Santan', qty: 400, unit: 'ml' },
                { name: 'Kunyit', qty: 10, unit: 'g' },
                { name: 'Jahe', qty: 15, unit: 'g' },
                { name: 'Bawang Merah', qty: 60, unit: 'g' },
                { name: 'Bawang Putih', qty: 20, unit: 'g' },
                { name: 'Ketumbar', qty: 10, unit: 'g' },
                { name: 'Garam', qty: 8, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Ikan Teri Kacang',
            description: 'Ikan teri goreng dengan bumbu bawang',
            category: 'Lauk',
            meal_type: 'ANY',
            servings: 4,
            cooking_time: 20,
            difficulty: 'EASY',
            instructions: '1. Cuci ikan teri bersih. 2. Goreng hingga kering. 3. Tumis bawang, cabai. 4. Masukkan teri goreng. 5. Aduk rata.',
            ingredients: [
                { name: 'Ikan Teri', qty: 150, unit: 'g' },
                { name: 'Bawang Merah', qty: 30, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Cabai Merah', qty: 20, unit: 'g' },
                { name: 'Minyak Goreng', qty: 60, unit: 'ml' },
                { name: 'Garam', qty: 3, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Oatmeal Pisang',
            description: 'Oatmeal sehat dengan irisan pisang untuk sarapan',
            category: 'Sarapan',
            meal_type: 'BREAKFAST',
            servings: 2,
            cooking_time: 10,
            difficulty: 'EASY',
            instructions: '1. Masak oat dengan air/susu hingga mengental. 2. Tambahkan sedikit gula. 3. Sajikan dengan irisan pisang di atas.',
            ingredients: [
                { name: 'Oat', qty: 100, unit: 'g' },
                { name: 'Pisang', qty: 2, unit: 'pcs' },
                { name: 'Gula Pasir', qty: 10, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Panci']
        },
        {
            name: 'Telur Dadar',
            description: 'Telur dadar simple dengan bumbu bawang dan daun bawang',
            category: 'Lauk',
            meal_type: 'BREAKFAST',
            servings: 2,
            cooking_time: 10,
            difficulty: 'EASY',
            instructions: '1. Kocok telur dengan garam. 2. Tambahkan bawang merah cincang dan daun bawang. 3. Goreng di wajan dengan sedikit minyak.',
            ingredients: [
                { name: 'Telur', qty: 3, unit: 'pcs' },
                { name: 'Bawang Merah', qty: 15, unit: 'g' },
                { name: 'Daun Bawang', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 20, unit: 'ml' },
                { name: 'Garam', qty: 3, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        },
        {
            name: 'Tumis Bayam Tahu',
            description: 'Tumis bayam dan tahu yang sehat dan bergizi',
            category: 'Sayur',
            meal_type: 'DINNER',
            servings: 3,
            cooking_time: 15,
            difficulty: 'EASY',
            instructions: '1. Goreng tahu sebentar. 2. Tumis bawang dan bawang putih. 3. Masukkan tahu dan bayam. 4. Bumbui garam, aduk hingga layu.',
            ingredients: [
                { name: 'Bayam', qty: 200, unit: 'g' },
                { name: 'Tahu', qty: 200, unit: 'g' },
                { name: 'Bawang Merah', qty: 25, unit: 'g' },
                { name: 'Bawang Putih', qty: 10, unit: 'g' },
                { name: 'Minyak Goreng', qty: 25, unit: 'ml' },
                { name: 'Garam', qty: 4, unit: 'g' }
            ],
            equipment: ['Kompor Gas', 'Wajan']
        }
    ];

    for (const recipe of recipes) {
        // IDEMPOTENT: skip if recipe with same name already exists
        const [existing] = await conn.query('SELECT id FROM recipes WHERE name=?', [recipe.name]);
        if (existing.length > 0) {
            console.log(`  ⏭️  Skipping existing recipe: ${recipe.name}`);
            continue;
        }

        const [rr] = await conn.query(
            `INSERT INTO recipes (name, description, category, meal_type, servings, cooking_time, difficulty, instructions)
             VALUES (?,?,?,?,?,?,?,?)`,
            [recipe.name, recipe.description, recipe.category, recipe.meal_type, recipe.servings, recipe.cooking_time, recipe.difficulty, recipe.instructions]
        );
        const recipeId = rr.insertId;

        // Insert ingredients
        for (const ing of recipe.ingredients) {
            const ingId = ingIds[ing.name];
            if (ingId) {
                await conn.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?,?,?,?)',
                    [recipeId, ingId, ing.qty, ing.unit]);
            } else {
                console.warn(`  ⚠️  Ingredient not found: "${ing.name}" in recipe "${recipe.name}"`);
            }
        }

        // Insert equipment
        for (const eqName of recipe.equipment) {
            const eqId = eqIds[eqName];
            if (eqId) {
                await conn.query('INSERT INTO recipe_equipment (recipe_id, equipment_id) VALUES (?,?)', [recipeId, eqId]);
            }
        }

        // Recalculate nutrition totals (per serving)
        const [ings] = await conn.query(`
            SELECT ri.quantity, inn.calories, inn.protein, inn.fat, inn.carbs
            FROM recipe_ingredients ri
            JOIN ingredient_nutrition inn ON ri.ingredient_id = inn.ingredient_id
            WHERE ri.recipe_id = ?`, [recipeId]);
        let cal = 0, pro = 0, fat = 0, carb = 0;
        for (const ing of ings) {
            cal  += (ing.calories || 0) * ing.quantity;
            pro  += (ing.protein  || 0) * ing.quantity;
            fat  += (ing.fat      || 0) * ing.quantity;
            carb += (ing.carbs    || 0) * ing.quantity;
        }
        const servings = recipe.servings || 1;
        await conn.query('UPDATE recipes SET total_calories=?, total_protein=?, total_fat=?, total_carbs=? WHERE id=?',
            [cal / servings, pro / servings, fat / servings, carb / servings, recipeId]);
    }

    console.log('✅ Recipes seeded (20 recipes, duplicates skipped)');


    // --- Demo User Inventory (give user@demo.com some stock) ---
    const [userRow] = await conn.query('SELECT id FROM users WHERE email=?', ['user@demo.com']);
    if (userRow.length > 0) {
        const userId = userRow[0].id;
        const stockItems = [
            ['Beras', 1000, 'g'],
            ['Ayam', 300, 'g'],
            ['Telur', 6, 'pcs'],
            ['Bawang Merah', 100, 'g'],
            ['Bawang Putih', 50, 'g'],
            ['Minyak Goreng', 200, 'ml'],
            ['Garam', 50, 'g'],
            ['Kecap Manis', 100, 'ml'],
            ['Gula Pasir', 100, 'g'],
            ['Tahu', 200, 'g'],
        ];
        for (const [name, qty, unit] of stockItems) {
            const ingId = ingIds[name];
            if (ingId) {
                await conn.query('INSERT IGNORE INTO user_inventory (user_id, ingredient_id, quantity, unit, minimum_stock) VALUES (?,?,?,?,?)',
                    [userId, ingId, qty, unit, qty * 0.1]);
            }
        }
        // Give demo user some equipment
        const demoEq = ['Kompor Gas', 'Rice Cooker', 'Wajan', 'Panci', 'Talenan'];
        for (const eqName of demoEq) {
            const eqId = eqIds[eqName];
            if (eqId) await conn.query('INSERT IGNORE INTO user_equipment (user_id, equipment_id) VALUES (?,?)', [userId, eqId]);
        }
        // Demo budget
        await conn.query('INSERT IGNORE INTO user_budgets (user_id, amount, period, days) VALUES (?,?,?,?)', [userId, 500000, 'WEEKLY', 7]);
        console.log('✅ Demo user inventory, equipment, and budget set');
    }

    await conn.end();
    console.log('🎉 Seed complete!');
}

seed().catch(console.error);
