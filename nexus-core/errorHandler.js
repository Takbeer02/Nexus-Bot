const logger = require('./logger');
const { getNotifier } = require('./adminNotifier');

/**
 * Enhanced error handler with admin notification
 */
class ErrorHandler {
  /**
   * Initialize with API instance
   * @param {Object} api - Facebook API instance
   */
  constructor(api) {
    this.api = api;
    this.notifier = null;
    
    // Initialize notifier if API is provided
    if (api) {
      try {
        this.notifier = getNotifier(api);
      } catch (error) {
        logger.error('Failed to initialize admin notifier:', error);
      }
    }
  }
  
  /**
   * Handle an error with logging and notification
   * @param {Error|string} error - Error object or message
   * @param {Object} [options={}] - Options
   * @param {string} [options.source] - Error source/component
   * @param {string} [options.context] - Error context
   * @param {boolean} [options.notifyAdmin=true] - Whether to notify admins
   * @param {boolean} [options.critical=false] - Whether the error is critical
   */
  async handleError(error, options = {}) {
    const { source = 'Unknown', context = {}, notifyAdmin = true, critical = false } = options;
    
    // Get error details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    
    // Always log the error
    if (critical) {
      logger.error(`[CRITICAL] Error in ${source}: ${errorMessage}`);
    } else {
      logger.error(`Error in ${source}: ${errorMessage}`);
    }
    
    if (errorStack) {
      logger.debug(`Stack trace: ${errorStack}`);
    }
    
    // Notify admins if needed and notifier is available
    if (notifyAdmin && this.notifier) {
      try {
        await this.notifier.notifyError(error, {
          source: source,
          details: JSON.stringify(context),
          hideStack: !critical
        });
      } catch (notifyError) {
        // Don't let notification errors cause more problems
        logger.error('Failed to send admin notification:', notifyError);
      }
    }
    
    // Return formatted error for response
    return {
      success: false,
      error: errorMessage,
      source,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Function to wrap
   * @param {Object} options - Error handling options
   * @returns {Function} Wrapped function
   */
  wrapAsync(fn, options = {}) {
    const handler = this;
    
    return async function(...args) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        return handler.handleError(error, options);
      }
    };
  }
}

let instance = null;

/**
 * Get or create ErrorHandler instance
 * @param {Object} [api] - Facebook API instance
 * @returns {ErrorHandler} ErrorHandler instance
 */
function getErrorHandler(api) {
  if (!instance || api) {
    instance = new ErrorHandler(api);
  }
  
  return instance;
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
  process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (global.adminNotifier) {
      await global.adminNotifier.notifyError(reason, {
        source: 'Unhandled Promise Rejection',
        critical: true
      });
    }
  });

  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    if (global.adminNotifier) {
      await global.adminNotifier.notifyError(error, {
        source: 'Uncaught Exception',
        critical: true
      });
    }
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('Shutting down Nexus Bot...');
    process.exit(0);
  });
}

module.exports = { getErrorHandler, setupErrorHandlers };
