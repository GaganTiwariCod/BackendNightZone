const express = require('express');
const router = express.Router();
const spiritualController = require('../controllers/spiritualController');
const { optionalAuth } = require('../middlewares/authMiddleware');

// Public Master Data
router.get('/masters', spiritualController.getMasterData);

// Public Directory & Search
router.get('/', spiritualController.getContentDirectory);

// Submit Public Content Request (Optional Auth to capture user_id if logged in)
router.post('/requests', optionalAuth, spiritualController.submitContentRequest);

// Public Content Detail by Slug
router.get('/:slug', spiritualController.getContentBySlug);

module.exports = router;
