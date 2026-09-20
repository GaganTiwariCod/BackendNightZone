const { sequelize } = require('../config/db');
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const MerchantProfile = require('./MerchantProfile');
const CompanyProfile = require('./CompanyProfile');
const CustomerProfile = require('./CustomerProfile');
const EmailOtp = require('./EmailOtp');

// Matrimonial Models
const MatrimonialProfile = require('./MatrimonialProfile');
const ReligiousProfile = require('./ReligiousProfile');
const LocationProfile = require('./LocationProfile');
const EducationProfile = require('./EducationProfile');
const CareerProfile = require('./CareerProfile');
const LifestyleProfile = require('./LifestyleProfile');
const FamilyProfile = require('./FamilyProfile');
const FamilyMember = require('./FamilyMember');
const UserPhoto = require('./UserPhoto');
const HoroscopeProfile = require('./HoroscopeProfile');
const PartnerPreference = require('./PartnerPreference');
const PrivacySetting = require('./PrivacySetting');
const ProfileVerification = require('./ProfileVerification');
const ProfileReport = require('./ProfileReport');
const MasterHobby = require('./MasterHobby');
const UserHobby = require('./UserHobby');

// Pandit Models
const PanditProfile = require('./PanditProfile');
const PanditReligiousDetail = require('./PanditReligiousDetail');
const MasterService = require('./MasterService');
const PanditService = require('./PanditService');
const MasterLanguage = require('./MasterLanguage');
const PanditLanguage = require('./PanditLanguage');
const PanditEducation = require('./PanditEducation');
const PanditExperience = require('./PanditExperience');
const PanditLocation = require('./PanditLocation');
const PanditAvailability = require('./PanditAvailability');
const PanditDocument = require('./PanditDocument');
const PanditVerification = require('./PanditVerification');
const PanditAuditLog = require('./PanditAuditLog');

// --- Existing Associations ---
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(MerchantProfile, { foreignKey: 'user_id', as: 'merchantProfile', onDelete: 'CASCADE' });
MerchantProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CompanyProfile, { foreignKey: 'user_id', as: 'companyProfile', onDelete: 'CASCADE' });
CompanyProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CustomerProfile, { foreignKey: 'user_id', as: 'customerProfile', onDelete: 'CASCADE' });
CustomerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- Matrimonial Associations ---
User.hasOne(MatrimonialProfile, { foreignKey: 'user_id', as: 'matrimonialProfile', onDelete: 'CASCADE' });
MatrimonialProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

MatrimonialProfile.hasOne(ReligiousProfile, { foreignKey: 'profile_id', as: 'religiousProfile', onDelete: 'CASCADE' });
ReligiousProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(LocationProfile, { foreignKey: 'profile_id', as: 'locationProfile', onDelete: 'CASCADE' });
LocationProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(EducationProfile, { foreignKey: 'profile_id', as: 'educationProfile', onDelete: 'CASCADE' });
EducationProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(CareerProfile, { foreignKey: 'profile_id', as: 'careerProfile', onDelete: 'CASCADE' });
CareerProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(LifestyleProfile, { foreignKey: 'profile_id', as: 'lifestyleProfile', onDelete: 'CASCADE' });
LifestyleProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(FamilyProfile, { foreignKey: 'profile_id', as: 'familyProfile', onDelete: 'CASCADE' });
FamilyProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(HoroscopeProfile, { foreignKey: 'profile_id', as: 'horoscopeProfile', onDelete: 'CASCADE' });
HoroscopeProfile.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(PartnerPreference, { foreignKey: 'profile_id', as: 'partnerPreference', onDelete: 'CASCADE' });
PartnerPreference.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasOne(PrivacySetting, { foreignKey: 'profile_id', as: 'privacySetting', onDelete: 'CASCADE' });
PrivacySetting.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasMany(FamilyMember, { foreignKey: 'profile_id', as: 'familyMembers', onDelete: 'CASCADE' });
FamilyMember.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasMany(UserPhoto, { foreignKey: 'profile_id', as: 'photos', onDelete: 'CASCADE' });
UserPhoto.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasMany(ProfileVerification, { foreignKey: 'profile_id', as: 'verifications', onDelete: 'CASCADE' });
ProfileVerification.belongsTo(MatrimonialProfile, { foreignKey: 'profile_id', as: 'matrimonialProfile' });

MatrimonialProfile.hasMany(ProfileReport, { foreignKey: 'reported_profile_id', as: 'reports', onDelete: 'CASCADE' });
ProfileReport.belongsTo(MatrimonialProfile, { foreignKey: 'reported_profile_id', as: 'reportedProfile' });
User.hasMany(ProfileReport, { foreignKey: 'reporter_id', as: 'submittedReports', onDelete: 'CASCADE' });
ProfileReport.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

MatrimonialProfile.belongsToMany(MasterHobby, { through: UserHobby, foreignKey: 'profile_id', otherKey: 'hobby_id', as: 'hobbies' });
MasterHobby.belongsToMany(MatrimonialProfile, { through: UserHobby, foreignKey: 'hobby_id', otherKey: 'profile_id', as: 'profiles' });

// --- Pandit Associations ---

// 1. User <-> PanditProfile (1:1)
User.hasOne(PanditProfile, { foreignKey: 'user_id', as: 'panditProfile', onDelete: 'CASCADE' });
PanditProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. PanditProfile <-> Sub Details (1:1)
PanditProfile.hasOne(PanditReligiousDetail, { foreignKey: 'pandit_id', as: 'religiousDetail', onDelete: 'CASCADE' });
PanditReligiousDetail.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

PanditProfile.hasOne(PanditAvailability, { foreignKey: 'pandit_id', as: 'availability', onDelete: 'CASCADE' });
PanditAvailability.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

PanditProfile.hasOne(PanditVerification, { foreignKey: 'pandit_id', as: 'verification', onDelete: 'CASCADE' });
PanditVerification.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

// 3. PanditProfile <-> Collections (1:N)
PanditProfile.hasMany(PanditEducation, { foreignKey: 'pandit_id', as: 'education', onDelete: 'CASCADE' });
PanditEducation.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

PanditProfile.hasMany(PanditExperience, { foreignKey: 'pandit_id', as: 'experience', onDelete: 'CASCADE' });
PanditExperience.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

PanditProfile.hasMany(PanditLocation, { foreignKey: 'pandit_id', as: 'locations', onDelete: 'CASCADE' });
PanditLocation.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

PanditProfile.hasMany(PanditDocument, { foreignKey: 'pandit_id', as: 'documents', onDelete: 'CASCADE' });
PanditDocument.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });

PanditProfile.hasMany(PanditAuditLog, { foreignKey: 'pandit_id', as: 'auditLogs', onDelete: 'CASCADE' });
PanditAuditLog.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'panditProfile' });
User.hasMany(PanditAuditLog, { foreignKey: 'admin_user_id', as: 'adminAuditActions' });
PanditAuditLog.belongsTo(User, { foreignKey: 'admin_user_id', as: 'admin' });

// 4. PanditProfile <-> Master Services & Master Languages (N:M)
PanditProfile.belongsToMany(MasterService, { through: PanditService, foreignKey: 'pandit_id', otherKey: 'service_id', as: 'services' });
MasterService.belongsToMany(PanditProfile, { through: PanditService, foreignKey: 'service_id', otherKey: 'pandit_id', as: 'pandits' });

PanditProfile.belongsToMany(MasterLanguage, { through: PanditLanguage, foreignKey: 'pandit_id', otherKey: 'language_id', as: 'languages' });
MasterLanguage.belongsToMany(PanditProfile, { through: PanditLanguage, foreignKey: 'language_id', otherKey: 'pandit_id', as: 'pandits' });

// --- Spiritual / Dharmik CMS Models ---
const SpiritualContentType = require('./SpiritualContentType');
const SpiritualDeity = require('./SpiritualDeity');
const SpiritualCategory = require('./SpiritualCategory');
const SpiritualTag = require('./SpiritualTag');
const SpiritualContent = require('./SpiritualContent');
const SpiritualContentTranslation = require('./SpiritualContentTranslation');
const SpiritualContentTag = require('./SpiritualContentTag');
const SpiritualContentRequest = require('./SpiritualContentRequest');
const SpiritualRelatedContent = require('./SpiritualRelatedContent');

// --- Spiritual CMS Associations ---
SpiritualContent.belongsTo(SpiritualContentType, { foreignKey: 'type_id', as: 'type' });
SpiritualContentType.hasMany(SpiritualContent, { foreignKey: 'type_id', as: 'contents' });

SpiritualContent.belongsTo(SpiritualDeity, { foreignKey: 'deity_id', as: 'deity' });
SpiritualDeity.hasMany(SpiritualContent, { foreignKey: 'deity_id', as: 'contents' });

SpiritualContent.belongsTo(SpiritualCategory, { foreignKey: 'category_id', as: 'category' });
SpiritualCategory.hasMany(SpiritualContent, { foreignKey: 'category_id', as: 'contents' });

SpiritualContent.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

SpiritualContent.hasMany(SpiritualContentTranslation, { foreignKey: 'content_id', as: 'translations', onDelete: 'CASCADE' });
SpiritualContentTranslation.belongsTo(SpiritualContent, { foreignKey: 'content_id', as: 'spiritualContent' });

SpiritualContent.belongsToMany(SpiritualTag, { through: SpiritualContentTag, foreignKey: 'content_id', otherKey: 'tag_id', as: 'tags' });
SpiritualTag.belongsToMany(SpiritualContent, { through: SpiritualContentTag, foreignKey: 'tag_id', otherKey: 'content_id', as: 'contents' });

SpiritualContentRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SpiritualContentRequest.belongsTo(SpiritualDeity, { foreignKey: 'deity_id', as: 'deity' });
SpiritualContentRequest.belongsTo(SpiritualContent, { foreignKey: 'fulfilled_content_id', as: 'fulfilledContent' });

SpiritualContent.belongsToMany(SpiritualContent, { through: SpiritualRelatedContent, foreignKey: 'content_id', otherKey: 'related_content_id', as: 'manualRelatedContents' });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  MerchantProfile,
  CompanyProfile,
  CustomerProfile,
  EmailOtp,
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
  MasterHobby,
  UserHobby,
  PanditProfile,
  PanditReligiousDetail,
  MasterService,
  PanditService,
  MasterLanguage,
  PanditLanguage,
  PanditEducation,
  PanditExperience,
  PanditLocation,
  PanditAvailability,
  PanditDocument,
  PanditVerification,
  PanditAuditLog,
  SpiritualContentType,
  SpiritualDeity,
  SpiritualCategory,
  SpiritualTag,
  SpiritualContent,
  SpiritualContentTranslation,
  SpiritualContentTag,
  SpiritualContentRequest,
  SpiritualRelatedContent
};
