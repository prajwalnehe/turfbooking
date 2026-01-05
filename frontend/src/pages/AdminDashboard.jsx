import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '../components/ProtectedRoute';

function AdminDashboardContent() {
  const [analytics, setAnalytics] = useState(null);
  const [turfs, setTurfs] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'analytics') {
        const response = await api.get('/admin/analytics');
        setAnalytics(response.data.data);
      } else {
        const response = await api.get('/admin/turfs');
        setTurfs(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (turfId, isApproved) => {
    try {
      await api.put(`/admin/turfs/${turfId}/approve`, { isApproved: !isApproved });
      toast.success(`Turf ${!isApproved ? 'approved' : 'rejected'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update turf');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

        <div className="bg-white rounded-xl shadow-md mb-4 sm:mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('turfs')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'turfs'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              Manage Turfs
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : activeTab === 'analytics' && analytics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-gray-600 mb-2 text-sm sm:text-base">Total Users</h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{analytics.users.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-gray-600 mb-2 text-sm sm:text-base">Active Turfs</h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics.turfs.active}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-gray-600 mb-2 text-sm sm:text-base">Total Bookings</h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{analytics.bookings.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-gray-600 mb-2 text-sm sm:text-base">Total Revenue</h3>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">₹{analytics.revenue.total}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {turfs.map((turf) => (
              <div key={turf._id} className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{turf.name}</h3>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      {turf.location.city} • {turf.sportType}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">Owner: {turf.owner?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(turf._id, turf.isApproved)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap ${
                        turf.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {turf.isApproved ? 'Approved' : 'Approve'}
                    </button>
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

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}














