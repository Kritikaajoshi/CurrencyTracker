const asyncHandler = require('express-async-handler');
const fixerService = require('../services/fixerService');
const ConversionHistory = require('../models/ConversionHistory');

// GET /api/currency/latest?base=USD
const latest = asyncHandler(async (req, res) => {
  const base = (req.query.base || 'EUR').toUpperCase();
  const data = await fixerService.getLatestRates(base);
  res.json(data);
});

// POST /api/currency/convert  { from, to, amount }
// Authenticated: every conversion is logged so the user has a history.
const convertCurrency = asyncHandler(async (req, res) => {
  const { from, to, amount } = req.body;
  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();
  const numericAmount = Number(amount);

  const { rate, result, date } = await fixerService.convert(fromCode, toCode, numericAmount);

  await ConversionHistory.create({
    user: req.user._id,
    from: fromCode,
    to: toCode,
    amount: numericAmount,
    rate,
    result,
  });

  res.json({ from: fromCode, to: toCode, amount: numericAmount, rate, result, date });
});

// GET /api/currency/trend?from=USD&to=EUR&days=7
const trend = asyncHandler(async (req, res) => {
  const from = (req.query.from || 'USD').toUpperCase();
  const to = (req.query.to || 'EUR').toUpperCase();
  const days = Math.min(Number(req.query.days) || 7, 30);

  const series = await fixerService.getTrend(from, to, days);
  res.json({ from, to, series });
});

// GET /api/currency/history  (authenticated user's own conversion log)
const history = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const items = await ConversionHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ items });
});

module.exports = { latest, convertCurrency, trend, history };
