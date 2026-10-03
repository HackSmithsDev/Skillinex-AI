import api from './axios';

const authService = {
  checkEmail: async (email) => (await api.get('/auth/check-email', { params: { email } })).data,

  suggestInterests: async (experience, age) =>
    (await api.post('/auth/suggest-interests', { experience, age })).data,

  login: async (email, password) => (await api.post('/auth/token', { email, password })).data,

  // `fields` is a plain object; tech_stack is serialised as the backend expects.
  signup: async ({ full_name, email, password, age, gender, bio = '', experience = '', tech_stack = {}, photo }) => {
    const body = new FormData();
    body.append('full_name', full_name);
    body.append('email', email);
    body.append('password', password);
    body.append('age', String(parseInt(age, 10)));
    body.append('gender', gender);
    body.append('bio', bio);
    body.append('experience', experience);
    body.append('tech_stack', JSON.stringify(tech_stack));
    if (photo) body.append('file', photo);
    return (await api.post('/auth/signup', body, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },

  forgotPassword: async (email) => (await api.post('/auth/forgot-password', { email })).data,

  resetPassword: async (email, code, new_password) =>
    (await api.post('/auth/reset-password', { email, code, new_password })).data,
};

export default authService;
