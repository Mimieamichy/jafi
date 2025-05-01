const NodeCache = require("node-cache");

// Default TTL is 5 minutes (in seconds)
exports.cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });
;
