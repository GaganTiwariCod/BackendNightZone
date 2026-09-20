const express = require('express');
const router = express.Router();
const spiritualAdminController = require('../controllers/spiritualAdminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { ROLES } = require('../constants/roles');
const { uploadSpiritualCover } = require('../middlewares/uploadMiddleware');

// All Admin routes require ADMIN role
router.use(protect);
router.use(authorizeRoles(ROLES.ADMIN));

// Dashboard Stats
router.get('/dashboard-stats', spiritualAdminController.getDashboardStats);

// Content CRUD
router.get('/contents', spiritualAdminController.getAllContents);
router.get('/contents/:id', spiritualAdminController.getContentDetail);
router.post('/contents', spiritualAdminController.createContent);
router.put('/contents/:id', spiritualAdminController.updateContent);
router.delete('/contents/:id', spiritualAdminController.deleteContent);

// Quick Toggles
router.patch('/contents/:id/status', spiritualAdminController.updateStatus);
router.patch('/contents/:id/feature', spiritualAdminController.toggleFeatured);

// Image Upload
router.post('/upload-cover', uploadSpiritualCover.single('coverImage'), spiritualAdminController.uploadCoverImage);

// Requests Management
router.get('/requests', spiritualAdminController.getAllRequests);
router.patch('/requests/:id/status', spiritualAdminController.updateRequestStatus);

module.exports = router;
