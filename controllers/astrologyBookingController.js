const { 
  AstrologyBooking, 
  AstrologyConsultation, 
  ConsultationMessage, 
  AstrologyRecommendation, 
  AstrologyReport, 
  AstrologyReview, 
  AstrologerProfile, 
  AstrologyProfile, 
  AstrologyService, 
  User 
} = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new Astrology Booking (With collision check to prevent double booking)
 */
const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      astrologer_id,
      service_id,
      astrology_profile_id,
      consultation_type = 'CHAT',
      booking_date,
      start_time,
      end_time,
      timezone = 'Asia/Kolkata',
      duration_minutes = 30
    } = req.body;

    if (!astrologer_id || !astrology_profile_id || !booking_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: 'Astrologer, Birth Profile, Date, and Time Slot are required.'
      });
    }

    // Verify ownership of the birth profile
    const profile = await AstrologyProfile.findOne({
      where: { id: astrology_profile_id, user_id: userId }
    });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Birth profile not found or access denied.'
      });
    }

    // Verify Astrologer existence
    const astrologer = await AstrologerProfile.findOne({
      where: { id: astrologer_id, is_active: true }
    });
    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: 'Astrologer not found or inactive.'
      });
    }

    // Check collision to prevent double booking on the same date and slot
    const existingConflict = await AstrologyBooking.findOne({
      where: {
        astrologer_id,
        booking_date,
        start_time,
        booking_status: { [Op.in]: ['SCHEDULED', 'ACTIVE'] }
      }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked for this astrologer. Please choose a different slot.'
      });
    }

    // Calculate Amount based on consultation type
    let amount = 0;
    if (consultation_type === 'CHAT') {
      amount = parseFloat(astrologer.chat_price || 20) * (duration_minutes || 30);
    } else if (consultation_type === 'AUDIO_CALL') {
      amount = parseFloat(astrologer.call_price || 30) * (duration_minutes || 30);
    } else if (consultation_type === 'VIDEO_CALL') {
      amount = parseFloat(astrologer.video_price || 45) * (duration_minutes || 30);
    } else if (consultation_type === 'REPORT') {
      amount = parseFloat(astrologer.report_price || 499);
    }

    // Generate automatic end_time if not provided
    const calculatedEndTime = end_time || `${parseInt(start_time.split(':')[0]) + 1}:00`;

    const booking = await AstrologyBooking.create({
      user_id: userId,
      astrologer_id,
      service_id: service_id || null,
      astrology_profile_id: profile.id,
      consultation_type,
      booking_date,
      start_time,
      end_time: calculatedEndTime,
      timezone,
      duration_minutes,
      amount,
      payment_status: 'SUCCESS', // Mock payment abstraction
      booking_status: 'SCHEDULED',
      meeting_reference: `ASTRO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    });

    // Create linked consultation session
    const consultation = await AstrologyConsultation.create({
      booking_id: booking.id,
      user_id: userId,
      astrologer_id,
      status: 'SCHEDULED'
    });

    // Send initial system welcome message
    await ConsultationMessage.create({
      consultation_id: consultation.id,
      sender_id: userId,
      sender_role: 'SYSTEM',
      message: `Consultation session created for ${profile.name} (${consultation_type}). Meeting ID: ${booking.meeting_reference}`
    });

    // Increment astrologer consultation count
    await astrologer.increment('consultation_count');

    return res.status(201).json({
      success: true,
      message: 'Consultation successfully booked!',
      booking,
      consultation_id: consultation.id
    });
  } catch (error) {
    console.error('Error creating astrology booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking.'
    });
  }
};

/**
 * Get all Bookings for authenticated user
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await AstrologyBooking.findAll({
      where: { user_id: userId },
      order: [['booking_date', 'DESC'], ['start_time', 'DESC']],
      include: [
        {
          model: AstrologerProfile,
          as: 'astrologer',
          attributes: ['id', 'full_name', 'display_name', 'profile_photo', 'slug', 'specializations', 'rating']
        },
        {
          model: AstrologyProfile,
          as: 'profile',
          attributes: ['id', 'name', 'relationship', 'gender', 'date_of_birth', 'birth_place']
        },
        {
          model: AstrologyService,
          as: 'service',
          attributes: ['id', 'name', 'slug', 'icon']
        },
        {
          model: AstrologyConsultation,
          as: 'consultation',
          attributes: ['id', 'status', 'summary', 'report_url']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings.'
    });
  }
};

/**
 * Get Consultation Details & Chat Transcript (Protected by User/Astrologer ownership)
 */
const getConsultationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await AstrologyConsultation.findByPk(id, {
      include: [
        {
          model: AstrologyBooking,
          as: 'booking',
          include: [
            {
              model: AstrologyProfile,
              as: 'profile'
            },
            {
              model: AstrologyService,
              as: 'service'
            }
          ]
        },
        {
          model: AstrologerProfile,
          as: 'astrologer',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: ConsultationMessage,
          as: 'messages',
          order: [['created_at', 'ASC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        },
        {
          model: AstrologyRecommendation,
          as: 'recommendations'
        }
      ]
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found.'
      });
    }

    // Verify ownership: User is either the client or the assigned astrologer or an Admin
    const isClient = consultation.user_id === userId;
    const isAstrologer = consultation.astrologer?.user_id === userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!isClient && !isAstrologer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this consultation.'
      });
    }

    return res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    console.error('Error fetching consultation details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load consultation session.'
    });
  }
};

/**
 * Send a Message in Consultation Chat
 */
const sendConsultationMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { message, attachment_url, attachment_type } = req.body;

    if (!message && !attachment_url) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachment is required.'
      });
    }

    const consultation = await AstrologyConsultation.findByPk(id, {
      include: [{ model: AstrologerProfile, as: 'astrologer' }]
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation session not found.'
      });
    }

    const isClient = consultation.user_id === userId;
    const isAstrologer = consultation.astrologer?.user_id === userId;

    if (!isClient && !isAstrologer && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Set consultation to ACTIVE if it was SCHEDULED
    if (consultation.status === 'SCHEDULED') {
      await consultation.update({ status: 'ACTIVE', started_at: new Date() });
    }

    const newMessage = await ConsultationMessage.create({
      consultation_id: id,
      sender_id: userId,
      sender_role: isAstrologer ? 'ASTROLOGER' : 'USER',
      message: message || '',
      attachment_url: attachment_url || null,
      attachment_type: attachment_type || null
    });

    const populatedMessage = await ConsultationMessage.findByPk(newMessage.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }]
    });

    return res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error sending consultation message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deliver message.'
    });
  }
};

/**
 * Astrologer Completes Consultation & Adds Spiritual Remedies / Pandit Recommendation
 */
const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      summary,
      astrologer_notes,
      report_url,
      recommendations = [] // e.g. [{ service_type: 'PUJA', title: 'Navgraha Shanti Puja', description: 'Perform Navgraha Shanti...' }]
    } = req.body;

    const consultation = await AstrologyConsultation.findByPk(id, {
      include: [
        { model: AstrologerProfile, as: 'astrologer' },
        { model: AstrologyBooking, as: 'booking' }
      ]
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found.'
      });
    }

    // Verify that caller is the astrologer or admin
    if (consultation.astrologer?.user_id !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned astrologer can complete this consultation.'
      });
    }

    await consultation.update({
      status: 'COMPLETED',
      ended_at: new Date(),
      summary,
      astrologer_notes,
      report_url
    });

    if (consultation.booking) {
      await consultation.booking.update({ booking_status: 'COMPLETED' });
    }

    // Add spiritual remedy recommendations
    if (Array.isArray(recommendations) && recommendations.length > 0) {
      for (const rec of recommendations) {
        await AstrologyRecommendation.create({
          consultation_id: consultation.id,
          astrologer_id: consultation.astrologer_id,
          service_type: rec.service_type || 'PUJA',
          title: rec.title || 'Recommended Spiritual Remedy',
          description: rec.description || '',
          optional_action_url: rec.optional_action_url || '/services/pandit'
        });
      }
    }

    // If report is provided or generated, create AstrologyReport
    if (summary || report_url) {
      await AstrologyReport.create({
        user_id: consultation.user_id,
        astrologer_id: consultation.astrologer_id,
        booking_id: consultation.booking_id,
        astrology_profile_id: consultation.booking?.astrology_profile_id,
        report_type: 'PERSONALIZED_REPORT',
        title: `Astrological Consultation Report - ${consultation.astrologer?.display_name || 'Astrologer'}`,
        description: summary || 'Detailed guidance and personalized remedies provided during the consultation session.',
        file_url: report_url || null,
        analysis_content: { summary, notes: astrologer_notes, recommendations },
        status: 'DELIVERED'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation marked as completed and recommendations recorded.',
      consultation
    });
  } catch (error) {
    console.error('Error completing consultation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete consultation.'
    });
  }
};

/**
 * Submit a Post-Consultation Review
 */
const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { consultation_id, rating, review_text } = req.body;

    if (!consultation_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Consultation ID and a rating between 1 and 5 are required.'
      });
    }

    const consultation = await AstrologyConsultation.findOne({
      where: { id: consultation_id, user_id: userId, status: 'COMPLETED' }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Completed consultation not found or you are not eligible to review.'
      });
    }

    const [review, created] = await AstrologyReview.findOrCreate({
      where: { consultation_id },
      defaults: {
        user_id: userId,
        astrologer_id: consultation.astrologer_id,
        consultation_id,
        rating: parseInt(rating),
        review_text,
        is_published: true
      }
    });

    if (!created) {
      await review.update({
        rating: parseInt(rating),
        review_text
      });
    }

    // Update Astrologer's average rating
    const allReviews = await AstrologyReview.findAll({
      where: { astrologer_id: consultation.astrologer_id, is_published: true }
    });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2);

    await AstrologerProfile.update(
      { rating: avgRating, review_count: allReviews.length },
      { where: { id: consultation.astrologer_id } }
    );

    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback! Review published.',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review.'
    });
  }
};

/**
 * Get all Reports for Authenticated User
 */
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await AstrologyReport.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: AstrologyProfile,
          as: 'profile',
          attributes: ['id', 'name', 'relationship', 'gender', 'date_of_birth']
        },
        {
          model: AstrologerProfile,
          as: 'astrologer',
          attributes: ['id', 'full_name', 'display_name', 'profile_photo']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports.'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getConsultationDetails,
  sendConsultationMessage,
  completeConsultation,
  submitReview,
  getMyReports
};
