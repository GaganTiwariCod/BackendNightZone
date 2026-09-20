const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const schemas = require('../utils/validators');
const { ROLES } = require('../constants/roles');

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     description: Updates personal and role-specific details for the logged in user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Profile updated successfully.' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/profile', protect, validate(schemas.updateProfile), userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/admin/users:
 *   get:
 *     summary: List all users (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve paginated list of all users with associated profiles.
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, CUSTOMER, MERCHANT, COMPANY]
 *         description: Filter users by role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of registered users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 45 }
 *                     totalPages: { type: integer, example: 3 }
 *                     page: { type: integer, example: 1 }
 *                     users:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/User' }
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/admin/users', protect, authorizeRoles(ROLES.ADMIN), userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/admin/users/{userId}/role:
 *   patch:
 *     summary: Update a user's role (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Modifies user role across the platform.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'User role updated to MERCHANT' }
 *       403:
 *         description: Forbidden - Admin permission required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch('/admin/users/:userId/role', protect, authorizeRoles(ROLES.ADMIN), userController.updateUserRole);

/**
 * @swagger
 * /api/v1/users/admin/users/{userId}/status:
 *   patch:
 *     summary: Update a user's active/suspended status (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Suspends or reactivates a user account.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'User status updated successfully' }
 *       403:
 *         description: Forbidden - Admin permission required
 */
router.patch('/admin/users/:userId/status', protect, authorizeRoles(ROLES.ADMIN), userController.updateUserStatus);

module.exports = router;
