import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status);
    
    if (!error.response) {
      console.error('🔴 Network error - backend might be down');
      return Promise.reject({
        response: {
          data: {
            message: 'Network error. Please check your connection and backend server.'
          }
        }
      });
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('user');
      const publicEndpoints = ['/login', '/register', '/forgotPassword', '/send-otp', '/verify-otp'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (!isPublicEndpoint && window.location.pathname !== '/login') {
        console.log('🔄 Redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  // Registration with OTP
  sendRegistrationOTP: (userData) => {
    console.log('📤 Sending registration OTP for:', userData.email);
    return API.post('/register/send-otp', userData);
  },
  
  verifyRegistrationOTP: (email, otp) => {
    console.log('📤 Verifying OTP for:', email);
    return API.post('/register/verify-otp', { email, otp });
  },
  
  resendRegistrationOTP: (email) => {
    console.log('📤 Resending OTP to:', email);
    return API.post('/register/resend-otp', { email });
  },
  
  // Login
  login: (credentials) => {
    console.log('📤 Login request for:', credentials.email);
    return API.post('/login', credentials);
  },
  
  // Logout
  logout: () => {
    console.log('📤 Logout request');
    return API.post('/logout');
  },
  
  // Forgot Password
  forgotPassword: (data) => {
    console.log('📤 Forgot password request');
    return API.put('/forgotPassword', data);
  },
  
  // Get Profile
  getProfile: () => {
    console.log('📤 Get profile request');
    return API.get('/users/profile');
  },
};

export default API;