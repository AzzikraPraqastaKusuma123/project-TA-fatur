const db = require('../database/connection');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [[{ total_inventory }]] = await db.query('SELECT COUNT(*) as total_inventory FROM user_inventory WHERE user_id=?', [userId]);
        const [[{ low_stock }]] = await db.query('SELECT COUNT(*) as low_stock FROM user_inventory WHERE user_id=? AND quantity <= minimum_stock AND minimum_stock > 0', [userId]);
        const [[budget_row]] = await db.query('SELECT * FROM user_budgets WHERE user_id=? LIMIT 1', [userId]);
        const [[{ active_plans }]] = await db.query('SELECT COUNT(*) as active_plans FROM meal_plans WHERE user_id=? AND status="ACTIVE"', [userId]);
        const [[{ total_recipes }]] = await db.query('SELECT COUNT(*) as total_recipes FROM recipes');
        const [[{ family_count }]] = await db.query('SELECT COUNT(*) as family_count FROM family_members WHERE user_id=?', [userId]);

        // Most recent active meal plan cost
        const [recentPlan] = await db.query('SELECT estimated_cost, total_budget FROM meal_plans WHERE user_id=? AND status="ACTIVE" ORDER BY created_at DESC LIMIT 1', [userId]);

        // Low stock items
        const [lowStockItems] = await db.query(`
            SELECT ui.*, i.name AS ingredient_name FROM user_inventory ui
            JOIN ingredients i ON ui.ingredient_id = i.id
            WHERE ui.user_id=? AND ui.quantity <= ui.minimum_stock AND ui.minimum_stock > 0
            LIMIT 5`, [userId]);

        // Active meal plan meals
        const [upcomingMeals] = await db.query(`
            SELECT mpi.*, r.name AS recipe_name, mp.start_date
            FROM meal_plan_items mpi
            JOIN meal_plans mp ON mpi.meal_plan_id = mp.id
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mp.user_id=? AND mp.status='ACTIVE'
            ORDER BY mpi.day_date, mpi.meal_slot
            LIMIT 9`, [userId]);

        // Family members
        const [familyMembers] = await db.query('SELECT * FROM family_members WHERE user_id=? ORDER BY id ASC', [userId]);

        // Preferences
        const [preferences] = await db.query(`
            SELECT up.*, i.name AS ingredient_name, i.category
            FROM user_preferences up
            JOIN ingredients i ON up.ingredient_id = i.id
            WHERE up.user_id = ?
            ORDER BY up.id DESC`, [userId]);

        res.json({
            success: true, data: {
                total_inventory,
                low_stock,
                active_plans,
                total_recipes,
                family_count: familyMembers.length,
                family_members: familyMembers,
                preferences,
                budget: budget_row || null,
                recent_plan: recentPlan[0] || null,
                low_stock_items: lowStockItems,
                upcoming_meals: upcomingMeals
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Admin dashboard
const getAdminStats = async (req, res) => {
    try {
        const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users WHERE role="USER"');
        const [[{ total_recipes }]] = await db.query('SELECT COUNT(*) as total_recipes FROM recipes');
        const [[{ total_ingredients }]] = await db.query('SELECT COUNT(*) as total_ingredients FROM ingredients');
        const [[{ total_equipment }]] = await db.query('SELECT COUNT(*) as total_equipment FROM equipment');
        const [[{ total_plans }]] = await db.query('SELECT COUNT(*) as total_plans FROM meal_plans');
        const [[{ total_runs }]] = await db.query('SELECT COUNT(*) as total_runs FROM optimization_runs');
        const [[{ avg_time }]] = await db.query('SELECT AVG(processing_time_ms) as avg_time FROM optimization_runs WHERE status!="ERROR"');
        const [[{ infeasible_count }]] = await db.query('SELECT COUNT(*) as infeasible_count FROM optimization_runs WHERE status="INFEASIBLE"');
        const [recentRuns] = await db.query('SELECT or2.*, u.name FROM optimization_runs or2 JOIN users u ON or2.user_id=u.id ORDER BY or2.created_at DESC LIMIT 10');
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 20');

        res.json({
            success: true, data: {
                total_users, total_recipes, total_ingredients, total_equipment, total_plans, total_runs,
                avg_processing_time: avg_time,
                infeasible_count,
                success_count: total_runs - infeasible_count,
                recent_runs: recentRuns,
                users
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getDashboardStats, getAdminStats };
