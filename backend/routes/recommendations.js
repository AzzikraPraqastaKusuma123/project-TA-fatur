const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recommendationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
router.use(authenticateToken);

router.post('/', ctrl.generate);
router.post('/generate', ctrl.generate);
router.post('/save', ctrl.saveMealPlan);
router.get('/meal-plans', ctrl.getMealPlans);
router.get('/plans', ctrl.getMealPlans);
router.get('/history', ctrl.getMealPlans);
router.get('/active', ctrl.getActiveMealPlan);
router.get('/shopping', ctrl.getShoppingLists);
router.get('/shopping-lists', ctrl.getShoppingLists);
router.get('/meal-plans/:id', ctrl.getMealPlanById);
router.get('/plans/:id', ctrl.getMealPlanById);
router.delete('/meal-plans/:id', ctrl.deleteMealPlan);
router.delete('/plans/:id', ctrl.deleteMealPlan);
router.put('/shopping-item/:itemId', ctrl.updateShoppingItem);
router.post('/shopping-list/:shopping_list_id/apply', ctrl.applyShoppingToInventory);
router.get('/optimization-runs', ctrl.getOptimizationRuns);

module.exports = router;
