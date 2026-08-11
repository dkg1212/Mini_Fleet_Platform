const mongoose = require('mongoose');

const { RIDE_STATUSES } = require('../utils/rideStatuses');

const rideHistorySchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    previousStatus: {
      type: String,
      enum: RIDE_STATUSES,
      default: null
    },
    newStatus: {
      type: String,
      enum: RIDE_STATUSES,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    },
    versionKey: false
  }
);

rideHistorySchema.index({ rideId: 1 });
rideHistorySchema.index({ createdAt: 1 });

module.exports = mongoose.model('RideHistory', rideHistorySchema);

