const express = require('express');
const router = express.Router();
const matrimonyAdminController = require('../controllers/matrimonyAdminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const schemas = require('../utils/validators');
const { ROLES } = require('../constants/roles');

// Require ADMIN role for all routes in this router
router.use(protect, authorizeRoles(ROLES.ADMIN));

router.get('/profiles', matrimonyAdminController.getAllProfiles);
router.get('/profiles/:id', matrimonyAdminController.getProfileDetail);
router.patch('/profiles/:id/status', validate(schemas.matrimonyAdminStatus), matrimonyAdminController.updateProfileStatus);
router.patch('/photos/:photoId/status', matrimonyAdminController.updatePhotoStatus);

module.exports = router;
