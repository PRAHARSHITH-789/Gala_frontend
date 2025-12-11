export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const ROLES = {
  USER: 'User',
  ORGANIZER: 'Organizer',
  ADMIN: 'Admin',
};

export const EVENT_CATEGORIES = [
  'Music',
  'Sports',
  'Food',
  'Arts',
  'Technology',
  'Business',
  'Other',
];

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'approved',
  CANCELLED: 'Cancelled',
};

export const EVENT_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'approved',
  CANCELLED: 'Cancelled',
};