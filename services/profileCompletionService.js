/**
 * Calculate profile completion percentage and section breakdown
 * @param {Object} profile - Full MatrimonialProfile with all associations
 * @returns {Object} { completionPercentage: number, sections: Object, isPublishable: boolean }
 */
const calculateProfileCompletion = (profile) => {
  if (!profile) {
    return {
      completionPercentage: 0,
      sections: {},
      isPublishable: false
    };
  }

  const sections = {
    basic: false,
    religion: false,
    location: false,
    education: false,
    career: false,
    lifestyle: false,
    family: false,
    about: false,
    photos: false,
    partnerPreference: false
  };

  let totalPercentage = 0;

  // 1. Basic Information (15%)
  if (
    profile.first_name &&
    profile.gender &&
    profile.date_of_birth &&
    profile.height &&
    profile.marital_status
  ) {
    sections.basic = true;
    totalPercentage += 15;
  }

  // 2. Religion & Cultural (10%)
  if (profile.religiousProfile?.religion && profile.religiousProfile?.community) {
    sections.religion = true;
    totalPercentage += 10;
  }

  // 3. Location (10%)
  if (
    profile.locationProfile?.current_country &&
    profile.locationProfile?.current_state &&
    profile.locationProfile?.current_city
  ) {
    sections.location = true;
    totalPercentage += 10;
  }

  // 4. Education (10%)
  if (profile.educationProfile?.highest_education) {
    sections.education = true;
    totalPercentage += 10;
  }

  // 5. Career (10%)
  if (profile.careerProfile?.profession && profile.careerProfile?.employment_status) {
    sections.career = true;
    totalPercentage += 10;
  }

  // 6. Lifestyle (10%)
  if (profile.lifestyleProfile?.diet) {
    sections.lifestyle = true;
    totalPercentage += 10;
  }

  // 7. Family (10%)
  if (
    profile.familyProfile?.family_type &&
    (profile.familyProfile?.father_status || profile.familyProfile?.mother_status || profile.familyProfile?.family_status)
  ) {
    sections.family = true;
    totalPercentage += 10;
  }

  // 8. About Me (10%)
  if (profile.about_me && profile.about_me.trim().length >= 20) {
    sections.about = true;
    totalPercentage += 10;
  }

  // 9. Photos (10%)
  if (profile.photos && profile.photos.length > 0) {
    sections.photos = true;
    totalPercentage += 10;
  }

  // 10. Partner Preferences (5%)
  if (
    profile.partnerPreference?.min_age &&
    profile.partnerPreference?.max_age
  ) {
    sections.partnerPreference = true;
    totalPercentage += 5;
  }

  // A profile can be published if at least core essential sections are filled (>= 60% and has photos + basic)
  const isPublishable = totalPercentage >= 50 && sections.basic && sections.location;

  return {
    completionPercentage: Math.min(100, totalPercentage),
    sections,
    isPublishable
  };
};

module.exports = {
  calculateProfileCompletion
};
