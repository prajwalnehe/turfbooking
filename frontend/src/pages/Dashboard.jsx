import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '../components/ProtectedRoute';

function DashboardContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by user',
      });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg mb-4">No bookings found</p>
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base"
            >
              All Turfs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      {booking.turfId?.name}
                    </h3>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      {booking.turfId?.sportType && (
                        <span className="capitalize">
                          {booking.turfId.sportType.replace('-', ' ')} •{' '}
                        </span>
                      )}
                       {new Date(booking.date).toLocaleDateString()}
                       {booking.startTime && booking.endTime
                         ? ` from ${booking.startTime} to ${booking.endTime}`
                         : ` at ${booking.time}`}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      Duration: {booking.duration} hour(s)
                    </p>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-semibold text-indigo-600">
                        Total: ₹{booking.totalAmount}
                      </p>
                      {booking.advanceAmount && (
                        <p className="text-xs sm:text-sm text-gray-500">
                          Advance Paid: ₹{booking.advanceAmount} 
                          {booking.remainingAmount > 0 && (
                            <span className="ml-2"> | Remaining: ₹{booking.remainingAmount}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col sm:text-right items-start sm:items-end gap-2 sm:gap-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium whitespace-nowrap"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}




