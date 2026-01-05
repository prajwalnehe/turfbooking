import express from 'express';
import {
  getUsers,
  getAllTurfs,
  approveTurf,
  getAllBookings,
  getAnalytics,
  deleteUser,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/turfs', getAllTurfs);
router.put('/turfs/:id/approve', approveTurf);
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);

export default router;














