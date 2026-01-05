# Cloudinary Setup Guide

To enable image uploads in the Turf Booking application, you need to configure Cloudinary.

## Steps to Set Up Cloudinary:

1. **Sign up for a free Cloudinary account**
   - Go to https://cloudinary.com/users/register/free
   - Sign up with your email

2. **Get your Cloudinary credentials**
   - After signing up, go to your Dashboard
   - You'll find your credentials on the dashboard:
     - Cloud Name
     - API Key
     - API Secret

3. **Add credentials to backend/.env file**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Restart your backend server**
   ```bash
   cd backend
   npm run dev
   ```

## Current Status

If Cloudinary is **not configured**, the application will:
- ⚠️ Store images as base64 data URLs (NOT recommended for production)
- ⚠️ This works for development but has limitations:
  - Images are stored in the database, making it large
  - Slower performance
  - Not suitable for production use

## Recommended: Use Cloudinary

Cloudinary provides:
- ✅ Professional image hosting
- ✅ Image optimization and transformation
- ✅ CDN delivery for fast loading
- ✅ Free tier with generous limits
- ✅ Production-ready solution

## Example .env Configuration

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

After adding these credentials, restart your backend server and image uploads will use Cloudinary.














