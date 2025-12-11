import API from './axios';

export const contactAPI = {
  sendMessage: (messageData) => API.post('/contact', messageData),
};