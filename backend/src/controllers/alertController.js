const asyncHandler = require('express-async-handler');
const RateAlert = require('../models/RateAlert');
const ApiError = require('../utils/ApiError');

// GET /api/alerts
const getAlerts = asyncHandler(async (req, res) => {
  const items = await RateAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

// POST /api/alerts  { from, to, direction, targetRate }
const createAlert = asyncHandler(async (req, res) => {
  const { from, to, direction, targetRate } = req.body;
  const item = await RateAlert.create({
    user: req.user._id,
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    direction,
    targetRate: Number(targetRate),
  });
  res.status(201).json({ item });
});

// DELETE /api/alerts/:id
const cancelAlert = asyncHandler(async (req, res) => {
  const item = await RateAlert.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: 'cancelled' },
    { new: true }
  );
  if (!item) {
    throw new ApiError(404, 'Alert not found');
  }
  res.json({ item });
});

module.exports = { getAlerts, createAlert, cancelAlert };
