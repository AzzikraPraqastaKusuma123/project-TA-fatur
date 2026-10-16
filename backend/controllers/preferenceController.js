const db = require('../database/connection');

const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT up.*, i.name AS ingredient_name, i.category
            FROM user_preferences up
            JOIN ingredients i ON up.ingredient_id = i.id
            WHERE up.user_id = ?`, [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const add = async (req, res) => {
    const { ingredient_id, preference_type } = req.body;
    if (!ingredient_id || !preference_type)
        return res.status(400).json({ success: false, message: 'ingredient_id and preference_type required' });
    if (!['FAVORITE', 'AVOID'].includes(preference_type))
        return res.status(400).json({ success: false, message: 'preference_type must be FAVORITE or AVOID' });
    try {
        const [existing] = await db.query('SELECT id FROM user_preferences WHERE user_id=? AND ingredient_id=?', [req.user.id, ingredient_id]);
        if (existing.length > 0) {
            await db.query('UPDATE user_preferences SET preference_type=? WHERE user_id=? AND ingredient_id=?', [preference_type, req.user.id, ingredient_id]);
            return res.json({ success: true, message: 'Preference updated' });
        }
        await db.query('INSERT INTO user_preferences (user_id, ingredient_id, preference_type) VALUES (?,?,?)', [req.user.id, ingredient_id, preference_type]);
        res.status(201).json({ success: true, message: 'Preference added' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM user_preferences WHERE id=? AND user_id=?', [id, req.user.id]);
        res.json({ success: true, message: 'Preference removed' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, add, remove };
