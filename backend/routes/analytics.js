const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/overview',     ctrl.getAnalyticsOverview);
router.get('/spending',     ctrl.getSpendingTrend);
router.get('/recipes',      ctrl.getTopRecipes);
router.get('/budget',       ctrl.getBudgetAnalysis);
router.get('/categories',   ctrl.getCategoryDistribution);

module.exports = router;
