/**
 * Comprehensive tests for validators utility
 * Tests all validation functions with valid/invalid inputs
 */

import {
  validateEmail,
  validatePhone,
  validatePincode,
  validatePrice,
  validateProductName,
  validateFullName,
  validateAddress,
  validateOrderId,
  validateSearchQuery,
  validateCartItems,
  validateOrderTotal,
  validateCheckoutForm,
  validateProductForm,
} from '../utils/validators';

describe('Validators Module', () => {
  // Email Validation Tests
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBe('');
    });

    it('should reject invalid email formats', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject email without @ symbol', () => {
      const result = validateEmail('testexample.com');
      expect(result.valid).toBe(false);
    });

    it('should trim whitespace from email', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.valid).toBe(true);
    });

    it('should reject overly long emails', () => {
      const longEmail = 'a'.repeat(256) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('long');
    });
  });

  // Phone Validation Tests
  describe('validatePhone', () => {
    it('should accept valid 10-digit phone numbers', () => {
      const result = validatePhone('9876543210');
      expect(result.valid).toBe(true);
    });

    it('should accept phone with +91 prefix', () => {
      const result = validatePhone('+919876543210');
      expect(result.valid).toBe(true);
    });

    it('should accept phone with +91 and spaces', () => {
      const result = validatePhone('+91 9876543210');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const result = validatePhone('123456');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10-digit');
    });

    it('should reject phone starting with invalid digit', () => {
      const result = validatePhone('1234567890');
      expect(result.valid).toBe(false);
    });

    it('should reject empty phone', () => {
      const result = validatePhone('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  // PIN Code Validation Tests
  describe('validatePincode', () => {
    it('should accept valid 6-digit PIN codes', () => {
      const result = validatePincode('560001');
      expect(result.valid).toBe(true);
    });

    it('should reject PIN codes with less than 6 digits', () => {
      const result = validatePincode('56001');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('6 digits');
    });

    it('should reject PIN codes with non-digit characters', () => {
      const result = validatePincode('56000A');
      expect(result.valid).toBe(false);
    });

    it('should reject empty PIN code', () => {
      const result = validatePincode('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  // Price Validation Tests
  describe('validatePrice', () => {
    it('should accept valid positive prices', () => {
      const result = validatePrice(649);
      expect(result.valid).toBe(true);
    });

    it('should accept string prices that are valid numbers', () => {
      const result = validatePrice('649');
      expect(result.valid).toBe(true);
    });

    it('should reject zero price', () => {
      const result = validatePrice(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('should reject negative prices', () => {
      const result = validatePrice(-100);
      expect(result.valid).toBe(false);
    });

    it('should reject prices exceeding max', () => {
      const result = validatePrice(9999999);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceed');
    });

    it('should reject non-numeric prices', () => {
      const result = validatePrice('invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });
  });

  // Product Name Validation Tests
  describe('validateProductName', () => {
    it('should accept valid product names', () => {
      const result = validateProductName('iPhone 13 Pro');
      expect(result.valid).toBe(true);
    });

    it('should reject empty product names', () => {
      const result = validateProductName('');
      expect(result.valid).toBe(false);
    });

    it('should reject product names with HTML tags', () => {
      const result = validateProductName('iPhone <script>alert</script>');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HTML');
    });

    it('should reject overly long product names', () => {
      const longName = 'a'.repeat(101);
      const result = validateProductName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('long');
    });
  });

  // Full Name Validation Tests
  describe('validateFullName', () => {
    it('should accept valid names', () => {
      const result = validateFullName('John Doe');
      expect(result.valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = validateFullName('');
      expect(result.valid).toBe(false);
    });

    it('should reject names with HTML', () => {
      const result = validateFullName('John <b>Doe</b>');
      expect(result.valid).toBe(false);
    });

    it('should reject overly long names', () => {
      const longName = 'a'.repeat(101);
      const result = validateFullName(longName);
      expect(result.valid).toBe(false);
    });
  });

  // Address Validation Tests
  describe('validateAddress', () => {
    it('should accept valid addresses', () => {
      const result = validateAddress('123 Main St, Bangalore');
      expect(result.valid).toBe(true);
    });

    it('should reject empty addresses', () => {
      const result = validateAddress('');
      expect(result.valid).toBe(false);
    });

    it('should reject addresses with HTML', () => {
      const result = validateAddress('123 Main St <script>');
      expect(result.valid).toBe(false);
    });

    it('should reject overly long addresses', () => {
      const longAddr = 'a'.repeat(501);
      const result = validateAddress(longAddr);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('long');
    });
  });

  // Order ID Validation Tests
  describe('validateOrderId', () => {
    it('should accept valid order IDs', () => {
      const result = validateOrderId('order-123-abc');
      expect(result.valid).toBe(true);
    });

    it('should reject empty order IDs', () => {
      const result = validateOrderId('');
      expect(result.valid).toBe(false);
    });

    it('should reject overly long order IDs', () => {
      const longId = 'a'.repeat(256);
      const result = validateOrderId(longId);
      expect(result.valid).toBe(false);
    });
  });

  // Search Query Validation Tests
  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      const result = validateSearchQuery('iPhone 13');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('iPhone 13');
    });

    it('should sanitize HTML from search queries', () => {
      const result = validateSearchQuery('iPhone <script>');
      expect(result.valid).toBe(true);
      expect(result.sanitized).not.toContain('<script>');
    });

    it('should reject overly long queries', () => {
      const longQuery = 'a'.repeat(201);
      const result = validateSearchQuery(longQuery);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('long');
    });

    it('should return valid with empty string', () => {
      const result = validateSearchQuery('');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('');
    });
  });

  // Cart Items Validation Tests
  describe('validateCartItems', () => {
    it('should accept valid cart items', () => {
      const items = [
        { id: 1, name: 'Product 1', price: 100, quantity: 1 },
        { id: 2, name: 'Product 2', price: 200, quantity: 2 },
      ];
      const result = validateCartItems(items);
      expect(result.valid).toBe(true);
    });

    it('should reject empty cart', () => {
      const result = validateCartItems([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject cart with invalid items', () => {
      const items = [{ id: 1, price: 100 }]; // Missing quantity
      const result = validateCartItems(items);
      expect(result.valid).toBe(false);
    });

    it('should reject cart with zero quantity', () => {
      const items = [{ id: 1, name: 'Product', price: 100, quantity: 0 }];
      const result = validateCartItems(items);
      expect(result.valid).toBe(false);
    });
  });

  // Order Total Validation Tests
  describe('validateOrderTotal', () => {
    it('should accept matching totals', () => {
      const result = validateOrderTotal(100, 100);
      expect(result.valid).toBe(true);
    });

    it('should allow small rounding differences', () => {
      const result = validateOrderTotal(100.50, 100.49);
      expect(result.valid).toBe(true);
    });

    it('should reject large mismatches', () => {
      const result = validateOrderTotal(100, 200);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('match');
    });

    it('should reject zero total', () => {
      const result = validateOrderTotal(0, 0);
      expect(result.valid).toBe(false);
    });
  });

  // Checkout Form Validation Tests
  describe('validateCheckoutForm', () => {
    it('should validate complete form successfully', () => {
      const form = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        pincode: '560001',
        address: '123 Main St',
      };
      const result = validateCheckoutForm(form);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for invalid fields', () => {
      const form = {
        name: '',
        email: 'invalid',
        phone: '123',
        pincode: '12345',
        address: '',
      };
      const result = validateCheckoutForm(form);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should include all field errors', () => {
      const form = {
        name: '',
        email: '',
        phone: '',
        pincode: '',
        address: '',
      };
      const result = validateCheckoutForm(form);
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('phone');
      expect(result.errors).toHaveProperty('pincode');
      expect(result.errors).toHaveProperty('address');
    });
  });

  // Product Form Validation Tests
  describe('validateProductForm', () => {
    it('should validate complete product form', () => {
      const form = {
        name: 'iPhone 13 Pro',
        price: 649,
        category: 'smartphone',
        description: 'Great phone',
      };
      const result = validateProductForm(form);
      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid product', () => {
      const form = {
        name: '',
        price: 0,
        category: '',
        description: '',
      };
      const result = validateProductForm(form);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});
