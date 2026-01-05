# Turf Visibility Guide

## Issue: Newly Added Turfs Not Visible to Users

When you add a new turf, it won't be visible to users until it's approved by an admin. This is by design for content moderation.

## Current Behavior

- New turfs are created with `isApproved: false` by default
- The public turf listing only shows turfs where `isApproved: true`
- Owners can see their own turfs (approved or not) in the Owner Dashboard

## Solutions

### Option 1: Auto-Approve in Development (Current Implementation)

The backend is configured to automatically approve turfs in development mode:

```javascript
// Auto-approve in development mode or if user is admin
if (process.env.NODE_ENV !== 'production' || req.user.role === 'admin') {
  turfData.isApproved = true;
}
```

This means:
- ✅ In development: Turfs are auto-approved and visible immediately
- ✅ Admins: Their turfs are auto-approved
- ⚠️ In production: Turfs require admin approval

### Option 2: Manual Admin Approval

1. **Add a turf** as an owner
2. **Login as admin** (or use admin account)
3. **Go to Admin Dashboard**
4. **Click "Approve"** on the pending turf

### Option 3: Always Auto-Approve (Not Recommended for Production)

If you want all turfs to be auto-approved always, modify `backend/controllers/turf.controller.js`:

```javascript
// Always auto-approve (REMOVE THIS IN PRODUCTION)
turfData.isApproved = true;
```

## How to Check Turf Status

### As Owner:
- Go to **Owner Dashboard** → **My Turfs** tab
- You'll see all your turfs with their approval status

### As Admin:
- Go to **Admin Dashboard** → **Manage Turfs** tab
- You can see all turfs and approve/reject them

## Troubleshooting

If your turf is still not visible:

1. **Check NODE_ENV**: Make sure `NODE_ENV` is not set to 'production' in your `.env` file
2. **Restart backend server** after making changes
3. **Check turf status** in Owner Dashboard to see if it's approved
4. **Clear browser cache** and refresh the page

## For Production

In production, you should:
- Remove auto-approval
- Have an admin review and approve all turfs
- This ensures quality control and prevents spam














