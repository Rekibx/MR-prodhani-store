import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setupWindowMocks, setupLocalStorage } from './test-utils.jsx';

// Setup window mocks (matchMedia, clipboard, etc.)
setupWindowMocks();

// Setup localStorage mock
const localStorageMock = setupLocalStorage();
global.localStorage = localStorageMock;

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-user' } })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn(); // Return unsubscribe function
  }),
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({
    ref: vi.fn(),
  })),
  ref: vi.fn(),
  get: vi.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  set: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
  onValue: vi.fn((ref, callback) => {
    callback({ exists: () => false, val: () => null });
    return vi.fn(); // Return unsubscribe function
  }),
  off: vi.fn(),
  query: vi.fn((ref) => ref),
  limitToFirst: vi.fn(limit => ({ limit })),
}));

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

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn visible in tests
  error: vi.fn(),
  warn: vi.fn(),
  // Suppress log and info in tests unless needed
  log: vi.fn(),
  info: vi.fn(),
};

// Setup default test environment
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// Suppress act() warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
