const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Default configuration
const defaultConfig = {
  prefix: "!",
  adminIDs: ["100072936185948"], // Default admin ID(s)
  name: "Nexus",
  version: "1.1.1",
  auth: {
    appstatePath: "appstate.json",
    forceLogin: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  },
  database: {
    backupInterval: 86400000, // 24 hours
    backupPath: "database/backup"
  },
  logging: {
    level: "info",
    logToConsole: true,
    logToFile: true,
    logPath: "logs"
  }
};

// Config cache
let cachedConfig = null;

/**
 * Load configuration from file
 * @param {boolean} [reload=false] Force reload from disk
 * @returns {Object} Merged configuration
 */
function load(reload = false) {
  if (cachedConfig && !reload) {
    return cachedConfig;
  }

  try {
    const configPath = path.join(process.cwd(), 'config.json');
    
    if (!fs.existsSync(configPath)) {
      logger.warn('Config file not found, creating default config');
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
      cachedConfig = { ...defaultConfig };
      return cachedConfig;
    }
    
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Deep merge configs, with file values taking precedence
    cachedConfig = deepMerge(defaultConfig, fileConfig);
    return cachedConfig;
  } catch (error) {
    logger.error('Error loading config:', error);
    logger.info('Using default configuration');
    return defaultConfig;
  }
}

/**
 * Save configuration to file
 * @param {Object} config Configuration object to save
 * @returns {boolean} Success status
 */
function save(config) {
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    cachedConfig = { ...config };
    return true;
  } catch (error) {
    logger.error('Error saving config:', error);
    return false;
  }
}

/**
 * Add an admin ID to the configuration
 * @param {string} adminID Admin user ID to add
 * @returns {boolean} Success status
 */
function addAdmin(adminID) {
  const config = load();
  if (!config.adminIDs) {
    config.adminIDs = [];
  }
  
  // Don't add duplicates
  if (!config.adminIDs.includes(adminID)) {
    config.adminIDs.push(adminID);
    return save(config);
  }
  
  return true;
}

/**
 * Remove an admin ID from the configuration
 * @param {string} adminID Admin user ID to remove
 * @returns {boolean} Success status
 */
function removeAdmin(adminID) {
  const config = load();
  if (!config.adminIDs) {
    return true;
  }
  
  const index = config.adminIDs.indexOf(adminID);
  if (index !== -1) {
    config.adminIDs.splice(index, 1);
    return save(config);
  }
  
  return true;
}

/**
 * Deep merge two objects
 * @param {Object} target Target object
 * @param {Object} source Source object
 * @returns {Object} Merged object
 * @private
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is an object
 * @param {*} item Value to check
 * @returns {boolean} True if object
 * @private
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

module.exports = {
  load,
  save,
  addAdmin,
  removeAdmin
};
