const db = require('../database/connection');

// GET /api/analytics/spending — pengeluaran per bulan
const getSpendingTrend = async (req, res) => {
    try {
        const userId = req.user.id;
        const months = parseInt(req.query.months) || 6;

        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                DATE_FORMAT(created_at, '%b %Y')  AS label,
                SUM(estimated_cost) AS total_spent,
                AVG(estimated_cost) AS avg_spent,
                COUNT(*)            AS plan_count,
                AVG(total_budget)   AS avg_budget
            FROM meal_plans
            WHERE user_id = ?
              AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `, [userId, months]);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/recipes — resep paling sering dipakai
const getTopRecipes = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(`
            SELECT 
                r.id, r.name, r.total_calories, r.total_cost,
                r.category, r.image_url,
                COUNT(mpi.id) AS usage_count,
                SUM(mpi.servings) AS total_servings
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id = ?
            GROUP BY r.id
            ORDER BY usage_count DESC
            LIMIT 10
        `, [userId]);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/budget — perbandingan budget vs realisasi
const getBudgetAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;

        const [plans] = await db.query(`
            SELECT 
                id, start_date, end_date,
                total_budget, estimated_cost, status,
                ROUND((estimated_cost / NULLIF(total_budget,0)) * 100, 1) AS utilization_pct
            FROM meal_plans
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 12
        `, [userId]);

        // Summary
        const [[summary]] = await db.query(`
            SELECT 
                COUNT(*) AS total_plans,
                AVG(estimated_cost) AS avg_cost,
                AVG(total_budget)   AS avg_budget,
                SUM(total_budget - estimated_cost) AS total_savings,
                AVG((estimated_cost / NULLIF(total_budget,0)) * 100) AS avg_utilization
            FROM meal_plans
            WHERE user_id = ?
        `, [userId]);

        res.json({ success: true, data: { plans, summary } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/categories — distribusi kategori resep
const getCategoryDistribution = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(`
            SELECT 
                COALESCE(r.category, 'Lainnya') AS category,
                COUNT(mpi.id) AS count,
                ROUND(COUNT(mpi.id) * 100.0 / SUM(COUNT(mpi.id)) OVER(), 1) AS percentage
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id = ?
            GROUP BY r.category
            ORDER BY count DESC
        `, [userId]);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/overview — ringkasan umum untuk analytics dashboard
const getAnalyticsOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        const [[totals]] = await db.query(`
            SELECT 
                COUNT(*) AS total_plans,
                SUM(estimated_cost) AS total_spent,
                SUM(total_budget)   AS total_budget,
                SUM(total_budget - estimated_cost) AS total_savings
            FROM meal_plans WHERE user_id = ?
        `, [userId]);

        const [[{ total_recipes_used }]] = await db.query(`
            SELECT COUNT(DISTINCT mpi.recipe_id) AS total_recipes_used
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            WHERE mp.user_id = ?
        `, [userId]);

        const [[{ avg_calories }]] = await db.query(`
            SELECT AVG(daily_cal) AS avg_calories FROM (
                SELECT mpi.day_date, SUM(COALESCE(r.total_calories,0)) AS daily_cal
                FROM meal_plan_items mpi
                JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
                JOIN recipes r ON mpi.recipe_id = r.id
                WHERE mp.user_id = ?
                GROUP BY mpi.day_date
            ) t
        `, [userId]);

        // Most used ingredient
        const [topIngredients] = await db.query(`
            SELECT i.name, COUNT(ri.id) AS usage_count
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipe_ingredients ri ON ri.recipe_id = mpi.recipe_id
            JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE mp.user_id = ?
            GROUP BY i.id
            ORDER BY usage_count DESC
            LIMIT 5
        `, [userId]);

        res.json({
            success: true,
            data: {
                total_plans:       totals.total_plans  || 0,
                total_spent:       totals.total_spent  || 0,
                total_budget:      totals.total_budget || 0,
                total_savings:     totals.total_savings || 0,
                total_recipes_used,
                avg_daily_calories: Math.round(avg_calories || 0),
                top_ingredients:   topIngredients,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getSpendingTrend,
    getTopRecipes,
    getBudgetAnalysis,
    getCategoryDistribution,
    getAnalyticsOverview,
};
