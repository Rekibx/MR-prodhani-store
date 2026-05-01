/**
 * Comprehensive validation utilities for MR Prodhani Store
 * Used across forms: Checkout, Admin, TrackOrder, etc.
 */

/**
 * Validate email format using RFC 5322 simplified pattern
 * @param {string} email - Email to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (trimmedEmail.length > 255) {
    return { valid: false, error: 'Email is too long (max 255 characters)' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate phone number for Indian format
 * Accepts: 10 digits, with optional +91 prefix
 * Examples: 9876543210, +919876543210, +91 9876543210
 * @param {string} phone - Phone number to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const trimmedPhone = phone.trim().replace(/\s+/g, '');
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

  if (!phoneRegex.test(trimmedPhone)) {
    return { valid: false, error: 'Please enter a valid 10-digit phone number' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate Indian postal code (PIN code)
 * Must be exactly 6 digits
 * @param {string} pincode - PIN code to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validatePincode(pincode) {
  if (!pincode || typeof pincode !== 'string') {
    return { valid: false, error: 'PIN code is required' };
  }

  const trimmedPincode = pincode.trim();
  const pincodeRegex = /^\d{6}$/;

  if (!pincodeRegex.test(trimmedPincode)) {
    return { valid: false, error: 'PIN code must be exactly 6 digits' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate product price
 * Must be a positive number, max 999999
 * @param {number|string} price - Price to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validatePrice(price) {
  if (price === null || price === undefined || price === '') {
    return { valid: false, error: 'Price is required' };
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return { valid: false, error: 'Price must be a valid number' };
  }

  if (numPrice <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }

  if (numPrice > 999999) {
    return { valid: false, error: 'Price cannot exceed ₹999,999' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate product name
 * Must be non-empty, not contain HTML, max 100 characters
 * @param {string} name - Product name to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateProductName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Product name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Product name cannot be empty' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Product name is too long (max 100 characters)' };
  }

  // Check for HTML tags
  if (/<[^>]*>/g.test(trimmedName)) {
    return { valid: false, error: 'Product name cannot contain HTML' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate full name
 * Must be non-empty, not contain HTML/special chars, max 100 characters
 * @param {string} name - Full name to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Full name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Full name cannot be empty' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  if (/<[^>]*>/g.test(trimmedName)) {
    return { valid: false, error: 'Name cannot contain HTML' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate shipping address
 * Must be non-empty, not contain HTML, max 500 characters
 * @param {string} address - Address to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required' };
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length === 0) {
    return { valid: false, error: 'Address cannot be empty' };
  }

  if (trimmedAddress.length > 500) {
    return { valid: false, error: 'Address is too long (max 500 characters)' };
  }

  if (/<[^>]*>/g.test(trimmedAddress)) {
    return { valid: false, error: 'Address cannot contain HTML' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate order ID format
 * Order IDs are typically in format: timestamp + random string
 * @param {string} orderId - Order ID to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    return { valid: false, error: 'Order ID is required' };
  }

  const trimmedId = orderId.trim();

  if (trimmedId.length === 0) {
    return { valid: false, error: 'Order ID cannot be empty' };
  }

  if (trimmedId.length > 255) {
    return { valid: false, error: 'Order ID is invalid' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate search query
 * Max 200 characters, basic input validation
 * @param {string} query - Search query to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: true, error: '', sanitized: '' };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length > 200) {
    return { valid: false, error: 'Search query is too long (max 200 characters)', sanitized: '' };
  }

  // Return sanitized version (no HTML)
  const sanitized = trimmedQuery.replace(/<[^>]*>/g, '');
  return { valid: true, error: '', sanitized };
}

/**
 * Validate cart items array
 * Must be non-empty array with valid items
 * @param {array} items - Cart items to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateCartItems(items) {
  if (!Array.isArray(items)) {
    return { valid: false, error: 'Cart items must be an array' };
  }

  if (items.length === 0) {
    return { valid: false, error: 'Cart is empty' };
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.id || !item.price || !item.quantity) {
      return { valid: false, error: `Cart item ${i + 1} is invalid` };
    }

    if (item.price <= 0 || item.quantity <= 0) {
      return { valid: false, error: `Cart item ${i + 1} has invalid price or quantity` };
    }
  }

  return { valid: true, error: '' };
}

/**
 * Validate order total
 * Must match calculated total from items
 * @param {number} total - Total to validate
 * @param {number} calculatedTotal - Calculated total from items
 * @returns {object} { valid: boolean, error: string }
 */
export function validateOrderTotal(total, calculatedTotal) {
  if (!total || typeof total !== 'number') {
    return { valid: false, error: 'Order total is invalid' };
  }

  if (total <= 0) {
    return { valid: false, error: 'Order total must be greater than 0' };
  }

  // Allow small rounding differences (up to 1 rupee)
  if (Math.abs(total - calculatedTotal) > 1) {
    return { valid: false, error: 'Order total does not match items' };
  }

  return { valid: true, error: '' };
}

/**
 * Bulk validation for checkout form
 * Validates all fields together
 * @param {object} formData - Form data to validate
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateCheckoutForm(formData) {
  const errors = {};

  if (!formData) {
    return { valid: false, errors: { form: 'Form data is required' } };
  }

  // Validate each field
  const nameResult = validateFullName(formData.name);
  if (!nameResult.valid) errors.name = nameResult.error;

  const emailResult = validateEmail(formData.email);
  if (!emailResult.valid) errors.email = emailResult.error;

  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.valid) errors.phone = phoneResult.error;

  const pincodeResult = validatePincode(formData.pincode);
  if (!pincodeResult.valid) errors.pincode = pincodeResult.error;

  const addressResult = validateAddress(formData.address);
  if (!addressResult.valid) errors.address = addressResult.error;

  const hasErrors = Object.keys(errors).length > 0;
  return {
    valid: !hasErrors,
    errors: hasErrors ? errors : {}
  };
}

/**
 * Bulk validation for product form (Admin)
 * @param {object} productData - Product data to validate
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateProductForm(productData) {
  const errors = {};

  if (!productData) {
    return { valid: false, errors: { form: 'Product data is required' } };
  }

  const nameResult = validateProductName(productData.name);
  if (!nameResult.valid) errors.name = nameResult.error;

  const priceResult = validatePrice(productData.price);
  if (!priceResult.valid) errors.price = priceResult.error;

  if (!productData.category || productData.category.trim() === '') {
    errors.category = 'Category is required';
  }

  if (!productData.description || productData.description.trim() === '') {
    errors.description = 'Description is required';
  } else if (productData.description.length > 1000) {
    errors.description = 'Description is too long (max 1000 characters)';
  }

  const hasErrors = Object.keys(errors).length > 0;
  return {
    valid: !hasErrors,
    errors: hasErrors ? errors : {}
  };
}
