import API from './axios';

export const authAPI = {
  register: (userData) => API.post('/register', userData),
  
  login: (credentials) => API.post('/login', credentials),
  
  forgotPassword: (data) => API.put('/forgotPassword', data),
  
  logout: () => {
    localStorage.removeItem('user');
    return Promise.resolve();
  }
};