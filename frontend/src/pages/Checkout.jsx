import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [turf, setTurf] = useState(null);
  const [bookingData, setBookingData] = useState(
    location.state || { date: '', time: '', duration: 1 }
  );

  useEffect(() => {
    if (location.state?.turf) {
      setTurf(location.state.turf);
    } else {
      // Fetch turf if not passed
      api.get(`/turfs/${id}`).then(res => setTurf(res.data.data));
    }
  }, [id, location.state]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (!location.state) {
      navigate(`/turfs/${id}`);
    }
  }, [isAuthenticated, location.state, navigate, id]);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create booking
      const bookingResponse = await api.post('/bookings', {
        turfId: id,
        date: bookingData.date,
        time: bookingData.startTime || bookingData.time,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: bookingData.duration || 1,
      });

      const { razorpayOrder, data: booking } = bookingResponse.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Turf Booking',
          description: `Advance Payment (25%) for ${turf?.name || 'Turf'} booking`,
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              // Verify payment
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              toast.success('Booking confirmed! Advance payment received. Remaining amount payable at venue.');
              navigate('/dashboard');
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: bookingData.user?.name || '',
            email: bookingData.user?.email || '',
          },
          theme: {
            color: '#6366f1',
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled');
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!location.state) {
    return null;
  }

  const totalAmount = (turf?.pricePerHour || 0) * (bookingData.duration || 1);
  const advanceAmount = Math.round(totalAmount * 0.25);
  const remainingAmount = totalAmount - advanceAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Confirm Booking</h1>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Booking Details</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">Turf:</span>
              <span className="font-medium text-sm sm:text-base">{turf?.name || 'Loading...'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">Date:</span>
              <span className="font-medium text-sm sm:text-base">
                {new Date(bookingData.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">Time:</span>
              <span className="font-medium text-sm sm:text-base">
                {bookingData.startTime && bookingData.endTime
                  ? `${bookingData.startTime} - ${bookingData.endTime}`
                  : bookingData.time || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">Duration:</span>
              <span className="font-medium text-sm sm:text-base">{bookingData.duration || 1} hour(s)</span>
            </div>
            
            <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm sm:text-base">Total Booking Amount:</span>
                <span className="font-medium text-sm sm:text-base">₹{totalAmount}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-indigo-600">
                <span className="font-semibold text-sm sm:text-base">Advance Payment (25%):</span>
                <span className="font-bold text-base sm:text-lg">₹{advanceAmount}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-gray-500 text-xs sm:text-sm">
                <span>Remaining Amount (75%):</span>
                <span>₹{remainingAmount}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  💡 Pay the remaining ₹{remainingAmount} at the venue or before the booking date
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Note:</strong> You are paying 25% advance (₹{advanceAmount}) to confirm your booking. 
            The remaining amount (₹{remainingAmount}) can be paid at the venue.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay Advance ₹${advanceAmount}`}
        </button>
      </div>
    </div>
  );
}

