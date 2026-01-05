# Quick Deployment Steps for Render

## 🚀 Quick Start Guide

### Step 1: Prepare Your Code
1. Make sure your code is pushed to GitHub
2. Ensure `render.yaml` is in the root of your repository

### Step 2: Deploy Using Blueprint (Easiest Method)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically detect `render.yaml`**
5. **Review the services** and click **"Apply"**
6. **Add environment variables** for each service (see below)

### Step 3: Manual Deployment (Alternative)

#### Deploy Backend First:

1. **New** → **Web Service**
2. **Connect GitHub repository**
3. **Settings:**
   - Name: `turf-booking-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables** (see Backend Variables below)
5. **Create Web Service**

#### Deploy Frontend Second:

1. **New** → **Web Service**
2. **Connect GitHub repository**
3. **Settings:**
   - Name: `turf-booking-frontend`
   - Root Directory: `frontend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
4. **Add Environment Variables:**
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
5. **Create Web Service**

### Step 4: Update Backend CORS

After frontend is deployed, update backend environment variable:
- `FRONTEND_URL` = `https://your-frontend-url.onrender.com`

## 📋 Environment Variables

### Backend Variables

Copy these into Render's Environment Variables section:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Frontend Variables

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 🔗 Getting Your URLs

After deployment:
- Backend URL: `https://turf-booking-backend.onrender.com`
- Frontend URL: `https://turf-booking-frontend.onrender.com`

## ⚠️ Important Notes

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading for production

2. **MongoDB Setup:**
   - Use MongoDB Atlas (free tier available)
   - Whitelist IP: `0.0.0.0/0` for Render
   - Get connection string from Atlas dashboard

3. **First Deployment:**
   - Backend takes 5-10 minutes to build
   - Frontend takes 3-5 minutes to build
   - Be patient!

4. **After Deployment:**
   - Test backend: `https://your-backend.onrender.com/api/health`
   - Test frontend: Visit your frontend URL
   - Check logs if something doesn't work

## 🐛 Troubleshooting

### Backend won't start:
- Check MongoDB connection string
- Verify all environment variables are set
- Check build logs

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS settings in backend

### Build fails:
- Check Node.js version (Render uses 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

## ✅ Post-Deployment Checklist

- [ ] Backend health check works: `/api/health`
- [ ] Frontend loads correctly
- [ ] Can register/login
- [ ] Can view turfs
- [ ] Can create bookings
- [ ] Image uploads work
- [ ] Payments work (test mode)

## 📞 Need Help?

1. Check Render service logs
2. Check browser console
3. Verify environment variables
4. Review full deployment guide: `DEPLOYMENT.md`

