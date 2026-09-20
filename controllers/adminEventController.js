const { Op } = require('sequelize');
const { 
  Event, 
  EventCategory, 
  EventLocation, 
  EventParticipant, 
  EventReport, 
  User 
} = require('../models');
const { generateUniqueSlug } = require('../utils/slugGenerator');

/**
 * Admin Overview Metrics
 */
const getAdminOverview = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalEvents,
      publishedEvents,
      pendingEvents,
      cancelledEvents,
      completedEvents,
      upcomingEvents,
      reportedCount,
      totalParticipants
    ] = await Promise.all([
      Event.count(),
      Event.count({ where: { status: 'published' } }),
      Event.count({ where: { status: 'pending_review' } }),
      Event.count({ where: { status: 'cancelled' } }),
      Event.count({ where: { status: 'completed' } }),
      Event.count({ where: { start_date: { [Op.gte]: today }, status: 'published' } }),
      EventReport.count({ where: { status: 'pending' } }),
      EventParticipant.count({ where: { status: 'CONFIRMED' } })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        pendingEvents,
        cancelledEvents,
        completedEvents,
        upcomingEvents,
        reportedCount,
        totalParticipants
      }
    });
  } catch (error) {
    console.error('Error in getAdminOverview:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin overview.' });
  }
};

/**
 * Admin Events Moderation Table
 */
const getAdminEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;

    const { status, category_id, search } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (category_id && category_id !== 'all') where.category_id = category_id;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: term } },
        { short_description: { [Op.like]: term } }
      ];
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: EventCategory, as: 'category', attributes: ['name', 'slug'] },
        { model: EventLocation, as: 'location' },
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: EventParticipant, as: 'participants', attributes: ['id', 'status'] },
        { model: EventReport, as: 'reports', attributes: ['id', 'status'] }
      ]
    });

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAdminEvents:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin events.' });
  }
};

/**
 * Update Event Status (Publish, Reject, Cancel, Archive)
 */
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const updates = { status };
    if (cancellation_reason) updates.cancellation_reason = cancellation_reason;

    await event.update(updates);

    return res.status(200).json({
      success: true,
      message: `Event status updated to ${status}.`,
      data: event
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update event status.' });
  }
};

/**
 * Get Event Reports
 */
const getAdminReports = async (req, res) => {
  try {
    const reports = await EventReport.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'slug', 'status'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load reports.' });
  }
};

/**
 * Resolve Event Report
 */
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body; // 'reviewed', 'dismissed', 'action_taken'

    const report = await EventReport.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    await report.update({
      status,
      admin_notes,
      resolved_at: new Date()
    });

    return res.status(200).json({ success: true, message: 'Report status updated.', data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to resolve report.' });
  }
};

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, image, sort_order, is_active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const finalSlug = slug ? slug.trim().toLowerCase() : await generateUniqueSlug(EventCategory, name);

    const category = await EventCategory.create({
      name: name.trim(),
      slug: finalSlug,
      description: description || null,
      icon: icon || 'Calendar',
      image: image || null,
      sort_order: parseInt(sort_order, 10) || 0,
      is_active: is_active !== undefined ? is_active : true
    });

    return res.status(201).json({ success: true, message: 'Event category created.', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await EventCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await category.update(req.body);
    return res.status(200).json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

module.exports = {
  getAdminOverview,
  getAdminEvents,
  updateEventStatus,
  getAdminReports,
  resolveReport,
  createCategory,
  updateCategory
};
