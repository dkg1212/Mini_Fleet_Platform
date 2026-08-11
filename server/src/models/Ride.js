const mongoose = require('mongoose');

const { RIDE_STATUSES } = require('../utils/rideStatuses');

const rideSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      trim: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    pickup: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    estimatedDistance: {
      type: Number,
      required: true,
      min: 0.01
    },
    estimatedFare: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: RIDE_STATUSES,
      required: true,
      default: 'REQUESTED'
    },
    requestedTime: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    idempotencyKey: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

rideSchema.index({ status: 1 });
rideSchema.index({ customerId: 1 });
rideSchema.index({ driverId: 1 });
rideSchema.index({ requestedTime: 1 });
rideSchema.index({ bookingId: 1 }, { unique: true });
rideSchema.index(
  { status: 1, driverId: 1, requestedTime: 1 },
  {
    partialFilterExpression: {
      status: 'REQUESTED',
      driverId: null
    }
  }
);
rideSchema.index(
  { customerId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: {
        $exists: true,
        $type: 'string'
      }
    }
  }
);

module.exports = mongoose.model('Ride', rideSchema);
