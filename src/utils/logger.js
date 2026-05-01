/**
 * Structured logging utility for MR Prodhani Store
 * Provides consistent logging across the application with support for different log levels
 * In production, send logs to external monitoring service
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Determine current environment - safely check if process is defined
/* eslint-disable no-undef */
const isDevelopment = (typeof process !== 'undefined' && process.env?.NODE_ENV) === 'development';
const isProduction = (typeof process !== 'undefined' && process.env?.NODE_ENV) === 'production';
/* eslint-enable no-undef */

// Production logging level (suppress DEBUG, show INFO+ only for Errors/Warnings)
const productionMinLevel = LOG_LEVELS.WARN;
const developmentMinLevel = LOG_LEVELS.DEBUG;

const currentMinLevel = isProduction ? productionMinLevel : developmentMinLevel;

/**
 * Format log message with timestamp and metadata
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} component - Component/module name
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata to log
 * @returns {object} Formatted log entry
 */
function formatLogEntry(level, component, message, metadata = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    component,
    message,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    env: isProduction ? 'production' : 'development',
  };
}

/**
 * Get emoji prefix based on log level
 * @param {string} level - Log level
 * @returns {string} Emoji prefix
 */
function getEmojiPrefix(level) {
  const emojis = {
    DEBUG: '🔍',
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌',
  };
  return emojis[level] || '';
}

/**
 * Log debug message (lowest priority)
 * Only shown in development
 * @param {string} component - Component/module name
 * @param {string} message - Debug message
 * @param {object} metadata - Additional data to log
 */
export function logDebug(component, message, metadata = {}) {
  if (LOG_LEVELS.DEBUG < currentMinLevel) return;

  const entry = formatLogEntry('DEBUG', component, message, metadata);
  console.log(
    `${getEmojiPrefix('DEBUG')} [${entry.component}] ${message}`,
    Object.keys(metadata).length > 0 ? metadata : ''
  );
}

/**
 * Log info message (normal operations)
 * @param {string} component - Component/module name
 * @param {string} message - Info message
 * @param {object} metadata - Additional data to log
 */
export function logInfo(component, message, metadata = {}) {
  if (LOG_LEVELS.INFO < currentMinLevel) return;

  const entry = formatLogEntry('INFO', component, message, metadata);
  console.info(
    `${getEmojiPrefix('INFO')} [${entry.component}] ${message}`,
    Object.keys(metadata).length > 0 ? metadata : ''
  );
}

/**
 * Log warning message (potential issues)
 * @param {string} component - Component/module name
 * @param {string} message - Warning message
 * @param {object} metadata - Additional data to log
 */
export function logWarn(component, message, metadata = {}) {
  if (LOG_LEVELS.WARN < currentMinLevel) return;

  const entry = formatLogEntry('WARN', component, message, metadata);
  console.warn(
    `${getEmojiPrefix('WARN')} [${entry.component}] ${message}`,
    Object.keys(metadata).length > 0 ? metadata : ''
  );

  // In production, track warnings
  if (isProduction) {
    trackToMonitoringService(entry);
  }
}

/**
 * Log error message (failures that need attention)
 * @param {string} component - Component/module name
 * @param {string} message - Error message
 * @param {Error|object} error - Error object or additional metadata
 * @param {object} metadata - Additional data to log
 */
export function logError(component, message, error = null, metadata = {}) {
  if (LOG_LEVELS.ERROR < currentMinLevel) return;

  const errorMetadata = {
    ...metadata,
    ...(error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    } : { error }),
  };

  const entry = formatLogEntry('ERROR', component, message, errorMetadata);
  console.error(
    `${getEmojiPrefix('ERROR')} [${entry.component}] ${message}`,
    errorMetadata
  );

  // Always track errors in production
  if (isProduction) {
    trackToMonitoringService(entry);
  }
}

/**
 * Log performance metrics
 * @param {string} component - Component name
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in ms
 * @param {boolean} success - Whether operation succeeded
 */
export function logPerformance(component, operation, duration, success = true) {
  const _level = success ? 'INFO' : 'WARN';
  const message = `${operation} took ${duration}ms`;

  if (success && !isDevelopment) return; // Skip dev logging for successful perf in production

  logInfo(component, message, { operation, duration, success });
}

/**
 * Log database operation
 * @param {string} operation - Operation type (read, write, update, delete)
 * @param {string} path - Database path
 * @param {object} data - Data involved (sanitized for security)
 * @param {boolean} success - Whether operation succeeded
 * @param {Error} error - Error if failed
 */
export function logDatabaseOperation(operation, path, data = null, success = true, error = null) {
  const component = 'Firebase';
  const message = `Database ${operation.toUpperCase()} on ${path} ${success ? '✓' : '✗'}`;

  if (success) {
    logDebug(component, message, { operation, path, recordCount: data?.length });
  } else {
    logError(component, message, error, { operation, path });
  }
}

/**
 * Log authentication event
 * @param {string} event - Event type (login, logout, signup, etc.)
 * @param {object} metadata - Event metadata (sanitized)
 * @param {Error} error - Error if failed
 */
export function logAuthEvent(event, metadata = {}, error = null) {
  const component = 'Authentication';
  const sanitized = {
    ...metadata,
    email: metadata.email ? '***@***.com' : undefined, // Don't log full emails
  };

  if (error) {
    logWarn(component, `Auth ${event} failed`, { event, ...sanitized, error: error.message });
  } else {
    logInfo(component, `Auth ${event} successful`, { event, ...sanitized });
  }
}

/**
 * Log validation failure
 * @param {string} component - Component name
 * @param {string} fieldName - Field that failed validation
 * @param {string} rule - Validation rule that failed
 */
export function logValidationError(component, fieldName, rule) {
  logWarn(component, `Validation failed for ${fieldName}`, { field: fieldName, rule });
}

/**
 * Log network error
 * @param {string} component - Component name
 * @param {string} operation - Operation that failed
 * @param {Error} error - Network error
 * @param {number} retryCount - Number of retries attempted
 */
export function logNetworkError(component, operation, error, retryCount = 0) {
  const message = `Network error during ${operation}${retryCount > 0 ? ` (Retry ${retryCount})` : ''}`;
  logError(component, message, error, { operation, retryCount });
}

/**
 * Send log entry to production monitoring service
 * Currently logs to console; integrate with Sentry, LogRocket, etc. in future
 * @param {object} entry - Formatted log entry
 */
function trackToMonitoringService(entry) {
  // TODO: Integrate with Sentry, Firebase Crashlytics, LogRocket, etc.
  // Example for Sentry:
  // if (window.Sentry) {
  //   window.Sentry.captureMessage(entry.message, entry.level.toLowerCase());
  // }

  // For now, just ensure it's visible in console in production
  if (isProduction && entry.level === 'ERROR') {
    console.error('[PROD ERROR TRACKING]', entry);
  }
}

/**
 * Create a scoped logger for a specific component
 * @param {string} componentName - Name of the component
 * @returns {object} Logger object with methods bound to component
 */
export function createLogger(componentName) {
  return {
    debug: (msg, meta) => logDebug(componentName, msg, meta),
    info: (msg, meta) => logInfo(componentName, msg, meta),
    warn: (msg, meta) => logWarn(componentName, msg, meta),
    error: (msg, err, meta) => logError(componentName, msg, err, meta),
    perf: (op, dur, success) => logPerformance(componentName, op, dur, success),
    auth: (event, meta, err) => logAuthEvent(event, meta, err),
    db: (op, path, data, success, err) => logDatabaseOperation(op, path, data, success, err),
    validation: (field, rule) => logValidationError(componentName, field, rule),
    network: (op, err, retries) => logNetworkError(componentName, op, err, retries),
  };
}

/**
 * Clear all production logs (for testing)
 */
export function clearLogs() {
  // In production monitoring, implement log clearing/archiving
}

export default {
  logDebug,
  logInfo,
  logWarn,
  logError,
  logPerformance,
  logDatabaseOperation,
  logAuthEvent,
  logValidationError,
  logNetworkError,
  createLogger,
  clearLogs,
};
