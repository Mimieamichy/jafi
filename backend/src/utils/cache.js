const NodeCache = require("node-cache");

// Default TTL is 5 minutes (in seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

module.exports = cache

