import axiosInstance from './axios';

const tutorialService = {
  // Fetch all available course roadmaps
  getLearningVault: async () => {
    const response = await axiosInstance.get('/tutorials/vault/');
    return response.data;
  },

  // Get a specific lecture node
  getLectureDetails: async (courseId, lectureId) => {
    const response = await axiosInstance.get(`/tutorials/${courseId}/${lectureId}/`);
    return response.data;
  },

  // Mark node as completed (Update Neural Map)
  completeNode: async (nodeId) => {
    const response = await axiosInstance.post('/tutorials/complete/', { nodeId });
    return response.data;
  }
};

export default tutorialService;