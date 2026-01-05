import multer from 'multer';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Fallback middleware for local development without Cloudinary
// Stores images as base64 (NOT recommended for production)
export const uploadTurfImagesLocal = async (req, res, next) => {
  try {
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        // Convert images to base64 data URLs
        const imageUrls = req.files.map(file => {
          const base64 = file.buffer.toString('base64');
          return `data:${file.mimetype};base64,${base64}`;
        });

        req.body.images = imageUrls;
        console.log(`⚠️  Using local storage (base64) for ${imageUrls.length} image(s) - NOT RECOMMENDED FOR PRODUCTION`);
        next();
      } catch (uploadError) {
        console.error('Local image processing error:', uploadError);
        return res.status(500).json({ 
          message: 'Error processing images', 
          error: uploadError.message 
        });
      }
    });
  } catch (error) {
    next(error);
  }
};














