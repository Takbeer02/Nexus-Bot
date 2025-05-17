const { loadCommands, initializeCommandWatcher } = require('./commandHandler');
const { loadEvents } = require('./eventHandler');
const { initGithub } = require('./githubSync');
const logger = require('./logger');
const config = require('./configLoader').load();

async function initializeBot() {
  try {
    logger.info('Initializing bot components...');

    // Load commands
    loadCommands();
    initializeCommandWatcher();

    // Load events
    loadEvents();

    // Initialize GitHub integration if enabled
    if (config.github?.enabled) {
      initGithub(config.github);
    }

    logger.info('Bot components initialized successfully.');
  } catch (error) {
    logger.error('Error during bot initialization:', error);
    throw error;
  }
}

module.exports = { initializeBot };
