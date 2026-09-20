const Joi = require('joi');
const { ROLE_LIST, ROLES } = require('../constants/roles');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_-])[A-Za-z\d@$!%*?&#^_-]{8,30}$/;

const schemas = {
  // Signup Schema with role-based conditional validation
  signup: Joi.object({
    name: Joi.string().min(2).max(100).trim().required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long'
    }),
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long'
    }),
    role: Joi.string().uppercase().valid(...ROLE_LIST).default(ROLES.CUSTOMER),
    phone: Joi.string().max(25).optional().allow('', null),

    // Merchant profile specific payload (when role is MERCHANT)
    merchantDetails: Joi.object({
      storeName: Joi.string().min(3).max(150).required(),
      storeSlug: Joi.string().min(3).max(150).alphanum().optional(),
      businessRegNumber: Joi.string().max(100).optional().allow(''),
      storeDescription: Joi.string().max(1000).optional().allow('')
    }).when('role', {
      is: ROLES.MERCHANT,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),

    // Company profile specific payload (when role is COMPANY)
    companyDetails: Joi.object({
      companyName: Joi.string().min(2).max(200).required(),
      taxId: Joi.string().max(100).optional().allow(''),
      corporateEmail: Joi.string().email().optional().allow(''),
      businessPhone: Joi.string().max(30).optional().allow(''),
      billingAddress: Joi.string().max(500).optional().allow('')
    }).when('role', {
      is: ROLES.COMPANY,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // Login Schema
  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Valid email is required',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  }),

  // Google OAuth Login / Signup Schema
  googleAuth: Joi.object({
    credential: Joi.string().optional().allow('', null),
    idToken: Joi.string().optional().allow('', null),
    accessToken: Joi.string().optional().allow('', null),
    token: Joi.string().optional().allow('', null),
    role: Joi.string().uppercase().valid(...ROLE_LIST).optional().default(ROLES.CUSTOMER)
  }),

  // Change Password Schema
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
  }),

  // Forgot Password Request
  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().trim().required()
  }),

  // Reset Password with Token
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
  }),

  // Send Email OTP Schema
  sendEmailOtp: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Valid email is required',
      'string.empty': 'Email is required'
    }),
    type: Joi.string().uppercase().valid('LOGIN', 'SIGNUP', 'RESET_PASSWORD').default('LOGIN')
  }),

  // Verify Email OTP Schema
  verifyEmailOtp: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Valid email is required',
      'string.empty': 'Email is required'
    }),
    otp: Joi.string().min(4).max(6).trim().required().messages({
      'string.empty': 'OTP is required',
      'string.min': 'OTP must be at least 4 digits'
    }),
    name: Joi.string().min(2).max(100).trim().optional(),
    phone: Joi.string().max(25).optional().allow('', null),
    role: Joi.string().uppercase().valid(...ROLE_LIST).default(ROLES.CUSTOMER)
  }),

  // Update Profile Schema
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional(),
    phone: Joi.string().max(25).optional().allow('', null),
    avatar: Joi.string().uri().optional().allow('', null),
    shipping_address: Joi.string().max(500).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    state: Joi.string().max(100).optional().allow(''),
    postal_code: Joi.string().max(20).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    preferences: Joi.object().optional()
  }),

  // --- MATRIMONY PROFILE SCHEMAS ---

  // Step 2: Basic Information
  matrimonyBasic: Joi.object({
    profile_created_for: Joi.string().valid('myself', 'son', 'daughter', 'brother', 'sister', 'friend', 'relative', 'other').default('myself'),
    first_name: Joi.string().min(2).max(100).trim().required(),
    middle_name: Joi.string().max(100).trim().optional().allow('', null),
    last_name: Joi.string().min(1).max(100).trim().required(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').required(),
    date_of_birth: Joi.date().iso().max('now').required(),
    height: Joi.number().min(50).max(300).required(),
    height_unit: Joi.string().valid('cm', 'ft').default('cm'),
    marital_status: Joi.string().valid('never_married', 'divorced', 'widowed', 'awaiting_divorce', 'annulled').default('never_married'),
    mother_tongue: Joi.string().max(100).trim().required()
  }),

  // Step 3: Religion & Cultural
  matrimonyReligion: Joi.object({
    religion: Joi.string().max(100).trim().required(),
    community: Joi.string().max(100).trim().required(),
    sub_community: Joi.string().max(100).trim().optional().allow('', null),
    caste_no_bar: Joi.boolean().default(false),
    gotra: Joi.string().max(100).trim().optional().allow('', null),
    rashi: Joi.string().max(100).trim().optional().allow('', null),
    nakshatra: Joi.string().max(100).trim().optional().allow('', null),
    manglik_status: Joi.string().valid('yes', 'no', 'anshik', 'dont_know', 'not_applicable').default('dont_know'),
    religious_values: Joi.string().valid('traditional', 'moderate', 'liberal', 'flexible').optional().allow('', null),
    horoscope_available: Joi.boolean().default(false)
  }),

  // Step 4: Location
  matrimonyLocation: Joi.object({
    country: Joi.string().max(100).trim().default('India'),
    state: Joi.string().max(100).trim().optional().allow('', null),
    city: Joi.string().max(100).trim().optional().allow('', null),
    district: Joi.string().max(100).trim().optional().allow('', null),
    current_country: Joi.string().max(100).trim().required(),
    current_state: Joi.string().max(100).trim().required(),
    current_city: Joi.string().max(100).trim().required(),
    hometown: Joi.string().max(100).trim().optional().allow('', null),
    hometown_state: Joi.string().max(100).trim().optional().allow('', null),
    hometown_country: Joi.string().max(100).trim().default('India'),
    grew_up_in: Joi.string().max(100).trim().optional().allow('', null),
    residential_status: Joi.string().valid('citizen', 'permanent_resident', 'work_permit', 'student_visa', 'temporary_visa', 'other').default('citizen'),
    relocation_preference: Joi.string().valid('yes', 'no', 'not_sure', 'within_country_only').default('not_sure')
  }),

  // Step 5: Education
  matrimonyEducation: Joi.object({
    highest_education: Joi.string().max(100).trim().required(),
    education_field: Joi.string().max(100).trim().optional().allow('', null),
    college_name: Joi.string().max(255).trim().optional().allow('', null),
    university_name: Joi.string().max(255).trim().optional().allow('', null),
    additional_qualification: Joi.string().max(255).trim().optional().allow('', null),
    education_description: Joi.string().max(1000).trim().optional().allow('', null)
  }),

  // Step 6: Career
  matrimonyCareer: Joi.object({
    employment_status: Joi.string().valid('employed', 'self_employed', 'business', 'government', 'student', 'not_working', 'retired', 'other').required(),
    profession: Joi.string().max(150).trim().required(),
    job_title: Joi.string().max(150).trim().optional().allow('', null),
    company_name: Joi.string().max(200).trim().optional().allow('', null),
    industry: Joi.string().max(150).trim().optional().allow('', null),
    work_city: Joi.string().max(100).trim().optional().allow('', null),
    work_state: Joi.string().max(100).trim().optional().allow('', null),
    work_country: Joi.string().max(100).trim().default('India'),
    years_of_experience: Joi.number().integer().min(0).max(60).optional().allow(null),
    annual_income: Joi.number().min(0).optional().allow(null),
    income_currency: Joi.string().max(10).default('INR'),
    income_visibility: Joi.string().valid('visible', 'hidden').default('visible'),
    employment_type: Joi.string().valid('full_time', 'part_time', 'contract', 'freelance', 'business', 'other').default('full_time')
  }),

  // Step 7: Lifestyle
  matrimonyLifestyle: Joi.object({
    diet: Joi.string().valid('vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'other', 'prefer_not_to_say').required(),
    smoking: Joi.string().valid('never', 'occasionally', 'regularly', 'prefer_not_to_say').default('never'),
    drinking: Joi.string().valid('never', 'occasionally', 'regularly', 'prefer_not_to_say').default('never'),
    body_type: Joi.string().valid('slim', 'athletic', 'average', 'heavy', 'prefer_not_to_say').optional().allow('', null),
    physical_status: Joi.string().valid('normal', 'physically_challenged', 'other').default('normal'),
    languages_spoken: Joi.array().items(Joi.string().max(50)).default([]),
    hobby_ids: Joi.array().items(Joi.string().uuid()).optional()
  }),

  // Step 8: Family
  matrimonyFamily: Joi.object({
    family_type: Joi.string().valid('nuclear', 'joint', 'other').default('nuclear'),
    family_values: Joi.string().valid('traditional', 'moderate', 'liberal').default('moderate'),
    family_status: Joi.string().valid('middle_class', 'upper_middle_class', 'rich', 'affluent').default('middle_class'),
    family_location: Joi.string().max(200).trim().optional().allow('', null),
    father_occupation: Joi.string().max(150).trim().optional().allow('', null),
    father_status: Joi.string().valid('employed', 'business', 'retired', 'passed_away', 'homemaker', 'other').optional().allow('', null),
    mother_occupation: Joi.string().max(150).trim().optional().allow('', null),
    mother_status: Joi.string().valid('employed', 'business', 'retired', 'passed_away', 'homemaker', 'other').optional().allow('', null),
    family_description: Joi.string().max(1000).trim().optional().allow('', null)
  }),

  // Family Member
  matrimonyFamilyMember: Joi.object({
    relationship: Joi.string().valid('father', 'mother', 'brother', 'sister', 'other').required(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    age: Joi.number().integer().min(0).max(120).optional().allow(null),
    marital_status: Joi.string().valid('never_married', 'married', 'divorced', 'widowed').default('never_married'),
    occupation: Joi.string().max(150).trim().optional().allow('', null),
    education: Joi.string().max(150).trim().optional().allow('', null)
  }),

  // Step 9: About Me (Strictly forbids phone numbers, emails, social handles, URLs)
  matrimonyAbout: Joi.object({
    about_me: Joi.string()
      .min(20)
      .max(1000)
      .trim()
      .required()
      .custom((value, helpers) => {
        // Check for email patterns
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        if (emailRegex.test(value)) {
          return helpers.error('about.containsEmail');
        }
        // Check for phone number patterns (6+ digits in sequence or spaced)
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b|\b\d{5}\s\d{5}\b/;
        if (phoneRegex.test(value)) {
          return helpers.error('about.containsPhone');
        }
        // Check for web URLs or links
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|in|org|net|io|me|co))/i;
        if (urlRegex.test(value)) {
          return helpers.error('about.containsUrl');
        }
        return value;
      })
      .messages({
        'about.containsEmail': 'For security, personal email addresses are not permitted in the About Me section.',
        'about.containsPhone': 'For privacy, phone numbers are not permitted in the About Me section.',
        'about.containsUrl': 'External website links or URLs are not permitted in the About Me section.',
        'string.min': 'About Me must be at least 20 characters long.',
        'string.max': 'About Me cannot exceed 1000 characters.'
      })
  }),

  // Step 11: Horoscope / Astrology
  matrimonyHoroscope: Joi.object({
    date_of_birth: Joi.date().iso().optional().allow(null),
    time_of_birth: Joi.string().max(20).trim().optional().allow('', null),
    birth_place: Joi.string().max(150).trim().optional().allow('', null),
    birth_city: Joi.string().max(100).trim().optional().allow('', null),
    birth_state: Joi.string().max(100).trim().optional().allow('', null),
    birth_country: Joi.string().max(100).trim().default('India'),
    rashi: Joi.string().max(100).trim().optional().allow('', null),
    nakshatra: Joi.string().max(100).trim().optional().allow('', null),
    manglik_status: Joi.string().valid('yes', 'no', 'anshik', 'dont_know').default('dont_know'),
    gotra: Joi.string().max(100).trim().optional().allow('', null),
    horoscope_visibility: Joi.string().valid('public', 'registered_users', 'matches_only', 'private').default('registered_users')
  }),

  // Step 12: Partner Preferences
  matrimonyPreferences: Joi.object({
    min_age: Joi.number().integer().min(18).max(80).default(18),
    max_age: Joi.number().integer().min(18).max(80).default(40),
    min_height: Joi.number().min(50).max(300).optional().allow(null),
    max_height: Joi.number().min(50).max(300).optional().allow(null),
    genders: Joi.array().items(Joi.string()).default([]),
    religions: Joi.array().items(Joi.string()).default([]),
    communities: Joi.array().items(Joi.string()).default([]),
    mother_tongues: Joi.array().items(Joi.string()).default([]),
    marital_statuses: Joi.array().items(Joi.string()).default([]),
    countries: Joi.array().items(Joi.string()).default([]),
    states: Joi.array().items(Joi.string()).default([]),
    cities: Joi.array().items(Joi.string()).default([]),
    education_levels: Joi.array().items(Joi.string()).default([]),
    professions: Joi.array().items(Joi.string()).default([]),
    industries: Joi.array().items(Joi.string()).default([]),
    min_income: Joi.number().min(0).optional().allow(null),
    max_income: Joi.number().min(0).optional().allow(null),
    income_currency: Joi.string().max(10).default('INR'),
    diet_preferences: Joi.array().items(Joi.string()).default([]),
    smoking_preferences: Joi.array().items(Joi.string()).default([]),
    drinking_preferences: Joi.array().items(Joi.string()).default([]),
    manglik_preferences: Joi.array().items(Joi.string()).default([]),
    family_values: Joi.array().items(Joi.string()).default([]),
    additional_preferences: Joi.string().max(2000).trim().optional().allow('', null)
  }),

  // Step 13: Privacy Settings
  matrimonyPrivacy: Joi.object({
    profile_visibility: Joi.string().valid('public', 'registered_users', 'matches_only', 'private').default('public'),
    photo_visibility: Joi.string().valid('public', 'registered_users', 'matches_only', 'private').default('public'),
    contact_visibility: Joi.string().valid('private', 'accepted_connections', 'authorized_users').default('private'),
    horoscope_visibility: Joi.string().valid('public', 'registered_users', 'matches_only', 'private').default('registered_users'),
    income_visibility: Joi.string().valid('visible', 'hidden').default('visible')
  }),

  // Admin Moderation Status
  matrimonyAdminStatus: Joi.object({
    status: Joi.string().valid('pending_review', 'published', 'rejected', 'suspended', 'deactivated').required(),
    rejection_reason: Joi.string().max(500).optional().allow('', null)
  }),

  // --- PANDIT PROFILE SCHEMAS ---

  // Step 1: Basic Information
  panditBasic: Joi.object({
    title: Joi.string().valid('Pandit', 'Acharya', 'Shastri', 'Jyotishacharya', 'Mahant', 'Purohit', 'Dr.', 'Vedacharya').default('Pandit'),
    full_name: Joi.string().min(2).max(150).trim().required(),
    display_name: Joi.string().max(150).trim().optional().allow('', null),
    gender: Joi.string().valid('male', 'female', 'other').default('male'),
    date_of_birth: Joi.date().iso().max('now').optional().allow(null),
    primary_phone: Joi.string().max(25).trim().optional().allow('', null),
    whatsapp_number: Joi.string().max(25).trim().optional().allow('', null),
    email: Joi.string().email().lowercase().trim().optional().allow('', null),
    years_of_experience: Joi.number().integer().min(0).max(80).required(),
    pandit_types: Joi.array().items(Joi.string()).min(1).required(),
    short_bio: Joi.string().max(300).trim().optional().allow('', null),
    about: Joi.string().max(2500).trim().optional().allow('', null)
  }),

  // Step 2: Religious & Vedic Details
  panditReligious: Joi.object({
    gotra: Joi.string().max(100).trim().optional().allow('', null),
    pravara: Joi.string().max(200).trim().optional().allow('', null),
    veda: Joi.string().valid('Rigveda', 'Yajurveda (Shukla)', 'Yajurveda (Krishna)', 'Samaveda', 'Atharvaveda', 'Other', 'Not Specified').default('Not Specified'),
    shakha: Joi.string().max(100).trim().optional().allow('', null),
    sutra: Joi.string().max(100).trim().optional().allow('', null),
    sampradaya: Joi.string().max(150).trim().optional().allow('', null),
    kul_devta: Joi.string().max(150).trim().optional().allow('', null),
    ishta_devta: Joi.string().max(150).trim().optional().allow('', null),
    guru_parampara: Joi.string().max(500).trim().optional().allow('', null)
  }),

  // Step 3: Puja Services Offered
  panditServices: Joi.object({
    services: Joi.array().items(Joi.object({
      service_id: Joi.string().uuid().optional().allow('', null),
      custom_service_name: Joi.string().max(150).trim().optional().allow('', null),
      is_primary: Joi.boolean().default(false),
      years_experience: Joi.number().integer().min(0).max(80).optional().allow(null),
      price_type: Joi.string().valid('fixed', 'range', 'on_request', 'dakshina_only').default('dakshina_only'),
      fixed_price: Joi.number().min(0).optional().allow(null),
      min_price: Joi.number().min(0).optional().allow(null),
      max_price: Joi.number().min(0).optional().allow(null),
      duration_minutes: Joi.number().integer().min(15).max(1440).optional().allow(null),
      includes_samagri: Joi.boolean().default(false)
    })).min(1).required()
  }),

  // Step 4: Languages Spoken / Chanted
  panditLanguages: Joi.object({
    languages: Joi.array().items(Joi.object({
      language_id: Joi.string().uuid().required(),
      fluency: Joi.string().valid('native', 'fluent', 'intermediate', 'basic').default('fluent'),
      can_recite_mantras: Joi.boolean().default(true),
      is_primary: Joi.boolean().default(false)
    })).min(1).required()
  }),

  // Step 5: Vedic Education & Gurukul
  panditEducation: Joi.object({
    education: Joi.array().items(Joi.object({
      id: Joi.string().uuid().optional(),
      institution_name: Joi.string().max(255).trim().required(),
      institution_type: Joi.string().valid('gurukul', 'veda_pathshala', 'sanskrit_university', 'ashram', 'college', 'traditional_family', 'other').default('gurukul'),
      degree_or_title: Joi.string().max(150).trim().required(),
      field_of_study: Joi.string().max(150).trim().optional().allow('', null),
      board_or_university: Joi.string().max(200).trim().optional().allow('', null),
      year_of_passing: Joi.number().integer().min(1940).max(2035).optional().allow(null),
      certificates_held: Joi.string().max(500).trim().optional().allow('', null),
      honors: Joi.string().max(500).trim().optional().allow('', null)
    })).default([])
  }),

  // Step 6: Temple / Sansthan Experience
  panditExperience: Joi.object({
    experience: Joi.array().items(Joi.object({
      id: Joi.string().uuid().optional(),
      organization_or_temple_name: Joi.string().max(255).trim().required(),
      role_title: Joi.string().max(150).trim().required(),
      temple_type: Joi.string().valid('temple', 'ashram', 'vedic_sansthan', 'trust', 'independent', 'royal_patronage', 'other').default('temple'),
      city: Joi.string().max(100).trim().optional().allow('', null),
      state: Joi.string().max(100).trim().optional().allow('', null),
      country: Joi.string().max(100).trim().default('India'),
      start_year: Joi.number().integer().min(1940).max(2035).optional().allow(null),
      end_year: Joi.number().integer().min(1940).max(2035).optional().allow(null),
      is_current: Joi.boolean().default(false),
      key_rituals_handled: Joi.string().max(1000).trim().optional().allow('', null),
      notable_events: Joi.string().max(1000).trim().optional().allow('', null)
    })).default([])
  }),

  // Step 7: Locations & Travel
  panditLocation: Joi.object({
    residential: Joi.object({
      current_address: Joi.string().max(500).trim().optional().allow('', null),
      city: Joi.string().max(100).trim().required(),
      state: Joi.string().max(100).trim().required(),
      country: Joi.string().max(100).trim().default('India'),
      postal_code: Joi.string().max(20).trim().optional().allow('', null),
      travel_available: Joi.boolean().default(true),
      max_travel_distance_km: Joi.number().min(0).max(2000).default(50),
      outstation_available: Joi.boolean().default(false),
      international_travel: Joi.boolean().default(false),
      travel_expenses_extra: Joi.boolean().default(true)
    }).required(),
    service_locations: Joi.array().items(Joi.object({
      city: Joi.string().max(100).trim().required(),
      state: Joi.string().max(100).trim().required(),
      country: Joi.string().max(100).trim().default('India'),
      areas_covered: Joi.array().items(Joi.string()).default([]),
      is_primary: Joi.boolean().default(false)
    })).default([])
  }),

  // Step 8: Availability & Service Modes
  panditAvailability: Joi.object({
    available_days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    morning_slot: Joi.boolean().default(true),
    afternoon_slot: Joi.boolean().default(true),
    evening_slot: Joi.boolean().default(true),
    allows_home_visit: Joi.boolean().default(true),
    allows_temple_service: Joi.boolean().default(true),
    allows_online_puja: Joi.boolean().default(false),
    advance_booking_days: Joi.number().integer().min(0).max(365).default(2),
    consultation_available: Joi.boolean().default(true),
    notes: Joi.string().max(500).trim().optional().allow('', null)
  }),

  // Step 9: Document Metadata
  panditDocument: Joi.object({
    document_type: Joi.string().valid('AADHAAR', 'PAN', 'VOTER_ID', 'PASSPORT', 'EDUCATION_CERTIFICATE', 'PUROHIT_ID', 'TEMPLE_LETTER', 'OTHER').required(),
    document_number: Joi.string().max(100).trim().optional().allow('', null),
    document_title: Joi.string().max(150).trim().optional().allow('', null),
    issuing_authority: Joi.string().max(200).trim().optional().allow('', null),
    issued_year: Joi.number().integer().min(1940).max(2035).optional().allow(null),
    is_primary_id: Joi.boolean().default(false)
  }),

  // Admin Moderation
  panditAdminModeration: Joi.object({
    status: Joi.string().valid('draft', 'pending_review', 'published', 'rejected', 'suspended', 'deactivated').required(),
    rejection_reason: Joi.string().max(500).optional().allow('', null),
    admin_notes: Joi.string().max(1000).optional().allow('', null),
    badges: Joi.object({
      identity_verified: Joi.boolean().optional(),
      education_verified: Joi.boolean().optional(),
      experience_verified: Joi.boolean().optional(),
      background_checked: Joi.boolean().optional(),
      top_rated_pandit: Joi.boolean().optional(),
      vedic_certified: Joi.boolean().optional()
    }).optional()
  })
};

module.exports = schemas;
