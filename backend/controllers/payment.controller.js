import crypto from 'crypto';
import Booking from '../models/Booking.model.js';
import Slot from '../models/Slot.model.js';

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: Missing parameters' });
    }

    // Find booking by razorpay order id
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Payment verification failed - release slot
      const slot = await Slot.findById(booking.slotId);
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
        await slot.save();
      }

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancellationReason = 'Payment verification failed';
      await booking.save();

      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Payment verified - update booking
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentId = razorpay_payment_id;
    booking.isAdvancePaid = true;
    // Booking is confirmed with advance payment
    // Full payment will be collected later or at venue
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:bookingId
// @access  Private
export const getPaymentStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('turfId', 'name')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: {
        status: booking.status,
        paymentId: booking.razorpayPaymentId,
        amount: booking.totalAmount,
        booking: booking,
      },
    });
  } catch (error) {
    next(error);
  }
};




