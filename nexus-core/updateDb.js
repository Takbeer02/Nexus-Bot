const { exec } = require('child_process');
const logger = require('./logger');

/**
 * Run database migrations to update the schema
 */
async function updateDatabase() {
  logger.info('Updating database schema...');
  
  try {
    // Format schema first
    await runCommand('npx prisma format');
    
    // Generate Prisma client with updated schema
    await runCommand('npx prisma generate');
    
    // Create and apply migration
    await runCommand('npx prisma migrate dev --name add_settings_field');
    
    logger.info('Database schema updated successfully');
    return true;
  } catch (error) {
    logger.error('Failed to update database:', error);
    throw error;
  }
}

/**
 * Run a command and return a promise
 * @param {string} cmd - Command to run
 * @returns {Promise<string>} - Command output
 */
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Command failed: ${cmd}`);
        logger.error(`Error: ${stderr || error.message}`);
        return reject(error);
      }
      logger.info(`Command succeeded: ${cmd}`);
      resolve(stdout);
    });
  });
}

// Export the function to be used in other files
module.exports = { updateDatabase };

// Run directly if this script is executed directly
if (require.main === module) {
  updateDatabase()
    .then(() => {
      logger.info('Database update completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Database update failed:', error);
      process.exit(1);
    });
}
