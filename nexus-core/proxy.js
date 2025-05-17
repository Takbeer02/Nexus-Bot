const config = require('../config.json');

function getRandomProxy() {
  if (!config.systemConfig.proxy.enabled) {
    return null;
  }
  const proxies = config.systemConfig.proxy.list;
  return proxies[Math.floor(Math.random() * proxies.length)];
}

module.exports = { getRandomProxy };
