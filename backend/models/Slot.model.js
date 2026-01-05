import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false, // Owner can block slots
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
}, {
  timestamps: true,
});

// Compound index to prevent double booking
slotSchema.index({ turfId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('Slot', slotSchema);














