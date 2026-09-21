const NodeCache = require("node-cache");
// stdTTL is the default time-to-live for cache entries in seconds (5 minutes)
// checkperiod is the time in seconds between cache cleanup runs (2 minutes)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

module.exports = cache;
