const logger = require('./logger');

// Export an empty function to be used in other files
module.exports = {};

// Run directly if this script is executed directly
if (require.main === module) {
  logger.info('This script is no longer in use.');
  process.exit(0);
}
