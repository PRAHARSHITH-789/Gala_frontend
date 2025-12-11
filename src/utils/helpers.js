import { format, formatDistance } from 'date-fns';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'PPP') => {
  return format(new Date(date), formatStr);
};

// Get relative time
export const getRelativeTime = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate percentage
export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    Pending: 'yellow',
    approved: 'green',
    Cancelled: 'red',
  };
  return colors[status] || 'gray';
};