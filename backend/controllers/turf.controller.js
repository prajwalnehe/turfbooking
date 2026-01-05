import Turf from '../models/Turf.model.js';
import Slot from '../models/Slot.model.js';
import Booking from '../models/Booking.model.js';
import { normalizeDate, getDateRange } from '../utils/dateUtils.js';

// @desc    Get all turfs with filters
// @route   GET /api/turfs
// @access  Public
export const getTurfs = async (req, res, next) => {
  try {
    const { city, sportType, minPrice, maxPrice, search, includePending } = req.query;
    const query = { isActive: true };
    
    // Show approved turfs (or all if includePending=true)
    // Note: Turfs are auto-approved on creation in development
    if (includePending !== 'true') {
      query.isApproved = true;
    }

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (sportType) query.sportType = sportType;
    if (minPrice) query.pricePerHour = { ...query.pricePerHour, $gte: Number(minPrice) };
    if (maxPrice) {
      query.pricePerHour = { ...query.pricePerHour, $lte: Number(maxPrice) };
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
      ];
    }

    // First, check total turfs in database for debugging
    const totalTurfs = await Turf.countDocuments({});
    const activeTurfs = await Turf.countDocuments({ isActive: true });
    const approvedTurfs = await Turf.countDocuments({ isActive: true, isApproved: true });
    
    console.log(`📊 Database stats - Total: ${totalTurfs}, Active: ${activeTurfs}, Active+Approved: ${approvedTurfs}`);

    const turfs = await Turf.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${turfs.length} turf(s) matching query:`, JSON.stringify(query));
    if (turfs.length > 0) {
      console.log('Sample turf:', {
        name: turfs[0].name,
        isActive: turfs[0].isActive,
        isApproved: turfs[0].isApproved
      });
    }

    res.json({
      success: true,
      count: turfs.length,
      data: turfs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single turf
// @route   GET /api/turfs/:id
// @access  Public
export const getTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    res.json({
      success: true,
      data: turf,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create turf
// @route   POST /api/turfs
// @access  Private (Owner)
export const createTurf = async (req, res, next) => {
  try {
    // Ensure location is properly structured
    if (!req.body.location || typeof req.body.location !== 'object') {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Ensure coordinates are numbers
    if (req.body.location.coordinates) {
      req.body.location.coordinates.lat = Number(req.body.location.coordinates.lat) || 0;
      req.body.location.coordinates.lng = Number(req.body.location.coordinates.lng) || 0;
    } else {
      req.body.location.coordinates = { lat: 0, lng: 0 };
    }

    // Set default operating hours if not provided
    if (!req.body.operatingHours || typeof req.body.operatingHours !== 'object') {
      req.body.operatingHours = {
        open: '06:00',
        close: '22:00',
      };
    }

    const turfData = {
      ...req.body,
      owner: req.user.id,
      pricePerHour: Number(req.body.pricePerHour),
    };

    // Ensure images array exists (should be set by upload middleware)
    if (!turfData.images || !Array.isArray(turfData.images) || turfData.images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Auto-approve turfs for immediate visibility
    // TODO: Remove this in production to require admin approval
    turfData.isApproved = true;
    turfData.isActive = true; // Ensure turf is active

    const turf = await Turf.create(turfData);
    
    console.log('✅ Turf created:', {
      id: turf._id,
      name: turf.name,
      isActive: turf.isActive,
      isApproved: turf.isApproved,
      owner: turf.owner
    });

    res.status(201).json({
      success: true,
      data: turf,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update turf
// @route   PUT /api/turfs/:id
// @access  Private (Owner/Admin)
export const updateTurf = async (req, res, next) => {
  try {
    let turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Make sure user is turf owner or admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this turf' });
    }

    turf = await Turf.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: turf,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete turf
// @route   DELETE /api/turfs/:id
// @access  Private (Owner/Admin)
export const deleteTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Make sure user is turf owner or admin
    if (turf.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this turf' });
    }

    await turf.deleteOne();

    res.json({
      success: true,
      message: 'Turf deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available slots for a turf on a date
// @route   GET /api/turfs/:id/slots
// @access  Public
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const turfId = req.params.id;

    if (!date) {
      return res.status(400).json({ message: 'Please provide a date' });
    }

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Normalize date to start of day for consistent comparison
    const { start, end } = getDateRange(date);

    // Get all slots for the date (using date range to avoid timezone issues)
    const slots = await Slot.find({
      turfId,
      date: {
        $gte: start,
        $lt: end,
      },
    });

    console.log(`📅 Fetching slots for date ${date}: Found ${slots.length} slot(s)`);

    // Generate available time slots based on operating hours (30-minute intervals)
    const { open, close } = turf.operatingHours;
    const availableSlots = [];
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);
    const startMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin;

    // Generate slots in 30-minute intervals
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const slot = slots.find(s => s.time === time);
      
      availableSlots.push({
        time,
        isBooked: slot ? slot.isBooked : false,
        isBlocked: slot ? slot.isBlocked : false,
        slotId: slot ? slot._id : null,
      });
    }

    const bookedCount = availableSlots.filter(s => s.isBooked).length;
    console.log(`📊 Slot summary: ${availableSlots.length} total slots, ${bookedCount} booked`);

    res.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's turfs
// @route   GET /api/turfs/owner/my-turfs
// @access  Private (Owner)
export const getMyTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find({ owner: req.user.id })
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

