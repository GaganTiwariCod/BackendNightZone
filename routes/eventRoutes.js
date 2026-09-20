const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const eventController = require('../controllers/eventController');
const organizerEventController = require('../controllers/organizerEventController');
const meetupController = require('../controllers/meetupController');

// ==========================================
// 1. PUBLIC & DISCOVERY ROUTES
// ==========================================
router.get('/', optionalAuth, eventController.getPublicEvents);
router.get('/categories', eventController.getEventCategories);
router.get('/:slug', optionalAuth, eventController.getEventBySlug);

// User Participation & Favorites
router.post('/:id/raise-hand', protect, eventController.raiseHand);
router.delete('/:id/participation', protect, eventController.cancelParticipation);
router.post('/:id/favorite', protect, eventController.toggleFavorite);
router.post('/:id/report', protect, eventController.reportEvent);

// ==========================================
// 2. ORGANIZER MANAGEMENT ROUTES
// ==========================================
router.post('/', protect, organizerEventController.createEvent);
router.get('/organizer/my-events', protect, organizerEventController.getMyOrganizedEvents);
router.get('/organizer/events/:id', protect, organizerEventController.getOrganizerEventById);
router.put('/organizer/events/:id', protect, organizerEventController.updateOrganizerEvent);
router.patch('/organizer/events/:id/cancel', protect, organizerEventController.cancelOrganizerEvent);

// Participant Moderation & Attendance
router.get('/organizer/events/:id/participants', protect, organizerEventController.getEventParticipants);
router.patch('/organizer/events/:id/participants/:participantId', protect, organizerEventController.updateParticipantStatus);
router.post('/organizer/events/:id/participants/:participantId/check-in', protect, organizerEventController.markAttendance);

// Announcements
router.post('/organizer/events/:id/announcements', protect, organizerEventController.createAnnouncement);

// ==========================================
// 3. MEETUP ROUTES
// ==========================================
router.get('/:eventId/meetups', optionalAuth, meetupController.getEventMeetups);
router.post('/:eventId/meetups', protect, meetupController.createMeetup);
router.post('/meetups/:id/join', protect, meetupController.joinMeetup);
router.delete('/meetups/:id/leave', protect, meetupController.leaveMeetup);

module.exports = router;
