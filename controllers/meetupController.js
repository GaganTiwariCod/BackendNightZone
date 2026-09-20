const { Meetup, MeetupParticipant, Event, User } = require('../models');
const { generateUniqueSlug } = require('../utils/slugGenerator');

/**
 * Get all meetups for an event
 */
const getEventMeetups = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id || null;

    const meetups = await Meetup.findAll({
      where: { event_id: eventId },
      order: [['meetup_date', 'ASC'], ['meetup_time', 'ASC']],
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'avatar', 'phone'] },
        { 
          model: MeetupParticipant, 
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }]
        }
      ]
    });

    const enriched = meetups.map(m => {
      const json = m.toJSON();
      const activeCount = json.participants?.filter(p => p.status === 'APPROVED' || p.status === 'JOINED').length || 0;
      json.currentMembersCount = activeCount;
      json.isFull = activeCount >= json.max_members;
      json.isMember = userId ? json.participants?.some(p => p.user_id === userId && (p.status === 'APPROVED' || p.status === 'JOINED')) : false;
      return json;
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve event meetups.' });
  }
};

/**
 * Create a Meetup for an Event
 */
const createMeetup = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;
    const {
      name,
      description,
      starting_location,
      starting_latitude,
      starting_longitude,
      destination,
      meetup_date,
      meetup_time,
      max_members = 20,
      transport_type = 'car',
      requires_approval = false
    } = req.body;

    if (!name || !starting_location || !meetup_date) {
      return res.status(400).json({ success: false, message: 'Name, Starting Location, and Date are required.' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const slug = await generateUniqueSlug(Meetup, name);

    const meetup = await Meetup.create({
      event_id: eventId,
      organizer_id: organizerId,
      name: name.trim(),
      slug,
      description: description ? description.trim() : null,
      starting_location: starting_location.trim(),
      starting_latitude: starting_latitude ? parseFloat(starting_latitude) : null,
      starting_longitude: starting_longitude ? parseFloat(starting_longitude) : null,
      destination: destination || event.title,
      meetup_date,
      meetup_time: meetup_time || '06:30',
      max_members: parseInt(max_members, 10) || 20,
      transport_type,
      requires_approval,
      status: 'active'
    });

    // Auto-join organizer as approved participant
    await MeetupParticipant.create({
      meetup_id: meetup.id,
      user_id: organizerId,
      status: 'APPROVED',
      approved_at: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Meetup group created successfully!',
      data: meetup
    });
  } catch (error) {
    console.error('Error in createMeetup:', error);
    return res.status(500).json({ success: false, message: 'Failed to create meetup group.' });
  }
};

/**
 * Join a Meetup
 */
const joinMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      return res.status(404).json({ success: false, message: 'Meetup group not found.' });
    }

    // Check capacity
    const currentActiveCount = await MeetupParticipant.count({
      where: {
        meetup_id: id,
        status: ['APPROVED', 'JOINED']
      }
    });

    if (currentActiveCount >= meetup.max_members) {
      return res.status(400).json({ success: false, message: 'This meetup group is already full.' });
    }

    const initialStatus = meetup.requires_approval ? 'REQUESTED' : 'JOINED';

    const [participant, created] = await MeetupParticipant.findOrCreate({
      where: { meetup_id: id, user_id: userId },
      defaults: {
        meetup_id: id,
        user_id: userId,
        status: initialStatus,
        approved_at: initialStatus === 'JOINED' ? new Date() : null
      }
    });

    if (!created) {
      await participant.update({
        status: initialStatus,
        approved_at: initialStatus === 'JOINED' ? new Date() : null
      });
    }

    return res.status(200).json({
      success: true,
      message: initialStatus === 'JOINED' ? 'You joined the meetup group!' : 'Request sent to meetup organizer!',
      data: participant
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to join meetup.' });
  }
};

/**
 * Leave Meetup
 */
const leaveMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await MeetupParticipant.findOne({
      where: { meetup_id: id, user_id: userId }
    });

    if (!participant) {
      return res.status(404).json({ success: false, message: 'You are not a member of this meetup.' });
    }

    await participant.update({ status: 'LEFT' });

    return res.status(200).json({ success: true, message: 'You left the meetup group.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to leave meetup.' });
  }
};

module.exports = {
  getEventMeetups,
  createMeetup,
  joinMeetup,
  leaveMeetup
};
