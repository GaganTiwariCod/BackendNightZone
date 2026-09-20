const { Op } = require('sequelize');
const { News, NewsCategory, NewsSource, NewsKeyword, NewsKeywordMatch, NewsFetchLog } = require('../models');
const { fetchSource } = require('../services/newsFetcher');
const { generateUniqueSlug } = require('../utils/slugGenerator');

/**
 * Admin Overview Metrics
 */
const getAdminOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalNews,
      todayNews,
      pendingNews,
      publishedNews,
      rejectedNews,
      archivedNews,
      totalSources,
      activeSources,
      failedSources,
      totalKeywords,
      recentLogs
    ] = await Promise.all([
      News.count(),
      News.count({ where: { created_at: { [Op.gte]: today } } }),
      News.count({ where: { status: 'pending' } }),
      News.count({ where: { status: 'published' } }),
      News.count({ where: { status: 'rejected' } }),
      News.count({ where: { status: 'archived' } }),
      NewsSource.count(),
      NewsSource.count({ where: { is_active: true } }),
      NewsSource.count({ where: { last_error_at: { [Op.ne]: null } } }),
      NewsKeyword.count({ where: { is_active: true } }),
      NewsFetchLog.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{ model: NewsSource, as: 'source', attributes: ['name', 'source_type'] }]
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalNews,
        todayNews,
        pendingNews,
        publishedNews,
        rejectedNews,
        archivedNews,
        totalSources,
        activeSources,
        failedSources,
        totalKeywords,
        recentLogs
      }
    });
  } catch (error) {
    console.error('Error in getAdminOverview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin news analytics.'
    });
  }
};

/**
 * Admin News List with Search, Status, and Category Filters
 */
const getAdminNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;

    const { status, category_id, source_id, search } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (category_id && category_id !== 'all') where.category_id = category_id;
    if (source_id && source_id !== 'all') where.source_id = source_id;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: term } },
        { summary: { [Op.like]: term } }
      ];
    }

    const { count, rows: news } = await News.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon']
        },
        {
          model: NewsSource,
          as: 'source',
          attributes: ['id', 'name', 'source_type', 'base_url']
        },
        {
          model: NewsKeywordMatch,
          as: 'keywordMatches',
          attributes: ['id', 'matched_text', 'score']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAdminNews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve news records.'
    });
  }
};

/**
 * Update News Status (pending, published, rejected, archived)
 */
const updateNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'published', 'rejected', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const article = await News.findByPk(id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    await article.update({ status });

    return res.status(200).json({
      success: true,
      message: `Article status updated to ${status}.`,
      data: article
    });
  } catch (error) {
    console.error('Error in updateNewsStatus:', error);
    return res.status(500).json({ success: false, message: 'Failed to update article status.' });
  }
};

/**
 * Update Full Article Details (Category, Summary, Image, Flags)
 */
const updateNewsDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      content_excerpt,
      category_id,
      image_url,
      location,
      status,
      is_featured,
      is_breaking,
      is_verified
    } = req.body;

    const article = await News.findByPk(id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (summary !== undefined) updates.summary = summary;
    if (content_excerpt !== undefined) updates.content_excerpt = content_excerpt;
    if (category_id !== undefined) updates.category_id = category_id;
    if (image_url !== undefined) updates.image_url = image_url;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (is_breaking !== undefined) updates.is_breaking = is_breaking;
    if (is_verified !== undefined) updates.is_verified = is_verified;

    await article.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Article updated successfully.',
      data: article
    });
  } catch (error) {
    console.error('Error in updateNewsDetails:', error);
    return res.status(500).json({ success: false, message: 'Failed to update article details.' });
  }
};

/**
 * Delete Article
 */
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await News.findByPk(id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    await article.destroy();
    return res.status(200).json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteNews:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete article.' });
  }
};

// ==========================================
// SOURCE MANAGEMENT
// ==========================================
const getSources = async (req, res) => {
  try {
    const sources = await NewsSource.findAll({
      order: [['is_active', 'DESC'], ['name', 'ASC']]
    });
    return res.status(200).json({ success: true, data: sources });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve sources.' });
  }
};

const createSource = async (req, res) => {
  try {
    const { name, source_type, base_url, feed_url, scrape_url, language, country, location, fetch_interval_minutes, is_active } = req.body;
    if (!name || !base_url) {
      return res.status(400).json({ success: false, message: 'Name and Base URL are required.' });
    }

    const source = await NewsSource.create({
      name: name.trim(),
      source_type: source_type || 'rss',
      base_url: base_url.trim(),
      feed_url: feed_url ? feed_url.trim() : null,
      scrape_url: scrape_url ? scrape_url.trim() : null,
      language: language || 'en',
      country: country || 'India',
      location: location || null,
      fetch_interval_minutes: parseInt(fetch_interval_minutes, 10) || 60,
      is_active: is_active !== undefined ? is_active : true
    });

    return res.status(201).json({ success: true, message: 'News source created successfully.', data: source });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create source.' });
  }
};

const updateSource = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await NewsSource.findByPk(id);
    if (!source) {
      return res.status(404).json({ success: false, message: 'Source not found.' });
    }

    await source.update(req.body);
    return res.status(200).json({ success: true, message: 'Source updated successfully.', data: source });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update source.' });
  }
};

const triggerSourceFetch = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await NewsSource.findByPk(id);
    if (!source) {
      return res.status(404).json({ success: false, message: 'Source not found.' });
    }

    const stats = await fetchSource(source);

    return res.status(200).json({
      success: true,
      message: `Manual fetch completed for ${source.name}.`,
      stats
    });
  } catch (error) {
    console.error('Error in triggerSourceFetch:', error);
    return res.status(500).json({
      success: false,
      message: `Manual fetch failed: ${error.message}`
    });
  }
};

// ==========================================
// KEYWORD MANAGEMENT
// ==========================================
const getKeywords = async (req, res) => {
  try {
    const { category_id, language, search } = req.query;
    const where = {};
    if (category_id && category_id !== 'all') where.category_id = category_id;
    if (language && language !== 'all') where.language = language;
    if (search && search.trim()) {
      where.keyword = { [Op.like]: `%${search.trim()}%` };
    }

    const keywords = await NewsKeyword.findAll({
      where,
      order: [['weight', 'DESC'], ['keyword', 'ASC']],
      include: [{ model: NewsCategory, as: 'category', attributes: ['name', 'slug'] }]
    });

    return res.status(200).json({ success: true, data: keywords });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve keywords.' });
  }
};

const createKeyword = async (req, res) => {
  try {
    const { keyword, language, category_id, weight, match_title, match_description, match_content, is_active } = req.body;
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ success: false, message: 'Keyword is required.' });
    }

    const newKeyword = await NewsKeyword.create({
      keyword: keyword.trim(),
      normalized_keyword: keyword.trim().toLowerCase(),
      language: language || 'en',
      category_id: category_id || null,
      weight: parseInt(weight, 10) || 10,
      match_title: match_title !== undefined ? match_title : true,
      match_description: match_description !== undefined ? match_description : true,
      match_content: match_content !== undefined ? match_content : true,
      is_active: is_active !== undefined ? is_active : true
    });

    return res.status(201).json({ success: true, message: 'Keyword created successfully.', data: newKeyword });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create keyword.' });
  }
};

const updateKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const keyword = await NewsKeyword.findByPk(id);
    if (!keyword) {
      return res.status(404).json({ success: false, message: 'Keyword not found.' });
    }

    await keyword.update(req.body);
    return res.status(200).json({ success: true, message: 'Keyword updated successfully.', data: keyword });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update keyword.' });
  }
};

const deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const keyword = await NewsKeyword.findByPk(id);
    if (!keyword) {
      return res.status(404).json({ success: false, message: 'Keyword not found.' });
    }

    await keyword.destroy();
    return res.status(200).json({ success: true, message: 'Keyword deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete keyword.' });
  }
};

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
const getCategories = async (req, res) => {
  try {
    const categories = await NewsCategory.findAll({
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, image, sort_order, is_active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const finalSlug = slug ? slug.trim().toLowerCase() : await generateUniqueSlug(NewsCategory, name);

    const category = await NewsCategory.create({
      name: name.trim(),
      slug: finalSlug,
      description: description || null,
      icon: icon || 'Sparkles',
      image: image || null,
      sort_order: parseInt(sort_order, 10) || 0,
      is_active: is_active !== undefined ? is_active : true
    });

    return res.status(201).json({ success: true, message: 'Category created successfully.', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await NewsCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await category.update(req.body);
    return res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

// ==========================================
// FETCH LOGS
// ==========================================
const getFetchLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await NewsFetchLog.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: NewsSource, as: 'source', attributes: ['name', 'source_type', 'base_url'] }]
    });

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve fetch logs.' });
  }
};

module.exports = {
  getAdminOverview,
  getAdminNews,
  updateNewsStatus,
  updateNewsDetails,
  deleteNews,
  getSources,
  createSource,
  updateSource,
  triggerSourceFetch,
  getKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  getCategories,
  createCategory,
  updateCategory,
  getFetchLogs
};
