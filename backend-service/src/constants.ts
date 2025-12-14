/**
 * Centralized constants for the application
 * Reduces magic strings and improves maintainability
 */

/**
 * Collection names used in Firestore
 */
export const COLLECTIONS = {
  USERS: 'users',
  VERIFIED_PARTNER: 'verifiedPartner',
  UNVERIFIED_PARTNER: 'unverifiedPartner',
  PRODUCTS: 'products',
  HISTORY: 'history',
  EMPLOYEE: 'employee',
  PRODUCT_ID: 'product-id',
  FILES: 'files', // For Firestore-based file storage
} as const;

/**
 * Default cookie expiration in days
 */
export const DEFAULT_COOKIE_EXPIRATION_DAYS = 7;

/**
 * Session timeout in hours
 */
export const SESSION_TIMEOUT_HOURS = 24;

/**
 * Success messages
 */
export const MESSAGES = {
  PRODUCT_CREATED: 'Product berhasil ditambahkan',
  PRODUCT_DELETED: 'Product deleted successfully',
  USER_CREATED: 'User created successfully',
  USER_EDITED: 'User successfully edited',
  LOGOUT_SUCCESS: 'Success logout',
  REVIEW_SUCCESS: 'Success reviewing products',
  DATA_UPDATED: 'Success update data',
  DATA_CREATED: 'Success create data',
} as const;

/**
 * Error messages
 */
export const ERRORS = {
  INVALID_PRODUCT_REF: 'Invalid product reference',
  INVALID_UID: 'Invalid UID for the specified product',
  PRODUCT_NOT_FOUND: 'Product not found',
  PARTNER_NOT_FOUND: 'Partner not found',
  USER_NOT_FOUND: 'User not found',
  DOCUMENT_NOT_FOUND: 'Document not found',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  AUTH_FAILED: 'Authentication failed',
  UNAUTHORIZED: 'Unauthorized',
  INTERNAL_ERROR: 'Internal Server Error',
} as const;
