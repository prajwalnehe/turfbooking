import Booking from '../models/Booking.model.js';
import Slot from '../models/Slot.model.js';
import Turf from '../models/Turf.model.js';
import { razorpay } from '../config/razorpay.js';
import { normalizeDate, getDateRange } from '../utils/dateUtils.js';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { turfId, date, time, startTime, endTime, duration } = req.body;

    // Support both old format (time + duration) and new format (startTime + endTime)
    let bookingStartTime, bookingEndTime, bookingDuration;

    if (startTime && endTime) {
      // New range-based system
      bookingStartTime = startTime;
      bookingEndTime = endTime;
      // Calculate duration from time range (in hours)
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      bookingDuration = (endMinutes - startMinutes) / 60;
    } else if (time && duration) {
      // Legacy single time slot system
      bookingStartTime = time;
      bookingEndTime = null;
      bookingDuration = duration;
    } else {
      return res.status(400).json({ message: 'Please provide either (startTime and endTime) or (time and duration)' });
    }

    // Validate input
    if (!turfId || !date || !bookingStartTime || !bookingDuration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get turf and calculate amount
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    if (!turf.isActive || !turf.isApproved) {
      return res.status(400).json({ message: 'Turf is not available for booking' });
    }

    const totalAmount = turf.pricePerHour * bookingDuration;
    // Calculate 25% advance payment
    const advanceAmount = Math.round(totalAmount * 0.25);
    const remainingAmount = totalAmount - advanceAmount;

    // Generate all time slots in the range (30-minute intervals)
    const generateTimeSlotsInRange = (start, end) => {
      const slots = [];
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
      return slots;
    };

    const timeSlotsToCheck = bookingEndTime 
      ? generateTimeSlotsInRange(bookingStartTime, bookingEndTime)
      : [bookingStartTime];

    // Normalize date to start of day for consistent comparison
    const bookingDate = normalizeDate(date);
    const { start: dateStart, end: dateEnd } = getDateRange(date);

    console.log('📅 Booking Request:', {
      turfId,
      date,
      bookingStartTime,
      bookingEndTime,
      bookingDuration,
      timeSlotsToCheck,
      bookingDate: bookingDate.toISOString(),
    });

    // Check if all slots in the range are available (using date range query)
    const existingSlots = await Slot.find({
      turfId,
      date: {
        $gte: dateStart,
        $lt: dateEnd,
      },
      time: { $in: timeSlotsToCheck },
    });

    console.log(`🔍 Found ${existingSlots.length} existing slot(s) in range:`, existingSlots.map(s => ({ time: s.time, isBooked: s.isBooked })));

    const unavailableSlots = existingSlots.filter(s => s.isBooked || s.isBlocked);
    if (unavailableSlots.length > 0) {
      console.log('❌ Unavailable slots found:', unavailableSlots.map(s => ({ time: s.time, isBooked: s.isBooked, isBlocked: s.isBlocked })));
      return res.status(400).json({ 
        message: `Time range not available. Slot ${unavailableSlots[0].time} is already booked or blocked.` 
      });
    }

    console.log('✅ All slots available. Creating booking...');

    // Create or get slots for all times in the range
    const createdSlots = [];
    for (const timeSlot of timeSlotsToCheck) {
      let slot = existingSlots.find(s => s.time === timeSlot);
      if (!slot) {
        slot = await Slot.create({
          turfId,
          date: bookingDate,
          time: timeSlot,
          isBooked: false,
        });
      }
      createdSlots.push(slot);
    }

    // Use the first slot as the primary slot reference
    const slot = createdSlots[0];

    // Create Razorpay order for 25% advance payment
    const razorpayOrder = await razorpay.orders.create({
      amount: advanceAmount * 100, // Amount in paise (25% advance)
      currency: 'INR',
      receipt: `booking_advance_${Date.now()}`,
        notes: {
          userId: req.user.id,
          turfId,
          slotId: slot._id.toString(),
          date,
          time: bookingStartTime,
          startTime: bookingStartTime,
          endTime: bookingEndTime || '',
          duration: bookingDuration.toString(),
          paymentType: 'advance',
          totalAmount: totalAmount.toString(),
          advanceAmount: advanceAmount.toString(),
        },
    });

    // Create booking with pending status (advance payment pending)
    const booking = await Booking.create({
      userId: req.user.id,
      turfId,
      slotId: slot._id,
      date: bookingDate,
      time: bookingStartTime, // Keep for backward compatibility
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      duration: bookingDuration,
      totalAmount,
      advanceAmount,
      remainingAmount,
      isAdvancePaid: false,
      isFullAmountPaid: false,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    // Mark all slots in the range as booked
    console.log(`✅ Marking ${createdSlots.length} slot(s) as booked:`, createdSlots.map(s => s.time));
    for (const slotToUpdate of createdSlots) {
      slotToUpdate.isBooked = true;
      slotToUpdate.bookingId = booking._id;
      await slotToUpdate.save();
    }
    console.log('✅ Booking created successfully:', booking._id);

    res.status(201).json({
      success: true,
      data: booking,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('turfId', 'name sportType location images pricePerHour')
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('turfId', 'name sportType location images pricePerHour owner')
      .populate('slotId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (booking.userId._id.toString() !== req.user.id && 
        booking.turfId.owner.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Cancelled by user';
    
    // Refund logic (if payment was successful)
    if (booking.razorpayPaymentId && booking.status === 'confirmed') {
      // In production, implement actual Razorpay refund API call here
      booking.refundStatus = 'pending';
      booking.refundAmount = booking.totalAmount;
    }

    await booking.save();

    // Release the slot
    const slot = await Slot.findById(booking.slotId);
    if (slot) {
      slot.isBooked = false;
      slot.bookingId = null;
      await slot.save();
    }

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for turf owner
// @route   GET /api/bookings/owner/my-bookings
// @access  Private (Owner)
export const getOwnerBookings = async (req, res, next) => {
  try {
    // Get all turfs owned by the user
    const turfs = await Turf.find({ owner: req.user.id }).select('_id');
    const turfIds = turfs.map(t => t._id);

    const bookings = await Booking.find({ turfId: { $in: turfIds } })
      .populate('turfId', 'name sportType')
      .populate('userId', 'name email phone')
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};




