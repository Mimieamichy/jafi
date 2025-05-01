const NodeCache = require("node-cache");

// Default TTL is 5 minutes (in seconds)
const cache = new NodeCache({ stdTTL: 1200, checkperiod: 600 });

module.exports = cache

