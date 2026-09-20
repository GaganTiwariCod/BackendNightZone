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
  MasterHobby,
  User,
  sequelize
} = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { calculateProfileCompletion } = require('../services/profileCompletionService');
const { MASTER_DATA } = require('../seeders/matrimonySeedData');

/**
 * Standard eager loading options for a full profile
 */
const profileIncludeOptions = [
  { model: ReligiousProfile, as: 'religiousProfile' },
  { model: LocationProfile, as: 'locationProfile' },
  { model: EducationProfile, as: 'educationProfile' },
  { model: CareerProfile, as: 'careerProfile' },
  { model: LifestyleProfile, as: 'lifestyleProfile' },
  { model: FamilyProfile, as: 'familyProfile' },
  { model: FamilyMember, as: 'familyMembers' },
  { model: UserPhoto, as: 'photos', order: [['is_profile_photo', 'DESC'], ['display_order', 'ASC']] },
  { model: HoroscopeProfile, as: 'horoscopeProfile' },
  { model: PartnerPreference, as: 'partnerPreference' },
  { model: PrivacySetting, as: 'privacySetting' },
  { model: MasterHobby, as: 'hobbies', through: { attributes: [] } },
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'created_at'] }
];

/**
 * Helper to ensure user has an initial matrimonial profile created
 */
const getOrCreateUserProfile = async (userId, transaction = null) => {
  let profile = await MatrimonialProfile.findOne({
    where: { user_id: userId },
    include: profileIncludeOptions,
    transaction
  });

  if (!profile) {
    const user = await User.findByPk(userId, { transaction });
    profile = await MatrimonialProfile.create(
      {
        user_id: userId,
        first_name: user?.name ? user.name.split(' ')[0] : '',
        last_name: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
        profile_created_for: 'myself',
        profile_status: 'draft',
        profile_visibility: 'public',
        is_published: false,
        completion_percentage: 0
      },
      { transaction }
    );

    // Create default sub profiles
    await ReligiousProfile.create({ profile_id: profile.id }, { transaction });
    await LocationProfile.create({ profile_id: profile.id }, { transaction });
    await EducationProfile.create({ profile_id: profile.id }, { transaction });
    await CareerProfile.create({ profile_id: profile.id }, { transaction });
    await LifestyleProfile.create({ profile_id: profile.id }, { transaction });
    await FamilyProfile.create({ profile_id: profile.id }, { transaction });
    await HoroscopeProfile.create({ profile_id: profile.id }, { transaction });
    await PartnerPreference.create({ profile_id: profile.id }, { transaction });
    await PrivacySetting.create({ profile_id: profile.id }, { transaction });

    // Refetch with includes
    profile = await MatrimonialProfile.findByPk(profile.id, {
      include: profileIncludeOptions,
      transaction
    });
  }

  return profile;
};

/**
 * 1. Get logged in user's full matrimonial profile with completion score
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateUserProfile(req.user.id);
    const completionData = calculateProfileCompletion(profile);

    // Update completion percentage if changed
    if (profile.completion_percentage !== completionData.completionPercentage) {
      await profile.update({ completion_percentage: completionData.completionPercentage });
    }

    return ApiResponse.success(res, 'Matrimonial profile fetched successfully.', {
      profile,
      completion: completionData
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 2. Save individual step information
 */
const saveStep = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { stepName } = req.params;
    const payload = req.body;
    const profile = await getOrCreateUserProfile(req.user.id, t);

    switch (stepName) {
      case 'basic': {
        await profile.update(payload, { transaction: t });
        break;
      }
      case 'religion': {
        const [relProfile] = await ReligiousProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await relProfile.update(payload, { transaction: t });
        break;
      }
      case 'location': {
        const [locProfile] = await LocationProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await locProfile.update(payload, { transaction: t });
        break;
      }
      case 'education': {
        const [eduProfile] = await EducationProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await eduProfile.update(payload, { transaction: t });
        break;
      }
      case 'career': {
        const [careerProfile] = await CareerProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await careerProfile.update(payload, { transaction: t });
        break;
      }
      case 'lifestyle': {
        const [lifeProfile] = await LifestyleProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await lifeProfile.update(payload, { transaction: t });

        // Update hobbies if provided
        if (Array.isArray(payload.hobby_ids)) {
          await profile.setHobbies(payload.hobby_ids, { transaction: t });
        }
        break;
      }
      case 'family': {
        const [famProfile] = await FamilyProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await famProfile.update(payload, { transaction: t });
        break;
      }
      case 'about': {
        await profile.update({ about_me: payload.about_me }, { transaction: t });
        break;
      }
      case 'horoscope': {
        const [horoProfile] = await HoroscopeProfile.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await horoProfile.update(payload, { transaction: t });
        break;
      }
      case 'preferences': {
        const [prefProfile] = await PartnerPreference.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await prefProfile.update(payload, { transaction: t });
        break;
      }
      case 'privacy': {
        const [privProfile] = await PrivacySetting.findOrCreate({
          where: { profile_id: profile.id },
          defaults: { profile_id: profile.id },
          transaction: t
        });
        await privProfile.update(payload, { transaction: t });
        if (payload.profile_visibility) {
          await profile.update({ profile_visibility: payload.profile_visibility }, { transaction: t });
        }
        break;
      }
      default:
        await t.rollback();
        return ApiResponse.error(res, `Invalid step: ${stepName}`, 400);
    }

    await t.commit();

    // Refetch profile and recalculate score
    const updatedProfile = await MatrimonialProfile.findByPk(profile.id, {
      include: profileIncludeOptions
    });
    const completion = calculateProfileCompletion(updatedProfile);
    await updatedProfile.update({ completion_percentage: completion.completionPercentage });

    return ApiResponse.success(res, `Step '${stepName}' saved successfully.`, {
      profile: updatedProfile,
      completion
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * 3. Upload Matrimonial Photo
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'Please provide an image file (JPG, PNG, or WEBP up to 5MB).', 400);
    }

    const profile = await getOrCreateUserProfile(req.user.id);
    const existingPhotosCount = await UserPhoto.count({ where: { profile_id: profile.id } });

    if (existingPhotosCount >= 10) {
      return ApiResponse.error(res, 'Maximum limit of 10 photos reached. Please remove an existing photo first.', 400);
    }

    const fileUrl = `/uploads/matrimony/${req.file.filename}`;
    const isFirstPhoto = existingPhotosCount === 0;

    const photo = await UserPhoto.create({
      profile_id: profile.id,
      file_url: fileUrl,
      thumbnail_url: fileUrl,
      is_profile_photo: isFirstPhoto,
      display_order: existingPhotosCount,
      visibility: 'public',
      status: 'approved'
    });

    // Recalculate completion score
    const updatedProfile = await MatrimonialProfile.findByPk(profile.id, {
      include: profileIncludeOptions
    });
    const completion = calculateProfileCompletion(updatedProfile);
    await updatedProfile.update({ completion_percentage: completion.completionPercentage });

    return ApiResponse.success(res, 'Photo uploaded successfully.', {
      photo,
      completion
    }, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * 4. Delete Matrimonial Photo
 */
const deletePhoto = async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const profile = await getOrCreateUserProfile(req.user.id);

    const photo = await UserPhoto.findOne({
      where: { id: photoId, profile_id: profile.id }
    });

    if (!photo) {
      return ApiResponse.error(res, 'Photo not found or you are not authorized to delete it.', 404);
    }

    const wasProfilePhoto = photo.is_profile_photo;
    await photo.destroy();

    // If deleted photo was primary, make the next photo primary
    if (wasProfilePhoto) {
      const nextPhoto = await UserPhoto.findOne({
        where: { profile_id: profile.id },
        order: [['display_order', 'ASC']]
      });
      if (nextPhoto) {
        await nextPhoto.update({ is_profile_photo: true });
      }
    }

    const updatedProfile = await MatrimonialProfile.findByPk(profile.id, {
      include: profileIncludeOptions
    });
    const completion = calculateProfileCompletion(updatedProfile);
    await updatedProfile.update({ completion_percentage: completion.completionPercentage });

    return ApiResponse.success(res, 'Photo removed successfully.', { completion });
  } catch (error) {
    return next(error);
  }
};

/**
 * 5. Set Primary Profile Photo
 */
const setPrimaryPhoto = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { photoId } = req.params;
    const profile = await getOrCreateUserProfile(req.user.id, t);

    const photo = await UserPhoto.findOne({
      where: { id: photoId, profile_id: profile.id },
      transaction: t
    });

    if (!photo) {
      await t.rollback();
      return ApiResponse.error(res, 'Photo not found.', 404);
    }

    // Unset current primary photos
    await UserPhoto.update(
      { is_profile_photo: false },
      { where: { profile_id: profile.id }, transaction: t }
    );

    // Set selected photo as primary
    await photo.update({ is_profile_photo: true }, { transaction: t });

    await t.commit();
    return ApiResponse.success(res, 'Primary profile photo updated.');
  } catch (error) {
    await t.rollback();
    return next(error);
  }
};

/**
 * 6. Add Family Member
 */
const addFamilyMember = async (req, res, next) => {
  try {
    const profile = await getOrCreateUserProfile(req.user.id);
    const member = await FamilyMember.create({
      profile_id: profile.id,
      ...req.body
    });

    return ApiResponse.success(res, 'Family member added.', { member }, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * 7. Delete Family Member
 */
const deleteFamilyMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await getOrCreateUserProfile(req.user.id);

    const deleted = await FamilyMember.destroy({
      where: { id, profile_id: profile.id }
    });

    if (!deleted) {
      return ApiResponse.error(res, 'Family member record not found.', 404);
    }

    return ApiResponse.success(res, 'Family member removed.');
  } catch (error) {
    return next(error);
  }
};

/**
 * 8. Publish Profile
 */
const publishProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateUserProfile(req.user.id);
    const completion = calculateProfileCompletion(profile);

    if (!completion.isPublishable) {
      return ApiResponse.error(
        res,
        'Profile cannot be published yet. Please complete basic details, location, and upload at least one photo.',
        422,
        { completion }
      );
    }

    await profile.update({
      is_published: true,
      profile_status: 'published',
      completion_percentage: completion.completionPercentage
    });

    return ApiResponse.success(res, 'Matrimonial profile published successfully!', {
      profile,
      completion
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 9. Unpublish Profile
 */
const unpublishProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateUserProfile(req.user.id);
    await profile.update({
      is_published: false,
      profile_status: 'draft'
    });

    return ApiResponse.success(res, 'Matrimonial profile unpublished.');
  } catch (error) {
    return next(error);
  }
};

/**
 * 10. Public Profile Preview (Sanitized & Privacy compliant)
 */
const getProfilePreview = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    let targetProfileId = profileId;

    if (!targetProfileId) {
      const ownProfile = await getOrCreateUserProfile(req.user.id);
      targetProfileId = ownProfile.id;
    }

    const profile = await MatrimonialProfile.findByPk(targetProfileId, {
      include: profileIncludeOptions
    });

    if (!profile) {
      return ApiResponse.error(res, 'Matrimonial profile not found.', 404);
    }

    const isOwnProfile = req.user && req.user.id === profile.user_id;

    // Check privacy settings if viewing someone else's profile
    if (!isOwnProfile) {
      if (!profile.is_published || profile.profile_status !== 'published') {
        return ApiResponse.error(res, 'This profile is currently private or under review.', 403);
      }
    }

    const privacy = profile.privacySetting || {};
    const career = profile.careerProfile ? { ...profile.careerProfile.toJSON() } : null;

    // Sanitize income if hidden by user
    if (!isOwnProfile && (privacy.income_visibility === 'hidden' || career?.income_visibility === 'hidden')) {
      if (career) {
        career.annual_income = null;
        career.income_hidden = true;
      }
    }

    // Sanitize horoscope if restricted
    let horoscope = profile.horoscopeProfile ? { ...profile.horoscopeProfile.toJSON() } : null;
    if (!isOwnProfile && privacy.horoscope_visibility === 'private') {
      horoscope = null;
    }

    // Never leak contact details or credentials
    const safeData = {
      id: profile.id,
      profile_created_for: profile.profile_created_for,
      first_name: profile.first_name,
      last_name: isOwnProfile ? profile.last_name : (profile.last_name ? profile.last_name[0] + '.' : ''),
      gender: profile.gender,
      age: profile.age,
      date_of_birth: isOwnProfile ? profile.date_of_birth : null,
      height: profile.height,
      height_unit: profile.height_unit,
      marital_status: profile.marital_status,
      mother_tongue: profile.mother_tongue,
      about_me: profile.about_me,
      profile_status: profile.profile_status,
      is_published: profile.is_published,
      is_verified: profile.is_verified,
      completion_percentage: profile.completion_percentage,
      religiousProfile: profile.religiousProfile,
      locationProfile: profile.locationProfile,
      educationProfile: profile.educationProfile,
      careerProfile: career,
      lifestyleProfile: profile.lifestyleProfile,
      familyProfile: profile.familyProfile,
      familyMembers: profile.familyMembers,
      photos: profile.photos,
      horoscopeProfile: horoscope,
      partnerPreference: profile.partnerPreference,
      hobbies: profile.hobbies,
      isOwnProfile
    };

    return ApiResponse.success(res, 'Profile preview fetched.', safeData);
  } catch (error) {
    return next(error);
  }
};

/**
 * 11. Browse / Search Published Matrimonial Profiles
 */
const browseProfiles = async (req, res, next) => {
  try {
    const {
      gender,
      minAge,
      maxAge,
      religion,
      community,
      motherTongue,
      maritalStatus,
      city,
      state,
      search,
      page = 1,
      limit = 12
    } = req.query;

    const whereConditions = {
      is_published: true,
      profile_status: 'published',
      profile_visibility: { [Op.in]: ['public', 'registered_users'] }
    };

    // Exclude own profile if authenticated
    if (req.user) {
      whereConditions.user_id = { [Op.ne]: req.user.id };
    }

    if (gender) {
      whereConditions.gender = gender;
    }

    if (maritalStatus) {
      whereConditions.marital_status = maritalStatus;
    }

    if (motherTongue) {
      whereConditions.mother_tongue = { [Op.like]: `%${motherTongue}%` };
    }

    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { mother_tongue: { [Op.like]: `%${search}%` } }
      ];
    }

    const include = [
      {
        model: ReligiousProfile,
        as: 'religiousProfile',
        where: religion ? { religion } : (community ? { community: { [Op.like]: `%${community}%` } } : undefined),
        required: !!(religion || community)
      },
      {
        model: LocationProfile,
        as: 'locationProfile',
        where: city ? { current_city: { [Op.like]: `%${city}%` } } : (state ? { current_state: { [Op.like]: `%${state}%` } } : undefined),
        required: !!(city || state)
      },
      { model: EducationProfile, as: 'educationProfile' },
      { model: CareerProfile, as: 'careerProfile' },
      { model: UserPhoto, as: 'photos', where: { is_profile_photo: true }, required: false }
    ];

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows } = await MatrimonialProfile.findAndCountAll({
      where: whereConditions,
      include,
      limit: parseInt(limit, 10),
      offset,
      order: [['updated_at', 'DESC']],
      distinct: true
    });

    const profiles = rows.map((p) => ({
      id: p.id,
      first_name: p.first_name,
      gender: p.gender,
      age: p.age,
      height: p.height,
      height_unit: p.height_unit,
      marital_status: p.marital_status,
      mother_tongue: p.mother_tongue,
      religion: p.religiousProfile?.religion,
      community: p.religiousProfile?.community,
      city: p.locationProfile?.current_city,
      state: p.locationProfile?.current_state,
      highest_education: p.educationProfile?.highest_education,
      profession: p.careerProfile?.profession,
      photo: p.photos?.[0]?.file_url || null,
      is_verified: p.is_verified
    }));

    return ApiResponse.success(res, 'Profiles retrieved successfully.', {
      total: count,
      totalPages: Math.ceil(count / limit),
      page: parseInt(page, 10),
      profiles
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 12. Get Master Data Lists
 */
const getMasterData = async (req, res, next) => {
  try {
    const hobbies = await MasterHobby.findAll({ where: { is_active: true } });
    return ApiResponse.success(res, 'Master data retrieved.', {
      ...MASTER_DATA,
      hobbies
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  saveStep,
  uploadPhoto,
  deletePhoto,
  setPrimaryPhoto,
  addFamilyMember,
  deleteFamilyMember,
  publishProfile,
  unpublishProfile,
  getProfilePreview,
  browseProfiles,
  getMasterData
};
