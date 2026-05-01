/**
 * Error reporting and tracking utility
 * Captures, reports, and tracks errors throughout the application
 * In production, sends to external error tracking service (Sentry, Firebase Crashlytics, etc.)
 */

import { logError } from './logger';

/* eslint-disable no-undef */
const isDevelopment = (typeof process !== 'undefined' && process.env?.NODE_ENV) === 'development';
const isProduction = (typeof process !== 'undefined' && process.env?.NODE_ENV) === 'production';
/* eslint-enable no-undef */

// Error tracking configuration
const config = {
  maxErrorsToTrack: 50,
  trackingEnabled: true,
  sendToServer: isProduction,
};

// In-memory error history
let errorHistory = [];

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Error categories
 */
export const ERROR_CATEGORY = {
  AUTH: 'auth',
  DATABASE: 'database',
  VALIDATION: 'validation',
  NETWORK: 'network',
  UI: 'ui',
  UNKNOWN: 'unknown',
};

/**
 * Categorize error based on error properties
 * @param {Error} error - The error to categorize
 * @returns {string} Error category
 */
function categorizeError(error) {
  if (!error) return ERROR_CATEGORY.UNKNOWN;

  const message = (error.message || '').toLowerCase();
  const name = (error.name || '').toLowerCase();

  if (message.includes('auth') || message.includes('firebase/auth')) {
    return ERROR_CATEGORY.AUTH;
  }
  if (message.includes('database') || message.includes('firebase/database')) {
    return ERROR_CATEGORY.DATABASE;
  }
  if (message.includes('validation')) {
    return ERROR_CATEGORY.VALIDATION;
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return ERROR_CATEGORY.NETWORK;
  }
  if (name.includes('syntaxerror') || name.includes('referenceerror')) {
    return ERROR_CATEGORY.UI;
  }

  return ERROR_CATEGORY.UNKNOWN;
}

/**
 * Determine error severity
 * @param {Error} error - The error
 * @param {object} _context - Additional context (reserved for future use)
 * @returns {string} Severity level
 */
// eslint-disable-next-line no-unused-vars
function determineSeverity(error, _context) {
  const category = categorizeError(error);

  // Critical errors
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return ERROR_SEVERITY.CRITICAL;
  }
  if (category === ERROR_CATEGORY.AUTH && error.code === 'auth/user-not-found') {
    return ERROR_SEVERITY.ERROR;
  }
  if (category === ERROR_CATEGORY.DATABASE) {
    return ERROR_SEVERITY.ERROR;
  }

  // Warnings
  if (category === ERROR_CATEGORY.VALIDATION) {
    return ERROR_SEVERITY.WARNING;
  }
  if (category === ERROR_CATEGORY.NETWORK) {
    return ERROR_SEVERITY.WARNING; // Might be retryable
  }

  return ERROR_SEVERITY.ERROR;
}

/**
 * Create error report object
 * @param {Error} error - The error
 * @param {string} component - Component where error occurred
 * @param {object} context - Additional context
 * @returns {object} Error report
 */
function createErrorReport(error, component, context = {}) {
  const category = categorizeError(error);
  const severity = determineSeverity(error, context);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    error: {
      name: error?.name || 'Unknown',
      message: error?.message || 'An unexpected error occurred',
      stack: error?.stack || '',
    },
    component,
    category,
    severity,
    context: {
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...context,
    },
    env: isProduction ? 'production' : 'development',
  };
}

/**
 * Report an error
 * @param {Error} error - Error object
 * @param {string} component - Component name
 * @param {object} context - Additional context
 * @returns {object} Error report
 */
export function reportError(error, component = 'Unknown', context = {}) {
  if (!config.trackingEnabled) return null;

  const report = createErrorReport(error, component, context);

  // Add to history (keep last N errors)
  errorHistory.push(report);
  if (errorHistory.length > config.maxErrorsToTrack) {
    errorHistory.shift();
  }

  // Log the error
  logError(component, report.error.message, error, {
    category: report.category,
    severity: report.severity,
  });

  // Send to server in production
  if (config.sendToServer && isProduction) {
    sendErrorToServer(report);
  }

  return report;
}

/**
 * Report validation error
 * @param {string} field - Field name
 * @param {string} message - Validation message
 * @param {string} component - Component name
 */
export function reportValidationError(field, message, component = 'Form') {
  const error = new Error(`Validation failed: ${field} - ${message}`);
  reportError(error, component, { field, rule: message });
}

/**
 * Report authentication error
 * @param {Error} error - Auth error
 * @param {string} operation - Operation (login, logout, etc.)
 */
export function reportAuthError(error, operation = 'auth') {
  reportError(error, 'Authentication', { operation });
}

/**
 * Report database error
 * @param {Error} error - DB error
 * @param {string} operation - Operation (read, write, etc.)
 * @param {string} path - Database path
 */
export function reportDatabaseError(error, operation = 'operation', path = 'unknown') {
  reportError(error, 'Database', { operation, path });
}

/**
 * Report network error
 * @param {Error} error - Network error
 * @param {string} endpoint - API endpoint
 * @param {number} retryCount - Number of retries
 */
export function reportNetworkError(error, endpoint = 'unknown', retryCount = 0) {
  reportError(error, 'Network', { endpoint, retryCount });
}

/**
 * Report UI error (typically from error boundary)
 * @param {Error} error - UI error
 * @param {string} componentStack - React component stack
 */
export function reportUIError(error, componentStack = '') {
  reportError(error, 'UI', { componentStack });
}

/**
 * Send error to monitoring service
 * Currently logs to console; integrate with Sentry, Firebase Crashlytics, etc.
 * @param {object} report - Error report
 */
function sendErrorToServer(report) {
  // TODO: Integrate with error tracking service
  // Example for Sentry:
  // if (window.Sentry) {
  //   window.Sentry.captureException(report.error, {
  //     level: report.severity,
  //     tags: {
  //       category: report.category,
  //       component: report.component,
  //     },
  //     contexts: {
  //       app: report.context,
  //     },
  //   });
  // }

  // Example for Firebase Crashlytics:
  // if (window.firebase && window.firebase.crashlytics) {
  //   window.firebase.crashlytics().recordError(
  //     new Error(`[${report.component}] ${report.error.message}`)
  //   );
  // }

  if (isDevelopment) {
    console.log('[ERROR REPORT WOULD BE SENT]', report);
  }
}

/**
 * Get error history
 * @param {string} filter - Filter by category or severity
 * @returns {array} Error reports
 */
export function getErrorHistory(filter = null) {
  if (!filter) return errorHistory;

  return errorHistory.filter(report => {
    if (filter === report.category || filter === report.severity) {
      return true;
    }
    if (filter === report.component) {
      return true;
    }
    return false;
  });
}

/**
 * Get error statistics
 * @returns {object} Error stats
 */
export function getErrorStats() {
  const stats = {
    total: errorHistory.length,
    bySeverity: {},
    byCategory: {},
    byComponent: {},
  };

  errorHistory.forEach(report => {
    stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;
    stats.byCategory[report.category] = (stats.byCategory[report.category] || 0) + 1;
    stats.byComponent[report.component] = (stats.byComponent[report.component] || 0) + 1;
  });

  return stats;
}

/**
 * Clear error history
 */
export function clearErrorHistory() {
  errorHistory = [];
}

/**
 * Enable or disable error tracking
 * @param {boolean} enabled - Enable tracking
 */
export function setTrackingEnabled(enabled) {
  config.trackingEnabled = enabled;
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), 'GlobalError', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'UnhandledPromise'
    );
  });
}

export default {
  reportError,
  reportValidationError,
  reportAuthError,
  reportDatabaseError,
  reportNetworkError,
  reportUIError,
  getErrorHistory,
  getErrorStats,
  clearErrorHistory,
  setTrackingEnabled,
  setupGlobalErrorHandling,
  ERROR_SEVERITY,
  ERROR_CATEGORY,
};
