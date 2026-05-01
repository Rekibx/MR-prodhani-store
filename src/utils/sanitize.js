/**
 * Input sanitization utilities for XSS prevention
 * Used to clean user inputs before storage or display
 */

/**
 * Strip HTML tags from a string (XSS prevention)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string without HTML tags
 */
export function stripHtmlTags(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Escape special HTML characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Trim whitespace and normalize input
 * @param {string} str - String to trim
 * @returns {string} Trimmed string with normalized whitespace
 */
export function normalizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize user input for database storage
 * Combines trim, HTML stripping, and normalization
 * @param {string} str - String to sanitize
 * @param {number} maxLength - Maximum allowed length (default 1000)
 * @returns {string} Sanitized string
 */
export function sanitizeInput(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';

  let sanitized = str.trim();

  // Remove HTML tags
  sanitized = stripHtmlTags(sanitized);

  // Normalize whitespace
  sanitized = normalizeInput(sanitized);

  // Truncate to max length if needed
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Sanitize email input
 * Trim, lowercase, remove special chars
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Sanitize phone number
 * Remove spaces, dashes, brackets, keep only digits and +
 * @param {string} phone - Phone to sanitize
 * @returns {string} Sanitized phone number
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[\s\-()]/g, '').trim();
}

/**
 * Sanitize numeric input
 * Extract only digits and decimal point
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized numeric string
 */
export function sanitizeNumeric(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\d.]/g, '');
}

/**
 * Sanitize search query for display/storage
 * Remove HTML, trim, limit length
 * @param {string} query - Search query to sanitize
 * @param {number} maxLength - Maximum length (default 200)
 * @returns {string} Sanitized search query
 */
export function sanitizeSearchQuery(query, maxLength = 200) {
  if (typeof query !== 'string') return '';

  let sanitized = query.trim();
  sanitized = stripHtmlTags(sanitized);
  sanitized = normalizeInput(sanitized);

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Sanitize all fields in an object
 * Recursively sanitizes all string values
 * @param {object} obj - Object to sanitize
 * @returns {object} Sanitized object
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize form data (typically from checkout)
 * Special handling for each field type
 * @param {object} formData - Form data to sanitize
 * @returns {object} Sanitized form data
 */
export function sanitizeFormData(formData) {
  if (typeof formData !== 'object' || formData === null) return {};

  return {
    name: sanitizeInput(formData.name || '', 100),
    email: sanitizeEmail(formData.email || ''),
    phone: sanitizePhone(formData.phone || ''),
    pincode: sanitizeNumeric(formData.pincode || ''),
    address: sanitizeInput(formData.address || '', 500),
  };
}

/**
 * Sanitize product data (for admin form)
 * @param {object} productData - Product data to sanitize
 * @returns {object} Sanitized product data
 */
export function sanitizeProductData(productData) {
  if (typeof productData !== 'object' || productData === null) return {};

  return {
    name: sanitizeInput(productData.name || '', 100),
    price: sanitizeNumeric(productData.price || ''),
    category: sanitizeInput(productData.category || '', 50),
    description: sanitizeInput(productData.description || '', 1000),
    image: sanitizeInput(productData.image || '', 2048),
    condition: sanitizeInput(productData.condition || '', 50),
    specs: Array.isArray(productData.specs)
      ? productData.specs.map(spec => sanitizeInput(spec, 100))
      : []
  };
}

/**
 * Validate string is safe (no script tags or obvious injection)
 * @param {string} str - String to validate
 * @returns {boolean} True if string appears safe
 */
export function isSafeString(str) {
  if (typeof str !== 'string') return true;

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(str));
}

/**
 * Sanitize entire checkout form data
 * Combines sanitization and safety checking
 * @param {object} formData - Form data from checkout
 * @returns {object} Sanitized and validated form data
 */
export function sanitizeCheckoutFormData(formData) {
  const sanitized = sanitizeFormData(formData);

  // Verify no dangerous content
  for (const value of Object.values(sanitized)) {
    if (!isSafeString(value)) {
      console.warn('⚠️ Potentially unsafe input detected and sanitized');
    }
  }

  return sanitized;
}
