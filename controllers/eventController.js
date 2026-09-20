const { Op } = require('sequelize');
const { 
  Event, 
  EventCategory, 
  EventLocation, 
  EventParticipant, 
  EventAnnouncement, 
  EventFavorite, 
  EventReport, 
  Meetup, 
  User 
} = require('../models');
const { calculateHaversineDistance } = require('../services/geoDistanceService');
const { getEventCapacityStats, promoteWaitlistedParticipants } = require('../services/eventCapacityService');

/**
 * Public Events Discovery Feed with Filters & Distance Calculation
 */
const getPublicEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const offset = (page - 1) * limit;

    const {
      category,
      search,
      date_filter, // 'today', 'tomorrow', 'weekend', 'this_week', 'upcoming'
      city,
      lat,
      lng,
      radius_km, // 1, 5, 10, 25, 50
      tag,
      sort = 'upcoming' // 'upcoming' | 'popular' | 'distance'
    } = req.query;

    const where = {
      status: { [Op.in]: ['published', 'registration_open', 'ongoing'] },
      visibility: 'public'
    };

    // Category Filter
    if (category && category !== 'all') {
      const catObj = await EventCategory.findOne({
        where: { [Op.or]: [{ slug: category }, { id: category }] }
      });
      if (catObj) {
        where.category_id = catObj.id;
      }
    }

    // Search
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: term } },
        { short_description: { [Op.like]: term } },
        { full_description: { [Op.like]: term } }
      ];
    }

    // Date Filters
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (date_filter === 'today') {
      where.start_date = todayStr;
    } else if (date_filter === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.start_date = tomorrow.toISOString().split('T')[0];
    } else if (date_filter === 'this_week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.start_date = {
        [Op.gte]: todayStr,
        [Op.lte]: nextWeek.toISOString().split('T')[0]
      };
    } else {
      // Default: only upcoming or today's events
      where.start_date = { [Op.gte]: todayStr };
    }

    // Location Filter
    const locationWhere = {};
    if (city && city !== 'all') {
      locationWhere.city = { [Op.like]: `%${city}%` };
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      limit: lat && lng ? 100 : limit, // Load larger pool for client/server distance sorting if coords provided
      offset: lat && lng ? 0 : offset,
      order: [['start_date', 'ASC'], ['start_time', 'ASC']],
      include: [
        {
          model: EventCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'image']
        },
        {
          model: EventLocation,
          as: 'location',
          where: Object.keys(locationWhere).length > 0 ? locationWhere : undefined
        },
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: EventParticipant,
          as: 'participants',
          attributes: ['id', 'status', 'guests_count']
        }
      ]
    });

    // Compute distance and capacity stats for each event
    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    const maxRadius = parseFloat(radius_km) || 50;

    let processed = events.map(evt => {
      const json = evt.toJSON();
      
      // Calculate capacity stats
      let confirmedSeats = 0;
      let interestedCount = 0;
      if (json.participants) {
        for (const p of json.participants) {
          if (p.status === 'CONFIRMED' || p.status === 'ATTENDED') {
            confirmedSeats += (1 + (p.guests_count || 0));
          } else if (p.status === 'INTERESTED') {
            interestedCount++;
          }
        }
      }

      json.confirmedCount = confirmedSeats;
      json.interestedCount = interestedCount;
      json.availableSpots = json.has_capacity ? Math.max(0, json.max_participants - confirmedSeats) : null;
      json.isFull = json.has_capacity && json.availableSpots <= 0;

      // Distance calculation
      if (!isNaN(uLat) && !isNaN(uLng) && json.location?.latitude && json.location?.longitude) {
        json.distanceKm = calculateHaversineDistance(
          uLat,
          uLng,
          parseFloat(json.location.latitude),
          parseFloat(json.location.longitude)
        );
      } else {
        json.distanceKm = null;
      }

      return json;
    });

    // Filter by radius if distance filter active
    if (!isNaN(uLat) && !isNaN(uLng) && radius_km) {
      processed = processed.filter(e => e.distanceKm !== null && e.distanceKm <= maxRadius);
    }

    // Sort by distance if requested
    if (sort === 'distance' && !isNaN(uLat) && !isNaN(uLng)) {
      processed.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    } else if (sort === 'popular') {
      processed.sort((a, b) => (b.interestedCount + b.confirmedCount) - (a.interestedCount + a.confirmedCount));
    }

    // Paginate final list
    const finalTotal = processed.length;
    const finalData = lat && lng ? processed.slice(offset, offset + limit) : processed;

    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: finalData,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit)
      }
    });
  } catch (error) {
    console.error('Error in getPublicEvents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events feed.',
      error: error.message
    });
  }
};

/**
 * Event Details by Slug
 */
const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id || null;

    const event = await Event.findOne({
      where: { slug },
      include: [
        {
          model: EventCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'image', 'description']
        },
        {
          model: EventLocation,
          as: 'location'
        },
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'avatar', 'role']
        },
        {
          model: EventAnnouncement,
          as: 'announcements',
          order: [['created_at', 'DESC']],
          limit: 5
        },
        {
          model: Meetup,
          as: 'meetups',
          where: { status: 'active' },
          required: false
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Increment views
    event.increment('views_count', { by: 1 }).catch(() => {});

    // Capacity stats
    const capacityStats = await getEventCapacityStats(event.id);

    // Check user participation & favorite
    let userParticipation = null;
    let isFavorite = false;

    if (userId) {
      userParticipation = await EventParticipant.findOne({
        where: { event_id: event.id, user_id: userId }
      });
      const fav = await EventFavorite.findOne({
        where: { event_id: event.id, user_id: userId }
      });
      isFavorite = !!fav;
    }

    // Limited attendee preview (photo + first name)
    const recentAttendees = await EventParticipant.findAll({
      where: { event_id: event.id, status: { [Op.in]: ['CONFIRMED', 'INTERESTED'] } },
      limit: 6,
      order: [['joined_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }]
    });

    return res.status(200).json({
      success: true,
      data: {
        ...event.toJSON(),
        stats: capacityStats,
        userParticipation,
        isFavorite,
        attendeePreview: recentAttendees.map(a => ({
          id: a.user?.id,
          name: a.user?.name ? a.user.name.split(' ')[0] : 'Member',
          avatar: a.user?.avatar,
          status: a.status
        }))
      }
    });
  } catch (error) {
    console.error('Error in getEventBySlug:', error);
    return res.status(500).json({ success: false, message: 'Failed to load event details.' });
  }
};

/**
 * Get Active Event Categories
 */
const getEventCategories = async (req, res) => {
  try {
    const categories = await EventCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load event categories.' });
  }
};

/**
 * "🙋 Raise Hand" / Participate in Event
 */
const raiseHand = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { guests_count = 0, message_to_organizer = '' } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (['cancelled', 'completed', 'draft'].includes(event.status)) {
      return res.status(400).json({ success: false, message: `Cannot participate in ${event.status} events.` });
    }

    const guests = Math.min(parseInt(guests_count, 10) || 0, event.max_guests_per_user || 4);
    const capacityStats = await getEventCapacityStats(event.id);

    // Determine initial status:
    // 1. If event requires organizer confirmation -> 'INTERESTED'
    // 2. If event has capacity and is full -> 'WAITLISTED'
    // 3. Otherwise -> 'CONFIRMED'
    let initialStatus = 'CONFIRMED';
    if (event.requires_confirmation) {
      initialStatus = 'INTERESTED';
    } else if (event.has_capacity && (capacityStats.totalConfirmedSeats + 1 + guests) > event.max_participants) {
      if (!event.enable_waitlist) {
        return res.status(400).json({ success: false, message: 'This event is full and waitlist is disabled.' });
      }
      initialStatus = 'WAITLISTED';
    }

    const [participant, created] = await EventParticipant.findOrCreate({
      where: { event_id: event.id, user_id: userId },
      defaults: {
        event_id: event.id,
        user_id: userId,
        status: initialStatus,
        guests_count: guests,
        message_to_organizer: message_to_organizer ? message_to_organizer.trim() : null,
        joined_at: new Date(),
        confirmed_at: initialStatus === 'CONFIRMED' ? new Date() : null,
        waitlisted_at: initialStatus === 'WAITLISTED' ? new Date() : null
      }
    });

    if (!created) {
      // Re-activate if was cancelled
      await participant.update({
        status: initialStatus,
        guests_count: guests,
        message_to_organizer: message_to_organizer ? message_to_organizer.trim() : participant.message_to_organizer,
        cancelled_at: null,
        confirmed_at: initialStatus === 'CONFIRMED' ? new Date() : null
      });
    }

    return res.status(200).json({
      success: true,
      message: initialStatus === 'CONFIRMED' 
        ? 'Your participation is confirmed!' 
        : initialStatus === 'WAITLISTED' 
        ? 'Event is currently full. You are on the waitlist!' 
        : 'You expressed interest! Awaiting organizer confirmation.',
      data: participant
    });
  } catch (error) {
    console.error('Error in raiseHand:', error);
    return res.status(500).json({ success: false, message: 'Failed to process participation.' });
  }
};

/**
 * Cancel Participation
 */
const cancelParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await EventParticipant.findOne({
      where: { event_id: id, user_id: userId }
    });

    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participation record not found.' });
    }

    const wasConfirmed = participant.status === 'CONFIRMED';
    await participant.update({
      status: 'CANCELLED',
      cancelled_at: new Date()
    });

    // If confirmed seat was cancelled, automatically promote next waitlisted user
    if (wasConfirmed) {
      await promoteWaitlistedParticipants(id);
    }

    return res.status(200).json({
      success: true,
      message: 'Participation cancelled successfully.'
    });
  } catch (error) {
    console.error('Error in cancelParticipation:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel participation.' });
  }
};

/**
 * Toggle Event Bookmark / Favorite
 */
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await EventFavorite.findOne({
      where: { event_id: id, user_id: userId }
    });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({ success: true, message: 'Event removed from saved list.', isFavorite: false });
    }

    await EventFavorite.create({ event_id: id, user_id: userId });
    return res.status(200).json({ success: true, message: 'Event saved to your favorites!', isFavorite: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle favorite.' });
  }
};

/**
 * Report an Event
 */
const reportEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const reporterId = req.user.id;
    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required for report.' });
    }

    const report = await EventReport.create({
      event_id: id,
      reporter_id: reporterId,
      reason: reason.trim(),
      description: description ? description.trim() : null,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you. The event has been submitted for admin review.',
      data: report
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
};

module.exports = {
  getPublicEvents,
  getEventBySlug,
  getEventCategories,
  raiseHand,
  cancelParticipation,
  toggleFavorite,
  reportEvent
};
