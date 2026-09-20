const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

/**
 * Verifies a Google ID token or Access token received from the frontend client
 * @param {string} token - The ID token or access token provided by Google
 * @returns {Promise<Object>} Decoded user payload
 */
const verifyGoogleIdToken = async (token) => {
  if (!token) {
    throw new Error('Google token is missing.');
  }

  // 1. Try verifying as ID token (JWT)
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      name: payload.name,
      avatar: payload.picture
    };
  } catch (idErr) {
    // 2. If ID token verification fails, try fetching user info with token as access token
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.sub && data.email) {
        return {
          googleId: data.sub,
          email: data.email,
          emailVerified: data.email_verified,
          name: data.name,
          avatar: data.picture
        };
      }
    } catch (accessErr) {
      // ignore
    }
    throw new Error(`Google token verification failed: ${idErr.message}`);
  }
};

module.exports = {
  verifyGoogleIdToken
};
