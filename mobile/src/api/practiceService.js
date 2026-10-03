import api from './axios';

const practiceService = {
  languages: async () => (await api.get('/study/practice/user-languages')).data,
  execute: async (payload) => (await api.post('/study/practice/execute', payload)).data,
  verifyLab: async (payload) => (await api.post('/study/practice/verify-lab', payload)).data,
};

export default practiceService;
