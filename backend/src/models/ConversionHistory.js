const mongoose = require('mongoose');

const conversionHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: String, required: true, uppercase: true },
    to: { type: String, required: true, uppercase: true },
    amount: { type: Number, required: true },
    rate: { type: Number, required: true },
    result: { type: Number, required: true },
  },
  { timestamps: true }
);

// Most common query: "give me this user's recent conversions, newest first"
conversionHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ConversionHistory', conversionHistorySchema);
