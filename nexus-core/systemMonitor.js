const os = require('os');
const logger = require('./logger');
const { getNotifier } = require('../utils/adminNotifier');

/**
 * System monitoring and notification utility
 */
class SystemMonitor {
  /**
   * Initialize with API instance
   * @param {Object} api - Facebook API instance
   */
  constructor(api) {
    this.api = api;
    this.notifier = getNotifier(api);
    this.startTime = Date.now();
    
    // Set up error handlers
    this.setupErrorHandlers();
  }

  /**
   * Set up global error handlers
   */
  setupErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      this.notifier.notifyError(error, { source: 'Uncaught Exception' });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection:', reason);
      this.notifier.notifyError(reason, { source: 'Unhandled Promise Rejection' });
    });
  }
  
  /**
   * Get system information
   * @returns {Object} System information
   */
  getSystemInfo() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    return {
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      platform: os.platform(),
      arch: os.arch(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAvg: os.loadavg(),
      cpuCount: os.cpus().length
    };
  }
  
  /**
   * Send startup notification to admins
   * @param {Object} info - Additional startup info
   */
  async notifyStartup(info = {}) {
    const sysInfo = this.getSystemInfo();
    
    const message = `System started successfully!
Platform: ${sysInfo.platform} (${sysInfo.arch})
Memory: ${Math.round(sysInfo.memoryUsage.rss / 1024 / 1024)}MB / ${Math.round(sysInfo.totalMemory / 1024 / 1024)}MB
CPU Cores: ${sysInfo.cpuCount}
${info.version ? `Version: ${info.version}` : ''}
${info.commandCount ? `Commands: ${info.commandCount}` : ''}`;
    
    await this.notifier.notifySystem(message);
  }
  
  /**
   * Send error notification to admins
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context
   */
  async notifyError(error, context = {}) {
    await this.notifier.notifyError(error, context);
  }
  
  /**
   * Send periodic system status update
   */
  async sendStatusUpdate() {
    const sysInfo = this.getSystemInfo();
    
    const message = `System Status Update:
Uptime: ${sysInfo.uptime}
Memory: ${Math.round(sysInfo.memoryUsage.rss / 1024 / 1024)}MB / ${Math.round(sysInfo.totalMemory / 1024 / 1024)}MB
CPU Load: ${sysInfo.loadAvg[0].toFixed(2)}, ${sysInfo.loadAvg[1].toFixed(2)}, ${sysInfo.loadAvg[2].toFixed(2)}
Heap: ${Math.round(sysInfo.memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(sysInfo.memoryUsage.heapTotal / 1024 / 1024)}MB`;
    
    await this.notifier.notifySystem(message);
  }
}

module.exports = SystemMonitor;
