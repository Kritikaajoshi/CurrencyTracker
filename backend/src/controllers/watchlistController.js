const asyncHandler = require('express-async-handler');
const Watchlist = require('../models/Watchlist');
const fixerService = require('../services/fixerService');
const ApiError = require('../utils/ApiError');

// GET /api/watchlist  -> pairs plus their current live rate
const getWatchlist = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });

  const enriched = await Promise.all(
    items.map(async (item) => {
      try {
        const { rates, date } = await fixerService.getLatestRates(item.from);
        return { ...item.toObject(), currentRate: rates[item.to] ?? null, asOf: date };
      } catch {
        return { ...item.toObject(), currentRate: null, asOf: null };
      }
    })
  );

  res.json({ items: enriched });
});

// POST /api/watchlist  { from, to }
const addToWatchlist = asyncHandler(async (req, res) => {
  const from = req.body.from.toUpperCase();
  const to = req.body.to.toUpperCase();

  const existing = await Watchlist.findOne({ user: req.user._id, from, to });
  if (existing) {
    throw new ApiError(409, `${from}/${to} is already on your watchlist`);
  }

  const item = await Watchlist.create({ user: req.user._id, from, to });
  res.status(201).json({ item });
});

// DELETE /api/watchlist/:id
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const item = await Watchlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) {
    throw new ApiError(404, 'Watchlist item not found');
  }
  res.json({ message: 'Removed', id: req.params.id });
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
