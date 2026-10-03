import api from './axios';

const quizService = {
  // config: { node, depth, units, scope } -> { session_id, questions, node_name }
  generate: async (config) => (await api.post('/study/test/generate', config)).data,
  sync: async (sessionId) => (await api.get(`/study/test/sync/${sessionId}`)).data,
  // result: { node_name, score, total_questions, analysis }
  submit: async (sessionId, result) =>
    (await api.post('/study/test/submit', result, { params: { session_id: sessionId } })).data,
  history: async () => (await api.get('/study/test/history')).data,
};

export default quizService;
