const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_nightzone_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_nightzone_refresh_secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate Access Token (short-lived)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
};

/**
 * Generate Refresh Token (long-lived)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      tokenVersion: crypto.randomBytes(16).toString('hex')
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
};

/**
 * Creates and stores a new refresh token record in the MySQL NightZone database
 */
const createAndStoreRefreshToken = async (user, req) => {
  const refreshToken = generateRefreshToken(user);
  
  // Calculate expiration date (default 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';

  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent
  });

  return refreshToken;
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Set Refresh Token Cookie Options
 */
const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  createAndStoreRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenCookieOptions
};
