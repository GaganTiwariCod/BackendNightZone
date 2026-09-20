const { Event, EventParticipant, User } = require('../models');

/**
 * Calculate capacity statistics for an event
 * @param {string} eventId
 * @returns {Promise<{ maxCapacity: number, totalConfirmedSeats: number, availableSeats: number, isFull: boolean, totalInterested: number, totalWaitlisted: number }>}
 */
const getEventCapacityStats = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new Error('Event not found');

  const participants = await EventParticipant.findAll({
    where: { event_id: eventId },
    attributes: ['status', 'guests_count']
  });

  let totalConfirmedSeats = 0;
  let totalInterested = 0;
  let totalWaitlisted = 0;

  for (const p of participants) {
    if (p.status === 'CONFIRMED' || p.status === 'ATTENDED') {
      totalConfirmedSeats += (1 + (p.guests_count || 0));
    } else if (p.status === 'INTERESTED') {
      totalInterested++;
    } else if (p.status === 'WAITLISTED') {
      totalWaitlisted += (1 + (p.guests_count || 0));
    }
  }

  const maxCapacity = event.has_capacity ? (event.max_participants || 100) : 999999;
  const availableSeats = Math.max(0, maxCapacity - totalConfirmedSeats);
  const isFull = event.has_capacity && availableSeats <= 0;

  return {
    hasCapacity: event.has_capacity,
    maxCapacity,
    totalConfirmedSeats,
    availableSeats,
    isFull,
    totalInterested,
    totalWaitlisted
  };
};

/**
 * Promote the next waitlisted participants if capacity becomes available
 * @param {string} eventId
 */
const promoteWaitlistedParticipants = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event || !event.has_capacity || !event.auto_promote_waitlist) return [];

  const stats = await getEventCapacityStats(eventId);
  let available = stats.availableSeats;
  if (available <= 0) return [];

  // Find waitlisted participants ordered by joined_at ASC (first-come first-served)
  const waitlisted = await EventParticipant.findAll({
    where: {
      event_id: eventId,
      status: 'WAITLISTED'
    },
    order: [['joined_at', 'ASC']],
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
  });

  const promoted = [];

  for (const candidate of waitlisted) {
    const requiredSeats = 1 + (candidate.guests_count || 0);
    if (requiredSeats <= available) {
      await candidate.update({
        status: 'CONFIRMED',
        confirmed_at: new Date()
      });
      available -= requiredSeats;
      promoted.push(candidate);
    }
  }

  return promoted;
};

module.exports = {
  getEventCapacityStats,
  promoteWaitlistedParticipants
};
