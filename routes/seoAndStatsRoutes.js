const express = require('express');
const router = express.Router();
const seoAndStatsController = require('../controllers/seoAndStatsController');

// 1. Homepage Stats & Community Feed
router.get('/stats/homepage', (req, res) => seoAndStatsController.getHomepageStats(req, res));
router.get('/stats/community-feed', (req, res) => seoAndStatsController.getCommunityFeed(req, res));

// 2. SEO & LLM Indexing
router.get('/seo/llms.txt', (req, res) => seoAndStatsController.getLlmsTxt(req, res));
router.get('/seo/sitemap.xml', (req, res) => seoAndStatsController.getSitemapXml(req, res));
router.get('/seo/robots.txt', (req, res) => seoAndStatsController.getRobotsTxt(req, res));

module.exports = router;
