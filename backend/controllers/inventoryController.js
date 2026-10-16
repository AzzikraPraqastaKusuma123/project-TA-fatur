const db = require('../database/connection');

const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT ui.*, ui.expiration_date AS expiry_date, i.name AS ingredient_name, i.category, i.unit AS default_unit
            FROM user_inventory ui
            JOIN ingredients i ON ui.ingredient_id = i.id
            WHERE ui.user_id = ?
            ORDER BY ui.id`, [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
    const { ingredient_id, quantity, unit, expiration_date, expiry_date, minimum_stock, notes } = req.body;
    if (!ingredient_id || !quantity || !unit)
        return res.status(400).json({ success: false, message: 'ingredient_id, quantity, unit required' });
    const expDate = expiration_date || expiry_date || null;
    try {
        const [existing] = await db.query('SELECT id FROM user_inventory WHERE user_id=? AND ingredient_id=?', [req.user.id, ingredient_id]);
        if (existing.length > 0) {
            await db.query('UPDATE user_inventory SET quantity=quantity+?, unit=?, expiration_date=?, minimum_stock=?, notes=? WHERE user_id=? AND ingredient_id=?',
                [quantity, unit, expDate, minimum_stock || 0, notes || null, req.user.id, ingredient_id]);
            return res.json({ success: true, message: 'Inventory updated (quantity added)' });
        }
        const [result] = await db.query('INSERT INTO user_inventory (user_id, ingredient_id, quantity, unit, expiration_date, minimum_stock, notes) VALUES (?,?,?,?,?,?,?)',
            [req.user.id, ingredient_id, quantity, unit, expDate, minimum_stock || 0, notes || null]);
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const update = async (req, res) => {
    const { id } = req.params;
    const { quantity, unit, expiration_date, expiry_date, minimum_stock, notes } = req.body;
    const expDate = expiration_date || expiry_date || null;
    try {
        const [check] = await db.query('SELECT id FROM user_inventory WHERE id=? AND user_id=?', [id, req.user.id]);
        if (check.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        await db.query('UPDATE user_inventory SET quantity=?, unit=?, expiration_date=?, minimum_stock=?, notes=? WHERE id=?',
            [quantity, unit, expDate, minimum_stock || 0, notes || null, id]);
        res.json({ success: true, message: 'Updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [check] = await db.query('SELECT id FROM user_inventory WHERE id=? AND user_id=?', [id, req.user.id]);
        if (check.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        await db.query('DELETE FROM user_inventory WHERE id=?', [id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Apply shopping list purchase: add quantities to inventory
const applyPurchase = async (req, res) => {
    const { items } = req.body; // [{ingredient_id, quantity, unit}]
    if (!items || !Array.isArray(items)) return res.status(400).json({ success: false, message: 'items array required' });
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        for (const item of items) {
            const [existing] = await conn.query('SELECT id FROM user_inventory WHERE user_id=? AND ingredient_id=?', [req.user.id, item.ingredient_id]);
            if (existing.length > 0) {
                await conn.query('UPDATE user_inventory SET quantity=quantity+? WHERE user_id=? AND ingredient_id=?', [item.quantity, req.user.id, item.ingredient_id]);
            } else {
                await conn.query('INSERT INTO user_inventory (user_id, ingredient_id, quantity, unit) VALUES (?,?,?,?)', [req.user.id, item.ingredient_id, item.quantity, item.unit]);
            }
        }
        await conn.commit();
        res.json({ success: true, message: 'Inventory updated with purchases' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};

module.exports = { getAll, create, update, remove, applyPurchase };
