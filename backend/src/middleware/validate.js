const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Run after express-validator's check() chains. Collects all validation
 * failures into one readable error instead of failing on the first one.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => `${e.path}: ${e.msg}`)
      .join('; ');
    throw new ApiError(400, message);
  }
  next();
}

module.exports = validate;
