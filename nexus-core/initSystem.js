const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const sqlite3 = require('sqlite3').verbose();

/**
 * System initialization tasks
 */
class InitSystem {
  /**
   * Initialize system components
   * @returns {Promise<boolean>}
   */
  static async initialize() {
    try {
      // Try loading from database first
      try {
        await this.loadThreadPrefixesFromDB();
      } catch (prefixError) {
        logger.warn(`Failed to load thread prefixes from database: ${prefixError.message}`);
        // Fall back to file-based loading
        await this.loadThreadPrefixesFromFile();
      }
      
      try {
        await this.loadCustomKeywordsFromDB();
      } catch (keywordError) {
        logger.warn(`Failed to load custom keywords from database: ${keywordError.message}`);
        // Fall back to file-based loading
        await this.loadCustomKeywordsFromFile();
      }
      
      return true;
    } catch (error) {
      logger.error('Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Initialize system components from files (fallback if database fails)
   * @returns {Promise<boolean>}
   */
  static async initializeFromFiles() {
    try {
      await this.loadThreadPrefixesFromFile();
      await this.loadCustomKeywordsFromFile();
      
      return true;
    } catch (error) {
      logger.error('File-based initialization error:', error);
      return false;
    }
  }
  
  /**
   * Load thread-specific prefixes from database
   * @returns {Promise<Map<string, string>>}
   */
  static async loadThreadPrefixesFromDB() {
    try {
      // Initialize global thread prefixes map
      global.threadPrefixes = new Map();
      
      // Path to database
      const dbPath = path.join(process.cwd(), 'database', 'data.db');
      
      // Check if database exists
      if (!fs.existsSync(dbPath)) {
        logger.info('Database not found, no thread prefixes to load');
        return global.threadPrefixes;
      }
      
      // Connect to database
      const db = new sqlite3.Database(dbPath);
      
      // Query prefixes
      await new Promise((resolve, reject) => {
        db.all('SELECT thread_id, prefix FROM thread_prefixes', (err, rows) => {
          if (err) {
            logger.error('Error loading thread prefixes from database:', err.message);
            reject(err);
            return;
          }
          
          // Add prefixes to map
          rows.forEach(row => {
            global.threadPrefixes.set(row.thread_id, row.prefix);
          });
          
          logger.info(`Loaded ${rows.length} custom thread prefixes from database`);
          resolve();
        });
      });
      
      // Close database
      await new Promise(resolve => db.close(() => resolve()));
      
      return global.threadPrefixes;
    } catch (error) {
      logger.error('Error loading thread prefixes:', error);
      global.threadPrefixes = new Map(); // Ensure it's defined even on error
      return global.threadPrefixes;
    }
  }
  
  /**
   * Load thread-specific prefixes from JSON file
   * @returns {Promise<Map<string, string>>}
   */
  static async loadThreadPrefixesFromFile() {
    try {
      // Initialize global thread prefixes map
      global.threadPrefixes = new Map();
      
      // Path to prefixes file
      const prefixPath = path.join(process.cwd(), 'database', 'prefixes.json');
      
      // Check if file exists
      if (!fs.existsSync(prefixPath)) {
        logger.info('No prefixes file found, using empty map');
        return global.threadPrefixes;
      }
      
      // Read prefix data
      const prefixData = JSON.parse(fs.readFileSync(prefixPath, 'utf8'));
      
      // Add prefixes to map
      Object.entries(prefixData).forEach(([threadID, prefix]) => {
        global.threadPrefixes.set(threadID, prefix);
      });
      
      logger.info(`Loaded ${global.threadPrefixes.size} custom thread prefixes from file`);
      return global.threadPrefixes;
    } catch (error) {
      logger.error('Error loading thread prefixes from file:', error);
      global.threadPrefixes = new Map(); // Ensure it's defined even on error
      return global.threadPrefixes;
    }
  }
  
  /**
   * Load custom keywords from database
   * @returns {Promise<Map<string, object>>}
   */
  static async loadCustomKeywordsFromDB() {
    try {
      // Initialize global custom keywords map
      global.customKeywords = new Map();
      
      // Path to database
      const dbPath = path.join(process.cwd(), 'database', 'data.db');
      
      // Check if database exists
      if (!fs.existsSync(dbPath)) {
        logger.info('Database not found, no custom keywords to load');
        return global.customKeywords;
      }
      
      // Connect to database
      const db = new sqlite3.Database(dbPath);
      
      // Query keywords
      await new Promise((resolve, reject) => {
        db.all('SELECT id, trigger_word, response FROM keywords', (err, rows) => {
          if (err) {
            logger.error('Error loading custom keywords from database:', err.message);
            reject(err);
            return;
          }
          
          // Add keywords to map
          rows.forEach(row => {
            global.customKeywords.set(row.id, {
              triggers: [row.trigger_word],
              response: row.response
            });
          });
          
          logger.info(`Loaded ${rows.length} custom keywords from database`);
          resolve();
        });
      });
      
      // Close database
      await new Promise(resolve => db.close(() => resolve()));
      
      return global.customKeywords;
    } catch (error) {
      logger.error('Error loading custom keywords:', error);
      global.customKeywords = new Map(); // Ensure it's defined even on error
      return global.customKeywords;
    }
  }
  
  /**
   * Load custom keywords from JSON file
   * @returns {Promise<Map<string, object>>}
   */
  static async loadCustomKeywordsFromFile() {
    try {
      // Initialize global custom keywords map
      global.customKeywords = new Map();
      
      // Path to keywords file
      const keywordPath = path.join(process.cwd(), 'database', 'keywords.json');
      
      // Check if file exists
      if (!fs.existsSync(keywordPath)) {
        logger.info('No keywords file found, using empty map');
        return global.customKeywords;
      }
      
      // Read keyword data
      const keywordData = JSON.parse(fs.readFileSync(keywordPath, 'utf8'));
      
      // Add keywords to map
      Object.entries(keywordData).forEach(([id, keyword]) => {
        global.customKeywords.set(id, keyword);
      });
      
      logger.info(`Loaded ${global.customKeywords.size} custom keywords from file`);
      return global.customKeywords;
    } catch (error) {
      logger.error('Error loading custom keywords from file:', error);
      global.customKeywords = new Map(); // Ensure it's defined even on error
      return global.customKeywords;
    }
  }

  /**
   * Batch sync all threads and users to the database at startup
   * @param {Object} api - Facebook API instance
   */
  static async batchSyncDatabaseEntities(api) {
    const dbManager = require('./dbManager');
    const ThreadHelper = require('./threadHelper');
    try {
      logger.info('Starting batch sync of threads and users to database...');
      // 1. Fetch all threads (increase limit as needed)
      const threads = await ThreadHelper.getThreadList(api, 100);
      let totalUsers = 0;
      for (const thread of threads) {
        if (!thread.threadID) continue;
        // 2. Ensure thread exists in DB
        await dbManager.createGroup(thread.threadID, thread.name || 'Unknown Group');
        // 3. Fetch full thread info (for participants)
        let threadInfo;
        try {
          threadInfo = await ThreadHelper.getThreadInfo(api, thread.threadID);
        } catch (err) {
          logger.warn(`Failed to fetch info for thread ${thread.threadID}: ${err.message}`);
          continue;
        }
        // 4. Add all participants to DB
        const participants = threadInfo.participantIDs || [];
        if (participants.length > 0) {
          const userInfos = await ThreadHelper.getUsersInfo(api, participants);
          for (const userID of participants) {
            const name = userInfos[userID]?.name || 'Unknown User';
            await dbManager.createUser(userID, name);
            totalUsers++;
          }
        }
        // 5. Optionally update thread admins
        if (global.permissionManager && threadInfo.isGroup) {
          await global.permissionManager.refreshThreadAdmins(api, thread.threadID).catch(() => {});
        }
      }
      logger.info(`Batch sync complete: ${threads.length} threads, ${totalUsers} users processed.`);
    } catch (error) {
      logger.error('Batch sync error:', error);
    }
  }
}

module.exports = InitSystem;
