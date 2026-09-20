const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const astrologyAdminController = require('../controllers/astrologyAdminController');

// All admin routes require authentication and ADMIN / SUPER_ADMIN roles
router.use(protect);
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN', 'MODERATOR'));

// Astrologer moderation
router.get('/astrologers', astrologyAdminController.getAstrologersForModeration);
router.put('/astrologers/:id/verify', astrologyAdminController.verifyAstrologer);

// Analytics & Overview
router.get('/analytics', astrologyAdminController.getAdminAnalytics);

// Services management
router.post('/services', astrologyAdminController.upsertService);

module.exports = router;
