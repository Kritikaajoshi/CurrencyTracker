const mongoose = require('mongoose');

const rateAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: String, required: true, uppercase: true },
    to: { type: String, required: true, uppercase: true },
    // "above" fires when rate >= targetRate, "below" fires when rate <= targetRate
    direction: { type: String, enum: ['above', 'below'], required: true },
    targetRate: { type: Number, required: true },
    status: { type: String, enum: ['active', 'triggered', 'cancelled'], default: 'active' },
    triggeredAt: { type: Date, default: null },
    triggeredRate: { type: Number, default: null },
  },
  { timestamps: true }
);

rateAlertSchema.index({ status: 1, from: 1, to: 1 });

module.exports = mongoose.model('RateAlert', rateAlertSchema);
