const { Op } = require('sequelize');
const {
  SpiritualContent,
  SpiritualContentTranslation,
  SpiritualContentType,
  SpiritualDeity,
  SpiritualCategory,
  SpiritualTag,
  SpiritualContentTag,
  SpiritualContentRequest,
  User,
  sequelize
} = require('../models');
const ApiResponse = require('../utils/apiResponse');

// Helper to generate slug
const generateSlug = (text) => {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0900-\u097F\-]+/g, '')
      .replace(/\-\-+/g, '-')
  );
};

// 1. Dashboard Statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalContent, published, drafts, archived, requests, totalDeities, totalCategories] = await Promise.all([
      SpiritualContent.count(),
      SpiritualContent.count({ where: { status: 'PUBLISHED' } }),
      SpiritualContent.count({ where: { status: 'DRAFT' } }),
      SpiritualContent.count({ where: { status: 'ARCHIVED' } }),
      SpiritualContentRequest.count({ where: { status: 'PENDING' } }),
      SpiritualDeity.count({ where: { is_active: true } }),
      SpiritualCategory.count({ where: { is_active: true } })
    ]);

    return ApiResponse.success(res, 'Spiritual CMS stats retrieved', {
      totalContent,
      published,
      drafts,
      archived,
      requests,
      totalDeities,
      totalCategories
    });
  } catch (error) {
    next(error);
  }
};

// 2. Admin Content List (with Translations Overview)
exports.getAllContents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      type_id,
      deity_id,
      category_id
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageLimit;

    const whereConditions = {};
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }
    if (type_id) whereConditions.type_id = type_id;
    if (deity_id) whereConditions.deity_id = deity_id;
    if (category_id) whereConditions.category_id = category_id;

    const translationInclude = {
      model: SpiritualContentTranslation,
      as: 'translations',
      required: false
    };

    if (search) {
      translationInclude.where = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } }
        ]
      };
      translationInclude.required = true;
    }

    const { rows: contents, count } = await SpiritualContent.findAndCountAll({
      where: whereConditions,
      distinct: true,
      include: [
        { model: SpiritualContentType, as: 'type' },
        { model: SpiritualDeity, as: 'deity' },
        { model: SpiritualCategory, as: 'category' },
        { model: SpiritualTag, as: 'tags', through: { attributes: [] } },
        translationInclude
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      limit: pageLimit,
      offset
    });

    const formatted = contents.map(item => {
      const allTrans = item.translations || [];
      const primaryTrans = allTrans.find(t => t.language_code === 'hi') || allTrans[0] || {};
      
      const languagesMap = {
        hi: allTrans.some(t => t.language_code === 'hi'),
        mr: allTrans.some(t => t.language_code === 'mr'),
        en: allTrans.some(t => t.language_code === 'en'),
        sa: allTrans.some(t => t.language_code === 'sa')
      };

      return {
        id: item.id,
        title: primaryTrans.title || 'Untitled',
        image_url: item.image_url,
        type: item.type?.name || 'N/A',
        type_code: item.type?.code || 'N/A',
        deity: item.deity?.name || 'All Deities',
        category: item.category?.name || 'General',
        status: item.status,
        is_featured: item.is_featured,
        sort_order: item.sort_order,
        languages: languagesMap,
        created_at: item.createdAt || item.created_at,
        updated_at: item.updatedAt || item.updated_at
      };
    });

    return ApiResponse.success(res, 'Admin contents retrieved', {
      contents: formatted,
      pagination: {
        total: count,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Content Detail for Admin Editing
exports.getContentDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const content = await SpiritualContent.findByPk(id, {
      include: [
        { model: SpiritualContentType, as: 'type' },
        { model: SpiritualDeity, as: 'deity' },
        { model: SpiritualCategory, as: 'category' },
        { model: SpiritualTag, as: 'tags', through: { attributes: [] } },
        { model: SpiritualContentTranslation, as: 'translations' }
      ]
    });

    if (!content) {
      return ApiResponse.error(res, 'Spiritual content not found', 404);
    }

    return ApiResponse.success(res, 'Spiritual content details retrieved', { content });
  } catch (error) {
    next(error);
  }
};

// 4. Create New Spiritual Content (with Multi-lingual Translations)
exports.createContent = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      type_id,
      deity_id,
      category_id,
      image_url,
      is_featured = false,
      sort_order = 0,
      status = 'DRAFT',
      type_specific_data = {},
      tags = [], // array of tag strings or IDs
      translations = [] // array of { language_code, title, slug, short_description, content, meta_title, meta_description }
    } = req.body;

    if (!type_id) {
      await transaction.rollback();
      return ApiResponse.error(res, 'Content Type is required.', 422);
    }

    if (!translations || translations.length === 0) {
      await transaction.rollback();
      return ApiResponse.error(res, 'At least one language translation is required.', 422);
    }

    // Create Parent Content
    const newContent = await SpiritualContent.create(
      {
        type_id,
        deity_id: deity_id || null,
        category_id: category_id || null,
        image_url: image_url || null,
        is_featured: !!is_featured,
        sort_order: parseInt(sort_order, 10) || 0,
        status: status.toUpperCase(),
        type_specific_data,
        created_by: req.user?.id || null
      },
      { transaction }
    );

    // Save Translations
    for (const tr of translations) {
      if (!tr.title || !tr.content) continue;
      const slug = tr.slug ? generateSlug(tr.slug) : `${generateSlug(tr.title)}-${tr.language_code || 'hi'}-${Date.now().toString(36)}`;
      
      await SpiritualContentTranslation.create(
        {
          content_id: newContent.id,
          language_code: tr.language_code || 'hi',
          title: tr.title,
          slug,
          short_description: tr.short_description || null,
          content: tr.content,
          meta_title: tr.meta_title || tr.title,
          meta_description: tr.meta_description || tr.short_description || null,
          status: tr.status || 'PUBLISHED'
        },
        { transaction }
      );
    }

    // Save Tags
    if (tags && tags.length > 0) {
      for (const tName of tags) {
        if (!tName || typeof tName !== 'string') continue;
        const tagSlug = generateSlug(tName);
        const [tagRecord] = await SpiritualTag.findOrCreate({
          where: { slug: tagSlug },
          defaults: { name: tName.trim(), slug: tagSlug },
          transaction
        });

        await SpiritualContentTag.findOrCreate({
          where: { content_id: newContent.id, tag_id: tagRecord.id },
          defaults: { content_id: newContent.id, tag_id: tagRecord.id },
          transaction
        });
      }
    }

    await transaction.commit();

    return ApiResponse.success(res, 'Spiritual content created successfully!', {
      contentId: newContent.id
    }, 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 5. Update Existing Spiritual Content
exports.updateContent = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      type_id,
      deity_id,
      category_id,
      image_url,
      is_featured,
      sort_order,
      status,
      type_specific_data,
      tags,
      translations
    } = req.body;

    const content = await SpiritualContent.findByPk(id, { transaction });
    if (!content) {
      await transaction.rollback();
      return ApiResponse.error(res, 'Spiritual content not found', 404);
    }

    // Update parent fields
    const updates = {};
    if (type_id !== undefined) updates.type_id = type_id;
    if (deity_id !== undefined) updates.deity_id = deity_id || null;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (image_url !== undefined) updates.image_url = image_url;
    if (is_featured !== undefined) updates.is_featured = !!is_featured;
    if (sort_order !== undefined) updates.sort_order = parseInt(sort_order, 10);
    if (status !== undefined) updates.status = status.toUpperCase();
    if (type_specific_data !== undefined) updates.type_specific_data = type_specific_data;

    await content.update(updates, { transaction });

    // Update / Upsert Translations
    if (translations && Array.isArray(translations)) {
      for (const tr of translations) {
        if (!tr.language_code) continue;

        const existing = await SpiritualContentTranslation.findOne({
          where: { content_id: content.id, language_code: tr.language_code },
          transaction
        });

        if (existing) {
          await existing.update(
            {
              title: tr.title || existing.title,
              slug: tr.slug ? generateSlug(tr.slug) : existing.slug,
              short_description: tr.short_description !== undefined ? tr.short_description : existing.short_description,
              content: tr.content || existing.content,
              meta_title: tr.meta_title || existing.meta_title,
              meta_description: tr.meta_description || existing.meta_description,
              status: tr.status || existing.status
            },
            { transaction }
          );
        } else if (tr.title && tr.content) {
          const slug = tr.slug ? generateSlug(tr.slug) : `${generateSlug(tr.title)}-${tr.language_code}-${Date.now().toString(36)}`;
          await SpiritualContentTranslation.create(
            {
              content_id: content.id,
              language_code: tr.language_code,
              title: tr.title,
              slug,
              short_description: tr.short_description || null,
              content: tr.content,
              meta_title: tr.meta_title || tr.title,
              meta_description: tr.meta_description || null,
              status: tr.status || 'PUBLISHED'
            },
            { transaction }
          );
        }
      }
    }

    // Update Tags if provided
    if (tags && Array.isArray(tags)) {
      await SpiritualContentTag.destroy({ where: { content_id: content.id }, transaction });
      for (const tName of tags) {
        if (!tName || typeof tName !== 'string') continue;
        const tagSlug = generateSlug(tName);
        const [tagRecord] = await SpiritualTag.findOrCreate({
          where: { slug: tagSlug },
          defaults: { name: tName.trim(), slug: tagSlug },
          transaction
        });
        await SpiritualContentTag.create(
          { content_id: content.id, tag_id: tagRecord.id },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return ApiResponse.success(res, 'Spiritual content updated successfully!');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 6. Quick Status Toggle
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

    const content = await SpiritualContent.findByPk(id);
    if (!content) return ApiResponse.error(res, 'Content not found', 404);

    await content.update({ status: status.toUpperCase() });
    return ApiResponse.success(res, `Content status updated to ${status.toUpperCase()}`);
  } catch (error) {
    next(error);
  }
};

// 7. Toggle Featured
exports.toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await SpiritualContent.findByPk(id);
    if (!content) return ApiResponse.error(res, 'Content not found', 404);

    await content.update({ is_featured: !content.is_featured });
    return ApiResponse.success(res, `Featured status updated to ${content.is_featured}`);
  } catch (error) {
    next(error);
  }
};

// 8. Delete Content
exports.deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await SpiritualContent.findByPk(id);
    if (!content) return ApiResponse.error(res, 'Content not found', 404);

    await content.destroy();
    return ApiResponse.success(res, 'Spiritual content deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// 9. Cover Image Upload
exports.uploadCoverImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No image file uploaded.', 400);
    }
    const relativeUrl = `/uploads/spiritual/${req.file.filename}`;
    return ApiResponse.success(res, 'Cover image uploaded successfully.', {
      imageUrl: relativeUrl
    });
  } catch (error) {
    next(error);
  }
};

// 10. List Content Requests (Admin)
exports.getAllRequests = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageLimit;

    const whereConditions = {};
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }

    const { rows: requests, count } = await SpiritualContentRequest.findAndCountAll({
      where: whereConditions,
      include: [
        { model: SpiritualDeity, as: 'deity' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: pageLimit,
      offset
    });

    return ApiResponse.success(res, 'Content requests retrieved', {
      requests,
      pagination: {
        total: count,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 11. Update Request Status & Admin Note
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const request = await SpiritualContentRequest.findByPk(id);
    if (!request) return ApiResponse.error(res, 'Request not found', 404);

    const updates = {};
    if (status) updates.status = status.toUpperCase();
    if (admin_note !== undefined) updates.admin_note = admin_note;

    await request.update(updates);
    return ApiResponse.success(res, `Request updated to ${request.status}`);
  } catch (error) {
    next(error);
  }
};
