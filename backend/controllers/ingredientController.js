const db = require('../database/connection');

// ---- Ingredient Master (Admin) ----
const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, 
                inn.calories, inn.protein, inn.fat, inn.carbs,
                ip.price
            FROM ingredients i
            LEFT JOIN ingredient_nutrition inn ON i.id = inn.ingredient_id
            LEFT JOIN ingredient_prices ip ON i.id = ip.ingredient_id
            ORDER BY i.name`);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getById = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, inn.calories, inn.protein, inn.fat, inn.carbs, ip.price
            FROM ingredients i
            LEFT JOIN ingredient_nutrition inn ON i.id = inn.ingredient_id
            LEFT JOIN ingredient_prices ip ON i.id = ip.ingredient_id
            WHERE i.id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
    const { name, category, unit, calories, protein, fat, carbs, price } = req.body;
    if (!name || !unit) return res.status(400).json({ success: false, message: 'Name and unit required' });
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [r] = await conn.query('INSERT INTO ingredients (name, category, unit) VALUES (?,?,?)', [name, category || '', unit]);
        const ingId = r.insertId;
        await conn.query('INSERT INTO ingredient_nutrition (ingredient_id, calories, protein, fat, carbs) VALUES (?,?,?,?,?)',
            [ingId, calories || 0, protein || 0, fat || 0, carbs || 0]);
        await conn.query('INSERT INTO ingredient_prices (ingredient_id, price) VALUES (?,?)', [ingId, price || 0]);
        await conn.commit();
        res.status(201).json({ success: true, data: { id: ingId } });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
};

const update = async (req, res) => {
    const { id } = req.params;
    const { name, category, unit, calories, protein, fat, carbs, price } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('UPDATE ingredients SET name=?, category=?, unit=? WHERE id=?', [name, category || '', unit, id]);
        const [nutCheck] = await conn.query('SELECT id FROM ingredient_nutrition WHERE ingredient_id=?', [id]);
        if (nutCheck.length > 0) {
            await conn.query('UPDATE ingredient_nutrition SET calories=?, protein=?, fat=?, carbs=? WHERE ingredient_id=?',
                [calories || 0, protein || 0, fat || 0, carbs || 0, id]);
        } else {
            await conn.query('INSERT INTO ingredient_nutrition (ingredient_id, calories, protein, fat, carbs) VALUES (?,?,?,?,?)',
                [id, calories || 0, protein || 0, fat || 0, carbs || 0]);
        }
        const [priceCheck] = await conn.query('SELECT id FROM ingredient_prices WHERE ingredient_id=?', [id]);
        if (priceCheck.length > 0) {
            await conn.query('UPDATE ingredient_prices SET price=? WHERE ingredient_id=?', [price || 0, id]);
        } else {
            await conn.query('INSERT INTO ingredient_prices (ingredient_id, price) VALUES (?,?)', [id, price || 0]);
        }
        await conn.commit();
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
};

const remove = async (req, res) => {
    try {
        await db.query('DELETE FROM ingredients WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, getById, create, update, remove };
