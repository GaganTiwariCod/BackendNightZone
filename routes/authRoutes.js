const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');
const schemas = require('../utils/validators');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account (Customer, Merchant, Company, Admin)
 *     tags: [Authentication]
 *     description: Creates a new user profile with rate limiting (15 attempts/15 mins) and payload validation. Automatically provisions role-specific profiles.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Registration successful.' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     accessToken: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 *       400:
 *         description: Validation error or Email already in use
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RateLimitResponse' }
 */
router.post('/register', authLimiter, validate(schemas.signup), authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user & issue tokens
 *     tags: [Authentication]
 *     description: Authenticates user credentials, sets HTTP-only refreshToken cookie, and returns short-lived accessToken. Protected by rate limiting (15 attempts/15 mins) and account lockout.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Login successful.' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     accessToken: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       423:
 *         description: Account locked due to failed attempts
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RateLimitResponse' }
 */
router.post('/login', authLimiter, validate(schemas.login), authController.login);

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Google OAuth 2.0 Social Login & Signup
 *     tags: [Authentication]
 *     description: Verifies Google ID Token and logs in or registers user automatically.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Google authentication successful.' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     accessToken: { type: string }
 *       400:
 *         description: Invalid Google Token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/google', authLimiter, validate(schemas.googleAuth), authController.googleAuth);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Authentication]
 *     description: Obtains a fresh access token using the HTTP-Only refresh token cookie or payload refreshToken.
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken: { type: string }
 *       401:
 *         description: Refresh token missing or expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user & invalidate refresh tokens
 *     tags: [Authentication]
 *     description: Clears HTTP-only refresh token cookie and invalidates session.
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Logged out successfully.' }
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     description: Generates a secure reset token. Rate limited to 5 requests per hour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Reset instructions sent if account exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'If an account exists with this email, password reset instructions have been sent.' }
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RateLimitResponse' }
 */
router.post('/forgot-password', passwordResetLimiter, validate(schemas.forgotPassword), authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     description: Sets a new password using the token sent in the reset email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Password reset successful. Please login with your new password.' }
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/reset-password', passwordResetLimiter, validate(schemas.resetPassword), authController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Returns the profile data, role, and associated role details of the logged in user.
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized / Token missing or invalid
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Allows authenticated user to update their current password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Password changed successfully.' }
 *       400:
 *         description: Incorrect current password or invalid new password format
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/change-password', protect, validate(schemas.changePassword), authController.changePassword);

/**
 * @swagger
 * /api/v1/auth/send-email-otp:
 *   post:
 *     summary: Send Email OTP
 *     tags: [Authentication]
 *     description: Generates and sends a 4-digit verification code to the provided email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: 'user@example.com' }
 *               type: { type: string, enum: ['LOGIN', 'SIGNUP', 'RESET_PASSWORD'], default: 'LOGIN' }
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-email-otp', authLimiter, validate(schemas.sendEmailOtp), authController.sendEmailOtp);

/**
 * @swagger
 * /api/v1/auth/verify-email-otp:
 *   post:
 *     summary: Verify Email OTP & Login/Register
 *     tags: [Authentication]
 *     description: Verifies OTP code and authenticates user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, example: 'user@example.com' }
 *               otp: { type: string, example: '4321' }
 *               name: { type: string, example: 'John Doe' }
 *     responses:
 *       200:
 *         description: Login/Verification successful
 */
router.post('/verify-email-otp', authLimiter, validate(schemas.verifyEmailOtp), authController.verifyEmailOtp);

module.exports = router;
