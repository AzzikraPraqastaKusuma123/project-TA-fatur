const db = require('../database/connection');

// Helper: calculate BMR + TDEE using Mifflin-St Jeor
function calculateDailyNeeds(member) {
    const { age, gender, weight, height, activity_level } = member;
    let bmr;
    if (gender === 'MALE') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const activityFactors = {
        SEDENTARY: 1.2,
        LIGHTLY_ACTIVE: 1.375,
        MODERATELY_ACTIVE: 1.55,
        VERY_ACTIVE: 1.725,
        EXTRA_ACTIVE: 1.9
    };
    const calories = bmr * (activityFactors[activity_level] || 1.55);
    const protein = weight * 0.8; // g
    const fat = (calories * 0.25) / 9; // g
    const carbs = (calories * 0.55) / 4; // g
    return {
        daily_calories_target: Math.round(calories),
        daily_protein_target: Math.round(protein * 10) / 10,
        daily_fat_target: Math.round(fat * 10) / 10,
        daily_carbs_target: Math.round(carbs * 10) / 10
    };
}

const getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM family_members WHERE user_id = ? ORDER BY id', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    const { name, age, gender, weight, height, activity_level } = req.body;
    if (!name || !age || !gender || !weight || !height)
        return res.status(400).json({ success: false, message: 'All fields required' });
    try {
        const needs = calculateDailyNeeds({ age, gender, weight, height, activity_level: activity_level || 'MODERATELY_ACTIVE' });
        const [result] = await db.query(
            `INSERT INTO family_members (user_id, name, age, gender, weight, height, activity_level,
             daily_calories_target, daily_protein_target, daily_fat_target, daily_carbs_target)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, name, age, gender, weight, height, activity_level || 'MODERATELY_ACTIVE',
             needs.daily_calories_target, needs.daily_protein_target, needs.daily_fat_target, needs.daily_carbs_target]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, ...needs } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const update = async (req, res) => {
    const { id } = req.params;
    const { name, age, gender, weight, height, activity_level } = req.body;
    try {
        const [check] = await db.query('SELECT id FROM family_members WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (check.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        const needs = calculateDailyNeeds({ age, gender, weight, height, activity_level: activity_level || 'MODERATELY_ACTIVE' });
        await db.query(
            `UPDATE family_members SET name=?, age=?, gender=?, weight=?, height=?, activity_level=?,
             daily_calories_target=?, daily_protein_target=?, daily_fat_target=?, daily_carbs_target=? WHERE id=?`,
            [name, age, gender, weight, height, activity_level || 'MODERATELY_ACTIVE',
             needs.daily_calories_target, needs.daily_protein_target, needs.daily_fat_target, needs.daily_carbs_target, id]
        );
        res.json({ success: true, message: 'Updated', data: needs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [check] = await db.query('SELECT id FROM family_members WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (check.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        await db.query('DELETE FROM family_members WHERE id = ?', [id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, create, update, remove };
