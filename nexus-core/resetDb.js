const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Reset and reinitialize the database
 */
async function resetDatabase() {
  logger.info('Starting database reset process...');
  
  try {
    // 1. Delete the database file if it exists
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      logger.info('Removing existing database file...');
      fs.unlinkSync(dbPath);
      logger.info('Database file deleted');
    }
    
    // 2. Delete migration folder to start fresh
    const migrationDir = path.join(process.cwd(), 'prisma', 'migrations');
    if (fs.existsSync(migrationDir)) {
      logger.info('Removing migration history...');
      fs.rmSync(migrationDir, { recursive: true, force: true });
      logger.info('Migration history deleted');
    }
    
    // 3. Format schema
    logger.info('Formatting Prisma schema...');
    await runCommand('npx prisma format');
    
    // 4. Generate fresh client
    logger.info('Generating Prisma client...');
    await runCommand('npx prisma generate');
    
    // 5. Create and apply new migration
    logger.info('Creating migration...');
    await runCommand('npx prisma migrate dev --name initial_setup --create-only');
    
    logger.info('Applying migration...');
    await runCommand('npx prisma migrate deploy');
    
    logger.info('Database reset and reinitialized successfully!');
    return true;
  } catch (error) {
    logger.error('Database reset failed:', error);
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
module.exports = { resetDatabase };

// Run directly if this script is executed directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      logger.info('Database reset completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Database reset failed:', error);
      process.exit(1);
    });
}
