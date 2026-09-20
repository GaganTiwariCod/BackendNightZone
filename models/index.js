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

// --- Astrology Models ---
const AstrologyProfile = require('./AstrologyProfile');
const AstrologyCategory = require('./AstrologyCategory');
const AstrologyService = require('./AstrologyService');
const AstrologerProfile = require('./AstrologerProfile');
const AstrologerAvailability = require('./AstrologerAvailability');
const AstrologerDocument = require('./AstrologerDocument');
const AstrologyRequest = require('./AstrologyRequest');
const KundliMatchingRequest = require('./KundliMatchingRequest');
const AstrologyBooking = require('./AstrologyBooking');
const AstrologyConsultation = require('./AstrologyConsultation');
const ConsultationMessage = require('./ConsultationMessage');
const AstrologyReport = require('./AstrologyReport');
const AstrologyRecommendation = require('./AstrologyRecommendation');
const AstrologyReview = require('./AstrologyReview');

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

// --- Astrology Associations ---

// 1. Astrology Profiles (Self & Other for Users)
User.hasMany(AstrologyProfile, { foreignKey: 'user_id', as: 'astrologyProfiles', onDelete: 'CASCADE' });
AstrologyProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. Astrology Categories & Services
AstrologyCategory.hasMany(AstrologyService, { foreignKey: 'category_id', as: 'services' });
AstrologyService.belongsTo(AstrologyCategory, { foreignKey: 'category_id', as: 'category' });

// 3. Astrologer Profile & Credentials
User.hasOne(AstrologerProfile, { foreignKey: 'user_id', as: 'astrologerProfile', onDelete: 'CASCADE' });
AstrologerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

AstrologerProfile.hasMany(AstrologerAvailability, { foreignKey: 'astrologer_id', as: 'availabilities', onDelete: 'CASCADE' });
AstrologerAvailability.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });

AstrologerProfile.hasMany(AstrologerDocument, { foreignKey: 'astrologer_id', as: 'documents', onDelete: 'CASCADE' });
AstrologerDocument.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });

// 4. User Requests & Kundli Matching
User.hasMany(AstrologyRequest, { foreignKey: 'user_id', as: 'astrologyRequests', onDelete: 'CASCADE' });
AstrologyRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AstrologyRequest.belongsTo(AstrologyProfile, { foreignKey: 'astrology_profile_id', as: 'profile' });
AstrologyRequest.belongsTo(AstrologyService, { foreignKey: 'service_id', as: 'service' });
AstrologyRequest.belongsTo(AstrologyCategory, { foreignKey: 'category_id', as: 'category' });

User.hasMany(KundliMatchingRequest, { foreignKey: 'user_id', as: 'kundliMatchingRequests', onDelete: 'CASCADE' });
KundliMatchingRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
KundliMatchingRequest.belongsTo(AstrologyProfile, { foreignKey: 'person_a_profile_id', as: 'personA' });
KundliMatchingRequest.belongsTo(AstrologyProfile, { foreignKey: 'person_b_profile_id', as: 'personB' });

// 5. Bookings & Consultations
User.hasMany(AstrologyBooking, { foreignKey: 'user_id', as: 'astrologyBookings', onDelete: 'CASCADE' });
AstrologyBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AstrologyBooking.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });
AstrologyBooking.belongsTo(AstrologyService, { foreignKey: 'service_id', as: 'service' });
AstrologyBooking.belongsTo(AstrologyProfile, { foreignKey: 'astrology_profile_id', as: 'profile' });

AstrologyBooking.hasOne(AstrologyConsultation, { foreignKey: 'booking_id', as: 'consultation', onDelete: 'CASCADE' });
AstrologyConsultation.belongsTo(AstrologyBooking, { foreignKey: 'booking_id', as: 'booking' });
AstrologyConsultation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AstrologyConsultation.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });

// 6. Consultation Messages
AstrologyConsultation.hasMany(ConsultationMessage, { foreignKey: 'consultation_id', as: 'messages', onDelete: 'CASCADE' });
ConsultationMessage.belongsTo(AstrologyConsultation, { foreignKey: 'consultation_id', as: 'consultation' });
ConsultationMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// 7. Recommendations & Pandit Connection
AstrologyConsultation.hasMany(AstrologyRecommendation, { foreignKey: 'consultation_id', as: 'recommendations', onDelete: 'CASCADE' });
AstrologyRecommendation.belongsTo(AstrologyConsultation, { foreignKey: 'consultation_id', as: 'consultation' });
AstrologyRecommendation.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });
AstrologyRecommendation.belongsTo(PanditProfile, { foreignKey: 'pandit_id', as: 'pandit' });

// 8. Astrology Reports
User.hasMany(AstrologyReport, { foreignKey: 'user_id', as: 'astrologyReports', onDelete: 'CASCADE' });
AstrologyReport.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AstrologyReport.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });
AstrologyReport.belongsTo(AstrologyProfile, { foreignKey: 'astrology_profile_id', as: 'profile' });
AstrologyReport.belongsTo(AstrologyBooking, { foreignKey: 'booking_id', as: 'booking' });

// 9. Reviews
AstrologerProfile.hasMany(AstrologyReview, { foreignKey: 'astrologer_id', as: 'reviews', onDelete: 'CASCADE' });
AstrologyReview.belongsTo(AstrologerProfile, { foreignKey: 'astrologer_id', as: 'astrologer' });
AstrologyReview.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AstrologyReview.belongsTo(AstrologyConsultation, { foreignKey: 'consultation_id', as: 'consultation' });

// --- News & Local Updates Models ---
const NewsCategory = require('./NewsCategory');
const NewsSource = require('./NewsSource');
const NewsKeyword = require('./NewsKeyword');
const News = require('./News');
const NewsKeywordMatch = require('./NewsKeywordMatch');
const NewsLocation = require('./NewsLocation');
const NewsFetchLog = require('./NewsFetchLog');

// News Associations
NewsCategory.hasMany(NewsCategory, { foreignKey: 'parent_id', as: 'subcategories', onDelete: 'SET NULL' });
NewsCategory.belongsTo(NewsCategory, { foreignKey: 'parent_id', as: 'parentCategory' });

NewsCategory.hasMany(NewsKeyword, { foreignKey: 'category_id', as: 'keywords', onDelete: 'CASCADE' });
NewsKeyword.belongsTo(NewsCategory, { foreignKey: 'category_id', as: 'category' });

NewsCategory.hasMany(News, { foreignKey: 'category_id', as: 'news', onDelete: 'SET NULL' });
News.belongsTo(NewsCategory, { foreignKey: 'category_id', as: 'category' });

NewsSource.hasMany(News, { foreignKey: 'source_id', as: 'news', onDelete: 'CASCADE' });
News.belongsTo(NewsSource, { foreignKey: 'source_id', as: 'source' });

NewsSource.hasMany(NewsFetchLog, { foreignKey: 'source_id', as: 'fetchLogs', onDelete: 'CASCADE' });
NewsFetchLog.belongsTo(NewsSource, { foreignKey: 'source_id', as: 'source' });

News.hasMany(NewsKeywordMatch, { foreignKey: 'news_id', as: 'keywordMatches', onDelete: 'CASCADE' });
NewsKeywordMatch.belongsTo(News, { foreignKey: 'news_id', as: 'news' });

NewsKeyword.hasMany(NewsKeywordMatch, { foreignKey: 'keyword_id', as: 'matches', onDelete: 'CASCADE' });
NewsKeywordMatch.belongsTo(NewsKeyword, { foreignKey: 'keyword_id', as: 'keyword' });

News.hasMany(NewsLocation, { foreignKey: 'news_id', as: 'locations', onDelete: 'CASCADE' });
NewsLocation.belongsTo(News, { foreignKey: 'news_id', as: 'news' });

// --- Events & Meetup Models ---
const EventCategory = require('./EventCategory');
const Event = require('./Event');
const EventLocation = require('./EventLocation');
const EventParticipant = require('./EventParticipant');
const EventAttendance = require('./EventAttendance');
const EventAnnouncement = require('./EventAnnouncement');
const EventFavorite = require('./EventFavorite');
const EventReport = require('./EventReport');
const EventChangeHistory = require('./EventChangeHistory');
const Meetup = require('./Meetup');
const MeetupParticipant = require('./MeetupParticipant');

// Event Associations
User.hasMany(Event, { foreignKey: 'organizer_id', as: 'organizedEvents', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });

EventCategory.hasMany(Event, { foreignKey: 'category_id', as: 'events', onDelete: 'RESTRICT' });
Event.belongsTo(EventCategory, { foreignKey: 'category_id', as: 'category' });

Event.hasOne(EventLocation, { foreignKey: 'event_id', as: 'location', onDelete: 'CASCADE' });
EventLocation.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Event.hasMany(EventParticipant, { foreignKey: 'event_id', as: 'participants', onDelete: 'CASCADE' });
EventParticipant.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventParticipant, { foreignKey: 'user_id', as: 'eventParticipations', onDelete: 'CASCADE' });
EventParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Event.hasMany(EventAttendance, { foreignKey: 'event_id', as: 'attendanceRecords', onDelete: 'CASCADE' });
EventAttendance.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventAttendance, { foreignKey: 'user_id', as: 'attendance', onDelete: 'CASCADE' });
EventAttendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Event.hasMany(EventAnnouncement, { foreignKey: 'event_id', as: 'announcements', onDelete: 'CASCADE' });
EventAnnouncement.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventAnnouncement, { foreignKey: 'created_by', as: 'createdAnnouncements', onDelete: 'CASCADE' });
EventAnnouncement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Event.hasMany(EventFavorite, { foreignKey: 'event_id', as: 'favorites', onDelete: 'CASCADE' });
EventFavorite.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventFavorite, { foreignKey: 'user_id', as: 'favoriteEvents', onDelete: 'CASCADE' });
EventFavorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Event.hasMany(EventReport, { foreignKey: 'event_id', as: 'reports', onDelete: 'CASCADE' });
EventReport.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(EventReport, { foreignKey: 'reporter_id', as: 'submittedEventReports', onDelete: 'CASCADE' });
EventReport.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

Event.hasMany(EventChangeHistory, { foreignKey: 'event_id', as: 'changeHistory', onDelete: 'CASCADE' });
EventChangeHistory.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Event.hasMany(Meetup, { foreignKey: 'event_id', as: 'meetups', onDelete: 'CASCADE' });
Meetup.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

User.hasMany(Meetup, { foreignKey: 'organizer_id', as: 'organizedMeetups', onDelete: 'CASCADE' });
Meetup.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });

Meetup.hasMany(MeetupParticipant, { foreignKey: 'meetup_id', as: 'participants', onDelete: 'CASCADE' });
MeetupParticipant.belongsTo(Meetup, { foreignKey: 'meetup_id', as: 'meetup' });

User.hasMany(MeetupParticipant, { foreignKey: 'user_id', as: 'meetupMemberships', onDelete: 'CASCADE' });
MeetupParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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
  SpiritualRelatedContent,
  // Astrology Exports
  AstrologyProfile,
  AstrologyCategory,
  AstrologyService,
  AstrologerProfile,
  AstrologerAvailability,
  AstrologerDocument,
  AstrologyRequest,
  KundliMatchingRequest,
  AstrologyBooking,
  AstrologyConsultation,
  ConsultationMessage,
  AstrologyReport,
  AstrologyRecommendation,
  AstrologyReview,
  // News & Local Updates Exports
  NewsCategory,
  NewsSource,
  NewsKeyword,
  News,
  NewsKeywordMatch,
  NewsLocation,
  NewsFetchLog,
  // Events & Meetup Exports
  EventCategory,
  Event,
  EventLocation,
  EventParticipant,
  EventAttendance,
  EventAnnouncement,
  EventFavorite,
  EventReport,
  EventChangeHistory,
  Meetup,
  MeetupParticipant
};

