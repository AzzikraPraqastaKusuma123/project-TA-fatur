/**
 * RULE-BASED FILTERING ENGINE
 * Filters candidate recipes before MILP optimization.
 * 
 * Filters applied (in order):
 * 1. Equipment filter (HARD constraint)
 * 2. Forbidden ingredient filter (HARD constraint)
 * 3. Data validity filter (must have ingredients with price/nutrition data)
 * 4. Meal type filter
 */

function filterByEquipment(recipes, userEquipmentIds) {
    const filtered = [];
    const rejected = [];
    for (const recipe of recipes) {
        const required = recipe.equipment.map(e => e.id);
        const hasAll = required.every(eqId => userEquipmentIds.includes(eqId));
        if (hasAll) {
            filtered.push(recipe);
        } else {
            const missing = required.filter(eqId => !userEquipmentIds.includes(eqId));
            rejected.push({ recipe: recipe.name, reason: `Missing equipment IDs: ${missing.join(',')}` });
        }
    }
    return { filtered, rejected };
}

function filterByForbiddenIngredients(recipes, forbiddenIngredientIds) {
    if (!forbiddenIngredientIds.length) return { filtered: recipes, rejected: [] };
    const filtered = [];
    const rejected = [];
    for (const recipe of recipes) {
        const usedIds = recipe.ingredients.map(i => i.ingredient_id);
        const hasForbidden = usedIds.some(id => forbiddenIngredientIds.includes(id));
        if (hasForbidden) {
            const forbidden = usedIds.filter(id => forbiddenIngredientIds.includes(id));
            rejected.push({ recipe: recipe.name, reason: `Contains forbidden ingredient IDs: ${forbidden.join(',')}` });
        } else {
            filtered.push(recipe);
        }
    }
    return { filtered, rejected };
}

function filterByDataValidity(recipes) {
    const filtered = [];
    const rejected = [];
    for (const recipe of recipes) {
        // Must have at least one ingredient
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
            rejected.push({ recipe: recipe.name, reason: 'No ingredients defined' });
            continue;
        }

        // Every ingredient must have a price defined
        const hasValidPrice = recipe.ingredients.every(i => i.price !== null && i.price !== undefined);
        if (!hasValidPrice) {
            rejected.push({ recipe: recipe.name, reason: 'Missing price data for one or more ingredients' });
            continue;
        }

        // Total recipe cost must be > 0 (otherwise budget constraint is meaningless)
        const totalCost = recipe.ingredients.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);
        if (totalCost <= 0) {
            rejected.push({ recipe: recipe.name, reason: 'Total recipe cost is zero — ingredient prices likely not set' });
            continue;
        }

        filtered.push(recipe);
    }
    return { filtered, rejected };
}


function filterByMealType(recipes, allowedMealTypes) {
    if (!allowedMealTypes || allowedMealTypes.length === 0) return { filtered: recipes, rejected: [] };
    const filtered = [];
    const rejected = [];
    for (const recipe of recipes) {
        if (recipe.meal_type === 'ANY' || allowedMealTypes.includes(recipe.meal_type)) {
            filtered.push(recipe);
        } else {
            rejected.push({ recipe: recipe.name, reason: `Meal type ${recipe.meal_type} not in requested slots` });
        }
    }
    return { filtered, rejected };
}

/**
 * Main filtering pipeline
 * @param {Array} allRecipes 
 * @param {Object} context - { userEquipmentIds, forbiddenIngredientIds, mealTypes }
 * @returns {Object} { candidates, filterLog }
 */
function runFilteringPipeline(allRecipes, context) {
    const { userEquipmentIds = [], forbiddenIngredientIds = [], mealTypes = [] } = context;
    const filterLog = [];

    let current = allRecipes;
    filterLog.push({ step: 'ALL_RECIPES', count: current.length });

    const eqResult = filterByEquipment(current, userEquipmentIds);
    current = eqResult.filtered;
    filterLog.push({ step: 'EQUIPMENT_FILTER', count: current.length, rejected: eqResult.rejected });

    const forbiddenResult = filterByForbiddenIngredients(current, forbiddenIngredientIds);
    current = forbiddenResult.filtered;
    filterLog.push({ step: 'FORBIDDEN_INGREDIENT_FILTER', count: current.length, rejected: forbiddenResult.rejected });

    const validityResult = filterByDataValidity(current);
    current = validityResult.filtered;
    filterLog.push({ step: 'DATA_VALIDITY_FILTER', count: current.length, rejected: validityResult.rejected });

    const mealTypeResult = filterByMealType(current, mealTypes);
    current = mealTypeResult.filtered;
    filterLog.push({ step: 'MEAL_TYPE_FILTER', count: current.length, rejected: mealTypeResult.rejected });

    filterLog.push({ step: 'CANDIDATES', count: current.length });

    return { candidates: current, filterLog };
}

module.exports = { runFilteringPipeline };
