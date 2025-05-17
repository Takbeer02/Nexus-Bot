// Minimal adminNotifier for compatibility
function getNotifier() {
  return {
    notify: (msg) => {
      // You can implement notification logic here
      console.log('[ADMIN NOTIFY]', msg);
    }
  };
}

module.exports = { getNotifier };
