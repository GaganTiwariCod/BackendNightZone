const { Op } = require('sequelize');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  sequelize,
  User,
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
  PanditVerification
} = require('../models');
const schemas = require('../utils/validators');

// Helper to generate SEO friendly unique slug
function generateSlug(fullName) {
  const baseSlug = (fullName || 'pandit')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `pandit-${baseSlug}-${randomSuffix}`;
}

// 1. Get Master Data (Services, Languages, Vedas, Sampradayas)
exports.getMasterData = async (req, res, next) => {
  try {
    const services = await MasterService.findAll({
      where: { is_active: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    const languages = await MasterLanguage.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    const vedas = [
      'Rigveda',
      'Yajurveda (Shukla)',
      'Yajurveda (Krishna)',
      'Samaveda',
      'Atharvaveda',
      'Other'
    ];

    const panditTitles = ['Pandit', 'Acharya', 'Shastri', 'Jyotishacharya', 'Mahant', 'Purohit', 'Dr.', 'Vedacharya'];

    const panditTypes = [
      'Vedic Ritualist (Karma Kanda)',
      'Jyotish / Astrologer',
      'Vastu Consultant',
      'Pooja Specialist',
      'Kathavachak / Pravachankar',
      'Havankari / Yajna Specialist',
      'Sanskrit Scholar',
      'Temple Priest (Pujari)'
    ];

    return res.status(200).json({
      success: true,
      data: {
        services,
        languages,
        vedas,
        panditTitles,
        panditTypes
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Authenticated User's Pandit Profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let profile = await PanditProfile.findOne({
      where: { user_id: userId },
      include: [
        { model: PanditReligiousDetail, as: 'religiousDetail' },
        { model: PanditAvailability, as: 'availability' },
        { model: PanditVerification, as: 'verification' },
        { model: PanditEducation, as: 'education' },
        { model: PanditExperience, as: 'experience' },
        { model: PanditLocation, as: 'locations' },
        { model: PanditDocument, as: 'documents' },
        {
          model: MasterService,
          as: 'services',
          through: {
            attributes: ['id', 'experience_years']
          }
        },
        {
          model: MasterLanguage,
          as: 'languages',
          through: {
            attributes: ['id', 'speaking_level', 'reading_level']
          }
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Save Basic Information (Step 1)
exports.saveBasicInfo = async (req, res, next) => {
  try {
    const { error, value } = schemas.panditBasic.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    let profile = await PanditProfile.findOne({ where: { user_id: userId } });

    if (!profile) {
      const slug = generateSlug(value.full_name);
      profile = await PanditProfile.create({
        user_id: userId,
        slug,
        title: value.title,
        full_name: value.full_name,
        display_name: value.display_name || `${value.title} ${value.full_name}`,
        gender: value.gender,
        date_of_birth: value.date_of_birth,
        years_of_experience: value.years_of_experience,
        pandit_types: value.pandit_types,
        short_bio: value.short_bio,
        status: 'DRAFT'
      });

      // Also create empty verification and religious record if not present
      await PanditVerification.findOrCreate({
        where: { pandit_id: profile.id }
      });
    } else {
      await profile.update({
        title: value.title,
        full_name: value.full_name,
        display_name: value.display_name || `${value.title} ${value.full_name}`,
        gender: value.gender,
        date_of_birth: value.date_of_birth,
        years_of_experience: value.years_of_experience,
        pandit_types: value.pandit_types,
        short_bio: value.short_bio
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Basic information saved successfully',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Save Religious & Vedic Details (Step 2)
exports.saveReligiousDetails = async (req, res, next) => {
  try {
    const { error, value } = schemas.panditReligious.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    let religious = await PanditReligiousDetail.findOne({ where: { pandit_id: profile.id } });
    if (!religious) {
      religious = await PanditReligiousDetail.create({
        pandit_id: profile.id,
        ...value
      });
    } else {
      await religious.update(value);
    }

    return res.status(200).json({
      success: true,
      message: 'Religious details saved successfully',
      data: { religious }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Save Services Offered (Step 3)
exports.saveServices = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { error, value } = schemas.panditServices.validate(req.body, { abortEarly: false });
    if (error) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId }, transaction });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    // Delete existing service associations
    await PanditService.destroy({ where: { pandit_id: profile.id }, transaction });

    // Insert new service associations
    const rowsToInsert = value.services.map(s => ({
      pandit_id: profile.id,
      service_id: s.service_id,
      experience_years: s.years_experience || profile.years_of_experience || 5
    }));

    await PanditService.bulkCreate(rowsToInsert, { transaction });
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Services saved successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 6. Save Languages Spoken (Step 4)
exports.saveLanguages = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { error, value } = schemas.panditLanguages.validate(req.body, { abortEarly: false });
    if (error) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId }, transaction });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    await PanditLanguage.destroy({ where: { pandit_id: profile.id }, transaction });

    const rowsToInsert = value.languages.map(l => ({
      pandit_id: profile.id,
      language_id: l.language_id,
      speaking_level: l.fluency === 'native' ? 'Native' :
                      l.fluency === 'basic' ? 'Basic' : 'Fluent',
      reading_level: l.can_recite_mantras ? 'Expert / Vedic Mantras' : 'Good'
    }));

    await PanditLanguage.bulkCreate(rowsToInsert, { transaction });
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Languages saved successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 7. Save Education (Step 5)
exports.saveEducation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { error, value } = schemas.panditEducation.validate(req.body, { abortEarly: false });
    if (error) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId }, transaction });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    await PanditEducation.destroy({ where: { pandit_id: profile.id }, transaction });

    if (value.education && value.education.length > 0) {
      const rows = value.education.map(e => ({
        pandit_id: profile.id,
        institution_name: e.institution_name,
        course_name: e.degree_or_title || e.course_name || 'Vedic Studies',
        education_type: e.institution_type === 'sanskrit_university' ? 'Sanskrit University' :
                        e.institution_type === 'veda_pathshala' ? 'Veda Pathshala' :
                        e.institution_type === 'ashram' ? 'Religious Institution' : 'Gurukul',
        specialization: e.field_of_study || e.specialization || null,
        completion_year: e.year_of_passing || e.completion_year || null,
        description: e.honors || e.certificates_held || e.description || null
      }));
      await PanditEducation.bulkCreate(rows, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: 'Education history saved successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 8. Save Experience (Step 6)
exports.saveExperience = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { error, value } = schemas.panditExperience.validate(req.body, { abortEarly: false });
    if (error) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId }, transaction });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    await PanditExperience.destroy({ where: { pandit_id: profile.id }, transaction });

    if (value.experience && value.experience.length > 0) {
      const rows = value.experience.map(e => ({
        pandit_id: profile.id,
        title: e.role_title || e.title || 'Vedic Priest',
        organization: e.organization_or_temple_name || e.organization || null,
        location: e.city ? `${e.city}, ${e.state || ''}` : (e.location || null),
        start_year: e.start_year || null,
        end_year: e.end_year || null,
        is_current: e.is_current !== undefined ? e.is_current : true,
        description: e.key_rituals_handled || e.notable_events || e.description || null
      }));
      await PanditExperience.bulkCreate(rows, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: 'Experience records saved successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 9. Save Locations & Travel (Step 7)
exports.saveLocations = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { error, value } = schemas.panditLocation.validate(req.body, { abortEarly: false });
    if (error) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId }, transaction });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    // Update residential details on profile root
    await profile.update({
      current_address: value.residential.current_address || null,
      city: value.residential.city,
      state: value.residential.state,
      country: value.residential.country || 'India',
      postal_code: value.residential.postal_code || null,
      travel_available: value.residential.travel_available !== undefined ? value.residential.travel_available : true,
      max_travel_distance_km: value.residential.max_travel_distance_km || 50,
      outstation_available: value.residential.outstation_available || false,
      international_travel: value.residential.international_travel || false,
      travel_expenses_extra: value.residential.travel_expenses_extra !== undefined ? value.residential.travel_expenses_extra : true
    }, { transaction });

    // Sync service locations
    await PanditLocation.destroy({ where: { pandit_id: profile.id }, transaction });

    if (value.service_locations && value.service_locations.length > 0) {
      const rows = value.service_locations.map(loc => ({
        pandit_id: profile.id,
        city: loc.city,
        state: loc.state,
        country: loc.country || 'India',
        area: Array.isArray(loc.areas_covered) ? loc.areas_covered.join(', ') : (loc.area || null),
        service_radius: value.residential.max_travel_distance_km || 50,
        travel_available: value.residential.travel_available !== undefined ? value.residential.travel_available : true
      }));
      await PanditLocation.bulkCreate(rows, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: 'Location and travel details saved successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 10. Save Availability & Service Modes (Step 8)
exports.saveAvailability = async (req, res, next) => {
  try {
    const { error, value } = schemas.panditAvailability.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    const payload = {
      weekly_schedule: {
        available_days: value.available_days,
        morning_slot: value.morning_slot,
        afternoon_slot: value.afternoon_slot,
        evening_slot: value.evening_slot,
        advance_booking_days: value.advance_booking_days,
        notes: value.notes
      },
      home_visit: value.allows_home_visit !== undefined ? value.allows_home_visit : true,
      online_consultation: value.allows_online_puja !== undefined ? value.allows_online_puja : false,
      advance_booking_required: (value.advance_booking_days || 0) > 0
    };

    let availability = await PanditAvailability.findOne({ where: { pandit_id: profile.id } });
    if (!availability) {
      availability = await PanditAvailability.create({
        pandit_id: profile.id,
        ...payload
      });
    } else {
      await availability.update(payload);
    }

    return res.status(200).json({
      success: true,
      message: 'Availability schedule saved successfully',
      data: { availability }
    });
  } catch (error) {
    next(error);
  }
};

// 11. Upload Profile Photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    // Delete old photo if existed
    if (profile.profile_photo) {
      const oldPath = path.join(__dirname, '..', profile.profile_photo);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
      }
    }

    const relativePath = `/uploads/pandit/photos/${req.file.filename}`;
    await profile.update({ profile_photo: relativePath });

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { profile_photo: relativePath }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    next(error);
  }
};

// 12. Upload KYC / Certification Document (Step 9)
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Document file is required' });
    }

    const { error, value } = schemas.panditDocument.validate(req.body, { abortEarly: false });
    if (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
      }
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const userId = req.user.id;
    const profile = await PanditProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
      }
      return res.status(404).json({ success: false, message: 'Please save basic information first' });
    }

    const relativeFilePath = `/uploads/pandit/documents/${req.file.filename}`;

    const doc = await PanditDocument.create({
      pandit_id: profile.id,
      document_type: value.document_type,
      document_number: value.document_number || null,
      document_title: value.document_title || value.document_type,
      file_path: relativeFilePath,
      file_mime_type: req.file.mimetype,
      file_size_bytes: req.file.size,
      issuing_authority: value.issuing_authority || null,
      issued_year: value.issued_year || null,
      is_primary_id: value.is_primary_id || false,
      verification_status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document: doc }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    next(error);
  }
};

// 13. Delete Document
exports.deleteDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const userId = req.user.id;

    const profile = await PanditProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const doc = await PanditDocument.findOne({
      where: { id: docId, pandit_id: profile.id }
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Unlink physical file
    const absoluteFilePath = path.join(__dirname, '..', doc.file_path);
    if (fs.existsSync(absoluteFilePath)) {
      try { fs.unlinkSync(absoluteFilePath); } catch (e) { /* ignore */ }
    }

    await doc.destroy();

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// 14. Submit for Verification & Publication (Step 10)
exports.submitForVerification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await PanditProfile.findOne({
      where: { user_id: userId },
      include: [
        { model: PanditReligiousDetail, as: 'religiousDetail' },
        { model: PanditAvailability, as: 'availability' },
        { model: MasterService, as: 'services' },
        { model: MasterLanguage, as: 'languages' },
        { model: PanditLocation, as: 'locations' },
        { model: PanditDocument, as: 'documents' }
      ]
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Check completeness requirements
    if (!profile.full_name) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your basic profile before submitting.'
      });
    }

    if (!profile.locations || profile.locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your service locations and travel radius before submitting.'
      });
    }

    if (!profile.services || profile.services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one puja or ritual service you offer.'
      });
    }

    if (!profile.languages || profile.languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one language.'
      });
    }

    await profile.update({
      status: 'SUBMITTED',
      rejection_reason: null
    });

    return res.status(200).json({
      success: true,
      message: 'Your profile has been submitted for verification! Our Vedic council will review and approve it shortly.',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// 15. Public Directory: Search & Filter Pandits
exports.getPublicDirectory = async (req, res, next) => {
  try {
    const {
      search,
      city,
      state,
      veda,
      service_id,
      language_id,
      min_experience,
      pandit_type,
      online_puja,
      home_visit,
      verified_only,
      sort_by = 'top_rated',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(limit, 10)));
    const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));

    // Base conditions: verified or published and public profiles
    const whereConditions = {
      status: { [Op.in]: ['VERIFIED', 'published', 'SUBMITTED'] },
      is_public: true
    };

    if (search) {
      whereConditions[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { display_name: { [Op.like]: `%${search}%` } },
        { short_bio: { [Op.like]: `%${search}%` } }
      ];
    }

    if (min_experience) {
      whereConditions.years_of_experience = { [Op.gte]: parseInt(min_experience, 10) };
    }

    // Religious filter
    const religiousInclude = {
      model: PanditReligiousDetail,
      as: 'religiousDetail',
      required: false
    };
    if (veda) {
      religiousInclude.where = { veda };
      religiousInclude.required = true;
    }

    // Availability filter
    const availabilityInclude = {
      model: PanditAvailability,
      as: 'availability',
      required: false
    };
    if (online_puja === 'true' || home_visit === 'true') {
      const availWhere = {};
      if (online_puja === 'true') availWhere.online_consultation = true;
      if (home_visit === 'true') availWhere.home_visit = true;
      availabilityInclude.where = availWhere;
      availabilityInclude.required = true;
    }

    // Location filter
    const locationInclude = {
      model: PanditLocation,
      as: 'locations',
      required: false
    };
    if (city || state) {
      const locWhere = {};
      if (city) locWhere.city = { [Op.like]: `%${city}%` };
      if (state) locWhere.state = { [Op.like]: `%${state}%` };
      locationInclude.where = locWhere;
      locationInclude.required = true;
    }

    // Service filter
    const serviceInclude = {
      model: MasterService,
      as: 'services',
      through: { attributes: ['experience_years'] },
      required: false
    };
    if (service_id) {
      serviceInclude.where = { id: service_id };
      serviceInclude.required = true;
    }

    // Language filter
    const languageInclude = {
      model: MasterLanguage,
      as: 'languages',
      through: { attributes: ['speaking_level', 'reading_level'] },
      required: false
    };
    if (language_id) {
      languageInclude.where = { id: language_id };
      languageInclude.required = true;
    }

    // Verification Include
    const verificationInclude = {
      model: PanditVerification,
      as: 'verification',
      required: false
    };
    if (verified_only === 'true') {
      verificationInclude.where = { identity_verified: true };
      verificationInclude.required = true;
    }

    // Sorting
    let order = [['rating', 'DESC']];
    if (sort_by === 'experience') {
      order = [['years_of_experience', 'DESC']];
    } else if (sort_by === 'completed_services') {
      order = [['completed_services_count', 'DESC']];
    } else if (sort_by === 'newest') {
      order = [['created_at', 'DESC']];
    }

    const { rows: pandits, count } = await PanditProfile.findAndCountAll({
      where: whereConditions,
      distinct: true,
      include: [
        religiousInclude,
        availabilityInclude,
        verificationInclude,
        locationInclude,
        serviceInclude,
        languageInclude,
        { model: PanditEducation, as: 'education' },
        { model: PanditExperience, as: 'experience' }
      ],
      order,
      limit: pageLimit,
      offset
    });

    // Sanitized output for public (exclude sensitive details)
    const sanitizedPandits = pandits.map(p => {
      const primaryLoc = p.locations?.[0] || {};
      return {
        id: p.id,
        slug: p.slug,
        title: p.title || 'Pandit',
        full_name: p.full_name,
        display_name: p.display_name,
        profile_photo: p.profile_photo,
        years_of_experience: p.years_of_experience,
        pandit_types: p.pandit_types,
        short_bio: p.short_bio,
        city: primaryLoc.city || 'Mumbai',
        state: primaryLoc.state || 'Maharashtra',
        country: primaryLoc.country || 'India',
        rating: p.rating,
        review_count: 12,
        completed_services_count: p.completed_services_count,
        travel_available: primaryLoc.travel_available !== undefined ? primaryLoc.travel_available : true,
        max_travel_distance_km: primaryLoc.service_radius || 50,
        religiousDetail: p.religiousDetail ? {
          gotra: p.religiousDetail.gotra,
          veda: p.religiousDetail.veda,
          shakha: p.religiousDetail.shakha,
          sampradaya: p.religiousDetail.sampradaya,
          kul_devta: p.religiousDetail.kul_devta,
          ishta_devta: p.religiousDetail.ishta_devta
        } : null,
        availability: p.availability ? {
          available_days: p.availability.weekly_schedule?.available_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          allows_home_visit: p.availability.home_visit,
          allows_online_puja: p.availability.online_consultation
        } : null,
        verification: p.verification ? {
          identity_verified: p.verification.identity_verified,
          education_verified: p.verification.education_verified,
          experience_verified: p.verification.experience_verified,
          vedic_certified: p.verification.vedic_certified,
          top_rated_pandit: p.verification.top_rated_pandit
        } : null,
        services: p.services || [],
        languages: p.languages || [],
        education: p.education || [],
        experience: p.experience || [],
        locations: p.locations || []
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        pandits: sanitizedPandits,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: pageLimit,
          totalPages: Math.ceil(count / pageLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 16. Public Profile Detail by Slug
exports.getPublicProfileBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const profile = await PanditProfile.findOne({
      where: {
        slug,
        is_public: true
      },
      include: [
        { model: PanditReligiousDetail, as: 'religiousDetail' },
        { model: PanditAvailability, as: 'availability' },
        { model: PanditVerification, as: 'verification' },
        { model: PanditEducation, as: 'education' },
        { model: PanditExperience, as: 'experience' },
        { model: PanditLocation, as: 'locations' },
        {
          model: MasterService,
          as: 'services',
          through: { attributes: ['experience_years'] }
        },
        {
          model: MasterLanguage,
          as: 'languages',
          through: { attributes: ['speaking_level', 'reading_level'] }
        }
      ]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Pandit profile not found or is currently private.'
      });
    }

    const primaryLoc = profile.locations?.[0] || {};

    // Return safe public details (Strictly no KYC doc files or sensitive residential address)
    const publicData = {
      id: profile.id,
      slug: profile.slug,
      title: profile.title || 'Pandit',
      full_name: profile.full_name,
      display_name: profile.display_name,
      profile_photo: profile.profile_photo,
      years_of_experience: profile.years_of_experience,
      pandit_types: profile.pandit_types,
      short_bio: profile.short_bio,
      about: profile.about || profile.short_bio,
      city: primaryLoc.city || 'Mumbai',
      state: primaryLoc.state || 'Maharashtra',
      country: primaryLoc.country || 'India',
      rating: profile.rating,
      review_count: 12,
      completed_services_count: profile.completed_services_count,
      travel_available: primaryLoc.travel_available !== undefined ? primaryLoc.travel_available : true,
      max_travel_distance_km: primaryLoc.service_radius || 50,
      religiousDetail: profile.religiousDetail,
      availability: profile.availability ? {
        available_days: profile.availability.weekly_schedule?.available_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        allows_home_visit: profile.availability.home_visit,
        allows_online_puja: profile.availability.online_consultation,
        consultation_available: true
      } : null,
      verification: profile.verification,
      education: profile.education,
      experience: profile.experience,
      locations: profile.locations,
      services: profile.services,
      languages: profile.languages
    };

    return res.status(200).json({
      success: true,
      data: { profile: publicData }
    });
  } catch (error) {
    next(error);
  }
};
