const { Op } = require('sequelize');
const { News, NewsCategory, NewsSource, NewsKeywordMatch, NewsKeyword } = require('../models');

/**
 * Public News Feed with Pagination & Filters
 */
const getPublicNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const offset = (page - 1) * limit;

    const {
      category,
      search,
      language,
      location,
      sort = 'freshness' // 'freshness' | 'latest' | 'popular' | 'relevance'
    } = req.query;

    const where = {
      status: 'published'
    };

    // Category Filter (by slug or UUID)
    if (category && category !== 'all') {
      const catObj = await NewsCategory.findOne({
        where: {
          [Op.or]: [{ slug: category }, { id: category }]
        }
      });
      if (catObj) {
        where.category_id = catObj.id;
      }
    }

    // Language Filter
    if (language && language !== 'all') {
      where.language = language;
    }

    // Location Filter
    if (location && location !== 'all') {
      where.location = { [Op.like]: `%${location}%` };
    }

    // Search Filter (Supports Hindi / Marathi / English Unicode)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: term } },
        { summary: { [Op.like]: term } },
        { content_excerpt: { [Op.like]: term } }
      ];
    }

    // Sorting strategy
    let order = [['published_at', 'DESC']];
    if (sort === 'popular') {
      order = [['view_count', 'DESC'], ['published_at', 'DESC']];
    } else if (sort === 'relevance') {
      order = [['relevance_score', 'DESC'], ['published_at', 'DESC']];
    } else if (sort === 'freshness') {
      order = [
        ['is_breaking', 'DESC'],
        ['is_featured', 'DESC'],
        ['published_at', 'DESC']
      ];
    }

    const { count, rows: news } = await News.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'image']
        },
        {
          model: NewsSource,
          as: 'source',
          attributes: ['id', 'name', 'base_url', 'source_type']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'News articles retrieved successfully',
      data: news,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getPublicNews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve news feed.',
      error: error.message
    });
  }
};

/**
 * Single News Details by Slug
 */
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await News.findOne({
      where: { slug },
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'image']
        },
        {
          model: NewsSource,
          as: 'source',
          attributes: ['id', 'name', 'base_url', 'source_type']
        },
        {
          model: NewsKeywordMatch,
          as: 'keywordMatches',
          include: [{ model: NewsKeyword, as: 'keyword', attributes: ['keyword', 'language'] }]
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'News article not found.'
      });
    }

    // Increment view count asynchronously
    article.increment('view_count', { by: 1 }).catch(() => {});

    return res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error in getNewsBySlug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load article details.'
    });
  }
};

/**
 * Active Categories List
 */
const getNewsCategories = async (req, res) => {
  try {
    const categories = await NewsCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error in getNewsCategories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load categories.'
    });
  }
};

/**
 * Featured News Articles
 */
const getFeaturedNews = async (req, res) => {
  try {
    const featured = await News.findAll({
      where: {
        status: 'published',
        is_featured: true
      },
      limit: 6,
      order: [['published_at', 'DESC']],
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'image']
        },
        {
          model: NewsSource,
          as: 'source',
          attributes: ['id', 'name', 'base_url']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: featured
    });
  } catch (error) {
    console.error('Error in getFeaturedNews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured news.'
    });
  }
};

/**
 * Breaking & Latest News
 */
const getLatestNews = async (req, res) => {
  try {
    const latest = await News.findAll({
      where: { status: 'published' },
      limit: 10,
      order: [
        ['is_breaking', 'DESC'],
        ['published_at', 'DESC']
      ],
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon']
        },
        {
          model: NewsSource,
          as: 'source',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: latest
    });
  } catch (error) {
    console.error('Error in getLatestNews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest news.'
    });
  }
};

/**
 * Related News Articles
 */
const getRelatedNews = async (req, res) => {
  try {
    const { slug } = req.params;
    const current = await News.findOne({
      where: { slug },
      attributes: ['id', 'category_id', 'location']
    });

    if (!current) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const where = {
      status: 'published',
      id: { [Op.ne]: current.id }
    };

    if (current.category_id) {
      where.category_id = current.category_id;
    }

    const related = await News.findAll({
      where,
      limit: 4,
      order: [['published_at', 'DESC']],
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'image']
        },
        {
          model: NewsSource,
          as: 'source',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: related
    });
  } catch (error) {
    console.error('Error in getRelatedNews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve related news.'
    });
  }
};

module.exports = {
  getPublicNews,
  getNewsBySlug,
  getNewsCategories,
  getFeaturedNews,
  getLatestNews,
  getRelatedNews
};
