const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: String, required: true, uppercase: true },
    to: { type: String, required: true, uppercase: true },
  },
  { timestamps: true }
);

// A user shouldn't be able to watch the same pair twice
watchlistSchema.index({ user: 1, from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
