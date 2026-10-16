const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/equipmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
router.use(authenticateToken);

// User equipment
router.get('/', ctrl.getAll);
router.get('/user', ctrl.getAll);
router.post('/', ctrl.addEquipment);
router.post('/user', ctrl.addEquipment);
router.delete('/:equipment_id', ctrl.removeEquipment);
router.delete('/user/:equipment_id', ctrl.removeEquipment);

// Admin CRUD (also accessible by users for listing)
router.get('/master', ctrl.adminGetAll);
router.post('/master', requireAdmin, ctrl.adminCreate);
router.put('/master/:id', requireAdmin, ctrl.adminUpdate);
router.delete('/master/:id', requireAdmin, ctrl.adminDelete);

module.exports = router;
