const express = require('express');
const router = express.Router();
const matrimonyController = require('../controllers/matrimonyController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const schemas = require('../utils/validators');
const { uploadMatrimonyPhoto } = require('../middlewares/uploadMiddleware');

// Public / discovery endpoints
router.get('/master-data', matrimonyController.getMasterData);
router.get('/browse', optionalAuth, matrimonyController.browseProfiles);
router.get('/preview/:profileId', optionalAuth, matrimonyController.getProfilePreview);

// Protected authenticated user profile endpoints
router.get('/me', protect, matrimonyController.getMyProfile);
router.get('/preview', protect, matrimonyController.getProfilePreview);

// Step-by-step updates
router.post('/step/basic', protect, validate(schemas.matrimonyBasic), (req, res, next) => {
  req.params.stepName = 'basic';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/religion', protect, validate(schemas.matrimonyReligion), (req, res, next) => {
  req.params.stepName = 'religion';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/location', protect, validate(schemas.matrimonyLocation), (req, res, next) => {
  req.params.stepName = 'location';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/education', protect, validate(schemas.matrimonyEducation), (req, res, next) => {
  req.params.stepName = 'education';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/career', protect, validate(schemas.matrimonyCareer), (req, res, next) => {
  req.params.stepName = 'career';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/lifestyle', protect, validate(schemas.matrimonyLifestyle), (req, res, next) => {
  req.params.stepName = 'lifestyle';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/family', protect, validate(schemas.matrimonyFamily), (req, res, next) => {
  req.params.stepName = 'family';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/about', protect, validate(schemas.matrimonyAbout), (req, res, next) => {
  req.params.stepName = 'about';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/horoscope', protect, validate(schemas.matrimonyHoroscope), (req, res, next) => {
  req.params.stepName = 'horoscope';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/preferences', protect, validate(schemas.matrimonyPreferences), (req, res, next) => {
  req.params.stepName = 'preferences';
  matrimonyController.saveStep(req, res, next);
});

router.post('/step/privacy', protect, validate(schemas.matrimonyPrivacy), (req, res, next) => {
  req.params.stepName = 'privacy';
  matrimonyController.saveStep(req, res, next);
});

// Photo Management
router.post('/photos', protect, uploadMatrimonyPhoto.single('photo'), matrimonyController.uploadPhoto);
router.delete('/photos/:photoId', protect, matrimonyController.deletePhoto);
router.patch('/photos/:photoId/primary', protect, matrimonyController.setPrimaryPhoto);

// Family Members
router.post('/family-members', protect, validate(schemas.matrimonyFamilyMember), matrimonyController.addFamilyMember);
router.delete('/family-members/:id', protect, matrimonyController.deleteFamilyMember);

// Publishing lifecycle
router.post('/publish', protect, matrimonyController.publishProfile);
router.post('/unpublish', protect, matrimonyController.unpublishProfile);

module.exports = router;
