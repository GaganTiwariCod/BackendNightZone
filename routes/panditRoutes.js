const express = require('express');
const router = express.Router();
const panditController = require('../controllers/panditController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadPanditPhoto, uploadPanditDocument } = require('../middlewares/uploadMiddleware');

// 1. Master Data & Public Directory
router.get('/master-data', panditController.getMasterData);
router.get('/public/directory', panditController.getPublicDirectory);
router.get('/public/:slug', panditController.getPublicProfileBySlug);

// 2. Protected Authenticated Pandit Endpoints
router.get('/me', protect, panditController.getMyProfile);

// Step-by-Step Profile Management
router.post('/basic', protect, panditController.saveBasicInfo);
router.post('/religious', protect, panditController.saveReligiousDetails);
router.post('/services', protect, panditController.saveServices);
router.post('/languages', protect, panditController.saveLanguages);
router.post('/education', protect, panditController.saveEducation);
router.post('/experience', protect, panditController.saveExperience);
router.post('/locations', protect, panditController.saveLocations);
router.post('/availability', protect, panditController.saveAvailability);

// Uploads
router.post('/photo', protect, uploadPanditPhoto.single('photo'), panditController.uploadProfilePhoto);
router.post('/documents', protect, uploadPanditDocument.single('document'), panditController.uploadDocument);
router.delete('/documents/:docId', protect, panditController.deleteDocument);

// Final Submission
router.post('/submit', protect, panditController.submitForVerification);

module.exports = router;
