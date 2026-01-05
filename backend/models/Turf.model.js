import mongoose from 'mongoose';

const turfSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a turf name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  sportType: {
    type: String,
    required: [true, 'Please specify the sport type'],
    enum: ['football', 'cricket', 'badminton', 'tennis', 'basketball', 'volleyball', 'multi-sport'],
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please specify the price per hour'],
    min: [0, 'Price cannot be negative'],
  },
  images: [{
    type: String,
    required: true,
  }],
  amenities: [{
    type: String,
  }],
  rules: [{
    type: String,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  operatingHours: {
    open: {
      type: String,
      default: '06:00',
    },
    close: {
      type: String,
      default: '22:00',
    },
  },
}, {
  timestamps: true,
});

// Index for search optimization
turfSchema.index({ 'location.city': 1, sportType: 1 });
turfSchema.index({ owner: 1 });

export default mongoose.model('Turf', turfSchema);














