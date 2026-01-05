import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

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

// Middleware to upload images to Cloudinary
export const uploadTurfImages = async (req, res, next) => {
  try {
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        // No files uploaded, continue to next middleware
        // Images validation will happen in controller
        return next();
      }

      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ 
          message: 'Image upload service not configured. Please configure Cloudinary credentials in the backend .env file.',
          error: 'Cloudinary credentials missing'
        });
      }

      try {
        const uploadPromises = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'turf-booking/turfs',
                transformation: [{ width: 1200, height: 800, crop: 'limit' }],
              },
              (error, result) => {
                if (error) {
                  console.error(`Error uploading image ${index + 1}:`, error);
                  reject(new Error(`Failed to upload image ${index + 1}: ${error.message}`));
                } else {
                  resolve(result.secure_url);
                }
              }
            );

            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
          });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        req.body.images = uploadedUrls;
        console.log(`✅ Successfully uploaded ${uploadedUrls.length} image(s) to Cloudinary`);
        next();
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Error uploading images to Cloudinary', 
          error: uploadError.message 
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadSingleImage = async (req, res, next) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return next();
      }

      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'turf-booking/avatars',
            transformation: [{ width: 400, height: 400, crop: 'limit' }],
          },
          (error, result) => {
            if (error) {
              return res.status(500).json({ message: 'Error uploading image', error: error.message });
            }
            req.body.avatar = result.secure_url;
            next();
          }
        );

        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      } catch (uploadError) {
        return res.status(500).json({ message: 'Error uploading image', error: uploadError.message });
      }
    });
  } catch (error) {
    next(error);
  }
};

