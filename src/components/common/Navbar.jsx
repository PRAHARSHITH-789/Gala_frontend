import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isOrganizer, isUser } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'https://gala-backend-1.onrender.com/api/v1';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ✅ Get profile picture URL with default
  const getProfilePicture = () => {
    if (user?.profilePicture && user.profilePicture !== 'default.jpg') {
      return `${API_URL.replace('/api/v1', '')}/${user.profilePicture}`;
    }
    // Generate default avatar with user's initials
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9333ea&color=fff&size=128&bold=true`;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaCalendarAlt className="text-3xl text-blue-600" />
            <span className="text-2xl font-bold">GALA</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-black font-medium transition">
              Home
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-black font-medium transition">
              Events
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-black font-medium transition">
              Contact
            </Link>
            {isAuthenticated && (
              <>
                {isUser && (
                  <Link to="/my-bookings" className="text-gray-700 hover:text-black font-medium transition">
                    My Bookings
                  </Link>
                )}
                {isOrganizer && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-black font-medium transition">
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-black font-medium transition">
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* ✅ Profile Picture & Name */}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition group"
                >
                  {/* ✅ Profile Picture with default */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 group-hover:border-purple-400 transition">
                    <img
                      src={getProfilePicture()}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=9333ea&color=fff&size=128&bold=true`;
                      }}
                    />
                  </div>
                  
                  {/* User Name */}
                  <div className="hidden md:block text-left">
                    <p className="font-semibold text-gray-800 text-sm leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 btn-secondary py-2 px-4"
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-6">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary py-2 px-6">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;