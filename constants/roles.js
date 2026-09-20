/**
 * User Roles Enum for RBAC across NightZone platform
 */
const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  COMPANY: 'COMPANY',
  MERCHANT: 'MERCHANT'
});

const ROLE_LIST = Object.values(ROLES);

/**
 * Role permission hierarchy and granular capability mapping
 */
const PERMISSIONS = Object.freeze({
  // Customer
  PLACE_ORDER: ['CUSTOMER', 'COMPANY'],
  VIEW_OWN_ORDERS: ['CUSTOMER', 'COMPANY', 'MERCHANT', 'ADMIN'],
  WRITE_REVIEW: ['CUSTOMER', 'COMPANY'],

  // Merchant
  CREATE_PRODUCT: ['MERCHANT', 'ADMIN'],
  EDIT_PRODUCT: ['MERCHANT', 'ADMIN'],
  MANAGE_INVENTORY: ['MERCHANT', 'ADMIN'],
  VIEW_MERCHANT_ANALYTICS: ['MERCHANT', 'ADMIN'],

  // Company (B2B)
  REQUEST_BULK_QUOTE: ['COMPANY', 'ADMIN'],
  DOWNLOAD_B2B_INVOICE: ['COMPANY', 'ADMIN'],

  // Admin
  MANAGE_USERS: ['ADMIN'],
  MANAGE_ROLES: ['ADMIN'],
  APPROVE_MERCHANT: ['ADMIN'],
  APPROVE_COMPANY: ['ADMIN'],
  VIEW_ALL_ANALYTICS: ['ADMIN']
});

module.exports = {
  ROLES,
  ROLE_LIST,
  PERMISSIONS
};
