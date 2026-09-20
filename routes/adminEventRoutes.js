const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const adminEventController = require('../controllers/adminEventController');

// All Admin Event routes require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

// Analytics & Overview
router.get('/overview', adminEventController.getAdminOverview);

// Event Moderation Table & Status
router.get('/events', adminEventController.getAdminEvents);
router.patch('/events/:id/status', adminEventController.updateEventStatus);

// Reports Management
router.get('/reports', adminEventController.getAdminReports);
router.patch('/reports/:id/resolve', adminEventController.resolveReport);

// Categories Management
router.post('/categories', adminEventController.createCategory);
router.put('/categories/:id', adminEventController.updateCategory);

module.exports = router;
