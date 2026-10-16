/**
 * TEST SCRIPT: milpSolver.js
 * Run with: node backend/data_pipeline/test_solver.js
 *
 * Tests the MILP solver with realistic data similar to what the DB returns.
 * No database connection needed — uses in-memory mock data.
 */

const { runMILPOptimization } = require('../optimization/milpSolver');

// ── Mock Candidates (simulating DB output from loadAllRecipes) ──────────────
const mockCandidates = [
    {
        id: 1, name: 'Nasi Putih', meal_type: 'ANY', servings: 4,
        total_calories: 144, total_protein: 2.8, total_fat: 0.2, total_carbs: 31.6,
        ingredients: [{ ingredient_id: 1, ingredient_name: 'Beras', quantity: 400, unit: 'g', price: 0.15 }],
        equipment: [{ id: 2, name: 'Rice Cooker' }]
    },
    {
        id: 2, name: 'Nasi Goreng Spesial', meal_type: 'ANY', servings: 2,
        total_calories: 380, total_protein: 14, total_fat: 12, total_carbs: 50,
        ingredients: [
            { ingredient_id: 1, ingredient_name: 'Beras', quantity: 200, unit: 'g', price: 0.15 },
            { ingredient_id: 3, ingredient_name: 'Telur', quantity: 2, unit: 'pcs', price: 2000 },
        ],
        equipment: [{ id: 1, name: 'Kompor Gas' }, { id: 3, name: 'Wajan' }]
    },
    {
        id: 3, name: 'Ayam Kecap', meal_type: 'LUNCH', servings: 4,
        total_calories: 250, total_protein: 28, total_fat: 10, total_carbs: 12,
        ingredients: [
            { ingredient_id: 2, ingredient_name: 'Ayam', quantity: 500, unit: 'g', price: 0.35 },
        ],
        equipment: [{ id: 1, name: 'Kompor Gas' }]
    },
    {
        id: 4, name: 'Telur Balado', meal_type: 'ANY', servings: 3,
        total_calories: 160, total_protein: 9, total_fat: 11, total_carbs: 6,
        ingredients: [
            { ingredient_id: 3, ingredient_name: 'Telur', quantity: 4, unit: 'pcs', price: 2000 },
        ],
        equipment: [{ id: 1, name: 'Kompor Gas' }]
    },
    {
        id: 5, name: 'Tumis Kangkung', meal_type: 'ANY', servings: 3,
        total_calories: 60, total_protein: 3, total_fat: 3, total_carbs: 6,
        ingredients: [
            { ingredient_id: 6, ingredient_name: 'Kangkung', quantity: 300, unit: 'g', price: 0.025 },
        ],
        equipment: [{ id: 1, name: 'Kompor Gas' }]
    },
    {
        id: 6, name: 'Sayur Sop', meal_type: 'LUNCH', servings: 4,
        total_calories: 85, total_protein: 2, total_fat: 0.3, total_carbs: 18,
        ingredients: [
            { ingredient_id: 7, ingredient_name: 'Wortel', quantity: 150, unit: 'g', price: 0.04 },
            { ingredient_id: 9, ingredient_name: 'Kentang', quantity: 200, unit: 'g', price: 0.07 },
        ],
        equipment: [{ id: 4, name: 'Panci' }]
    },
    {
        id: 7, name: 'Oatmeal Pisang', meal_type: 'BREAKFAST', servings: 2,
        total_calories: 280, total_protein: 9, total_fat: 4, total_carbs: 54,
        ingredients: [
            { ingredient_id: 30, ingredient_name: 'Oat', quantity: 100, unit: 'g', price: 0.12 },
            { ingredient_id: 29, ingredient_name: 'Pisang', quantity: 2, unit: 'pcs', price: 2000 },
        ],
        equipment: [{ id: 4, name: 'Panci' }]
    },
    {
        id: 8, name: 'Telur Dadar', meal_type: 'BREAKFAST', servings: 2,
        total_calories: 200, total_protein: 12, total_fat: 15, total_carbs: 3,
        ingredients: [
            { ingredient_id: 3, ingredient_name: 'Telur', quantity: 3, unit: 'pcs', price: 2000 },
        ],
        equipment: [{ id: 1, name: 'Kompor Gas' }]
    },
    {
        id: 9, name: 'Tempe Goreng', meal_type: 'ANY', servings: 4,
        total_calories: 165, total_protein: 14, total_fat: 9, total_carbs: 8,
        ingredients: [
            { ingredient_id: 5, ingredient_name: 'Tempe', quantity: 300, unit: 'g', price: 0.06 },
        ],
        equipment: [{ id: 1, name: 'Kompor Gas' }]
    },
];

// ── Mock Config ──────────────────────────────────────────────────────────────
const planConfig = {
    days:    3,
    slots:   ['BREAKFAST', 'LUNCH', 'DINNER'],
    budget:  200000,
    stockMap: {
        1: 500, // Beras: 500g in stock
        3: 4,   // Telur: 4 pcs in stock
    },
    favoriteIds: [2], // Ayam is favorite
    maxRepeat: 2,
    weights: { cost: 0.4, nutrition: 0.3, repetition: 0.15, preference: 0.15 },
    nutritionTarget: { calories: 2000, protein: 60, fat: 70, carbs: 250 }
};

console.log('🧪 Running MILP Solver Test...');
console.log(`   Days: ${planConfig.days}, Slots: ${planConfig.slots.join(', ')}`);
console.log(`   Budget: Rp${planConfig.budget.toLocaleString('id-ID')}`);
console.log(`   Candidates: ${mockCandidates.length} recipes`);
console.log('');

const result = runMILPOptimization(mockCandidates, planConfig);

if (result.status === 'OPTIMAL') {
    console.log('✅ STATUS: OPTIMAL — Solution found!');
    console.log(`   Objective value: ${result.objectiveValue?.toFixed(4)}`);
    console.log(`   Total cost: Rp${result.totalCost?.toFixed(0)}`);
    console.log(`   Processing time: ${result.processingTime}ms`);
    console.log('');

    console.log('📅 MEAL PLAN:');
    for (const day of result.mealPlan) {
        console.log(`  Day ${day.day}:`);
        for (const [slot, meal] of Object.entries(day.meals)) {
            if (meal) {
                console.log(`    ${slot}: ${meal.recipe_name} (${Math.round(meal.calories)} kkal, Rp${meal.cost?.toFixed(0)})`);
            } else {
                console.log(`    ${slot}: ⚠️  EMPTY!`);
            }
        }
    }

    console.log('');
    console.log('🥗 NUTRITION TOTALS:');
    const n = result.nutrition;
    console.log(`   Calories: ${n.total_calories?.toFixed(0)} kkal`);
    console.log(`   Protein:  ${n.total_protein?.toFixed(1)} g`);
    console.log(`   Fat:      ${n.total_fat?.toFixed(1)} g`);
    console.log(`   Carbs:    ${n.total_carbs?.toFixed(1)} g`);

    console.log('');
    console.log('🛒 SHOPPING LIST:');
    if (result.shoppingList?.length === 0) {
        console.log('   (nothing to buy — all in stock)');
    } else {
        for (const item of result.shoppingList) {
            console.log(`   ${item.ingredient_name}: buy ${item.to_buy?.toFixed(1)} ${item.unit} (need ${item.total_needed?.toFixed(1)}, stock ${item.stock?.toFixed(1)}) — est. Rp${item.estimated_cost?.toFixed(0)}`);
        }
        const totalShop = result.shoppingList.reduce((s, i) => s + i.estimated_cost, 0);
        console.log(`   TOTAL SHOPPING: Rp${totalShop.toFixed(0)}`);
    }

    // Validate: check no slots empty
    let allFilled = true;
    for (const day of result.mealPlan) {
        for (const slot of planConfig.slots) {
            if (!day.meals[slot]) { allFilled = false; }
        }
    }
    console.log('');
    console.log(`✅ All meal slots filled: ${allFilled ? 'YES' : '❌ NO — CHECK SOLVER!'}`);
    // Validate budget
    const budgetOk = result.totalCost <= planConfig.budget;
    console.log(`✅ Budget respected: ${budgetOk ? 'YES' : `❌ NO — Cost ${result.totalCost} exceeds ${planConfig.budget}`}`);

} else {
    console.log(`❌ STATUS: ${result.status}`);
    console.log(`   Error: ${result.error}`);
    console.log('');
    console.log('ℹ️  Possible causes:');
    console.log('   - Budget too low');
    console.log('   - Insufficient recipe variety for all slots');
    console.log('   - maxRepeat too low for given number of days');
}

console.log('');
console.log('🏁 Test complete.');
