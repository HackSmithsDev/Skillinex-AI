import api from './axios';

const userService = {
  me: async () => (await api.get('/user/me')).data,
  dashboard: async () => (await api.get('/user/dashboard')).data,
  achievements: async () => (await api.get('/user/achievements/')).data,
  trending: async () => (await api.get('/user/trending')).data,
  search: async (q) => (await api.get('/user/search', { params: { q } })).data,
  uploadAvatar: async (file) => {
    const body = new FormData();
    body.append('file', file);
    return (await api.post('/user/upload-avatar', body, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  changePassword: async (payload) => (await api.post('/user/change-password', payload)).data,
  deleteAccount: async (password) => (await api.delete('/user/me', { data: { password } })).data,
  sendFeedback: async (comment) => (await api.post('/user/feedback', { comment })).data,
  logout: async () => (await api.post('/user/logout')).data,
};

export default userService;
