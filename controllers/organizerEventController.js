const { 
  Event, 
  EventCategory, 
  EventLocation, 
  EventParticipant, 
  EventAttendance, 
  EventAnnouncement, 
  EventChangeHistory, 
  Meetup, 
  User 
} = require('../models');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const { getEventCapacityStats, promoteWaitlistedParticipants } = require('../services/eventCapacityService');

/**
 * Create a New Event
 */
const createEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const {
      title,
      category_id,
      short_description,
      full_description,
      cover_image,
      additional_images,
      visibility = 'public',
      language = 'Hindi / Marathi / English',
      tags = [],
      contact_person,
      contact_phone,
      contact_email,
      start_date,
      start_time = '09:00',
      end_date,
      end_time = '18:00',
      is_all_day = false,
      has_capacity = false,
      max_participants = 100,
      allow_guests = true,
      max_guests_per_user = 3,
      enable_waitlist = true,
      requires_confirmation = false,
      event_rules,
      location // { venue_name, address, city, state, pincode, latitude, longitude, meeting_point_name, ... }
    } = req.body;

    if (!title || !category_id || !start_date) {
      return res.status(400).json({ success: false, message: 'Title, Category, and Start Date are required.' });
    }

    const slug = await generateUniqueSlug(Event, title);

    const event = await Event.create({
      organizer_id: organizerId,
      category_id,
      title: title.trim(),
      slug,
      short_description: short_description ? short_description.trim() : null,
      full_description: full_description ? full_description.trim() : null,
      cover_image: cover_image || null,
      additional_images: additional_images || [],
      status: 'published',
      visibility,
      language,
      tags: Array.isArray(tags) ? tags : [],
      contact_person: contact_person || req.user.name,
      contact_phone: contact_phone || req.user.phone,
      contact_email: contact_email || req.user.email,
      start_date,
      start_time,
      end_date: end_date || start_date,
      end_time,
      is_all_day,
      has_capacity,
      max_participants: parseInt(max_participants, 10) || 100,
      allow_guests,
      max_guests_per_user: parseInt(max_guests_per_user, 10) || 3,
      enable_waitlist,
      auto_promote_waitlist: true,
      requires_confirmation,
      event_rules: event_rules || null
    });

    if (location && location.venue_name) {
      await EventLocation.create({
        event_id: event.id,
        venue_name: location.venue_name.trim(),
        address: location.address || null,
        area: location.area || null,
        city: location.city || 'Mumbai',
        state: location.state || 'Maharashtra',
        country: location.country || 'India',
        pincode: location.pincode || null,
        landmark: location.landmark || null,
        latitude: location.latitude ? parseFloat(location.latitude) : null,
        longitude: location.longitude ? parseFloat(location.longitude) : null,
        meeting_point_name: location.meeting_point_name || null,
        meeting_point_address: location.meeting_point_address || null,
        meeting_point_latitude: location.meeting_point_latitude ? parseFloat(location.meeting_point_latitude) : null,
        meeting_point_longitude: location.meeting_point_longitude ? parseFloat(location.meeting_point_longitude) : null,
        meeting_time: location.meeting_time || null,
        meeting_instructions: location.meeting_instructions || null
      });
    }

    // Log Creation History
    await EventChangeHistory.create({
      event_id: event.id,
      changed_by: organizerId,
      change_type: 'EVENT_CREATED',
      new_values: { title: event.title, status: event.status }
    });

    return res.status(201).json({
      success: true,
      message: 'Event created and published successfully!',
      data: event
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

/**
 * Get Organizer's Own Events
 */
const getMyOrganizedEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const events = await Event.findAll({
      where: { organizer_id: organizerId },
      order: [['created_at', 'DESC']],
      include: [
        { model: EventCategory, as: 'category', attributes: ['name', 'slug', 'icon'] },
        { model: EventLocation, as: 'location' },
        { model: EventParticipant, as: 'participants', attributes: ['id', 'status', 'guests_count'] }
      ]
    });

    const enriched = events.map(evt => {
      const json = evt.toJSON();
      let confirmedSeats = 0;
      let interestedCount = 0;
      let waitlistedCount = 0;

      if (json.participants) {
        for (const p of json.participants) {
          if (p.status === 'CONFIRMED' || p.status === 'ATTENDED') {
            confirmedSeats += (1 + (p.guests_count || 0));
          } else if (p.status === 'INTERESTED') {
            interestedCount++;
          } else if (p.status === 'WAITLISTED') {
            waitlistedCount += (1 + (p.guests_count || 0));
          }
        }
      }

      json.confirmedCount = confirmedSeats;
      json.interestedCount = interestedCount;
      json.waitlistedCount = waitlistedCount;
      json.availableSpots = json.has_capacity ? Math.max(0, json.max_participants - confirmedSeats) : null;
      return json;
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve organized events.' });
  }
};

/**
 * Get Single Event for Organizer Management
 */
const getOrganizerEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;

    const event = await Event.findOne({
      where: { id, organizer_id: organizerId },
      include: [
        { model: EventCategory, as: 'category' },
        { model: EventLocation, as: 'location' },
        { model: EventAnnouncement, as: 'announcements', order: [['created_at', 'DESC']] },
        { model: Meetup, as: 'meetups' }
      ]
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    const stats = await getEventCapacityStats(event.id);

    return res.status(200).json({
      success: true,
      data: {
        ...event.toJSON(),
        stats
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load event details.' });
  }
};

/**
 * Update Event Details
 */
const updateOrganizerEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;

    const event = await Event.findOne({ where: { id, organizer_id: organizerId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    const oldValues = event.toJSON();
    await event.update(req.body);

    if (req.body.location) {
      const loc = await EventLocation.findOne({ where: { event_id: id } });
      if (loc) {
        await loc.update(req.body.location);
      } else {
        await EventLocation.create({ event_id: id, ...req.body.location });
      }
    }

    // Log changes
    await EventChangeHistory.create({
      event_id: id,
      changed_by: organizerId,
      change_type: 'EVENT_UPDATED',
      old_values: oldValues,
      new_values: req.body
    });

    return res.status(200).json({ success: true, message: 'Event updated successfully!', data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

/**
 * Cancel Event
 */
const cancelOrganizerEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;
    const { cancellation_reason } = req.body;

    const event = await Event.findOne({ where: { id, organizer_id: organizerId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    await event.update({
      status: 'cancelled',
      cancellation_reason: cancellation_reason || 'Cancelled by organizer'
    });

    // Create Cancellation Announcement
    await EventAnnouncement.create({
      event_id: id,
      created_by: organizerId,
      title: 'Event Cancelled',
      message: cancellation_reason || 'This event has been cancelled by the organizer.',
      priority: 'urgent'
    });

    return res.status(200).json({ success: true, message: 'Event marked as cancelled.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel event.' });
  }
};

/**
 * Get Event Participants List
 */
const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;
    const { status } = req.query;

    const event = await Event.findOne({ where: { id, organizer_id: organizerId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    const where = { event_id: id };
    if (status && status !== 'all') {
      where.status = status;
    }

    const participants = await EventParticipant.findAll({
      where,
      order: [['joined_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar', 'phone'] }
      ]
    });

    return res.status(200).json({ success: true, data: participants });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve participants.' });
  }
};

/**
 * Update Participant Status (Confirm, Reject, Waitlist)
 */
const updateParticipantStatus = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const organizerId = req.user.id;
    const { status } = req.body; // 'CONFIRMED', 'DECLINED', 'WAITLISTED', 'CANCELLED'

    const event = await Event.findOne({ where: { id, organizer_id: organizerId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    const participant = await EventParticipant.findOne({ where: { id: participantId, event_id: id } });
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }

    const wasConfirmed = participant.status === 'CONFIRMED';
    await participant.update({
      status,
      confirmed_at: status === 'CONFIRMED' ? new Date() : participant.confirmed_at
    });

    // If a confirmed participant was cancelled/rejected, auto-promote next waitlist
    if (wasConfirmed && status !== 'CONFIRMED') {
      await promoteWaitlistedParticipants(id);
    }

    return res.status(200).json({ success: true, message: `Participant status updated to ${status}.`, data: participant });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update participant status.' });
  }
};

/**
 * Mark Attendance Check-In
 */
const markAttendance = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const organizerId = req.user.id;
    const { status = 'ATTENDED', check_in_method = 'manual', notes } = req.body;

    const event = await Event.findOne({ where: { id, organizer_id: organizerId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    const participant = await EventParticipant.findOne({ where: { id: participantId, event_id: id } });
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }

    // Update participant status
    await participant.update({ status });

    // Record attendance entry
    const attendance = await EventAttendance.create({
      event_id: id,
      participant_id: participant.id,
      user_id: participant.user_id,
      status,
      check_in_time: new Date(),
      check_in_method,
      verified_by: organizerId,
      notes: notes ? notes.trim() : null
    });

    return res.status(200).json({ success: true, message: `Attendance marked as ${status}.`, data: attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
};

/**
 * Broadcast Event Announcement
 */
const createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;
    const { title, message, priority = 'normal' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const event = await Event.findOne({ where: { id, organizer_id: organizerId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
    }

    const announcement = await EventAnnouncement.create({
      event_id: id,
      created_by: organizerId,
      title: title.trim(),
      message: message.trim(),
      priority
    });

    return res.status(201).json({ success: true, message: 'Announcement broadcasted to participants!', data: announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

module.exports = {
  createEvent,
  getMyOrganizedEvents,
  getOrganizerEventById,
  updateOrganizerEvent,
  cancelOrganizerEvent,
  getEventParticipants,
  updateParticipantStatus,
  markAttendance,
  createAnnouncement
};
