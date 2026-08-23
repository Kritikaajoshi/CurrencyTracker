const rateLimit = require('express-rate-limit');

// Protects our own API (and by extension our Fixer quota) from abuse.
// Auth routes get a tighter limit to slow down credential stuffing.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

module.exports = { generalLimiter, authLimiter };
