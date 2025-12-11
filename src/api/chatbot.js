import axios from './axios';

export const sendMessage = async (message, conversationHistory = []) => {
  const response = await axios.post('/chatbot/chat', {
    message,
    conversationHistory
  });
  return response.data;
};

export const getQuickResponses = async () => {
  const response = await axios.get('/chatbot/quick-responses');
  return response.data;
};

export const getEventHelp = async (eventId) => {
  const response = await axios.get(`/chatbot/event-help/${eventId}`);
  return response.data;
};