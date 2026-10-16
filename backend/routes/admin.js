const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../database/connection');
const bcrypt = require('bcrypt');
const dashboardCtrl = require('../controllers/dashboardController');

// Admin only — apply to all routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats — admin statistics
router.get('/stats', dashboardCtrl.getAdminStats);

// GET /api/admin/users — list all users with stats
router.get('/users', async (req, res) => {
    try {
        const { search = '', role = '', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let where = 'WHERE 1=1';
        const params = [];

        if (search) {
            where += ' AND (u.name LIKE ? OR u.email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (role) {
            where += ' AND u.role = ?';
            params.push(role);
        }

        const [users] = await db.query(`
            SELECT
                u.id, u.name, u.email, u.role, u.created_at,
                COUNT(DISTINCT fm.id) AS family_count,
                COUNT(DISTINCT mp.id) AS plan_count,
                ub.amount AS budget_amount,
                ub.period AS budget_period
            FROM users u
            LEFT JOIN family_members fm ON fm.user_id = u.id
            LEFT JOIN meal_plans mp ON mp.user_id = u.id
            LEFT JOIN user_budgets ub ON ub.user_id = u.id
            ${where}
            GROUP BY u.id, ub.amount, ub.period
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) as total FROM users u ${where}`,
            params
        );

        const [[stats]] = await db.query(`
            SELECT
                COUNT(*) as total_users,
                SUM(role = 'ADMIN') as total_admins,
                SUM(role = 'USER') as total_regular,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_this_week
            FROM users
        `);

        res.json({
            success: true,
            data: { users, total, stats, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/admin/users/:id — user detail
router.get('/users/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.name, u.email, u.role, u.created_at,
                   ub.amount as budget_amount, ub.period as budget_period, ub.days as budget_days
            FROM users u
            LEFT JOIN user_budgets ub ON ub.user_id = u.id
            WHERE u.id = ?
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });

        const [members] = await db.query('SELECT * FROM family_members WHERE user_id = ?', [req.params.id]);
        const [plans]   = await db.query(`
            SELECT id, 
                   CONCAT('Rencana ', DATE_FORMAT(start_date, '%d %b %Y')) AS name,
                   status, start_date, end_date, estimated_cost AS total_cost 
            FROM meal_plans 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 5
        `, [req.params.id]);

        res.json({ success: true, data: { ...rows[0], family_members: members, recent_plans: plans } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/admin/users — create user
router.post('/users', async (req, res) => {
    const { name, email, password, role = 'USER' } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ success: false, message: 'Email already registered' });
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashed, role]
        );
        res.status(201).json({ success: true, message: 'User created', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/admin/users/:id — update user
router.put('/users/:id', async (req, res) => {
    const { name, email, role, password } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        if (!existing.length) return res.status(404).json({ success: false, message: 'User not found' });

        // Prevent demoting self
        if (parseInt(req.params.id) === req.user.id && role === 'USER') {
            return res.status(400).json({ success: false, message: 'You cannot demote your own admin account' });
        }

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET name=?, email=?, role=?, password=? WHERE id=?', [name, email, role, hashed, req.params.id]);
        } else {
            await db.query('UPDATE users SET name=?, email=?, role=? WHERE id=?', [name, email, role, req.params.id]);
        }
        res.json({ success: true, message: 'User updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', async (req, res) => {
    if (parseInt(req.params.id) === req.user.id)
        return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
        if (!existing.length) return res.status(404).json({ success: false, message: 'User not found' });
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH /api/admin/users/:id/role — quick role toggle
router.patch('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role))
        return res.status(400).json({ success: false, message: 'Invalid role' });
    if (parseInt(req.params.id) === req.user.id)
        return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ success: true, message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
