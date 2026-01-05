import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Utility function to convert 24-hour format to 12-hour format with AM/PM
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  
  // Handle time format like "14:30" or "14:30:00"
  const [hours, minutes] = time24.split(':').map(Number);
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const minutesStr = minutes.toString().padStart(2, '0');
  
  return `${hour12}:${minutesStr} ${ampm}`;
};

function OwnerDashboardContent() {
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('turfs');
  const [loading, setLoading] = useState(true);
  // Initialize with today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'turfs') {
        const response = await api.get('/turfs/owner/my-turfs');
        setTurfs(response.data.data || []);
      } else {
        const response = await api.get('/bookings/owner/my-bookings');
        setBookings(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (turfId, isActive) => {
    try {
      await api.put(`/turfs/${turfId}`, { isActive: !isActive });
      toast.success(`Turf ${!isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update turf');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <Link
            to="/owner/add-turf"
            className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base text-center"
          >
            Add New Turf
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-4 sm:mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('turfs')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'turfs'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              My Turfs ({turfs.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              Bookings ({(() => {
                const today = new Date().toISOString().split('T')[0];
                return bookings.filter((booking) => {
                  const bookingDate = new Date(booking.date).toISOString().split('T')[0];
                  return bookingDate === today;
                }).length;
              })()})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : activeTab === 'turfs' ? (
          <div className="grid gap-4 sm:gap-6">
            {turfs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
                <p className="text-gray-500 text-base sm:text-lg mb-4">No turfs found</p>
                <Link
                  to="/owner/add-turf"
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base"
                >
                  Add Your First Turf
                </Link>
              </div>
            ) : (
              turfs.map((turf) => (
                <div
                  key={turf._id}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold">{turf.name}</h3>
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                            turf.isApproved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {turf.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        {turf.location.city} • {turf.sportType}
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-indigo-600">
                        ₹{turf.pricePerHour}/hour
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(turf._id, turf.isActive)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap ${
                          turf.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {turf.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Date Filter Section */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <label htmlFor="date-filter" className="text-gray-700 font-medium text-sm sm:text-base">
                  Filter by Date:
                </label>
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setSelectedDate(today);
                  }}
                  className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="grid gap-4 sm:gap-6">
              {(() => {
                // Always filter by selectedDate (defaults to today)
                const filteredBookings = bookings.filter((booking) => {
                  const bookingDate = new Date(booking.date).toISOString().split('T')[0];
                  return bookingDate === selectedDate;
                });

                return filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
                    <p className="text-gray-500 text-base sm:text-lg">
                      {selectedDate
                        ? `No bookings found for ${new Date(selectedDate).toLocaleDateString()}`
                        : 'No bookings found'}
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {booking.turfId?.name}
                      </h3>
                      <p className="text-gray-600 mb-1 font-medium text-sm sm:text-base">
                        {booking.userId?.name}
                      </p>
                      {booking.userId?.phone && (
                        <p className="text-gray-600 mb-1 text-sm sm:text-base">
                          Phone No: {booking.userId.phone}
                        </p>
                      )}
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        Email: {booking.userId?.email}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        {new Date(booking.date).toLocaleDateString()}{' '}
                        {booking.startTime && booking.endTime
                          ? `from ${formatTime12Hour(booking.startTime)} to ${formatTime12Hour(booking.endTime)}`
                          : booking.time
                          ? `at ${formatTime12Hour(booking.time)}`
                          : ''}
                      </p>
                      <div className="space-y-1">
                        <p className="text-base sm:text-lg font-semibold text-indigo-600">
                          Total: ₹{booking.totalAmount}
                        </p>
                        {booking.advanceAmount && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Advance: ₹{booking.advanceAmount} 
                            {booking.remainingAmount > 0 && (
                              <span> | Remaining: ₹{booking.remainingAmount}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
                  ))
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}




