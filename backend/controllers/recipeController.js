const db = require('../database/connection');

const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, 
                GROUP_CONCAT(DISTINCT CONCAT(i.name, ':', ri.quantity, ':', ri.unit) SEPARATOR '|') AS ingredients_list,
                GROUP_CONCAT(DISTINCT e.name SEPARATOR ',') AS equipment_list
            FROM recipes r
            LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            LEFT JOIN ingredients i ON ri.ingredient_id = i.id
            LEFT JOIN recipe_equipment re ON r.id = re.recipe_id
            LEFT JOIN equipment e ON re.equipment_id = e.id
            GROUP BY r.id
            ORDER BY r.name`);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [recipes] = await db.query('SELECT * FROM recipes WHERE id=?', [id]);
        if (!recipes.length) return res.status(404).json({ success: false, message: 'Not found' });
        const recipe = recipes[0];

        const [ingredients] = await db.query(`
            SELECT ri.*, i.name AS ingredient_name, i.unit AS default_unit, inn.calories, inn.protein, inn.fat, inn.carbs, ip.price
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            LEFT JOIN ingredient_nutrition inn ON i.id = inn.ingredient_id
            LEFT JOIN ingredient_prices ip ON i.id = ip.ingredient_id
            WHERE ri.recipe_id = ?`, [id]);

        const [equipment] = await db.query(`
            SELECT e.* FROM recipe_equipment re
            JOIN equipment e ON re.equipment_id = e.id
            WHERE re.recipe_id = ?`, [id]);

        res.json({ success: true, data: { ...recipe, ingredients, equipment } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

async function recalculateNutrition(conn, recipeId, servings) {
    const [ings] = await conn.query(`
        SELECT ri.quantity, inn.calories, inn.protein, inn.fat, inn.carbs
        FROM recipe_ingredients ri
        JOIN ingredient_nutrition inn ON ri.ingredient_id = inn.ingredient_id
        WHERE ri.recipe_id = ?`, [recipeId]);
    let cal = 0, pro = 0, fat = 0, carb = 0;
    for (const ing of ings) {
        cal += (ing.calories || 0) * ing.quantity;
        pro += (ing.protein || 0) * ing.quantity;
        fat += (ing.fat || 0) * ing.quantity;
        carb += (ing.carbs || 0) * ing.quantity;
    }
    // Divide by servings for per-serving nutrition
    const s = servings || 1;
    await conn.query('UPDATE recipes SET total_calories=?, total_protein=?, total_fat=?, total_carbs=? WHERE id=?',
        [cal / s, pro / s, fat / s, carb / s, recipeId]);
}

const create = async (req, res) => {
    const { name, description, category, meal_type, servings, cooking_time, difficulty, instructions, ingredients, equipment } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [r] = await conn.query(`INSERT INTO recipes (name, description, category, meal_type, servings, cooking_time, difficulty, instructions)
            VALUES (?,?,?,?,?,?,?,?)`, [name, description || '', category || '', meal_type || 'ANY', servings || 1, cooking_time || 0, difficulty || 'MEDIUM', instructions || '']);
        const recipeId = r.insertId;
        if (ingredients && Array.isArray(ingredients)) {
            for (const ing of ingredients) {
                await conn.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?,?,?,?)',
                    [recipeId, ing.ingredient_id, ing.quantity, ing.unit]);
            }
        }
        if (equipment && Array.isArray(equipment)) {
            for (const eq of equipment) {
                await conn.query('INSERT INTO recipe_equipment (recipe_id, equipment_id) VALUES (?,?)', [recipeId, eq.equipment_id]);
            }
        }
        await recalculateNutrition(conn, recipeId, servings || 1);
        await conn.commit();
        res.status(201).json({ success: true, data: { id: recipeId } });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
};

const update = async (req, res) => {
    const { id } = req.params;
    const { name, description, category, meal_type, servings, cooking_time, difficulty, instructions, ingredients, equipment } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(`UPDATE recipes SET name=?, description=?, category=?, meal_type=?, servings=?, cooking_time=?, difficulty=?, instructions=? WHERE id=?`,
            [name, description || '', category || '', meal_type || 'ANY', servings || 1, cooking_time || 0, difficulty || 'MEDIUM', instructions || '', id]);
        if (ingredients) {
            await conn.query('DELETE FROM recipe_ingredients WHERE recipe_id=?', [id]);
            for (const ing of ingredients) {
                await conn.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?,?,?,?)',
                    [id, ing.ingredient_id, ing.quantity, ing.unit]);
            }
        }
        if (equipment) {
            await conn.query('DELETE FROM recipe_equipment WHERE recipe_id=?', [id]);
            for (const eq of equipment) {
                await conn.query('INSERT INTO recipe_equipment (recipe_id, equipment_id) VALUES (?,?)', [id, eq.equipment_id]);
            }
        }
        await recalculateNutrition(conn, id, servings || 1);
        await conn.commit();
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
};

const remove = async (req, res) => {
    try {
        await db.query('DELETE FROM recipes WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, getById, create, update, remove };
