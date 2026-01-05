import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Home() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    search: '',
  });

  useEffect(() => {
    fetchTurfs();
  }, [filters]);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/turfs?${params.toString()}`);
      console.log('Turfs API response:', response.data);
      console.log('Number of turfs:', response.data.count);
      setTurfs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching turfs:', error);
      console.error('Error details:', error.response?.data);
      // Set empty array on error to show the "no turfs" message
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
        <img
          src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766233894/79f3d760208bcf14b777f4e3c39c904e_e0ydd2.jpg"
          alt="Turf Booking Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-lg">Book Your Perfect Turf</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 drop-shadow-md">Find and book sports turfs in your city</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base text-black bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white placeholder:text-black placeholder:text-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <select
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base text-black bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                >
                  <option value="" className="text-gray-900">All Cities</option>
                  <option value="Mumbai" className="text-gray-900">Mumbai</option>
                  <option value="Delhi" className="text-gray-900">Delhi</option>
                  <option value="Bangalore" className="text-gray-900">Bangalore</option>
                  <option value="Hyderabad" className="text-gray-900">Hyderabad</option>
                  <option value="Chennai" className="text-gray-900">Chennai</option>
                  <option value="Pune" className="text-gray-900">Pune</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Turf Listings */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : turfs.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-gray-500 text-base sm:text-lg mb-4">No turfs found. Try different filters.</p>
            <p className="text-gray-400 text-xs sm:text-sm">
              If you just added a turf, make sure it's approved and active. 
              <Link to="/owner/dashboard" className="text-indigo-600 hover:underline ml-1">
                Check Dashboard
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {turfs.map((turf) => (
              <Link
                key={turf._id}
                to={`/turfs/${turf._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-40 sm:h-48 bg-gray-200 relative">
                  {turf.images && turf.images.length > 0 && (
                    <img
                      src={turf.images[0]}
                      alt={turf.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-2 right-2 bg-indigo-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize">
                    {turf.sportType.replace('-', ' ')}
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{turf.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1">{turf.location.address}, {turf.location.city}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-600 font-bold text-sm sm:text-base">₹{turf.pricePerHour}/hour</span>
                    {turf.rating > 0 && (
                      <span className="text-yellow-500 text-sm sm:text-base">⭐ {turf.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

