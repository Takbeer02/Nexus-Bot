const config = require('../config.json');
const logger = require('./logger');
const rateLimit = require('./rateLimit');

// Add human behavior simulation
const humanBehavior = {
  typingSpeed: {
    min: 50,
    max: 200
  },
  readingTime: {
    min: 1000,
    max: 5000
  },
  replyDelay: {
    min: 2000,
    max: 10000
  }
};

let isInBreak = false;
let dailyMessageCount = 0;

function processMessage(message) {
  const currentTime = Date.now();
  const hour = new Date().getHours();

  // Check active hours
  if (hour < config.systemConfig.behavior.activeHours.start || hour >= config.systemConfig.behavior.activeHours.end) {
    logger.warn('Message blocked: Outside active hours');
    return false;
  }

  // Check if in break
  if (isInBreak) {
    logger.warn('Message blocked: Bot is taking a break');
    return false;
  }

  // Check rate limits
  if (rateLimit.isLimited(message.senderID, 'message')) {
    logger.warn('Message blocked: Rate limit exceeded');
    return false;
  }

  if (dailyMessageCount >= config.systemConfig.safety.maxDailyMessages) {
    logger.warn('Message blocked: Daily limit reached');
    return false;
  }

  // Check content filters
  if (config.systemConfig.safety.moderation.contentFilter.some(word => message.body?.includes(word))) {
    logger.warn('Message blocked: Filtered content');
    return false;
  }

  // Update counters
  dailyMessageCount++;

  // Random break check
  if (config.systemConfig.behavior.autoBreaks?.enabled && Math.random() < 0.1) {
    takeBreak();
  }

  return true;
}

function takeBreak() {
  if (isInBreak) return;
  
  isInBreak = true;
  const duration = Math.floor(
    Math.random() * 
    (config.systemConfig.behavior.autoBreaks?.maxDuration - config.systemConfig.behavior.autoBreaks?.minDuration) +
    config.systemConfig.behavior.autoBreaks?.minDuration
  );

  logger.info(`Taking a break for ${duration/1000} seconds`);
  
  setTimeout(() => {
    isInBreak = false;
    logger.info('Break finished');
  }, duration);
}

// Reset daily count at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    dailyMessageCount = 0;
    logger.info('Daily message count reset');
  }
}, 60000);

function simulateHumanTyping(messageLength) {
  const typingSpeed = Math.random() * 
    (humanBehavior.typingSpeed.max - humanBehavior.typingSpeed.min) + 
    humanBehavior.typingSpeed.min;
  return Math.floor((messageLength / typingSpeed) * 60 * 1000);
}

// Add to exports
module.exports = { 
  processMessage, 
  simulateHumanTyping
};
