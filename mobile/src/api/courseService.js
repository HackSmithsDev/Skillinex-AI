import api from './axios';

const courseService = {
  generate: async (prompt_topic, difficulty) =>
    (await api.post('/courses/generate', { prompt_topic, difficulty })).data,
};

export default courseService;
