import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Brain, Target } from 'lucide-react';
import api from '../api/axios';

const CreateRoadmapModal = ({ isOpen, onClose, onCreated }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      // This will hit your FastAPI endpoint that triggers Gemini
      const response = await api.post('/courses/generate', { 
        prompt_topic: topic, 
        difficulty: difficulty 
      });
      onCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Failed to generate roadmap", error);
      alert("AI was a bit sleepy. Try again!");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-muted flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary-hover flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            AI Roadmap Generator
          </h2>
          <button onClick={onClose} className="text-subtle hover:text-soft"><X size={24}/></button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-soft mb-2">What do you want to learn?</label>
            <input 
              type="text"
              placeholder="e.g. Advanced React Patterns or 450kg Deadlift Form"
              className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-soft mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 rounded-xl border font-semibold text-sm transition-all ${
                    difficulty === lvl ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'border-border text-muted-foreground hover:bg-surface'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className={`w-full py-4 rounded-2xl font-bold text-primary-foreground shadow-lg transition-all flex items-center justify-center gap-3 ${
              isGenerating ? 'bg-subtle cursor-not-allowed' : 'bg-primary hover:bg-info-strong active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-card"></div>
                Analyzing and Building...
              </>
            ) : (
              <>Generate Custom Path</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoadmapModal;