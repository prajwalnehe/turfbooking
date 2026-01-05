# Troubleshooting: "No turfs found"

If you're seeing "No turfs found" on the home page, here are steps to diagnose and fix:

## Quick Checks

1. **Have you added any turfs?**
   - Go to Owner Dashboard → Add New Turf
   - Fill in all required fields and add at least one image
   - Submit the form

2. **Check Owner Dashboard**
   - Login as the owner who created the turf
   - Go to Owner Dashboard → My Turfs tab
   - Verify the turf exists and check its status:
     - ✅ **Approved**: Should be visible to users
     - ⚠️ **Pending Approval**: Won't be visible until approved

3. **Check Backend Console**
   - Look for log messages like: `📊 Found X turf(s) matching query`
   - If you see `Found 0 turfs`, check the query conditions

## Common Issues

### Issue 1: Turf Not Approved
**Solution**: The backend is configured to auto-approve turfs in development. Check:
- Backend `.env` file - `NODE_ENV` should NOT be set to `production`
- Or manually approve via Admin Dashboard

### Issue 2: Turf is Inactive
**Solution**: Check Owner Dashboard and make sure the turf status is "Active"

### Issue 3: Filters Too Restrictive
**Solution**: 
- Clear all filters (search bar, city dropdown, sport type buttons)
- Try refreshing the page

### Issue 4: Backend Not Running or API Error
**Solution**:
1. Check browser console (F12) for API errors
2. Verify backend is running on `http://localhost:5000`
3. Check network tab to see the API response

## Manual Database Check

If you have MongoDB Compass or CLI access:

```javascript
// Connect to your database and run:
db.turfs.find({ isActive: true })

// Check if turfs exist:
db.turfs.countDocuments({})

// Check approval status:
db.turfs.find({}, { name: 1, isActive: 1, isApproved: 1 })
```

## Reset Filters

On the home page:
- Clear the search bar
- Select "All Cities" in the dropdown
- Click "All Sports" button
- Refresh the page

## Still Not Working?

1. **Check backend logs** for any errors
2. **Verify API endpoint** is accessible: `http://localhost:5000/api/turfs`
3. **Check browser console** for frontend errors
4. **Verify database connection** is working

If the issue persists, check:
- Are there any turfs in the database?
- Are the turfs active (`isActive: true`)?
- Are the turfs approved (`isApproved: true` in production)?














