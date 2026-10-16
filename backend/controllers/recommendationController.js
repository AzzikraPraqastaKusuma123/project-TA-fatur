const db = require('../database/connection');
const { generateRecommendation } = require('../services/recommendationService');

const generate = async (req, res) => {
    const { days, slots, budget, maxRepeat, weights } = req.body;
    if (!days || !slots || !budget || !Array.isArray(slots) || slots.length === 0)
        return res.status(400).json({ success: false, message: 'days, slots (array), and budget are required' });
    if (budget <= 0) return res.status(400).json({ success: false, message: 'Budget must be > 0' });

    try {
        const result = await generateRecommendation(req.user.id, { days, slots, budget, maxRepeat, weights });
        if (!result.success) {
            return res.status(422).json({ success: false, ...result });
        }
        res.json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Save meal plan from optimization result
const saveMealPlan = async (req, res) => {
    const { mealPlan, totalCost, budget, startDate, shoppingList } = req.body;
    if (!mealPlan || !startDate) return res.status(400).json({ success: false, message: 'mealPlan and startDate required' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + mealPlan.length - 1);

        const [planResult] = await conn.query(
            'INSERT INTO meal_plans (user_id, start_date, end_date, total_budget, estimated_cost) VALUES (?,?,?,?,?)',
            [req.user.id, start.toISOString().split('T')[0], end.toISOString().split('T')[0], budget, totalCost]
        );
        const planId = planResult.insertId;

        for (const day of mealPlan) {
            const dayDate = new Date(start);
            dayDate.setDate(dayDate.getDate() + day.day - 1);
            const dateStr = dayDate.toISOString().split('T')[0];

            for (const [slot, meal] of Object.entries(day.meals)) {
                if (meal && meal.recipe_id) {
                    await conn.query(
                        'INSERT INTO meal_plan_items (meal_plan_id, recipe_id, day_date, meal_slot) VALUES (?,?,?,?)',
                        [planId, meal.recipe_id, dateStr, slot]
                    );
                }
            }
        }

        // Save shopping list
        if (shoppingList && shoppingList.length > 0) {
            const [slResult] = await conn.query('INSERT INTO shopping_lists (user_id, meal_plan_id) VALUES (?,?)', [req.user.id, planId]);
            const slId = slResult.insertId;
            for (const item of shoppingList) {
                await conn.query(
                    'INSERT INTO shopping_list_items (shopping_list_id, ingredient_id, quantity, unit, estimated_cost) VALUES (?,?,?,?,?)',
                    [slId, item.ingredient_id, item.to_buy, item.unit, item.estimated_cost]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ success: true, data: { meal_plan_id: planId } });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
};

const getMealPlans = async (req, res) => {
    try {
        const [plans] = await db.query('SELECT * FROM meal_plans WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: plans });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMealPlanById = async (req, res) => {
    const { id } = req.params;
    try {
        const [plans] = await db.query('SELECT * FROM meal_plans WHERE id=? AND user_id=?', [id, req.user.id]);
        if (!plans.length) return res.status(404).json({ success: false, message: 'Not found' });
        const [items] = await db.query(`
            SELECT mpi.*, r.name AS recipe_name, r.total_calories, r.total_protein, r.total_fat, r.total_carbs
            FROM meal_plan_items mpi
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mpi.meal_plan_id = ?
            ORDER BY mpi.day_date, mpi.meal_slot`, [id]);
        const [sl] = await db.query('SELECT * FROM shopping_lists WHERE meal_plan_id=?', [id]);
        let shoppingList = [];
        if (sl.length > 0) {
            const [sli] = await db.query(`
                SELECT sli.*, i.name AS ingredient_name FROM shopping_list_items sli
                JOIN ingredients i ON sli.ingredient_id = i.id
                WHERE sli.shopping_list_id=?`, [sl[0].id]);
            shoppingList = sli;
        }
        res.json({ success: true, data: { ...plans[0], items, shoppingList } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteMealPlan = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM meal_plans WHERE id=? AND user_id=?', [id, req.user.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Update shopping item status
const updateShoppingItem = async (req, res) => {
    const { itemId } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE shopping_list_items SET status=? WHERE id=?', [status, itemId]);
        res.json({ success: true, message: 'Updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Apply purchased items to inventory
const applyShoppingToInventory = async (req, res) => {
    const { shopping_list_id } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [items] = await conn.query(
            'SELECT * FROM shopping_list_items WHERE shopping_list_id=? AND status="PENDING"',
            [shopping_list_id]
        );
        for (const item of items) {
            const [existing] = await conn.query('SELECT id FROM user_inventory WHERE user_id=? AND ingredient_id=?', [req.user.id, item.ingredient_id]);
            if (existing.length > 0) {
                await conn.query('UPDATE user_inventory SET quantity=quantity+? WHERE user_id=? AND ingredient_id=?', [item.quantity, req.user.id, item.ingredient_id]);
            } else {
                await conn.query('INSERT INTO user_inventory (user_id, ingredient_id, quantity, unit) VALUES (?,?,?,?)', [req.user.id, item.ingredient_id, item.quantity, item.unit]);
            }
            await conn.query('UPDATE shopping_list_items SET status="PURCHASED" WHERE id=?', [item.id]);
        }
        await conn.commit();
        res.json({ success: true, message: `${items.length} items applied to inventory` });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally { conn.release(); }
};

// Get optimization history (admin)
const getOptimizationRuns = async (req, res) => {
    try {
        const query = req.user.role === 'ADMIN'
            ? 'SELECT or2.*, u.name AS user_name, u.email FROM optimization_runs or2 JOIN users u ON or2.user_id=u.id ORDER BY or2.created_at DESC LIMIT 100'
            : 'SELECT * FROM optimization_runs WHERE user_id=? ORDER BY created_at DESC LIMIT 50';
        const params = req.user.role === 'ADMIN' ? [] : [req.user.id];
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get active meal plan
const getActiveMealPlan = async (req, res) => {
    try {
        const [plans] = await db.query('SELECT * FROM meal_plans WHERE user_id=? AND status="ACTIVE" ORDER BY created_at DESC LIMIT 1', [req.user.id]);
        if (!plans.length) return res.json({ success: true, data: null });
        req.params.id = plans[0].id;
        return getMealPlanById(req, res);
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get shopping lists
const getShoppingLists = async (req, res) => {
    try {
        const [lists] = await db.query(`
            SELECT sl.id, sl.meal_plan_id, mp.start_date, mp.end_date,
                   COUNT(sli.id) AS total_items,
                   SUM(CASE WHEN sli.status = 'PURCHASED' THEN 1 ELSE 0 END) AS purchased_items,
                   SUM(sli.estimated_cost) AS total_estimated_cost
            FROM shopping_lists sl
            JOIN meal_plans mp ON sl.meal_plan_id = mp.id
            LEFT JOIN shopping_list_items sli ON sli.shopping_list_id = sl.id
            WHERE sl.user_id = ?
            GROUP BY sl.id, sl.meal_plan_id, mp.start_date, mp.end_date
            ORDER BY sl.created_at DESC
        `, [req.user.id]);
        res.json({ success: true, data: lists });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { generate, saveMealPlan, getMealPlans, getMealPlanById, deleteMealPlan, updateShoppingItem, applyShoppingToInventory, getOptimizationRuns, getActiveMealPlan, getShoppingLists };
