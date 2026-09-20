const { Op } = require('sequelize');
const {
  MatrimonialProfile,
  ReligiousProfile,
  LocationProfile,
  EducationProfile,
  CareerProfile,
  LifestyleProfile,
  FamilyProfile,
  FamilyMember,
  UserPhoto,
  HoroscopeProfile,
  PartnerPreference,
  PrivacySetting,
  ProfileVerification,
  ProfileReport,
  User
} = require('../models');
const ApiResponse = require('../utils/apiResponse');

/**
 * 1. Admin: Get list of all matrimonial profiles with status filtering
 */
const getAllProfiles = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const whereConditions = {};

    if (status) {
      whereConditions.profile_status = status;
    }

    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows } = await MatrimonialProfile.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'is_active'] },
        { model: LocationProfile, as: 'locationProfile' },
        { model: ReligiousProfile, as: 'religiousProfile' },
        { model: UserPhoto, as: 'photos' }
      ],
      limit: parseInt(limit, 10),
      offset,
      order: [['updated_at', 'DESC']],
      distinct: true
    });

    return ApiResponse.success(res, 'Admin profiles list fetched.', {
      total: count,
      totalPages: Math.ceil(count / limit),
      page: parseInt(page, 10),
      profiles: rows
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 2. Admin: Get single profile full details for review
 */
const getProfileDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await MatrimonialProfile.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'is_active', 'created_at'] },
        { model: ReligiousProfile, as: 'religiousProfile' },
        { model: LocationProfile, as: 'locationProfile' },
        { model: EducationProfile, as: 'educationProfile' },
        { model: CareerProfile, as: 'careerProfile' },
        { model: LifestyleProfile, as: 'lifestyleProfile' },
        { model: FamilyProfile, as: 'familyProfile' },
        { model: FamilyMember, as: 'familyMembers' },
        { model: UserPhoto, as: 'photos' },
        { model: HoroscopeProfile, as: 'horoscopeProfile' },
        { model: PartnerPreference, as: 'partnerPreference' },
        { model: PrivacySetting, as: 'privacySetting' },
        { model: ProfileVerification, as: 'verifications' },
        { model: ProfileReport, as: 'reports', include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }] }
      ]
    });

    if (!profile) {
      return ApiResponse.error(res, 'Profile not found.', 404);
    }

    return ApiResponse.success(res, 'Profile details retrieved for moderation.', { profile });
  } catch (error) {
    return next(error);
  }
};

/**
 * 3. Admin: Moderate Profile Status (Approve, Reject, Suspend, Restore)
 */
const updateProfileStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const profile = await MatrimonialProfile.findByPk(id);
    if (!profile) {
      return ApiResponse.error(res, 'Profile not found.', 404);
    }

    const updates = {
      profile_status: status,
      rejection_reason: status === 'rejected' ? (rejection_reason || 'Does not meet community guidelines') : null,
      is_published: status === 'published'
    };

    if (status === 'published') {
      updates.is_verified = true;
    }

    await profile.update(updates);

    return ApiResponse.success(res, `Profile status updated to ${status}.`, { profile });
  } catch (error) {
    return next(error);
  }
};

/**
 * 4. Admin: Moderate User Photos
 */
const updatePhotoStatus = async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    const photo = await UserPhoto.findByPk(photoId);
    if (!photo) {
      return ApiResponse.error(res, 'Photo not found.', 404);
    }

    await photo.update({ status });
    return ApiResponse.success(res, `Photo status updated to ${status}.`, { photo });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllProfiles,
  getProfileDetail,
  updateProfileStatus,
  updatePhotoStatus
};
