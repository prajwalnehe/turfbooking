import express from 'express';
import { verifyPayment, getPaymentStatus } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/verify', verifyPayment);
router.get('/status/:bookingId', getPaymentStatus);

export default router;














