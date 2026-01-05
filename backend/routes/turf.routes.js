import express from 'express';
import {
  getTurfs,
  getTurf,
  createTurf,
  updateTurf,
  deleteTurf,
  getAvailableSlots,
  getMyTurfs,
} from '../controllers/turf.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadTurfImages } from '../middleware/upload.middleware.js';
import { uploadTurfImagesLocal } from '../middleware/upload.middleware.local.js';
import { parseFormData } from '../middleware/parseFormData.js';

const router = express.Router();

router.get('/', getTurfs);
router.get('/:id', getTurf);
router.get('/:id/slots', getAvailableSlots);
router.get('/owner/my-turfs', protect, authorize('owner', 'admin'), getMyTurfs);

// Use Cloudinary if configured, otherwise use local fallback
const imageUploadMiddleware = 
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    ? uploadTurfImages
    : uploadTurfImagesLocal;

router.post('/', protect, authorize('owner', 'admin'), imageUploadMiddleware, parseFormData, createTurf);
router.put('/:id', protect, updateTurf);
router.delete('/:id', protect, deleteTurf);

export default router;

