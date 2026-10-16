const db = require('../database/connection');

// User equipment management
const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, CASE WHEN ue.id IS NOT NULL THEN 1 ELSE 0 END AS owned
            FROM equipment e
            LEFT JOIN user_equipment ue ON e.id = ue.equipment_id AND ue.user_id = ?
            ORDER BY e.name`, [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const addEquipment = async (req, res) => {
    const { equipment_id } = req.body;
    if (!equipment_id) return res.status(400).json({ success: false, message: 'equipment_id required' });
    try {
        const [existing] = await db.query('SELECT id FROM user_equipment WHERE user_id=? AND equipment_id=?', [req.user.id, equipment_id]);
        if (existing.length > 0) return res.status(409).json({ success: false, message: 'Equipment already added' });
        await db.query('INSERT INTO user_equipment (user_id, equipment_id) VALUES (?,?)', [req.user.id, equipment_id]);
        res.status(201).json({ success: true, message: 'Equipment added' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const removeEquipment = async (req, res) => {
    const { equipment_id } = req.params;
    try {
        await db.query('DELETE FROM user_equipment WHERE user_id=? AND equipment_id=?', [req.user.id, equipment_id]);
        res.json({ success: true, message: 'Equipment removed' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Admin: CRUD for equipment master
const adminGetAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM equipment ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const adminCreate = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    try {
        const [result] = await db.query('INSERT INTO equipment (name, description) VALUES (?,?)', [name, description || '']);
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const adminUpdate = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        await db.query('UPDATE equipment SET name=?, description=? WHERE id=?', [name, description || '', id]);
        res.json({ success: true, message: 'Updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const adminDelete = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM equipment WHERE id=?', [id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAll, addEquipment, removeEquipment, adminGetAll, adminCreate, adminUpdate, adminDelete };
