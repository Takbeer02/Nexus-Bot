const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const configLoader = require('./configLoader');
const config = configLoader.load();
const nexusFca = require('nexus-fca');

async function login(options) {
  return await new Promise((resolve, reject) => {
    nexusFca(options, (err, api) => {
      if (err) return reject(err);
      resolve(api);
    });
  });
}

/**
 * Authentication utilities for Facebook login
 */
class Auth {
  /**
   * Login to Facebook with credentials
   * @returns {Promise<Object>} Facebook API object
   */
  static async login() {
    try {
      const appstatePath = path.join(process.cwd(), config?.auth?.appstatePath || 'appstate.json');
      if (!fs.existsSync(appstatePath)) {
        throw new Error(`AppState file not found at ${appstatePath}`);
      }

      const appstate = JSON.parse(fs.readFileSync(appstatePath, 'utf8'));
      logger.info('Loaded AppState successfully');

      const options = {
        appState: appstate,
        forceLogin: config?.auth?.forceLogin || false,
        listenEvents: true,
        logLevel: "silent",
        selfListen: false,
        userAgent: config?.auth?.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      };

      // Use the nexus-fca login method
      return await login(options);
    } catch (error) {
      logger.error('Facebook login failed:', error);
      throw error;
    }
  }

  /**
   * Login with retry mechanism
   * @param {number} maxRetries Maximum number of retries
   * @param {number} delay Delay in ms between retries
   * @returns {Promise<Object>} Facebook API object
   */
  static async loginWithRetry(maxRetries = 3, delay = 5000) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await this.login();
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Failed to login after ${maxRetries} attempts: ${error.message}`);
        }
        logger.warn(`Login attempt ${retries} failed. Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = Auth;
