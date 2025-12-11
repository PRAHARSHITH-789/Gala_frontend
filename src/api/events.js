import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventsAPI = {
  // Public - Get approved events
  getApprovedEvents: () => api.get('/events'),
  
  // Admin - Get ALL events (including pending)
  getAllEvents: () => api.get('/events/all'),
  
  // Get single event
  getEventById: (id) => api.get(`/events/${id}`),
  
  // Organizer - Create event
  createEvent: (eventData) => api.post('/events', eventData),
  
  // Update event
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  // Delete event
  deleteEvent: (id) => api.delete(`/events/${id}`),
  
  // Admin - Approve event
  approveEvent: (id) => api.patch(`/events/approveevent/${id}`),
  
  // Admin - Decline event
  declineEvent: (id) => api.patch(`/events/decline/${id}`),

  // ✅ Organizer - Get their events
  getUserEvents: () => api.get('/users/events'),

  // ✅ Organizer - Get analytics
  getEventAnalytics: () => api.get('/users/events/analytics'),
};