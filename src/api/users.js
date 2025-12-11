import API from './axios';

export const usersAPI = {
  getProfile: () => API.get('/users/profile'),
  
  updateProfile: (profileData) => API.put('/users/profile', profileData),
  
  // ✅ Upload profile picture
  uploadProfilePicture: (formData) => API.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // ✅ Delete profile picture
  deleteProfilePicture: () => API.delete('/users/profile/picture'),
  
  getAllUsers: () => API.get('/users'),
  
  createUser: (userData) => API.post('/users', userData),
  
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
  
  deleteUser: (id) => API.delete(`/users/${id}`),
};