import axiosInstance from './axios';

const quizService = {
  // Initialize a new assessment session
  initializeAssessment: async (config) => {
    // config includes { level, units, nodeId }
    const response = await axiosInstance.post('/quiz/initialize/', config);
    return response.data; // Should return the Quiz ID and first question
  },

  // Submit answer and get next question
  submitAnswer: async (quizId, questionId, selection) => {
    const response = await axiosInstance.post(`/quiz/${quizId}/sync/`, {
      question_id: questionId,
      answer: selection
    });
    return response.data;
  },

  // Finalize sync and calculate XP
  finalizeSync: async (quizId) => {
    const response = await axiosInstance.get(`/quiz/${quizId}/results/`);
    return response.data;
  }
};

export default quizService;