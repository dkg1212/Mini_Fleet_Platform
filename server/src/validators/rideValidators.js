const { z } = require('zod');

const { RIDE_STATUSES } = require('../utils/rideStatuses');

const objectIdSchema = z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const createRideSchema = z.object({
  pickup: z.string().trim().min(1, 'Pickup is required'),
  destination: z.string().trim().min(1, 'Destination is required'),
  estimatedDistance: z.coerce.number().positive('Estimated distance must be positive'),
  requestedTime: z.coerce.date(),
  notes: z.string().trim().optional()
});

const updateRideStatusSchema = z.object({
  status: z.enum(RIDE_STATUSES)
});

const rideIdParamSchema = z.object({
  id: objectIdSchema
});

const adminRideFiltersSchema = z.object({
  status: z.enum(RIDE_STATUSES).optional(),
  driver: objectIdSchema.optional(),
  customer: objectIdSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
}).refine((data) => {
  if (!data.dateFrom || !data.dateTo) {
    return true;
  }

  return data.dateFrom <= data.dateTo;
}, {
  message: 'dateFrom must be before or equal to dateTo',
  path: ['dateFrom']
});

module.exports = {
  adminRideFiltersSchema,
  createRideSchema,
  rideIdParamSchema,
  updateRideStatusSchema
};
