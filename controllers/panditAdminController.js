const { Op } = require('sequelize');
const {
  sequelize,
  User,
  PanditProfile,
  PanditReligiousDetail,
  MasterService,
  MasterLanguage,
  PanditEducation,
  PanditExperience,
  PanditLocation,
  PanditAvailability,
  PanditDocument,
  PanditVerification,
  PanditAuditLog
} = require('../models');
const schemas = require('../utils/validators');

// 1. Get All Pandits (Admin List View)
exports.getAllPandits = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const whereConditions = {};
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    if (search) {
      whereConditions[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { display_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { primary_phone: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: pandits, count } = await PanditProfile.findAndCountAll({
      where: whereConditions,
      distinct: true,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role'] },
        { model: PanditVerification, as: 'verification' },
        { model: PanditDocument, as: 'documents' }
      ],
      order: [['created_at', 'DESC']],
      limit: pageLimit,
      offset
    });

    return res.status(200).json({
      success: true,
      data: {
        pandits,
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

// 2. Get Detailed Pandit Profile For Admin Review (Including KYC Docs)
exports.getPanditDetailForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await PanditProfile.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role', 'status'] },
        { model: PanditReligiousDetail, as: 'religiousDetail' },
        { model: PanditAvailability, as: 'availability' },
        { model: PanditVerification, as: 'verification' },
        { model: PanditEducation, as: 'education' },
        { model: PanditExperience, as: 'experience' },
        { model: PanditLocation, as: 'locations' },
        { model: PanditDocument, as: 'documents' },
        {
          model: PanditAuditLog,
          as: 'auditLogs',
          include: [{ model: User, as: 'admin', attributes: ['id', 'name', 'email'] }],
          order: [['created_at', 'DESC']]
        },
        {
          model: MasterService,
          as: 'services',
          through: { attributes: ['id', 'experience_years'] }
        },
        {
          model: MasterLanguage,
          as: 'languages',
          through: { attributes: ['id', 'speaking_level', 'reading_level'] }
        }
      ]
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pandit profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Moderate Profile Status & Badges
exports.moderatePandit = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const { error, value } = schemas.panditAdminModeration.validate(req.body, { abortEarly: false });
    if (error) {
      await transaction.rollback();
      return res.status(422).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => d.message)
      });
    }

    const profile = await PanditProfile.findByPk(id, { transaction });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Pandit profile not found' });
    }

    const previousStatus = profile.status;
    const isApproved = value.status === 'published' || value.status === 'VERIFIED';
    const dbStatus = isApproved ? 'VERIFIED' :
                     value.status === 'rejected' ? 'REJECTED' :
                     value.status === 'suspended' ? 'SUSPENDED' : 'DRAFT';

    // Update status & public visibility
    await profile.update({
      status: dbStatus,
      is_public: isApproved,
      rejection_reason: value.status === 'rejected' ? value.rejection_reason : null,
      admin_notes: value.admin_notes || profile.admin_notes
    }, { transaction });

    // Update Verification Badges if supplied
    let verification = await PanditVerification.findOne({ where: { pandit_id: profile.id }, transaction });
    if (!verification) {
      verification = await PanditVerification.create({
        pandit_id: profile.id,
        verified_by_user_id: adminId,
        verified_at: isApproved ? new Date() : null,
        ...(value.badges || {})
      }, { transaction });
    } else {
      const updateData = { ...(value.badges || {}) };
      if (isApproved) {
        updateData.verified_by_user_id = adminId;
        updateData.verified_at = new Date();
      }
      await verification.update(updateData, { transaction });
    }

    // Log to PanditAuditLog
    await PanditAuditLog.create({
      pandit_id: profile.id,
      admin_user_id: adminId,
      action: `STATUS_CHANGED_TO_${dbStatus}`,
      previous_status: previousStatus,
      new_status: dbStatus,
      reason: value.rejection_reason || value.admin_notes || `Status updated from ${previousStatus} to ${dbStatus}`,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `Pandit profile status successfully updated to ${dbStatus}`,
      data: { profile, verification }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 4. Verify Individual KYC Document
exports.verifyDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { status, notes } = req.body; // status: 'verified' | 'rejected'

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const doc = await PanditDocument.findOne({
      where: { id: docId, pandit_id: id }
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await doc.update({
      verification_status: status,
      verified_at: status === 'verified' ? new Date() : null,
      verification_notes: notes || null
    });

    // Check if identity document was verified and auto-update verification table
    if (status === 'verified' && ['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID'].includes(doc.document_type)) {
      const [verif] = await PanditVerification.findOrCreate({ where: { pandit_id: id } });
      await verif.update({ identity_verified: true });
    }

    return res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: { document: doc }
    });
  } catch (error) {
    next(error);
  }
};
