import api from './axios';

const tutorialService = {
  getLearningVault: async () => (await api.get('/study/tutorials/my-vault')).data,
  getCourse: async (courseId) => (await api.get(`/study/tutorials/courses/${courseId}`)).data,
  getLecture: async (lectureId) => (await api.get(`/study/tutorials/lecture/${lectureId}`)).data,
  completeLecture: async (lectureId) => (await api.post(`/study/tutorials/lecture/${lectureId}/complete`)).data,
};

export default tutorialService;
