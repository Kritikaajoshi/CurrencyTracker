const NodeCache = require('node-cache');

// stdTTL is set per-key when we call .set(), this default is just a fallback
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = cache;
