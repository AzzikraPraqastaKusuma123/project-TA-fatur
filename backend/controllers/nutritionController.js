const db = require('../database/connection');

// GET /api/nutrition/today — nutrisi hari ini dari meal plan aktif
const getTodayNutrition = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const [meals] = await db.query(`
            SELECT mpi.meal_slot, mpi.day_date,
                   r.name AS recipe_name,
                   COALESCE(r.total_calories, 0)  AS calories,
                   COALESCE(r.total_protein, 0)   AS protein,
                   COALESCE(r.total_fat, 0)        AS fat,
                   COALESCE(r.total_carbs, 0)      AS carbs,
                   COALESCE(r.total_fiber, 0)      AS fiber,
                   r.id AS recipe_id
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id = ? AND mp.status = 'ACTIVE'
              AND mpi.day_date = ?
            ORDER BY FIELD(mpi.meal_slot, 'BREAKFAST','LUNCH','DINNER','SNACK')
        `, [userId, today]);

        const totals = meals.reduce((acc, m) => ({
            calories: acc.calories + Number(m.calories),
            protein:  acc.protein  + Number(m.protein),
            fat:      acc.fat      + Number(m.fat),
            carbs:    acc.carbs    + Number(m.carbs),
            fiber:    acc.fiber    + Number(m.fiber),
        }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 });

        // Get family members count to determine targets
        const [[{ members }]] = await db.query(
            'SELECT COUNT(*) AS members FROM family_members WHERE user_id = ?', [userId]
        );
        const familySize = members + 1; // +1 for main user

        // Basic daily targets (per person * family size)
        const targets = {
            calories: 2000 * familySize,
            protein:  50   * familySize,
            fat:      65   * familySize,
            carbs:    300  * familySize,
            fiber:    25   * familySize,
        };

        res.json({ success: true, data: { meals, totals, targets, date: today, family_size: familySize } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/nutrition/weekly — nutrisi 7 hari dari meal plan aktif
const getWeeklyNutrition = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 7;

        const [rows] = await db.query(`
            SELECT 
                mpi.day_date,
                SUM(COALESCE(r.total_calories, 0)) AS calories,
                SUM(COALESCE(r.total_protein, 0))  AS protein,
                SUM(COALESCE(r.total_fat, 0))       AS fat,
                SUM(COALESCE(r.total_carbs, 0))     AS carbs,
                SUM(COALESCE(r.total_fiber, 0))     AS fiber,
                COUNT(mpi.id) AS meal_count
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id = ?
              AND mpi.day_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
              AND mpi.day_date <= CURDATE()
            GROUP BY mpi.day_date
            ORDER BY mpi.day_date ASC
        `, [userId, days]);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/nutrition/summary — ringkasan nutrisi per slot makan
const getNutritionSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Per slot breakdown from all meal plans
        const [slotBreakdown] = await db.query(`
            SELECT 
                mpi.meal_slot,
                AVG(COALESCE(r.total_calories, 0)) AS avg_calories,
                AVG(COALESCE(r.total_protein, 0))  AS avg_protein,
                AVG(COALESCE(r.total_fat, 0))       AS avg_fat,
                AVG(COALESCE(r.total_carbs, 0))     AS avg_carbs,
                COUNT(DISTINCT mpi.day_date)         AS days_tracked
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id = ?
            GROUP BY mpi.meal_slot
        `, [userId]);

        // Top nutritious recipes used
        const [topRecipes] = await db.query(`
            SELECT r.id, r.name, r.total_calories, r.total_protein, r.image_url,
                   COUNT(mpi.id) AS times_used
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id = ?
            GROUP BY r.id
            ORDER BY r.total_protein DESC
            LIMIT 5
        `, [userId]);

        res.json({ success: true, data: { slot_breakdown: slotBreakdown, top_recipes: topRecipes } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getTodayNutrition, getWeeklyNutrition, getNutritionSummary };
