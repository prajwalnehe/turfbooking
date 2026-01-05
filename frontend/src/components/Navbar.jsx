import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600">
            TurfBooking
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 whitespace-nowrap">
              Browse Turfs
            </Link>

            {isAuthenticated ? (
              <>
                {user.role === 'owner' && (
                  <Link
                    to="/owner/dashboard"
                    className="text-gray-700 hover:text-indigo-600 whitespace-nowrap"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-indigo-600 whitespace-nowrap"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 whitespace-nowrap"
                >
                  My Bookings
                </Link>
                <span className="text-gray-700 hidden sm:inline">{user.name}</span>
                <span className="text-gray-700 sm:hidden text-xs">{user.name?.split(' ')[0]}</span>
                <button
                  onClick={logout}
                  className="bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base whitespace-nowrap"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}














