const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);
router.get('/', ctrl.get);
router.post('/', ctrl.set);
module.exports = router;
