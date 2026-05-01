/**
 * Test utilities and helpers for MR Prodhani Store
 * Provides setup functions, mocks, and custom renderers for tests
 */

import { vi } from 'vitest';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';

/**
 * Custom render function that includes all necessary providers
 * Use this instead of the standard React Testing Library render
 * @param {ReactElement} ui - Component to render
 * @param {object} options - Additional options to pass to render
 * @returns {object} Render result with queries
 */
export function render(ui, options = {}) {
  const Wrapper = ({ children }) => (
    <Router>
      <ToastProvider>
        <CartProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CartProvider>
      </ToastProvider>
    </Router>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock Firebase Auth
 * Returns standard auth object with user state
 * @returns {object} Mock auth object
 */
export function createMockAuth(isAuthenticated = false, user = null) {
  return {
    currentUser: user || (isAuthenticated ? { uid: 'test-user-123', email: 'test@example.com' } : null),
  };
}

/**
 * Mock Firebase Database
 * Returns mock database object for testing read/write operations
 * @returns {object} Mock database object
 */
export function createMockDatabase() {
  return {
    ref: vi.fn(() => ({
      on: vi.fn((event, callback) => {
        // Simulate database listener
        if (event === 'value') {
          callback({ val: () => null, exists: () => false });
        }
      }),
      off: vi.fn(),
      once: vi.fn(() => Promise.resolve({ val: () => null })),
      set: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve()),
    })),
  };
}

/**
 * Mock cart data
 * @returns {object} Sample cart items for testing
 */
export function createMockCartItems() {
  return [
    {
      id: 1,
      name: 'iPhone 13 Pro',
      price: 649,
      quantity: 1,
      image: 'https://example.com/image1.jpg',
    },
    {
      id: 2,
      name: 'iPhone 12',
      price: 399,
      quantity: 2,
      image: 'https://example.com/image2.jpg',
    },
  ];
}

/**
 * Mock product data
 * @returns {object} Sample product for testing
 */
export function createMockProduct() {
  return {
    id: 1,
    name: 'iPhone 13 Pro',
    price: 649,
    originalPrice: 999,
    condition: 'Excellent',
    category: 'smartphone',
    image: 'https://example.com/image.jpg',
    description: 'Test product description',
    specs: ['128GB Storage', 'Sierra Blue'],
  };
}

/**
 * Mock order data
 * @returns {object} Sample order for testing
 */
export function createMockOrder() {
  return {
    id: 'order-123',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      pincode: '560001',
      address: '123 Main St, Bangalore',
    },
    items: createMockCartItems(),
    total: '1447.00',
    date: new Date().toISOString(),
    status: 'Pending',
  };
}

/**
 * Mock form data for checkout
 * @returns {object} Sample checkout form data
 */
export function createMockFormData() {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    pincode: '560001',
    address: '123 Main St, Bangalore',
  };
}

/**
 * Wait for element with timeout
 * Useful for async operations in tests
 * @param {function} callback - Function that returns truthy when element is ready
 * @param {number} timeout - Max wait time in ms (default 3000)
 * @returns {Promise} Resolves when condition is met
 */
export async function waitForElement(callback, timeout = 3000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const result = callback();
      if (result) return result;
    } catch {
      // Element not found yet, continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Element not found within timeout');
}

/**
 * Setup mock localStorage for testing
 * Prevents localStorage errors in test environment
 * @returns {object} Mock localStorage object
 */
export function setupLocalStorage() {
  const store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
  };
}

/**
 * Setup global mocks for window object
 * Includes matchMedia, scrollTo, etc.
 */
export function setupWindowMocks() {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock window.scrollTo
  window.scrollTo = vi.fn();

  // Mock navigator.clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  });
}

/**
 * Create mock toast function
 * @returns {object} Mock toast object with addToast function
 */
export function createMockToast() {
  return {
    addToast: vi.fn((message, type) => ({
      message,
      type,
      id: Math.random(),
    })),
  };
}

/**
 * Create mock navigation
 * @returns {object} Mock navigate function
 */
export function createMockNavigate() {
  return vi.fn();
}

/**
 * Helper to check if validation error exists in DOM
 * @param {object} screen - React Testing Library screen object
 * @param {string} errorText - Error message to look for
 * @returns {boolean} True if error text is in document
 */
export function hasValidationError(screen, errorText) {
  try {
    screen.getByText(new RegExp(errorText, 'i'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to fill form inputs
 * @param {object} screen - React Testing Library screen object
 * @param {object} data - Form data to fill { fieldName: value }
 */
export function fillForm(screen, data) {
  Object.entries(data).forEach(([name, value]) => {
    const input = screen.getByPlaceholderText(new RegExp(name, 'i'));
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

/**
 * Helper to submit form
 * @param {object} screen - React Testing Library screen object
 * @param {string} buttonText - Text of submit button
 */
export function submitForm(screen, buttonText = 'Submit') {
  const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
  button.click();
}

export default {
  render,
  createMockAuth,
  createMockDatabase,
  createMockCartItems,
  createMockProduct,
  createMockOrder,
  createMockFormData,
  waitForElement,
  setupLocalStorage,
  setupWindowMocks,
  createMockToast,
  createMockNavigate,
  hasValidationError,
  fillForm,
  submitForm,
};
