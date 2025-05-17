const logger = require('./logger');

async function initializeDatabase() {
    try {
        logger.info('Database initialization skipped as Prisma usage is removed');
        return true;
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
    }
}

module.exports = { initializeDatabase };
