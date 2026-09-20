const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const adminNewsController = require('../controllers/adminNewsController');

// All Admin News routes require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

// Analytics & Overview
router.get('/overview', adminNewsController.getAdminOverview);

// News Moderation
router.get('/news', adminNewsController.getAdminNews);
router.patch('/news/:id/status', adminNewsController.updateNewsStatus);
router.put('/news/:id', adminNewsController.updateNewsDetails);
router.delete('/news/:id', adminNewsController.deleteNews);

// Source Management
router.get('/sources', adminNewsController.getSources);
router.post('/sources', adminNewsController.createSource);
router.put('/sources/:id', adminNewsController.updateSource);
router.post('/sources/:id/fetch', adminNewsController.triggerSourceFetch);

// Keyword Management
router.get('/keywords', adminNewsController.getKeywords);
router.post('/keywords', adminNewsController.createKeyword);
router.put('/keywords/:id', adminNewsController.updateKeyword);
router.delete('/keywords/:id', adminNewsController.deleteKeyword);

// Category Management
router.get('/categories', adminNewsController.getCategories);
router.post('/categories', adminNewsController.createCategory);
router.put('/categories/:id', adminNewsController.updateCategory);

// Fetch Logs
router.get('/fetch-logs', adminNewsController.getFetchLogs);

module.exports = router;
