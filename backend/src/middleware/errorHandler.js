/* eslint-disable no-unused-vars */
const ApiError = require('../utils/ApiError');

/**
 * Single place that turns any thrown error into a consistent JSON shape.
 * Operational errors (ApiError) show their real message; anything else
 * (a bug) gets logged in full server-side but a generic message client-side
 * so we never leak stack traces to the browser.
 */
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error('[unhandled error]', err);
  return res.status(500).json({ error: 'Something went wrong on our end.' });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
