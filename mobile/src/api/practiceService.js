import api from './axios';

export default {
  languages: async () => {
    const res = await api.get('/study/practice/user-languages');
    return res.data;
  },

  getActiveTask: async (topic = null) => {
    const res = await api.get('/study/practice/active-task', {
      params: topic ? { topic } : {}
    });
    return res.data;
  },

  execute: async (payload) => {
    const res = await api.post('/study/practice/execute', payload);
    return res.data;
  },

  verifyLab: async (payload) => {
    const res = await api.post('/study/practice/verify-lab', payload);
    return res.data;
  },
};