/**
 * MILP OPTIMIZATION ENGINE
 *
 * Implements Mixed Integer Linear Programming using 'javascript-lp-solver'.
 *
 * Decision Variables: x[recipe][day][slot] ∈ {0,1}
 *   - 1 if recipe r is selected for day d, meal slot m
 *   - 0 otherwise
 *
 * Constraints:
 *   1. Meal slot constraint: Σ_r x[r][d][m] = 1 (exactly 1 recipe per slot per day)
 *   2. Budget constraint:    Total cost ≤ budget
 *   3. Repetition constraint: Σ_{d,m} x[r][d][m] ≤ maxRepeat
 *   4. Meal type constraint: recipe can only be placed in compatible slot
 *
 * Objective (minimize):
 *   F = w_cost * (cost / maxPossibleCost) - w_pref * preferenceScore
 *   (cost is normalized to [0,1] so weights are meaningful)
 */

const solver = require('javascript-lp-solver');

/**
 * Build and solve the MILP model.
 *
 * @param {Array}  candidates  - Filtered candidate recipes (each has .ingredients, .meal_type, etc.)
 * @param {Object} planConfig  - { days, slots, budget, stockMap, favoriteIds, maxRepeat, weights }
 * @returns {Object} { status, result, recipeData, varNames } | { status, error }
 */
function buildAndSolve(candidates, planConfig) {
    const {
        days,
        slots,          // e.g. ['BREAKFAST', 'LUNCH', 'DINNER']
        budget,
        stockMap = {},  // { ingredient_id: quantity_in_stock }
        favoriteIds = [],
        maxRepeat = 3,
        weights = { cost: 0.4, nutrition: 0.4, repetition: 0.1, preference: 0.1 }
    } = planConfig;

    const numDays  = days;
    const numSlots = slots.length;

    if (candidates.length === 0) {
        return { status: 'INFEASIBLE', error: 'No candidate recipes available after filtering' };
    }

    // ── Pre-calculate per-recipe cost and preference score ──────────────────
    const recipeData = candidates.map(r => {
        let cost = 0;
        for (const ing of (r.ingredients || [])) {
            cost += (ing.price || 0) * (ing.quantity || 0);
        }
        const usesFavorite = (r.ingredients || []).some(ing =>
            favoriteIds.includes(ing.ingredient_id)
        );
        return {
            id:              r.id,
            name:            r.name,
            meal_type:       r.meal_type,
            calories:        r.total_calories || 0,
            protein:         r.total_protein  || 0,
            fat:             r.total_fat      || 0,
            carbs:           r.total_carbs    || 0,
            cost,
            preferenceScore: usesFavorite ? 1 : 0
        };
    });

    // Normalize cost to [0,1] so the objective weights are meaningful
    const maxCost = Math.max(...recipeData.map(r => r.cost), 1);

    // ── Build variable names: x_r_d_s ───────────────────────────────────────
    const varNames   = [];
    const ints       = {};
    const vars       = {};
    const constraints = {};

    for (let r = 0; r < candidates.length; r++) {
        for (let d = 0; d < numDays; d++) {
            for (let s = 0; s < numSlots; s++) {
                const varName = `x_${r}_${d}_${s}`;
                varNames.push({ varName, r, d, s });
                ints[varName]  = 1;
                vars[varName]  = {};
            }
        }
    }

    // ── Objective coefficients ───────────────────────────────────────────────
    // Minimize: w_cost*(normalised_cost) - w_pref*(preferenceScore)
    const objective = {};
    for (const { varName, r } of varNames) {
        const rd = recipeData[r];
        objective[varName] =
            (weights.cost        || 0.4) * (rd.cost / maxCost) -
            (weights.preference  || 0.1) * rd.preferenceScore;
    }

    // ── CONSTRAINTS ─────────────────────────────────────────────────────────

    // 1. Exactly 1 recipe per day per slot
    for (let d = 0; d < numDays; d++) {
        for (let s = 0; s < numSlots; s++) {
            const cName = `slot_d${d}_s${s}`;
            constraints[cName] = { equal: 1 };
            for (let r = 0; r < candidates.length; r++) {
                vars[`x_${r}_${d}_${s}`][cName] = 1;
            }
        }
    }

    // 2. Budget: total cost ≤ budget
    const budgetCName = 'budget_total';
    constraints[budgetCName] = { max: budget };
    for (const { varName, r } of varNames) {
        vars[varName][budgetCName] = recipeData[r].cost;
    }

    // 3. Repetition: each recipe appears at most maxRepeat times
    for (let r = 0; r < candidates.length; r++) {
        const cName = `repeat_r${r}`;
        constraints[cName] = { max: maxRepeat };
        for (let d = 0; d < numDays; d++) {
            for (let s = 0; s < numSlots; s++) {
                vars[`x_${r}_${d}_${s}`][cName] = 1;
            }
        }
    }

    // 4. Meal-type: force incompatible slot assignments to 0
    const slotTypeMap = {};
    slots.forEach((slot, idx) => { slotTypeMap[idx] = slot; });

    for (let r = 0; r < candidates.length; r++) {
        const mealType = candidates[r].meal_type;
        if (mealType && mealType !== 'ANY') {
            for (let d = 0; d < numDays; d++) {
                for (let s = 0; s < numSlots; s++) {
                    if (slotTypeMap[s] !== mealType) {
                        const cName = `mealtype_r${r}_d${d}_s${s}`;
                        constraints[cName] = { max: 0 };
                        vars[`x_${r}_${d}_${s}`][cName] = 1;
                    }
                }
            }
        }
    }

    // ── Build model ──────────────────────────────────────────────────────────
    const model = {
        optimize:    'objective',
        opType:      'min',
        constraints,
        variables:   {},
        ints
    };

    for (const { varName } of varNames) {
        model.variables[varName] = {
            objective: objective[varName] || 0,
            ...vars[varName]
        };
    }

    // ── Solve ────────────────────────────────────────────────────────────────
    try {
        const result = solver.Solve(model);
        return {
            status: result.feasible ? 'OPTIMAL' : 'INFEASIBLE',
            result,
            recipeData,
            varNames
        };
    } catch (err) {
        return { status: 'ERROR', error: err.message };
    }
}

/**
 * Extract the structured meal plan from solver result.
 */
function extractMealPlan(solverResult, candidates, days, slots) {
    const { result, recipeData, varNames } = solverResult;

    const plan = [];
    for (let d = 0; d < days; d++) {
        const dayPlan = { day: d + 1, meals: {} };
        for (const slot of slots) dayPlan.meals[slot] = null;
        plan.push(dayPlan);
    }

    for (const { varName, r, d, s } of varNames) {
        const val = result[varName];
        if (val && Math.round(val) === 1) {
            const slot = slots[s];
            plan[d].meals[slot] = {
                recipe_id:   candidates[r].id,
                recipe_name: candidates[r].name,
                calories:    recipeData[r].calories,
                protein:     recipeData[r].protein,
                fat:         recipeData[r].fat,
                carbs:       recipeData[r].carbs,
                cost:        recipeData[r].cost
            };
        }
    }

    return plan;
}

/**
 * Sum nutrition across all meals in the plan.
 */
function calculateNutritionTotals(mealPlan, slots) {
    let cal = 0, pro = 0, fat = 0, carbs = 0;
    for (const day of mealPlan) {
        for (const slot of slots) {
            const meal = day.meals[slot];
            if (meal) {
                cal   += meal.calories || 0;
                pro   += meal.protein  || 0;
                fat   += meal.fat      || 0;
                carbs += meal.carbs    || 0;
            }
        }
    }
    return { total_calories: cal, total_protein: pro, total_fat: fat, total_carbs: carbs };
}

/**
 * Sum cost across all meals in the plan.
 */
function calculateTotalCost(mealPlan, slots) {
    let total = 0;
    for (const day of mealPlan) {
        for (const slot of slots) {
            const meal = day.meals[slot];
            if (meal) total += meal.cost || 0;
        }
    }
    return total;
}

/**
 * Generate a shopping list by comparing total ingredient requirements
 * against current inventory stock.
 *
 * Rules:
 *  - to_buy = max(0, total_needed - stock)   → never negative
 *  - Stock is not double-counted across days
 *  - Items with to_buy === 0 are excluded from the list
 *
 * @param {Array}  mealPlan      - Output of extractMealPlan
 * @param {Object} candidateMap  - { recipe_id: recipe }
 * @param {Array}  slots         - ['BREAKFAST',...]
 * @param {Object} stockMap      - { ingredient_id: quantity_in_stock }
 */
function generateShoppingList(mealPlan, candidateMap, slots, stockMap) {
    // Step 1: Aggregate total ingredient needs across all days/slots
    const ingredientNeeds = {}; // { ingredient_id: { total_needed, ...details } }

    for (const day of mealPlan) {
        for (const slot of slots) {
            const meal = day.meals[slot];
            if (!meal) continue;
            const recipe = candidateMap[meal.recipe_id];
            if (!recipe) continue;

            for (const ing of (recipe.ingredients || [])) {
                if (!ingredientNeeds[ing.ingredient_id]) {
                    ingredientNeeds[ing.ingredient_id] = {
                        ingredient_id:   ing.ingredient_id,
                        ingredient_name: ing.ingredient_name || 'Unknown',
                        unit:            ing.unit || '',
                        price:           ing.price || 0,
                        total_needed:    0,
                        stock:           Math.max(0, stockMap[ing.ingredient_id] || 0)
                    };
                }
                ingredientNeeds[ing.ingredient_id].total_needed += (ing.quantity || 0);
            }
        }
    }

    // Step 2: Calculate how much needs to be purchased
    const shoppingList = [];
    for (const data of Object.values(ingredientNeeds)) {
        const toBuy         = Math.max(0, data.total_needed - data.stock);
        const estimatedCost = toBuy * data.price;
        if (toBuy > 0) {
            shoppingList.push({
                ...data,
                to_buy:         toBuy,
                estimated_cost: estimatedCost,
                status:         'PENDING'
            });
        }
    }

    // Sort by estimated cost descending (most expensive items first)
    shoppingList.sort((a, b) => b.estimated_cost - a.estimated_cost);

    return shoppingList;
}

/**
 * Main entry point — run the full MILP optimization pipeline.
 *
 * @param {Array}  candidates  - Pre-filtered recipe candidates
 * @param {Object} planConfig  - Full plan configuration
 * @returns {Object} Structured result with status, mealPlan, nutrition, totalCost, shoppingList
 */
function runMILPOptimization(candidates, planConfig) {
    const startTime = Date.now();

    const solverResult = buildAndSolve(candidates, planConfig);

    if (solverResult.status === 'INFEASIBLE' || solverResult.status === 'ERROR') {
        return {
            status:         solverResult.status,
            error:          solverResult.error || 'No feasible solution found',
            processingTime: Date.now() - startTime
        };
    }

    const { days, slots, stockMap = {} } = planConfig;

    // Extract structured meal plan
    const mealPlan = extractMealPlan(solverResult, candidates, days, slots);

    // Aggregate nutrition and cost
    const nutrition  = calculateNutritionTotals(mealPlan, slots);
    const totalCost  = calculateTotalCost(mealPlan, slots);

    // Build a lookup map for shopping list generation
    const candidateMap = {};
    for (const r of candidates) candidateMap[r.id] = r;

    // Generate shopping list
    const shoppingList = generateShoppingList(mealPlan, candidateMap, slots, stockMap);

    return {
        status:         'OPTIMAL',
        objectiveValue: solverResult.result.result,
        mealPlan,
        nutrition,
        totalCost,
        shoppingList,
        processingTime: Date.now() - startTime
    };
}

module.exports = { runMILPOptimization, generateShoppingList };
