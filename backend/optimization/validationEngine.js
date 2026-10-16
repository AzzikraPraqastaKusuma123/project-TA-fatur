/**
 * VALIDATION ENGINE
 * Validates optimization result against all constraints before accepting.
 */

function validateBudget(totalCost, budget) {
    const passed = totalCost <= budget * 1.01; // 1% tolerance
    return { constraint: 'BUDGET', passed, detail: `Cost ${totalCost.toFixed(0)} vs Budget ${budget}` };
}

function validateNutrition(actual, target, tolerance = 0.20) {
    if (!target || !target.calories) return { constraint: 'NUTRITION', passed: true, detail: 'No nutrition target set' };
    const checks = [];
    for (const key of ['calories', 'protein', 'fat', 'carbs']) {
        const t = target[key] || 0;
        const a = actual[`total_${key}`] || 0;
        if (t === 0) continue;
        const low = t * (1 - tolerance);
        const high = t * (1 + tolerance);
        checks.push({ nutrient: key, actual: a, target: t, min: low, max: high, passed: a >= low && a <= high });
    }
    const allPassed = checks.every(c => c.passed);
    return { constraint: 'NUTRITION', passed: allPassed, detail: checks };
}

function validateNoForbiddenIngredients(mealPlan, candidateMap, forbiddenIds, slots) {
    if (!forbiddenIds.length) return { constraint: 'FORBIDDEN_INGREDIENTS', passed: true, detail: 'No forbidden ingredients defined' };
    const violations = [];
    for (const day of mealPlan) {
        for (const slot of slots) {
            const meal = day.meals[slot];
            if (!meal) continue;
            const recipe = candidateMap[meal.recipe_id];
            if (!recipe) continue;
            for (const ing of recipe.ingredients) {
                if (forbiddenIds.includes(ing.ingredient_id)) {
                    violations.push({ recipe: recipe.name, ingredient: ing.ingredient_name });
                }
            }
        }
    }
    return { constraint: 'FORBIDDEN_INGREDIENTS', passed: violations.length === 0, detail: violations };
}

function validateRepetition(mealPlan, slots, maxRepeat) {
    const counts = {};
    for (const day of mealPlan) {
        for (const slot of slots) {
            const meal = day.meals[slot];
            if (!meal) continue;
            counts[meal.recipe_id] = (counts[meal.recipe_id] || 0) + 1;
        }
    }
    const violations = Object.entries(counts).filter(([, count]) => count > maxRepeat).map(([id, count]) => ({ recipe_id: id, count, max: maxRepeat }));
    return { constraint: 'REPETITION', passed: violations.length === 0, detail: violations };
}

function validateAllMealsFilled(mealPlan, slots) {
    const missing = [];
    for (const day of mealPlan) {
        for (const slot of slots) {
            if (!day.meals[slot]) missing.push({ day: day.day, slot });
        }
    }
    return { constraint: 'MEALS_FILLED', passed: missing.length === 0, detail: missing };
}

/**
 * Run all validations
 * @returns {{ isValid, validationResults }}
 */
function validateResult(mealPlan, { totalCost, budget, nutritionActual, nutritionTarget, candidateMap, forbiddenIds, slots, maxRepeat }) {
    const results = [
        validateBudget(totalCost, budget),
        validateNutrition(nutritionActual, nutritionTarget),
        validateNoForbiddenIngredients(mealPlan, candidateMap, forbiddenIds || [], slots),
        validateRepetition(mealPlan, slots, maxRepeat || 999),
        validateAllMealsFilled(mealPlan, slots)
    ];
    const isValid = results.every(r => r.passed);
    return { isValid, validationResults: results };
}

module.exports = { validateResult };
