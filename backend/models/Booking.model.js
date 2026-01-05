import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    default: null,
  },
  endTime: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    default: 1, // in hours
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  advanceAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  isAdvancePaid: {
    type: Boolean,
    default: false,
  },
  isFullAmountPaid: {
    type: Boolean,
    default: false,
  },
  paymentId: {
    type: String,
    default: null,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed'],
    default: 'none',
  },
}, {
  timestamps: true,
});

// Indexes for query optimization
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ turfId: 1, date: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);




