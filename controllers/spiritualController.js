const { Op } = require('sequelize');
const {
  SpiritualContent,
  SpiritualContentTranslation,
  SpiritualContentType,
  SpiritualDeity,
  SpiritualCategory,
  SpiritualTag,
  SpiritualContentRequest,
  sequelize
} = require('../models');
const ApiResponse = require('../utils/apiResponse');

// 1. Get Master Data (Types, Deities, Categories, Tags, Languages)
exports.getMasterData = async (req, res, next) => {
  try {
    const [types, deities, categories, tags] = await Promise.all([
      SpiritualContentType.findAll({ where: { is_active: true }, order: [['name', 'ASC']] }),
      SpiritualDeity.findAll({ where: { is_active: true }, order: [['name', 'ASC']] }),
      SpiritualCategory.findAll({ where: { is_active: true }, order: [['name', 'ASC']] }),
      SpiritualTag.findAll({ order: [['name', 'ASC']] })
    ]);

    const languages = [
      { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
      { code: 'mr', name: 'मराठी', label: 'Marathi' },
      { code: 'en', name: 'English', label: 'English' },
      { code: 'sa', name: 'संस्कृतम्', label: 'Sanskrit' }
    ];

    return ApiResponse.success(res, 'Spiritual master data fetched', {
      types,
      deities,
      categories,
      tags,
      languages
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Public Content Directory (Search, Filter, Pagination)
exports.getContentDirectory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      type,
      deity,
      category,
      tag,
      language = 'hi',
      featured,
      sort_by = 'popular' // 'popular', 'newest', 'title'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * pageLimit;

    // Base conditions for parent content
    const whereConditions = {
      status: 'PUBLISHED'
    };

    if (featured === 'true' || featured === true) {
      whereConditions.is_featured = true;
    }

    // Type filter
    const typeInclude = {
      model: SpiritualContentType,
      as: 'type',
      required: false
    };
    if (type) {
      typeInclude.where = {
        [Op.or]: [{ code: type.toUpperCase() }, { id: type }]
      };
      typeInclude.required = true;
    }

    // Deity filter
    const deityInclude = {
      model: SpiritualDeity,
      as: 'deity',
      required: false
    };
    if (deity) {
      deityInclude.where = {
        [Op.or]: [{ slug: deity.toLowerCase() }, { id: deity }, { name: { [Op.like]: `%${deity}%` } }]
      };
      deityInclude.required = true;
    }

    // Category filter
    const categoryInclude = {
      model: SpiritualCategory,
      as: 'category',
      required: false
    };
    if (category) {
      categoryInclude.where = {
        [Op.or]: [{ slug: category.toLowerCase() }, { id: category }, { name: { [Op.like]: `%${category}%` } }]
      };
      categoryInclude.required = true;
    }

    // Tag filter
    const tagInclude = {
      model: SpiritualTag,
      as: 'tags',
      through: { attributes: [] },
      required: false
    };
    if (tag) {
      tagInclude.where = {
        [Op.or]: [{ slug: tag.toLowerCase() }, { name: tag }]
      };
      tagInclude.required = true;
    }

    // Translations Include
    const translationInclude = {
      model: SpiritualContentTranslation,
      as: 'translations',
      required: false
    };

    if (search) {
      translationInclude.where = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { short_description: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ]
      };
      translationInclude.required = true;
    }

    // Sorting
    let order = [['sort_order', 'ASC'], ['created_at', 'DESC']];
    if (sort_by === 'newest') {
      order = [['created_at', 'DESC']];
    } else if (sort_by === 'featured') {
      order = [['is_featured', 'DESC'], ['sort_order', 'ASC']];
    }

    const { rows: contents, count } = await SpiritualContent.findAndCountAll({
      where: whereConditions,
      distinct: true,
      include: [
        typeInclude,
        deityInclude,
        categoryInclude,
        tagInclude,
        translationInclude
      ],
      order,
      limit: pageLimit,
      offset
    });

    // Format output with requested language translation (or primary fallback)
    const formatted = contents.map(item => {
      const allTranslations = item.translations || [];
      const exactTrans = allTranslations.find(t => t.language_code === language);
      const fallbackTrans = allTranslations.find(t => t.language_code === 'hi') || allTranslations[0] || {};
      const activeTrans = exactTrans || fallbackTrans;

      return {
        id: item.id,
        image_url: item.image_url,
        is_featured: item.is_featured,
        sort_order: item.sort_order,
        type: item.type ? { id: item.type.id, code: item.type.code, name: item.type.name, icon: item.type.icon } : null,
        deity: item.deity ? { id: item.deity.id, name: item.deity.name, slug: item.deity.slug } : null,
        category: item.category ? { id: item.category.id, name: item.category.name, slug: item.category.slug } : null,
        tags: (item.tags || []).map(tg => ({ id: tg.id, name: tg.name, slug: tg.slug })),
        available_languages: allTranslations.map(t => t.language_code),
        active_translation: {
          language_code: activeTrans.language_code || language,
          is_fallback: !exactTrans && !!fallbackTrans,
          title: activeTrans.title || 'Untitled',
          slug: activeTrans.slug || '',
          short_description: activeTrans.short_description || ''
        },
        type_specific_data: item.type_specific_data || {},
        created_at: item.createdAt || item.created_at
      };
    });

    return ApiResponse.success(res, 'Spiritual content directory retrieved', {
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

// 3. Get Public Content Detail by Slug (with Language Switching & Related Content)
exports.getContentBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { lang = 'hi' } = req.query;

    // Find translation by slug
    let translation = await SpiritualContentTranslation.findOne({
      where: { slug },
      include: [
        {
          model: SpiritualContent,
          as: 'spiritualContent',
          where: { status: 'PUBLISHED' },
          include: [
            { model: SpiritualContentType, as: 'type' },
            { model: SpiritualDeity, as: 'deity' },
            { model: SpiritualCategory, as: 'category' },
            { model: SpiritualTag, as: 'tags', through: { attributes: [] } },
            { model: SpiritualContentTranslation, as: 'translations' }
          ]
        }
      ]
    });

    let parentContent = null;
    if (translation && translation.spiritualContent) {
      parentContent = translation.spiritualContent;
    } else {
      // Fallback: search if slug is an ID or if translation exists under another language
      parentContent = await SpiritualContent.findByPk(slug, {
        where: { status: 'PUBLISHED' },
        include: [
          { model: SpiritualContentType, as: 'type' },
          { model: SpiritualDeity, as: 'deity' },
          { model: SpiritualCategory, as: 'category' },
          { model: SpiritualTag, as: 'tags', through: { attributes: [] } },
          { model: SpiritualContentTranslation, as: 'translations' }
        ]
      });
    }

    if (!parentContent) {
      return ApiResponse.error(res, 'Spiritual content not found or is currently private.', 404);
    }

    // Determine target translation matching requested 'lang'
    const allTranslations = parentContent.translations || [];
    let activeTrans = allTranslations.find(t => t.language_code === lang && t.status === 'PUBLISHED');
    let isFallback = false;

    if (!activeTrans) {
      // Fallback hierarchy: Requested -> Hindi ('hi') -> English ('en') -> First available
      activeTrans = allTranslations.find(t => t.language_code === 'hi') ||
                    allTranslations.find(t => t.language_code === 'en') ||
                    allTranslations[0];
      isFallback = true;
    }

    // Find Related Content (Matching Deity, Type, Category or Tags)
    const relatedWhere = {
      status: 'PUBLISHED',
      id: { [Op.ne]: parentContent.id }
    };

    const relatedOr = [];
    if (parentContent.deity_id) relatedOr.push({ deity_id: parentContent.deity_id });
    if (parentContent.type_id) relatedOr.push({ type_id: parentContent.type_id });
    if (parentContent.category_id) relatedOr.push({ category_id: parentContent.category_id });

    if (relatedOr.length > 0) {
      relatedWhere[Op.or] = relatedOr;
    }

    const relatedItems = await SpiritualContent.findAll({
      where: relatedWhere,
      include: [
        { model: SpiritualContentType, as: 'type' },
        { model: SpiritualDeity, as: 'deity' },
        { model: SpiritualContentTranslation, as: 'translations' }
      ],
      limit: 6,
      order: [['is_featured', 'DESC'], ['sort_order', 'ASC']]
    });

    const formattedRelated = relatedItems.map(item => {
      const trans = (item.translations || []).find(t => t.language_code === lang) ||
                    (item.translations || []).find(t => t.language_code === 'hi') ||
                    (item.translations || [])[0] || {};
      return {
        id: item.id,
        image_url: item.image_url,
        type: item.type?.name || 'Spiritual',
        deity: item.deity?.name || null,
        title: trans.title || 'Spiritual Content',
        slug: trans.slug || item.id,
        short_description: trans.short_description || ''
      };
    });

    const responseData = {
      id: parentContent.id,
      image_url: parentContent.image_url,
      is_featured: parentContent.is_featured,
      type: parentContent.type ? { id: parentContent.type.id, code: parentContent.type.code, name: parentContent.type.name, icon: parentContent.type.icon } : null,
      deity: parentContent.deity ? { id: parentContent.deity.id, name: parentContent.deity.name, slug: parentContent.deity.slug } : null,
      category: parentContent.category ? { id: parentContent.category.id, name: parentContent.category.name, slug: parentContent.category.slug } : null,
      tags: (parentContent.tags || []).map(tg => ({ id: tg.id, name: tg.name, slug: tg.slug })),
      type_specific_data: parentContent.type_specific_data || {},
      active_translation: {
        language_code: activeTrans?.language_code || lang,
        requested_language: lang,
        is_fallback: isFallback,
        title: activeTrans?.title || 'Untitled',
        slug: activeTrans?.slug || slug,
        short_description: activeTrans?.short_description || '',
        content: activeTrans?.content || '',
        meta_title: activeTrans?.meta_title || '',
        meta_description: activeTrans?.meta_description || ''
      },
      available_translations: allTranslations.map(t => ({
        language_code: t.language_code,
        title: t.title,
        slug: t.slug
      })),
      related_content: formattedRelated
    };

    return ApiResponse.success(res, 'Spiritual content detail retrieved', responseData);
  } catch (error) {
    next(error);
  }
};

// 4. Submit Content Request by Public User
exports.submitContentRequest = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      request_type,
      deity_id,
      requested_title,
      language_code = 'hi',
      description,
      additional_information
    } = req.body;

    if (!name || !request_type || !requested_title || !description) {
      return ApiResponse.error(res, 'Name, request type, requested title, and description are required.', 422);
    }

    const userId = req.user?.id || null;

    const newRequest = await SpiritualContentRequest.create({
      user_id: userId,
      name,
      email,
      phone,
      request_type,
      deity_id: deity_id || null,
      requested_title,
      language_code,
      description,
      additional_information,
      status: 'PENDING'
    });

    return ApiResponse.success(res, 'Thank you! Your spiritual content request has been submitted to our Vedic editorial team.', {
      request: newRequest
    }, 201);
  } catch (error) {
    next(error);
  }
};
