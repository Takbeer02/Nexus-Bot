// filepath: nexus-core/utils.js
// General utility functions for Nexus Bot

const logger = require('./logger');

// Time formatting: ms to human readable
function formatDuration(ms) {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  const hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const day = Math.floor(ms / (1000 * 60 * 60 * 24));
  let str = '';
  if (day) str += `${day}d `;
  if (hr) str += `${hr}h `;
  if (min) str += `${min}m `;
  if (sec || !str) str += `${sec}s`;
  return str.trim();
}

/**
 * Convert milliseconds to a human-readable time string (e.g. 1d2h3m4s)
 * @param {number} ms
 * @returns {string}
 */
function convertTime(ms) {
  const second = Math.floor(ms / 1000 % 60);
  const minute = Math.floor(ms / 1000 / 60 % 60);
  const hour = Math.floor(ms / 1000 / 60 / 60 % 24);
  const day = Math.floor(ms / 1000 / 60 / 60 / 24 % 30);
  const month = Math.floor(ms / 1000 / 60 / 60 / 24 / 30 % 12);
  const year = Math.floor(ms / 1000 / 60 / 60 / 24 / 30 / 12);
  let formatted = '';
  if (year) formatted += year + 'y';
  if (month) formatted += month + 'M';
  if (day) formatted += day + 'd';
  if (hour) formatted += hour + 'h';
  if (minute) formatted += minute + 'm';
  if (second || !formatted) formatted += second + 's';
  return formatted;
}

// Permission checks
function isAdmin(userID) {
  const config = global.config || {};
  return config.admins && config.admins.includes(userID);
}
function isSuperAdmin(userID) {
  const config = global.config || {};
  return config.owner && config.owner === userID;
}

// Message formatting
function truncate(str, len = 100) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/**
 * Normalize a string (remove accents, convert to lowercase, trim)
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

// Safe API wrapper (auto-retry)
async function safeApiCall(fn, ...args) {
  let retries = 2;
  while (retries--) {
    try {
      return await fn(...args);
    } catch (e) {
      logger.warn('API call failed, retrying...', e.message);
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error('API call failed after retries');
}

module.exports = {
  formatDuration,
  convertTime,
  isAdmin,
  isSuperAdmin,
  truncate,
  normalizeString,
  safeApiCall
};
