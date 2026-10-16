const db = require('../database/connection');

const get = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM user_budgets WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
        res.json({ success: true, data: rows[0] || null });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const set = async (req, res) => {
    const { amount, period, days } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
    try {
        const [existing] = await db.query('SELECT id FROM user_budgets WHERE user_id = ?', [req.user.id]);
        if (existing.length > 0) {
            await db.query('UPDATE user_budgets SET amount=?, period=?, days=? WHERE user_id=?', [amount, period || 'WEEKLY', days || 7, req.user.id]);
        } else {
            await db.query('INSERT INTO user_budgets (user_id, amount, period, days) VALUES (?, ?, ?, ?)', [req.user.id, amount, period || 'WEEKLY', days || 7]);
        }
        res.json({ success: true, message: 'Budget saved' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { get, set };
