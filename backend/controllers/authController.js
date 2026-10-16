const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    if (password.length < 6)
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email already registered' });
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
        res.status(201).json({ success: true, message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        const msg = err.code === 'ECONNREFUSED' || err.name === 'AggregateError' 
            ? 'Koneksi database terputus. Pastikan server MySQL berjalan.' 
            : (err.message || 'Terjadi kesalahan pada server');
        res.status(500).json({ success: false, message: msg });
    }
};

const me = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: rows[0] });
    } catch (err) {
        const msg = err.code === 'ECONNREFUSED' || err.name === 'AggregateError' ? 'Koneksi database terputus.' : err.message;
        res.status(500).json({ success: false, message: msg });
    }
};

const updateProfile = async (req, res) => {
    const { name, password } = req.body;
    try {
        if (password && name) {
            const hashed = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET name = ?, password = ? WHERE id = ?', [name, hashed, req.user.id]);
        } else if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
        } else if (name) {
            await db.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
        } else {
            return res.status(400).json({ success: false, message: 'Tidak ada data untuk diperbarui' });
        }
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        const msg = err.code === 'ECONNREFUSED' || err.name === 'AggregateError' ? 'Koneksi database terputus.' : err.message;
        res.status(500).json({ success: false, message: msg });
    }
};

module.exports = { register, login, me, updateProfile };
