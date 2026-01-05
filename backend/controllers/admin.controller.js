import User from '../models/User.model.js';
import Turf from '../models/Turf.model.js';
import Booking from '../models/Booking.model.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all turfs (including unapproved)
// @route   GET /api/admin/turfs
// @access  Private (Admin)
export const getAllTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: turfs.length,
      data: turfs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject turf
// @route   PUT /api/admin/turfs/:id/approve
// @access  Private (Admin)
export const approveTurf = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    turf.isApproved = isApproved;
    await turf.save();

    res.json({
      success: true,
      data: turf,
      message: isApproved ? 'Turf approved successfully' : 'Turf rejected',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('turfId', 'name location')
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

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTurfs = await Turf.countDocuments();
    const activeTurfs = await Turf.countDocuments({ isActive: true, isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate total revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
        },
        turfs: {
          total: totalTurfs,
          active: activeTurfs,
          pending: totalTurfs - activeTurfs,
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          byStatus: bookingsByStatus,
        },
        revenue: {
          total: totalRevenue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};














