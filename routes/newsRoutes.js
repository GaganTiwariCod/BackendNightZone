const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Public News Routes
router.get('/', newsController.getPublicNews);
router.get('/categories', newsController.getNewsCategories);
router.get('/featured', newsController.getFeaturedNews);
router.get('/latest', newsController.getLatestNews);
router.get('/:slug/related', newsController.getRelatedNews);
router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;
