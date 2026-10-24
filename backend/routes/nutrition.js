const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nutritionController');
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/today',   ctrl.getTodayNutrition);
router.get('/weekly',  ctrl.getWeeklyNutrition);
router.get('/summary', ctrl.getNutritionSummary);

module.exports = router;
