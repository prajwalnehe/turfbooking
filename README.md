# Turf Booking Website

A modern, scalable turf booking platform where users can discover sports turfs and book time slots online.

## Features

### User Features
- 🔐 User authentication (Register/Login with JWT)
- 🔍 Browse turfs by city, sport type, and search
- 📅 View turf details with images, pricing, amenities, and location
- ⏰ Real-time slot availability checking
- 💳 Online payment via Razorpay
- 📋 Booking history and cancellation
- 📱 Fully responsive design

### Turf Owner Features
- 🏟️ Register and manage multiple turfs
- 📸 Upload turf images (Cloudinary integration)
- 💰 Set pricing per hour
- ⏰ Manage time slots (block/unblock)
- 📊 View bookings and earnings
- ✅ Toggle turf availability

### Admin Features
- 👥 Manage users and turfs
- ✅ Approve/reject turf listings
- 📊 Platform analytics (bookings, revenue, active turfs)
- 📈 View all bookings across the platform

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** + **bcrypt** - Authentication
- **Razorpay** - Payment gateway
- **Cloudinary** - Image storage
- **Multer** - File upload handling

### Frontend
- **React 19** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - API client
- **React Hot Toast** - Notifications

## Project Structure

```
Turf/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── database.js
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── payment.controller.js
│   │   └── turf.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── Booking.model.js
│   │   ├── Slot.model.js
│   │   ├── Turf.model.js
│   │   └── User.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── payment.routes.js
│   │   └── turf.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AddTurf.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── Register.jsx
│   │   │   └── TurfDetail.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Razorpay account
- Cloudinary account
- Google Maps API key (optional, for maps integration)

### Creating Admin User

After setting up the backend, create an admin user:

```bash
cd backend
npm run create-admin [email] [name] [password]
```

Example:
```bash
npm run create-admin admin@example.com "Admin Name" admin123
```

If no arguments are provided, it will create:
- Email: admin@turfbooking.com
- Name: Admin User
- Password: admin123

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/turf-booking

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

GOOGLE_MAPS_API_KEY=your-google-maps-api-key

FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Turfs
- `GET /api/turfs` - Get all turfs (with filters: city, sportType, search)
- `GET /api/turfs/:id` - Get single turf
- `GET /api/turfs/:id/slots` - Get available slots for a date
- `GET /api/turfs/owner/my-turfs` - Get owner's turfs (Protected, Owner)
- `POST /api/turfs` - Create turf (Protected, Owner)
- `PUT /api/turfs/:id` - Update turf (Protected)
- `DELETE /api/turfs/:id` - Delete turf (Protected)

### Bookings
- `GET /api/bookings` - Get user bookings (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `POST /api/bookings` - Create booking (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)
- `GET /api/bookings/owner/my-bookings` - Get owner bookings (Protected, Owner)

### Payments
- `POST /api/payments/verify` - Verify Razorpay payment (Protected)
- `GET /api/payments/status/:bookingId` - Get payment status (Protected)

### Admin
- `GET /api/admin/users` - Get all users (Protected, Admin)
- `DELETE /api/admin/users/:id` - Delete user (Protected, Admin)
- `GET /api/admin/turfs` - Get all turfs (Protected, Admin)
- `PUT /api/admin/turfs/:id/approve` - Approve/reject turf (Protected, Admin)
- `GET /api/admin/bookings` - Get all bookings (Protected, Admin)
- `GET /api/admin/analytics` - Get platform analytics (Protected, Admin)

## Database Models

### User
- name, email, password, phone, role (user/owner/admin), avatar, isVerified

### Turf
- name, description, sportType, location (address, city, state, pincode, coordinates), pricePerHour, images, amenities, rules, owner, isActive, isApproved, rating, operatingHours

### Slot
- turfId, date, time, isBooked, isBlocked, bookingId

### Booking
- userId, turfId, slotId, date, time, duration, totalAmount, paymentId, razorpayOrderId, razorpayPaymentId, status, cancelledAt, cancellationReason, refundAmount, refundStatus

## Booking Flow

1. User browses turfs and selects a turf
2. User selects date and available time slot
3. User proceeds to checkout
4. System creates a booking with "pending" status and Razorpay order
5. Slot is marked as booked
6. User completes payment via Razorpay
7. Payment is verified on backend
8. Booking status changes to "confirmed"
9. If payment fails, slot is released automatically

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- CORS configuration
- Secure payment verification

## Deployment

### Backend Deployment (Recommended: Railway, Render, or Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Deploy backend code
4. Update frontend API URL

### Frontend Deployment (Recommended: Vercel, Netlify)

1. Set `VITE_API_URL` environment variable to your backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder

### Environment Variables for Production

Make sure to:
- Use strong JWT_SECRET
- Set NODE_ENV=production
- Use production MongoDB URI
- Configure production Razorpay keys
- Set up production Cloudinary account
- Update FRONTEND_URL to production domain

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@turfbooking.com or open an issue in the repository.

#   t u r f b o o k i n g  
 