import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getOwnerBookings,
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyBookings);
router.get('/owner/my-bookings', authorize('owner', 'admin'), getOwnerBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);

export default router;














