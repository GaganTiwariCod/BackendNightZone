const { AstrologyProfile, User } = require('../models');

/**
 * Get all Astrology profiles for authenticated user (Self + Family/Friends)
 */
const getMyAstrologyProfiles = async (req, res) => {
  try {
    const userId = req.user.id;

    let profiles = await AstrologyProfile.findAll({
      where: { user_id: userId },
      order: [
        ['profile_type', 'ASC'], // 'SELF' first
        ['is_default', 'DESC'],
        ['created_at', 'ASC']
      ]
    });

    // If user has no profile at all, create an initial SELF profile scaffold based on user's name
    if (profiles.length === 0) {
      const user = await User.findByPk(userId);
      if (user) {
        const defaultSelf = await AstrologyProfile.create({
          user_id: userId,
          profile_type: 'SELF',
          name: user.name || 'My Profile',
          relationship: 'Self',
          gender: 'male',
          date_of_birth: '1995-01-01',
          time_of_birth: '12:00',
          birth_time_accuracy: 'ACCURATE',
          birth_country: 'India',
          birth_state: 'Maharashtra',
          birth_city: 'Mumbai',
          birth_place: 'Mumbai, Maharashtra, India',
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: 'Asia/Kolkata',
          is_default: true
        });
        profiles = [defaultSelf];
      }
    }

    return res.status(200).json({
      success: true,
      profiles,
      activeProfile: profiles.find(p => p.is_default) || profiles[0] || null
    });
  } catch (error) {
    console.error('Error fetching astrology profiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve astrology profiles.'
    });
  }
};

/**
 * Get single profile by ID (Strict ownership check)
 */
const getAstrologyProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await AstrologyProfile.findOne({
      where: { id, user_id: userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Astrology profile not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching astrology profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch astrology profile.'
    });
  }
};
const parseCoord = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

/**
 * Create a new Astrology Profile (Self or Other Person)
 */
const createAstrologyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      profile_type = 'OTHER',
      name,
      relationship = 'Other',
      gender = 'male',
      date_of_birth,
      time_of_birth = '12:00',
      birth_time_accuracy = 'ACCURATE',
      birth_country = 'India',
      birth_state,
      birth_city,
      birth_place,
      latitude,
      longitude,
      timezone = 'Asia/Kolkata',
      notes,
      is_default = false
    } = req.body;

    if (!name || !date_of_birth) {
      return res.status(400).json({
        success: false,
        message: 'Name and Date of Birth are required.'
      });
    }

    const resolvedBirthPlace = birth_place?.trim() || [birth_city, birth_state, birth_country].filter(Boolean).join(', ') || 'India';

    // If profile_type is SELF, check if user already has one
    if (profile_type === 'SELF') {
      const existingSelf = await AstrologyProfile.findOne({
        where: { user_id: userId, profile_type: 'SELF' }
      });
      if (existingSelf) {
        // Update existing self profile instead of duplicating
        await existingSelf.update({
          name: name.trim(),
          relationship: 'Self',
          gender,
          date_of_birth,
          time_of_birth: time_of_birth || '12:00',
          birth_time_accuracy,
          birth_country: birth_country || 'India',
          birth_state,
          birth_city,
          birth_place: resolvedBirthPlace,
          latitude: parseCoord(latitude),
          longitude: parseCoord(longitude),
          timezone: timezone || 'Asia/Kolkata',
          notes,
          is_default: true
        });

        return res.status(200).json({
          success: true,
          message: 'Self astrology profile updated successfully.',
          profile: existingSelf
        });
      }
    }

    // If set to default, unset other defaults
    if (is_default) {
      await AstrologyProfile.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    const newProfile = await AstrologyProfile.create({
      user_id: userId,
      profile_type,
      name: name.trim(),
      relationship: profile_type === 'SELF' ? 'Self' : (relationship || 'Other'),
      gender,
      date_of_birth,
      time_of_birth: time_of_birth || '12:00',
      birth_time_accuracy,
      birth_country: birth_country || 'India',
      birth_state,
      birth_city,
      birth_place: resolvedBirthPlace,
      latitude: parseCoord(latitude),
      longitude: parseCoord(longitude),
      timezone: timezone || 'Asia/Kolkata',
      notes,
      is_default
    });

    return res.status(201).json({
      success: true,
      message: `${newProfile.name}'s astrology profile added successfully.`,
      profile: newProfile
    });
  } catch (error) {
    console.error('Error creating astrology profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create astrology profile.'
    });
  }
};

/**
 * Update an Astrology Profile (Strict ownership check)
 */
const updateAstrologyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await AstrologyProfile.findOne({
      where: { id, user_id: userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or you do not have permission to edit it.'
      });
    }

    const {
      name,
      relationship,
      gender,
      date_of_birth,
      time_of_birth,
      birth_time_accuracy,
      birth_country,
      birth_state,
      birth_city,
      birth_place,
      latitude,
      longitude,
      timezone,
      notes,
      is_default
    } = req.body;

    if (is_default && !profile.is_default) {
      await AstrologyProfile.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    await profile.update({
      name: name !== undefined ? name.trim() : profile.name,
      relationship: profile.profile_type === 'SELF' ? 'Self' : (relationship ?? profile.relationship),
      gender: gender ?? profile.gender,
      date_of_birth: date_of_birth ?? profile.date_of_birth,
      time_of_birth: time_of_birth ?? profile.time_of_birth,
      birth_time_accuracy: birth_time_accuracy ?? profile.birth_time_accuracy,
      birth_country: birth_country ?? profile.birth_country,
      birth_state: birth_state ?? profile.birth_state,
      birth_city: birth_city ?? profile.birth_city,
      birth_place: birth_place !== undefined ? birth_place.trim() : profile.birth_place,
      latitude: latitude !== undefined ? parseCoord(latitude) : profile.latitude,
      longitude: longitude !== undefined ? parseCoord(longitude) : profile.longitude,
      timezone: timezone ?? profile.timezone,
      notes: notes ?? profile.notes,
      is_default: is_default !== undefined ? is_default : profile.is_default
    });

    return res.status(200).json({
      success: true,
      message: 'Astrology profile updated successfully.',
      profile
    });
  } catch (error) {
    console.error('Error updating astrology profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update astrology profile.'
    });
  }
};

/**
 * Delete (Soft Delete) an Astrology Profile
 */
const deleteAstrologyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await AstrologyProfile.findOne({
      where: { id, user_id: userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or access denied.'
      });
    }

    // Do not allow deleting SELF profile if it's the only one
    if (profile.profile_type === 'SELF') {
      const count = await AstrologyProfile.count({ where: { user_id: userId } });
      if (count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your primary SELF profile.'
        });
      }
    }

    await profile.destroy(); // Soft delete via paranoid: true

    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting astrology profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete astrology profile.'
    });
  }
};

module.exports = {
  getMyAstrologyProfiles,
  getAstrologyProfileById,
  createAstrologyProfile,
  updateAstrologyProfile,
  deleteAstrologyProfile
};
