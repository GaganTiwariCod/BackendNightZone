const { 
  AstrologerProfile, 
  AstrologerDocument, 
  AstrologyBooking, 
  AstrologyProfile, 
  AstrologyService, 
  AstrologyCategory, 
  AstrologyReport, 
  AstrologyReview, 
  User 
} = require('../models');
const { Op } = require('sequelize');

/**
 * Admin: Get Astrologers with filter by status
 */
const getAstrologersForModeration = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: astrologers } = await AstrologerProfile.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: AstrologerDocument,
          as: 'documents'
        }
      ]
    });

    return res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      astrologers
    });
  } catch (error) {
    console.error('Error in getAstrologersForModeration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve astrologers for moderation.'
    });
  }
};

/**
 * Admin: Update Astrologer status (Approve / Reject / Suspend)
 */
const verifyAstrologer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['VERIFIED', 'REJECTED', 'SUSPENDED', 'UNDER_REVIEW'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status.'
      });
    }

    const astrologer = await AstrologerProfile.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: 'Astrologer profile not found.'
      });
    }

    await astrologer.update({
      status,
      rejection_reason: status === 'REJECTED' ? rejection_reason : null,
      is_active: status === 'VERIFIED'
    });

    return res.status(200).json({
      success: true,
      message: `Astrologer status updated to ${status}.`,
      astrologer
    });
  } catch (error) {
    console.error('Error verifying astrologer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update astrologer verification status.'
    });
  }
};

/**
 * Admin: Get Overview Analytics
 */
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalAstrologers = await AstrologerProfile.count();
    const verifiedAstrologers = await AstrologerProfile.count({ where: { status: 'VERIFIED' } });
    const pendingAstrologers = await AstrologerProfile.count({ where: { status: 'PENDING' } });
    const totalProfiles = await AstrologyProfile.count();
    const totalBookings = await AstrologyBooking.count();
    const completedBookings = await AstrologyBooking.count({ where: { booking_status: 'COMPLETED' } });
    const totalReports = await AstrologyReport.count();

    const revenueResult = await AstrologyBooking.sum('amount', {
      where: { payment_status: 'SUCCESS' }
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalAstrologers,
        verifiedAstrologers,
        pendingAstrologers,
        totalProfiles,
        totalBookings,
        completedBookings,
        totalReports,
        totalRevenue: revenueResult || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin astrology analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics.'
    });
  }
};

/**
 * Admin: Add or update a dynamic service
 */
const upsertService = async (req, res) => {
  try {
    const { id, category_id, name, short_description, description, icon, pricing, duration_minutes, is_active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required.'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let service;
    if (id) {
      service = await AstrologyService.findByPk(id);
      if (service) {
        await service.update({
          category_id,
          name,
          short_description,
          description,
          icon,
          pricing,
          duration_minutes,
          is_active
        });
      }
    } else {
      service = await AstrologyService.create({
        category_id,
        name,
        slug,
        short_description,
        description,
        icon,
        pricing,
        duration_minutes,
        is_active: is_active ?? true
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service saved successfully.',
      service
    });
  } catch (error) {
    console.error('Error upserting service:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save service.'
    });
  }
};

module.exports = {
  getAstrologersForModeration,
  verifyAstrologer,
  getAdminAnalytics,
  upsertService
};
