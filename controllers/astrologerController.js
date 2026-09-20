const { 
  AstrologerProfile, 
  AstrologerAvailability, 
  AstrologerDocument, 
  AstrologyReview, 
  User 
} = require('../models');
const { Op } = require('sequelize');

/**
 * Public Directory: Search & Filter Astrologers
 */
const getAstrologers = async (req, res) => {
  try {
    const {
      search,
      specialization,
      language,
      consultation_type,
      max_price,
      min_rating,
      sort_by = 'rating', // 'rating', 'experience', 'price_low', 'price_high', 'consultations'
      page = 1,
      limit = 12
    } = req.query;

    const whereClause = {
      status: 'VERIFIED',
      is_active: true
    };

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { display_name: { [Op.like]: `%${search}%` } },
        { bio: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    if (min_rating) {
      whereClause.rating = { [Op.gte]: parseFloat(min_rating) };
    }

    let order = [['rating', 'DESC']];
    if (sort_by === 'experience') {
      order = [['years_of_experience', 'DESC']];
    } else if (sort_by === 'price_low') {
      order = [['chat_price', 'ASC']];
    } else if (sort_by === 'price_high') {
      order = [['chat_price', 'DESC']];
    } else if (sort_by === 'consultations') {
      order = [['consultation_count', 'DESC']];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: astrologers } = await AstrologerProfile.findAndCountAll({
      where: whereClause,
      order,
      limit: parseInt(limit),
      offset,
      attributes: {
        exclude: ['rejection_reason']
      }
    });

    // Client side filter on JSON fields if needed
    let filtered = astrologers;
    if (specialization) {
      filtered = filtered.filter(a => 
        Array.isArray(a.specializations) && 
        a.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase()))
      );
    }
    if (language) {
      filtered = filtered.filter(a => 
        Array.isArray(a.languages) && 
        a.languages.some(l => l.toLowerCase().includes(language.toLowerCase()))
      );
    }
    if (max_price) {
      filtered = filtered.filter(a => parseFloat(a.chat_price) <= parseFloat(max_price));
    }

    return res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      astrologers: filtered
    });
  } catch (error) {
    console.error('Error fetching astrologers directory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve astrologers.'
    });
  }
};

/**
 * Get Astrologer details by public slug
 */
const getAstrologerBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const astrologer = await AstrologerProfile.findOne({
      where: { slug, is_active: true },
      include: [
        {
          model: AstrologerAvailability,
          as: 'availabilities',
          where: { is_active: true },
          required: false
        },
        {
          model: AstrologyReview,
          as: 'reviews',
          where: { is_published: true },
          required: false,
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'avatar']
            }
          ]
        }
      ],
      attributes: {
        exclude: ['rejection_reason']
      }
    });

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: 'Astrologer profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      astrologer
    });
  } catch (error) {
    console.error('Error fetching astrologer by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve astrologer profile.'
    });
  }
};

/**
 * Register as Astrologer (Public Onboarding Wizard)
 */
const registerAstrologer = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has an astrologer profile
    let existingProfile = await AstrologerProfile.findOne({ where: { user_id: userId } });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'You already have an Astrologer application or profile registered.',
        profile: existingProfile
      });
    }

    const {
      full_name,
      display_name,
      gender = 'male',
      date_of_birth,
      profile_photo,
      bio,
      phone,
      alternate_phone,
      country = 'India',
      state,
      city,
      address,
      pincode,
      years_of_experience = 1,
      education,
      certifications,
      training,
      languages = ['Hindi', 'English'],
      specializations = ['Vedic Astrology', 'Kundli'],
      astrology_methods = ['Parashari'],
      chat_price = 15.00,
      call_price = 25.00,
      video_price = 35.00,
      report_price = 499.00
    } = req.body;

    if (!full_name || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Phone number, and City are required for registration.'
      });
    }

    const slug = `${full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newProfile = await AstrologerProfile.create({
      user_id: userId,
      full_name,
      display_name: display_name || full_name,
      slug,
      gender,
      date_of_birth,
      profile_photo,
      bio,
      phone,
      alternate_phone,
      country,
      state,
      city,
      address,
      pincode,
      years_of_experience,
      education,
      certifications,
      training,
      languages,
      specializations,
      astrology_methods,
      chat_price,
      call_price,
      video_price,
      report_price,
      status: 'PENDING'
    });

    // Create default availability schedule (Mon-Sun, 9am - 8pm)
    for (let day = 0; day <= 6; day++) {
      await AstrologerAvailability.create({
        astrologer_id: newProfile.id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '20:00',
        slot_duration_minutes: 30,
        break_start_time: '13:00',
        break_end_time: '14:00',
        timezone: 'Asia/Kolkata',
        max_consultations_per_day: 12,
        is_active: true
      });
    }

    // Update user role to ASTROLOGER if currently CUSTOMER
    const user = await User.findByPk(userId);
    if (user && user.role === 'CUSTOMER') {
      await user.update({ role: 'ASTROLOGER' });
    }

    return res.status(201).json({
      success: true,
      message: 'Astrologer registration submitted successfully. Your profile is under verification.',
      profile: newProfile
    });
  } catch (error) {
    console.error('Error registering astrologer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit astrologer registration.'
    });
  }
};

/**
 * Get Astrologer's own profile & availability
 */
const getMyAstrologerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await AstrologerProfile.findOne({
      where: { user_id: userId },
      include: [
        {
          model: AstrologerAvailability,
          as: 'availabilities'
        },
        {
          model: AstrologerDocument,
          as: 'documents'
        }
      ]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No astrologer profile found for this account.'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching astrologer dashboard profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load astrologer profile.'
    });
  }
};

module.exports = {
  getAstrologers,
  getAstrologerBySlug,
  registerAstrologer,
  getMyAstrologerProfile
};
