const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/preferenceController');
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);
router.get('/', ctrl.getAll);
router.post('/', ctrl.add);
router.delete('/:id', ctrl.remove);
module.exports = router;
