const express = require('express');
const router = express.Router();
const panditAdminController = require('../controllers/panditAdminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { ROLES } = require('../constants/roles');

// Apply protection and Admin restriction to all routes in this router
router.use(protect, authorizeRoles(ROLES.ADMIN));

router.get('/pandits', panditAdminController.getAllPandits);
router.get('/pandits/:id', panditAdminController.getPanditDetailForAdmin);
router.patch('/pandits/:id/status', panditAdminController.moderatePandit);
router.patch('/pandits/:id/documents/:docId/verify', panditAdminController.verifyDocument);

module.exports = router;
