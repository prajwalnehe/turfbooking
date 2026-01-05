# Deployment Guide for Render

This guide will help you deploy the Turf Booking application on Render.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account** - For database (or use Render's MongoDB)
4. **Cloudinary Account** - For image hosting
5. **Razorpay Account** - For payment processing

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure all environment variables are documented

## Step 2: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/turf-booking`

### Option B: Render MongoDB

1. In Render dashboard, create a new MongoDB service
2. Get the connection string from the service details

## Step 3: Deploy Backend

1. **Go to Render Dashboard** → New → Web Service
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name:** `turf-booking-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-very-secure-secret-key-min-32-chars
   JWT_EXPIRE=7d
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

5. **Click "Create Web Service"**

6. **Wait for deployment** - Render will build and deploy your backend

7. **Note your backend URL** - It will be something like `https://turf-booking-backend.onrender.com`

## Step 4: Deploy Frontend

1. **Go to Render Dashboard** → New → Web Service
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name:** `turf-booking-frontend`
   - **Environment:** `Node`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`

4. **Add Environment Variables:**
   ```
   VITE_BACKEND_URL=https://turfbooking-bmiv.onrender.com
   ```
   
   **Note:** The `/api` path will be automatically appended. If your backend URL already includes `/api`, use `VITE_API_URL` instead.

5. **Click "Create Web Service"**

6. **Wait for deployment**

## Step 5: Update Backend CORS

After deploying frontend, update the backend `FRONTEND_URL` environment variable to your frontend URL.

## Step 6: Update Frontend API URL

Make sure `VITE_API_URL` in frontend environment variables points to your backend URL.

## Alternative: Using render.yaml (Infrastructure as Code)

If you prefer using the `render.yaml` file:

1. **Push `render.yaml` to your repository root**
2. **Go to Render Dashboard** → New → Blueprint
3. **Connect your GitHub repository**
4. **Render will automatically detect and deploy both services**

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | `your-secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.onrender.com` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend URL (auto-appends /api) | `https://turfbooking-bmiv.onrender.com` |
| `VITE_API_URL` | Full API URL (alternative) | `https://your-backend.onrender.com/api` |

## Troubleshooting

### Backend Issues

1. **Build fails:**
   - Check Node.js version (Render uses Node 18+ by default)
   - Verify all dependencies in `package.json`

2. **Database connection fails:**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

3. **CORS errors:**
   - Update `FRONTEND_URL` in backend environment variables
   - Restart the backend service

### Frontend Issues

1. **Build fails:**
   - Check if `VITE_API_URL` is set correctly
   - Verify all dependencies

2. **API calls fail:**
   - Verify `VITE_API_URL` points to correct backend URL
   - Check browser console for errors
   - Ensure backend is running and accessible

### General Issues

1. **Services not starting:**
   - Check build logs in Render dashboard
   - Verify all environment variables are set
   - Check service logs for errors

2. **Free tier limitations:**
   - Free tier services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading to paid plan for always-on services

## Post-Deployment Checklist

- [ ] Backend is accessible at `/api/health`
- [ ] Frontend loads correctly
- [ ] API calls from frontend work
- [ ] Image uploads work (Cloudinary)
- [ ] Payments work (Razorpay)
- [ ] Database connections are stable
- [ ] CORS is configured correctly

## Custom Domain (Optional)

1. **In Render Dashboard:**
   - Go to your service
   - Click "Settings"
   - Scroll to "Custom Domains"
   - Add your domain
   - Follow DNS configuration instructions

2. **Update environment variables:**
   - Update `FRONTEND_URL` in backend
   - Update `VITE_API_URL` in frontend (if using custom domain for backend)

## Security Notes

1. **Never commit `.env` files** to Git
2. **Use strong JWT_SECRET** (minimum 32 characters)
3. **Keep environment variables secure** in Render dashboard
4. **Use HTTPS** (Render provides this automatically)
5. **Regularly update dependencies**

## Support

For issues:
1. Check Render service logs
2. Check browser console (for frontend)
3. Verify all environment variables
4. Check MongoDB connection
5. Review this deployment guide

