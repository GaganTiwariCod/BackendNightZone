const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  User,
  RefreshToken,
  MerchantProfile,
  CompanyProfile,
  CustomerProfile,
  EmailOtp,
  sequelize
} = require('../models');
const { ROLES } = require('../constants/roles');
const ApiResponse = require('../utils/apiResponse');
const {
  generateAccessToken,
  createAndStoreRefreshToken,
  verifyRefreshToken,
  getRefreshTokenCookieOptions
} = require('../utils/tokenUtils');
const { verifyGoogleIdToken } = require('../utils/googleAuth');

/**
 * Helper to generate unique store slug for merchants
 */
const generateSlug = (text) => {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-') +
    '-' +
    Math.random().toString(36).substring(2, 7)
  );
};

/**
 * 1. Register User (Local Email/Password)
 * Supports all roles: CUSTOMER, MERCHANT, COMPANY, ADMIN
 */
const register = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, role = ROLES.CUSTOMER, phone, merchantDetails, companyDetails } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      await t.rollback();
      return ApiResponse.error(res, 'Email address is already in use.', 409);
    }

    // Create User record
    const user = await User.create(
      {
        name,
        email: email.toLowerCase(),
        password,
        role,
        phone,
        auth_provider: 'LOCAL'
      },
      { transaction: t }
    );

    // Auto-create role-specific profile based on selected role
    if (role === ROLES.MERCHANT) {
      const storeName = merchantDetails?.storeName || `${name}'s Store`;
      const storeSlug = merchantDetails?.storeSlug || generateSlug(storeName);

      await MerchantProfile.create(
        {
          user_id: user.id,
          store_name: storeName,
          store_slug: storeSlug,
          business_reg_number: merchantDetails?.businessRegNumber || null,
          store_description: merchantDetails?.storeDescription || null,
          is_approved: false
        },
        { transaction: t }
      );
    } else if (role === ROLES.COMPANY) {
      await CompanyProfile.create(
        {
          user_id: user.id,
          company_name: companyDetails?.companyName || `${name} Corp`,
          tax_id: companyDetails?.taxId || null,
          corporate_email: companyDetails?.corporateEmail || email,
          business_phone: companyDetails?.businessPhone || phone || null,
          billing_address: companyDetails?.billingAddress || null,
          is_verified: false
        },
        { transaction: t }
      );
    } else if (role === ROLES.CUSTOMER) {
      await CustomerProfile.create(
        {
          user_id: user.id
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndStoreRefreshToken(user, req);

    // Set HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.success(
      res,
      'Registration successful.',
      {
        user: user.toSafeJSON(),
        accessToken
      },
      201
    );
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * 2. Login User (Local Email/Password)
 * Includes Account Lockout Protection
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
    const lockMinutes = parseInt(process.env.LOCK_TIME_MINUTES, 10) || 15;

    // Fetch user including password hash & profiles
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        { model: MerchantProfile, as: 'merchantProfile', required: false },
        { model: CompanyProfile, as: 'companyProfile', required: false },
        { model: CustomerProfile, as: 'customerProfile', required: false }
      ]
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password.', 401);
    }

    // Check account active status
    if (!user.is_active) {
      return ApiResponse.error(res, 'This account has been suspended. Please contact support.', 403);
    }

    // Check account lockout
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((new Date(user.lock_until) - new Date()) / (60 * 1000));
      return ApiResponse.error(
        res,
        `Account is temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`,
        423
      );
    }

    // Verify Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementFailedAttempts(maxAttempts, lockMinutes);
      const remaining = maxAttempts - (user.failed_login_attempts + 1);
      const warningMsg =
        remaining > 0
          ? `Invalid credentials. ${remaining} attempt(s) remaining before temporary lockout.`
          : `Invalid credentials. Account locked for ${lockMinutes} minutes.`;

      return ApiResponse.error(res, warningMsg, 401);
    }

    // Reset failed attempts & update last login
    await user.resetFailedAttempts();
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndStoreRefreshToken(user, req);

    // Set secure cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.success(res, 'Login successful.', {
      user: user.toSafeJSON(),
      accessToken
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 3. Google OAuth 2.0 (Login / Signup)
 */
const googleAuth = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { idToken, accessToken: googleAccessToken, token: rawToken, credential, role = ROLES.CUSTOMER } = req.body;
    const token = idToken || googleAccessToken || rawToken || credential;

    if (!token) {
      await t.rollback();
      return ApiResponse.error(res, 'Google authentication token is required.', 400);
    }

    const googlePayload = await verifyGoogleIdToken(token);
    const { googleId, email, name, avatar } = googlePayload;

    // Check if user exists by googleId or email
    let user = await User.findOne({
      where: {
        [Op.or]: [{ google_id: googleId }, { email: email.toLowerCase() }]
      }
    });

    if (user) {
      // If user exists, link Google ID and update avatar if not present
      if (!user.google_id) {
        await user.update(
          {
            google_id: googleId,
            avatar: user.avatar || avatar,
            is_email_verified: true
          },
          { transaction: t }
        );
      }
    } else {
      // Create new user via Google
      user = await User.create(
        {
          name: name || 'Google User',
          email: email.toLowerCase(),
          google_id: googleId,
          avatar: avatar || null,
          role,
          auth_provider: 'GOOGLE',
          is_email_verified: true
        },
        { transaction: t }
      );

      // Create associated profile
      if (role === ROLES.MERCHANT) {
        await MerchantProfile.create(
          {
            user_id: user.id,
            store_name: `${user.name}'s Store`,
            store_slug: generateSlug(user.name),
            is_approved: false
          },
          { transaction: t }
        );
      } else if (role === ROLES.COMPANY) {
        await CompanyProfile.create(
          {
            user_id: user.id,
            company_name: `${user.name} Enterprise`,
            corporate_email: user.email,
            is_verified: false
          },
          { transaction: t }
        );
      } else {
        await CustomerProfile.create(
          {
            user_id: user.id
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    if (!user.is_active) {
      return ApiResponse.error(res, 'Your account is deactivated. Contact support.', 403);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndStoreRefreshToken(user, req);

    // Set cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.success(res, 'Google authentication successful.', {
      user: user.toSafeJSON(),
      accessToken
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * 4. Refresh Token Rotation
 * Prevents replay attacks by invalidating used refresh token and issuing a new pair
 */
const refreshToken = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawToken) {
      return ApiResponse.error(res, 'Refresh token not provided.', 401);
    }

    // Verify JWT signature
    const decoded = verifyRefreshToken(rawToken);
    if (!decoded) {
      return ApiResponse.error(res, 'Invalid or expired refresh token. Please login again.', 401);
    }

    // Check token existence and revocation in DB
    const storedToken = await RefreshToken.findOne({
      where: {
        token: rawToken,
        user_id: decoded.id,
        is_revoked: false
      }
    });

    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      return ApiResponse.error(res, 'Refresh token is expired or has been revoked.', 401);
    }

    // Fetch user
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return ApiResponse.error(res, 'User account not found or inactive.', 401);
    }

    // Revoke old refresh token (Rotation)
    await storedToken.update({ is_revoked: true });

    // Issue new token pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await createAndStoreRefreshToken(user, req);

    // Set new cookie
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.success(res, 'Token refreshed successfully.', {
      accessToken: newAccessToken
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 5. Logout User
 * Revokes current refresh token and clears cookie
 */
const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawToken) {
      await RefreshToken.update({ is_revoked: true }, { where: { token: rawToken } });
    }

    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    return ApiResponse.success(res, 'Logged out successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * 6. Get Current User Profile (with role profile included)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: MerchantProfile, as: 'merchantProfile', required: false },
        { model: CompanyProfile, as: 'companyProfile', required: false },
        { model: CustomerProfile, as: 'customerProfile', required: false }
      ]
    });

    return ApiResponse.success(res, 'User profile retrieved.', user.toSafeJSON());
  } catch (error) {
    return next(error);
  }
};

/**
 * 7. Change Password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.password) {
      return ApiResponse.error(
        res,
        'This account was created via Google OAuth. Please set a password using the reset password flow.',
        400
      );
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password does not match.', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all active refresh tokens for this user for security
    await RefreshToken.update({ is_revoked: true }, { where: { user_id: user.id } });

    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

    return ApiResponse.success(res, 'Password changed successfully. Please log in again with your new password.');
  } catch (error) {
    return next(error);
  }
};

/**
 * 8. Forgot Password (generates reset token)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    // Always respond with success message to prevent user enumeration attacks
    if (!user) {
      return ApiResponse.success(
        res,
        'If an account exists with that email address, a password reset link/token has been generated.'
      );
    }

    // Generate random reset token & hash it
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({
      password_reset_token: hashedToken,
      password_reset_expires: expiresAt
    });

    console.log(`[NightZone PASSWORD RESET TOKEN for ${user.email}]: ${resetToken}`);

    return ApiResponse.success(
      res,
      'If an account exists with that email address, a password reset token has been sent.',
      process.env.NODE_ENV === 'development' ? { devResetToken: resetToken } : null
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * 9. Reset Password with Token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return ApiResponse.error(res, 'Password reset token is invalid or has expired.', 400);
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    user.failed_login_attempts = 0;
    user.lock_until = null;
    await user.save();

    // Revoke all existing sessions
    await RefreshToken.update({ is_revoked: true }, { where: { user_id: user.id } });

    return ApiResponse.success(res, 'Password has been reset successfully. You can now login with your new password.');
  } catch (error) {
    return next(error);
  }
};

/**
 * 10. Send Email OTP (Login / Signup)
 */
const sendEmailOtp = async (req, res, next) => {
  try {
    const { email, type = 'LOGIN' } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // Generate 4-digit numeric OTP code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous unused OTPs for this email & type
    await EmailOtp.update(
      { is_used: true },
      { where: { email: cleanEmail, is_used: false } }
    );

    // Store new OTP in database
    await EmailOtp.create({
      email: cleanEmail,
      otp: otpCode,
      type,
      expires_at: expiresAt,
      is_used: false
    });

    console.log(`\n======================================================`);
    console.log(`📧 [NightZone EMAIL OTP for ${cleanEmail}]: ${otpCode} (Valid for 10 mins)`);
    console.log(`======================================================\n`);

    return ApiResponse.success(
      res,
      `A 4-digit verification code has been sent to ${cleanEmail}.`,
      process.env.NODE_ENV === 'development' ? { devOtp: otpCode } : null
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * 11. Verify Email OTP (Login / Signup)
 */
const verifyEmailOtp = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { email, otp, name, role = ROLES.CUSTOMER } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // Find active valid OTP in database
    const otpRecord = await EmailOtp.findOne({
      where: {
        email: cleanEmail,
        otp: otp.trim(),
        is_used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!otpRecord) {
      await t.rollback();
      return ApiResponse.error(res, 'Invalid or expired OTP code. Please request a new one.', 400);
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true }, { transaction: t });

    // Check if user exists
    let user = await User.findOne({
      where: { email: cleanEmail }
    });

    if (!user) {
      // Auto-register user via Email OTP
      const userName = name || cleanEmail.split('@')[0];
      user = await User.create(
        {
          name: userName,
          email: cleanEmail,
          role,
          auth_provider: 'LOCAL',
          is_email_verified: true,
          is_active: true
        },
        { transaction: t }
      );

      // Create Customer profile
      await CustomerProfile.create(
        {
          user_id: user.id
        },
        { transaction: t }
      );
    } else {
      // If user exists, mark email verified & reset failed attempts
      await user.update(
        {
          is_email_verified: true,
          failed_login_attempts: 0,
          lock_until: null,
          last_login_at: new Date()
        },
        { transaction: t }
      );
    }

    await t.commit();

    if (!user.is_active) {
      return ApiResponse.error(res, 'This account is deactivated. Contact support.', 403);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await createAndStoreRefreshToken(user, req);

    // Set cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.success(res, 'Email verification successful.', {
      user: user.toSafeJSON(),
      accessToken
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  refreshToken,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  sendEmailOtp,
  verifyEmailOtp
};
