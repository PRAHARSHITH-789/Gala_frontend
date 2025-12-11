import API from './axios';

export const bookingsAPI = {
  getUserBookings: () => API.get('/bookings/user'),
  
  createBooking: (bookingData) => API.post('/bookings', bookingData),
  
  getBookingById: (id) => API.get(`/bookings/${id}`),
  
  markAsAttended: (id) => API.put(`/bookings/${id}/attended`),
  
  cancelBooking: (id) => API.put(`/bookings/${id}/cancel`),
  
  deleteBooking: (id) => API.delete(`/bookings/${id}`),

  // ✅ NEW: Verify QR code
  verifyQRCode: (token) => API.post(`/bookings/verify/${token}`),

  // ✅ NEW: Get booking by token
  getBookingByToken: (token) => API.get(`/bookings/token/${token}`),
};