import api from './axios';

const aiService = {
  sessions: async () => (await api.get('/ai/sessions')).data,
  createSession: async (title) =>
    (await api.post('/ai/sessions', title ? { title } : {})).data,
  sendMessage: async (sessionId, content) =>
    (await api.post('/ai/message', { session_id: sessionId, content })).data,
  rateMessage: async (messageId, helpful) =>
    (await api.patch(`/ai/message/${messageId}/feedback`, null, { params: { helpful } })).data,
};

export default aiService;
