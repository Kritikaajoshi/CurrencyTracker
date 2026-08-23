const express = require('express');
const { query, body } = require('express-validator');
const {
  latest,
  convertCurrency,
  trend,
  history,
} = require('../controllers/currencyController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Public: anyone can check live rates without an account
router.get('/latest', [query('base').optional().isLength({ min: 3, max: 3 })], validate, latest);

router.get(
  '/trend',
  [
    query('from').optional().isLength({ min: 3, max: 3 }),
    query('to').optional().isLength({ min: 3, max: 3 }),
    query('days').optional().isInt({ min: 1, max: 30 }),
  ],
  validate,
  trend
);

// Authenticated: conversions get logged against the user
router.post(
  '/convert',
  protect,
  [
    body('from').isLength({ min: 3, max: 3 }),
    body('to').isLength({ min: 3, max: 3 }),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
  ],
  validate,
  convertCurrency
);

router.get('/history', protect, history);

module.exports = router;
