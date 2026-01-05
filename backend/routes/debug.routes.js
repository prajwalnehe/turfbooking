import express from 'express';
import Turf from '../models/Turf.model.js';

const router = express.Router();

// Debug route to check turf status
router.get('/turfs-status', async (req, res) => {
  try {
    const total = await Turf.countDocuments({});
    const active = await Turf.countDocuments({ isActive: true });
    const approved = await Turf.countDocuments({ isApproved: true });
    const activeAndApproved = await Turf.countDocuments({ isActive: true, isApproved: true });
    
    const sampleTurfs = await Turf.find({}).limit(5).select('name isActive isApproved location.city sportType');
    
    res.json({
      stats: {
        total,
        active,
        approved,
        activeAndApproved,
      },
      sampleTurfs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;













