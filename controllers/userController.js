const { User, MerchantProfile, CompanyProfile, CustomerProfile } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');

/**
 * 1. Get All Users (ADMIN ONLY)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, is_active, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['created_at', 'DESC']],
      include: [
        { model: MerchantProfile, as: 'merchantProfile', required: false },
        { model: CompanyProfile, as: 'companyProfile', required: false },
        { model: CustomerProfile, as: 'customerProfile', required: false }
      ]
    });

    return ApiResponse.success(res, 'Users fetched successfully', {
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      users: rows.map((u) => u.toSafeJSON())
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 2. Update User Role (ADMIN ONLY)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    await user.update({ role });
    return ApiResponse.success(res, `User role updated to ${role}`, user.toSafeJSON());
  } catch (error) {
    return next(error);
  }
};

/**
 * 3. Update User Status / Active State (ADMIN ONLY)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    await user.update({ is_active: Boolean(is_active) });
    return ApiResponse.success(res, `User status updated successfully`, user.toSafeJSON());
  } catch (error) {
    return next(error);
  }
};

/**
 * 4. Update Self Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, shipping_address, city, state, postal_code, country, preferences } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({
      name: name || user.name,
      phone: phone !== undefined ? phone : user.phone,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    // Update customer profile if applicable
    if (user.role === ROLES.CUSTOMER) {
      const customer = await CustomerProfile.findOne({ where: { user_id: user.id } });
      if (customer) {
        await customer.update({
          shipping_address: shipping_address !== undefined ? shipping_address : customer.shipping_address,
          city: city !== undefined ? city : customer.city,
          state: state !== undefined ? state : customer.state,
          postal_code: postal_code !== undefined ? postal_code : customer.postal_code,
          country: country !== undefined ? country : customer.country,
          preferences: preferences !== undefined ? preferences : customer.preferences
        });
      }
    }

    return ApiResponse.success(res, 'Profile updated successfully', user.toSafeJSON());
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  updateProfile
};
