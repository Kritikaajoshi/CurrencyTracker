/**
 * Lets controllers throw a typed error with an HTTP status attached,
 * instead of scattering res.status(x).json(...) everywhere. The central
 * error handler middleware knows how to unpack these.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = ApiError;
