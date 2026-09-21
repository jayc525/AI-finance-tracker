const cache = require("../config/cache");

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Generate a unique cache key based on the user ID, route path, and query params
    const key = `cache_${req.userId}_${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    } else {
      // Overwrite res.json to intercept the response and cache it
      res.originalJson = res.json;
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body, duration);
        }
        res.originalJson(body);
      };
      next();
    }
  };
};

// Helper function to clear cache for a specific user
const clearUserCache = (userId) => {
  const keys = cache.keys();
  const userKeys = keys.filter(key => key.startsWith(`cache_${userId}_`));
  if (userKeys.length > 0) {
    cache.del(userKeys);
  }
};

module.exports = { cacheMiddleware, clearUserCache };
