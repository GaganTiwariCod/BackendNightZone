const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

// Controllers
const astrologyProfileController = require('../controllers/astrologyProfileController');
const astrologyServiceController = require('../controllers/astrologyServiceController');
const astrologerController = require('../controllers/astrologerController');
const kundliController = require('../controllers/kundliController');
const astrologyBookingController = require('../controllers/astrologyBookingController');

// ==========================================
// 1. ASTROLOGY PROFILES (SELF / OTHER)
// ==========================================
// Get all saved birth profiles for logged-in user (auto-scaffolds SELF)
router.get('/profiles', protect, astrologyProfileController.getMyAstrologyProfiles);

// Create a new birth profile (Self / Other Person)
router.post('/profiles', protect, astrologyProfileController.createAstrologyProfile);

// Get single profile by ID (Strict ownership validation)
router.get('/profiles/:id', protect, astrologyProfileController.getAstrologyProfileById);

// Update a profile
router.put('/profiles/:id', protect, astrologyProfileController.updateAstrologyProfile);

// Soft delete a profile
router.delete('/profiles/:id', protect, astrologyProfileController.deleteAstrologyProfile);

// ==========================================
// 2. DYNAMIC SERVICES & CATEGORIES
// ==========================================
// Public catalogue of all astrology categories and services
router.get('/services', astrologyServiceController.getCategoriesAndServices);

// Single service by slug
router.get('/services/:slug', astrologyServiceController.getServiceBySlug);

// ==========================================
// 3. ASTROLOGERS DIRECTORY & ONBOARDING
// ==========================================
// Public directory search and filter
router.get('/astrologers', astrologerController.getAstrologers);

// Public astrologer profile by slug
router.get('/astrologers/:slug', astrologerController.getAstrologerBySlug);

// Astrologer Registration Wizard
router.post('/astrologers/register', protect, astrologerController.registerAstrologer);

// Astrologer's own profile management
router.get('/astrologers/me/profile', protect, astrologerController.getMyAstrologerProfile);

// ==========================================
// 4. KUNDLI & KUNDLI MATCHING
// ==========================================
// Generate Vedic Kundli for saved profile
router.post('/kundli/generate', protect, kundliController.generateKundli);

// Calculate 36 Guna Milan Kundli Matching between Person A and Person B
router.post('/kundli/match', protect, kundliController.calculateKundliMatching);

// ==========================================
// 5. BOOKINGS, CONSULTATIONS & REPORTS
// ==========================================
// Create a new booking
router.post('/bookings', protect, astrologyBookingController.createBooking);

// Get user's bookings
router.get('/bookings', protect, astrologyBookingController.getMyBookings);

// Get user's astrology reports
router.get('/reports', protect, astrologyBookingController.getMyReports);

// Get live consultation session and chat transcript
router.get('/consultations/:id', protect, astrologyBookingController.getConsultationDetails);

// Send chat message in consultation
router.post('/consultations/:id/messages', protect, astrologyBookingController.sendConsultationMessage);

// Complete consultation and add spiritual remedy recommendation (Astrologer only)
router.post('/consultations/:id/complete', protect, astrologyBookingController.completeConsultation);

// Submit review after completed consultation
router.post('/consultations/review', protect, astrologyBookingController.submitReview);

module.exports = router;
