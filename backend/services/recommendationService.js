/**
 * RECOMMENDATION SERVICE
 * Orchestrates the full recommendation pipeline:
 * 1. Load user data
 * 2. Run filtering engine
 * 3. Run MILP optimization
 * 4. Validate result
 * 5. Return structured result
 */

const db = require('../database/connection');
const { runFilteringPipeline } = require('../optimization/filteringEngine');
const { runMILPOptimization } = require('../optimization/milpSolver');
const { validateResult } = require('../optimization/validationEngine');

async function loadUserContext(userId) {
    const [equipment] = await db.query(`SELECT equipment_id FROM user_equipment WHERE user_id=?`, [userId]);
    const [preferences] = await db.query(`SELECT ingredient_id, preference_type FROM user_preferences WHERE user_id=?`, [userId]);
    const [inventory] = await db.query(`SELECT ingredient_id, quantity FROM user_inventory WHERE user_id=?`, [userId]);
    const [family] = await db.query(`SELECT * FROM family_members WHERE user_id=?`, [userId]);

    const userEquipmentIds = equipment.map(e => e.equipment_id);
    const forbiddenIngredientIds = preferences.filter(p => p.preference_type === 'AVOID').map(p => p.ingredient_id);
    const favoriteIngredientIds = preferences.filter(p => p.preference_type === 'FAVORITE').map(p => p.ingredient_id);
    const stockMap = {};
    for (const inv of inventory) {
        stockMap[inv.ingredient_id] = inv.quantity;
    }

    // Aggregate family nutrition targets
    const nutritionTarget = {
        calories: family.reduce((s, m) => s + (m.daily_calories_target || 0), 0),
        protein: family.reduce((s, m) => s + (m.daily_protein_target || 0), 0),
        fat: family.reduce((s, m) => s + (m.daily_fat_target || 0), 0),
        carbs: family.reduce((s, m) => s + (m.daily_carbs_target || 0), 0)
    };

    return { userEquipmentIds, forbiddenIngredientIds, favoriteIngredientIds, stockMap, nutritionTarget };
}

async function loadAllRecipes() {
    const [recipes] = await db.query('SELECT * FROM recipes');
    const result = [];
    for (const recipe of recipes) {
        const [ingredients] = await db.query(`
            SELECT ri.*, i.name AS ingredient_name, i.unit AS default_unit, 
                inn.calories, inn.protein, inn.fat, inn.carbs, ip.price
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            LEFT JOIN ingredient_nutrition inn ON i.id = inn.ingredient_id
            LEFT JOIN ingredient_prices ip ON i.id = ip.ingredient_id
            WHERE ri.recipe_id = ?`, [recipe.id]);
        const [equipment] = await db.query(`
            SELECT e.* FROM recipe_equipment re
            JOIN equipment e ON re.equipment_id = e.id
            WHERE re.recipe_id = ?`, [recipe.id]);
        result.push({ ...recipe, ingredients, equipment });
    }
    return result;
}

async function generateRecommendation(userId, params) {
    const { days, slots, budget, maxRepeat = 3, nutritionTolerance = 0.20, weights } = params;
    const timeline = { start: Date.now() };

    // Step 1: Load context
    const context = await loadUserContext(userId);
    timeline.contextLoaded = Date.now();

    // Step 2: Load all recipes
    const allRecipes = await loadAllRecipes();
    timeline.recipesLoaded = Date.now();

    // Step 3: Filtering
    const mealTypes = slots; // e.g. ['BREAKFAST','LUNCH','DINNER']
    const filterResult = runFilteringPipeline(allRecipes, {
        userEquipmentIds: context.userEquipmentIds,
        forbiddenIngredientIds: context.forbiddenIngredientIds,
        mealTypes
    });
    timeline.filteringDone = Date.now();
    const filteringTime = timeline.filteringDone - timeline.recipesLoaded;

    const candidates = filterResult.candidates;

    if (candidates.length < slots.length) {
        await logOptimizationRun(userId, { budget, days, candidateCount: candidates.length, status: 'INFEASIBLE', processingTime: Date.now() - timeline.start });
        return {
            success: false,
            status: 'INFEASIBLE',
            message: 'Tidak cukup resep kandidat untuk memenuhi jadwal makan.',
            suggestions: [
                'Tambahkan lebih banyak resep ke database',
                'Periksa peralatan memasak yang dimiliki',
                'Kurangi bahan yang dihindari',
                'Pastikan semua resep memiliki data harga'
            ],
            filterLog: filterResult.filterLog
        };
    }

    // Step 4: Build stock map (normalize - use ingredient_id as key)
    const stockMap = context.stockMap;

    // Step 5: MILP Optimization
    const planConfig = {
        days,
        slots,
        budget,
        nutritionTarget: context.nutritionTarget,
        stockMap,
        favoriteIds: context.favoriteIngredientIds,
        maxRepeat,
        weights: weights || { cost: 0.4, nutrition: 0.4, repetition: 0.1, preference: 0.1 }
    };

    const optimizationResult = runMILPOptimization(candidates, planConfig);
    timeline.optimizationDone = Date.now();
    const optimizationTime = timeline.optimizationDone - timeline.filteringDone;

    if (optimizationResult.status !== 'OPTIMAL') {
        await logOptimizationRun(userId, { budget, days, candidateCount: candidates.length, status: optimizationResult.status, processingTime: Date.now() - timeline.start });
        return {
            success: false,
            status: optimizationResult.status,
            message: optimizationResult.error || 'Tidak ditemukan kombinasi menu yang memenuhi seluruh kondisi.',
            suggestions: [
                'Naikkan anggaran',
                'Tambah stok bahan makanan',
                'Tambah peralatan memasak',
                'Kurangi bahan yang dihindari',
                'Tambah lebih banyak resep',
                'Longgarkan target nutrisi'
            ],
            filterLog: filterResult.filterLog
        };
    }

    // Step 6: Validate
    const candidateMap = {};
    for (const c of candidates) candidateMap[c.id] = c;

    const validation = validateResult(optimizationResult.mealPlan, {
        totalCost: optimizationResult.totalCost,
        budget,
        nutritionActual: optimizationResult.nutrition,
        nutritionTarget: context.nutritionTarget,
        candidateMap,
        forbiddenIds: context.forbiddenIngredientIds,
        slots,
        maxRepeat
    });
    timeline.validationDone = Date.now();
    const validationTime = timeline.validationDone - timeline.optimizationDone;

    const totalTime = Date.now() - timeline.start;

    // Log the run
    await logOptimizationRun(userId, {
        budget,
        days,
        candidateCount: candidates.length,
        status: validation.isValid ? 'OPTIMAL' : 'FEASIBLE',
        objectiveValue: optimizationResult.objectiveValue,
        processingTime: totalTime
    });

    return {
        success: true,
        status: validation.isValid ? 'OPTIMAL' : 'FEASIBLE',
        validationPassed: validation.isValid,
        validationResults: validation.validationResults,
        mealPlan: optimizationResult.mealPlan,
        nutrition: optimizationResult.nutrition,
        nutritionTarget: context.nutritionTarget,
        totalCost: optimizationResult.totalCost,
        budget,
        budgetRemaining: budget - optimizationResult.totalCost,
        budgetUtilization: ((optimizationResult.totalCost / budget) * 100).toFixed(1),
        shoppingList: optimizationResult.shoppingList,
        filterLog: filterResult.filterLog,
        candidateCount: candidates.length,
        performance: {
            filteringTime,
            optimizationTime,
            validationTime,
            totalTime
        },
        explanation: generateExplanation(optimizationResult, context, candidates.length, filterResult.filterLog)
    };
}

function generateExplanation(result, context, candidateCount, filterLog) {
    const rejected = filterLog.reduce((acc, log) => {
        if (log.rejected) acc += log.rejected.length;
        return acc;
    }, 0);
    return `Sistem memproses ${filterLog[0]?.count || 0} resep, memfilter ${rejected} resep yang tidak sesuai peralatan atau preferensi. Dari ${candidateCount} kandidat resep, sistem menemukan kombinasi menu terbaik menggunakan algoritma Mixed Integer Linear Programming (MILP). Estimasi biaya: Rp${result.totalCost?.toFixed(0)}, dari anggaran yang ditetapkan. Total nutrisi: ${result.nutrition?.total_calories?.toFixed(0)} kkal, protein ${result.nutrition?.total_protein?.toFixed(1)}g, lemak ${result.nutrition?.total_fat?.toFixed(1)}g, karbohidrat ${result.nutrition?.total_carbs?.toFixed(1)}g.`;
}

async function logOptimizationRun(userId, { budget, days, candidateCount, status, objectiveValue, processingTime }) {
    try {
        await db.query(`INSERT INTO optimization_runs (user_id, budget, period_days, candidate_recipes_count, status, objective_value, processing_time_ms)
            VALUES (?,?,?,?,?,?,?)`,
            [userId, budget, days, candidateCount, status, objectiveValue || null, processingTime]);
    } catch (err) {
        console.error('Failed to log optimization run:', err.message);
    }
}

module.exports = { generateRecommendation };
