import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurf();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate, id]);

  const fetchTurf = async () => {
    try {
      const response = await api.get(`/turfs/${id}`);
      setTurf(response.data.data);
    } catch (error) {
      toast.error('Failed to load turf details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await api.get(`/turfs/${id}/slots`, {
        params: { date: selectedDate },
      });
      setSlots(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load slots');
    }
  };

  // Generate time slots from 5:00 AM to 10:30 PM in 30-minute increments
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 5; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        times.push({ time24, time12 });
      }
    }
    // Add 10:30 PM
    times.push({ time24: '22:30', time12: '10:30 PM' });
    return times;
  };

  const timeSlots = generateTimeSlots();

  const isTimeSlotAvailable = (time24) => {
    const slot = slots.find(s => s.time === time24);
    return !slot || (!slot.isBooked && !slot.isBlocked);
  };

  const isTimeSlotBooked = (time24) => {
    const slot = slots.find(s => s.time === time24);
    return slot && slot.isBooked;
  };

  const isTimeInRange = (time24) => {
    if (!selectedStartTime || !selectedEndTime) return false;
    const time = time24;
    return time >= selectedStartTime && time <= selectedEndTime;
  };

  const handleTimeClick = (time24) => {
    if (!isTimeSlotAvailable(time24)) return;

    // If clicking the selected start time, unselect it
    if (selectedStartTime === time24) {
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      return;
    }

    // If clicking the selected end time, unselect it
    if (selectedEndTime === time24) {
      setSelectedEndTime(null);
      return;
    }

    // If clicking a time before the selected start time, reset and select new start time
    if (selectedStartTime && time24 < selectedStartTime) {
      setSelectedStartTime(time24);
      setSelectedEndTime(null);
      return;
    }

    if (!selectedStartTime) {
      // Select start time
      setSelectedStartTime(time24);
      setSelectedEndTime(null);
    } else if (!selectedEndTime) {
      // Select end time
      if (time24 <= selectedStartTime) {
        toast.error('End time must be after start time');
        return;
      }
      setSelectedEndTime(time24);
    } else {
      // Both are selected, clicking a new time resets to that as start time
      setSelectedStartTime(time24);
      setSelectedEndTime(null);
    }
  };

  const calculateDuration = () => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    const [startHour, startMin] = selectedStartTime.split(':').map(Number);
    const [endHour, endMin] = selectedEndTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60; // Convert to hours
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      toast.error('Please select date, start time, and end time');
      return;
    }

    const duration = calculateDuration();
    if (duration <= 0) {
      toast.error('Invalid time range');
      return;
    }

    navigate(`/book/${id}`, {
      state: {
        turf,
        date: selectedDate,
        time: selectedStartTime, // Keep for backward compatibility
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        duration: duration,
      },
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Get date 30 days from now
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Turf not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Images */}
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {turf.images && turf.images.length > 0 ? (
                <img
                  src={turf.images[0]}
                  alt={turf.name}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                />
              ) : (
                <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm sm:text-base">No image available</span>
                </div>
              )}
            </div>

            {turf.images && turf.images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 sm:mt-4">
                {turf.images.slice(1, 5).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${turf.name} ${idx + 2}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{turf.name}</h1>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {turf.location.address}, {turf.location.city}, {turf.location.state}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                <span className="bg-indigo-100 text-indigo-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize">
                  {turf.sportType.replace('-', ' ')}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                  ₹{turf.pricePerHour}/hour
                </span>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{turf.description}</p>
              </div>

              {turf.amenities && turf.amenities.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {turf.amenities.map((amenity, idx) => (
                      <li key={idx}>{amenity}</li>
                    ))}
                  </ul>
                </div>
              )}

              {turf.rules && turf.rules.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Rules</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {turf.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Booking Section */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Book Your Slot</h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    max={maxDate}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                      setSelectedStartTime(null);
                      setSelectedEndTime(null);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center">
                      Select Start Time
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto p-2">
                      {timeSlots.map((slot, idx) => {
                        const isAvailable = isTimeSlotAvailable(slot.time24);
                        const isBooked = isTimeSlotBooked(slot.time24);
                        const isSelected = selectedStartTime === slot.time24;
                        const isInRange = isTimeInRange(slot.time24);
                        const isEndSelected = selectedEndTime === slot.time24;

                        let buttonClass = 'px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ';
                        if (isBooked) {
                          // Booked slots shown in red
                          buttonClass += 'bg-red-500 text-white cursor-not-allowed';
                        } else if (!isAvailable) {
                          // Blocked slots (not booked but unavailable)
                          buttonClass += 'bg-gray-200 text-gray-400 cursor-not-allowed';
                        } else if (isSelected) {
                          buttonClass += 'bg-indigo-600 text-white';
                        } else if (isEndSelected) {
                          buttonClass += 'bg-green-600 text-white';
                        } else if (isInRange) {
                          buttonClass += 'bg-indigo-200 text-indigo-800';
                        } else {
                          buttonClass += 'bg-gray-100 text-gray-700 hover:bg-gray-200';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleTimeClick(slot.time24)}
                            disabled={!isAvailable || isBooked}
                            className={buttonClass}
                            title={isBooked ? 'This slot is already booked' : ''}
                          >
                            {slot.time12}
                          </button>
                        );
                      })}
                    </div>
                    {selectedStartTime && selectedEndTime && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium text-green-800">
                          Selected: {timeSlots.find(t => t.time24 === selectedStartTime)?.time12} - {timeSlots.find(t => t.time24 === selectedEndTime)?.time12}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600 mt-1">
                          Duration: {calculateDuration()} hour(s) | Total: ₹{turf ? (turf.pricePerHour * calculateDuration()) : 0}
                        </p>
                      </div>
                    )}
                    {selectedStartTime && !selectedEndTime && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium text-blue-800">
                          Start time selected: {timeSlots.find(t => t.time24 === selectedStartTime)?.time12}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-600 mt-1">
                          Now select an end time
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!selectedDate || !selectedStartTime || !selectedEndTime}
                  className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




