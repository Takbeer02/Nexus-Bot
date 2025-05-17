const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

async function resetDatabase() {
    try {
        const dbPath = path.join(process.cwd(), 'database', 'data.sqlite');
        
        // Delete existing database if it exists
        if (fs.existsSync(dbPath)) {
            logger.info('Removing existing database...');
            fs.unlinkSync(dbPath);
        }

        // Delete migration folder
        const migrationPath = path.join(process.cwd(), 'prisma', 'migrations');
        if (fs.existsSync(migrationPath)) {
            logger.info('Removing existing migrations...');
            fs.rmSync(migrationPath, { recursive: true, force: true });
        }

        logger.info('Database reset complete!');
        return true;
    } catch (error) {
        logger.error('Failed to reset database:', error);
        throw error;
    }
}

if (require.main === module) {
    resetDatabase().catch(console.error);
}

module.exports = { resetDatabase };
