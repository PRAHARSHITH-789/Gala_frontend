import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/axios';
// AuthContext.jsx

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  const onStorage = () => {
      const s = localStorage.getItem('user');
      try {
        setUser(s ? JSON.parse(s) : null);
      } catch {
        setUser(null);
      }
    };

    const onAuthChange = () => {
      const s = localStorage.getItem('user');
      try {
        setUser(s ? JSON.parse(s) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('authChange', onAuthChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authChange', onAuthChange);
    };
  }, []);
  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      
      const response = await authAPI.login(credentials);
      
      // ✅ ADD DETAILED LOGGING
      console.log('📦 Full response:', response);
      console.log('📦 Response data:', response.data);
      console.log('📦 Response data user:', response.data?.user);
      
      // ✅ FIX: Check the actual response structure
      const responseData = response.data;
      
      if (responseData && responseData.user) {
        const userData = responseData.user;
        
        console.log('✅ User data extracted:', userData);
        
        // Remove password if it exists
        if (userData.password) {
          console.warn('⚠️ WARNING: Password in response!');
          delete userData.password;
        }
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
                window.dispatchEvent(new Event('authChange'));

        
        console.log('✅ Login successful, user saved to state and localStorage');
        
        return { 
          success: true, 
          user: userData 
        };
      }
      
      console.error('❌ Invalid response structure:', responseData);
      return { 
        success: false, 
        message: responseData?.message || 'Invalid response from server' 
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
            window.dispatchEvent(new Event('authChange'));

    }
  };

// register wrapper used by Register.jsx (sends OTP)
  const register = async (userData) => {
    try {
      const res = await authAPI.sendRegistrationOTP(userData);
      return res.data || { success: false, message: 'Unexpected response' };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  // computed flags used by Navbar and other components
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'Admin';
  const isOrganizer = user?.role === 'Organizer';
  const isUser = user?.role === 'User';

  const value = {
    user,
    login,
    logout,
    register,      // added
    loading,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    isUser,
  };
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};