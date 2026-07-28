import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, Sparkles, MessageSquare, Zap } from 'lucide-react';
import api from "@/api/axios";
import ReactMarkdown from 'react-markdown';

export default function Chatbot({ isOpen, onClose, lectureTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Session if opening for the first time
  useEffect(() => {
    if (isOpen && !sessionId) {
      const initChat = async () => {
        try {
          const res = await api.post("/api/sessions", { 
            title: `Mentorship: ${lectureTitle || "New Node"}` 
          });
          setSessionId(res.data.id);
        } catch (err) {
          console.error("Neural Link Initialization Failed", err);
        }
      };
      initChat();
    }
  }, [isOpen, sessionId, lectureTitle]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/message", {
        content: input,
        session_id: sessionId
      });
      // The backend returns the assistant's ChatMessageOut
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "### ERROR_UPLINK_FAILED\nNeural link interrupted. Please verify your connection." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60]"
          />
          
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[61] flex flex-col border-l-4 border-slate-900"
          >
            {/* Header */}
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-900">CogniLit AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Neural_Link_Active</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Chat Space */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FCFDFF] selection:bg-slate-900 selection:text-white">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 grayscale">
                  <Sparkles size={60} />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] max-w-[200px]">Awaiting Neural Transmission</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-6 rounded-[2rem] text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none font-bold' 
                    : 'bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 rounded-tl-none prose prose-slate italic font-medium'
                  }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 p-6 rounded-[2rem] rounded-tl-none border-2 border-slate-100 animate-pulse">
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleSendMessage} className="p-8 bg-white border-t-2 border-slate-100">
              <div className="relative group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="INPUT_COMMAND_HERE..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-8 pr-16 focus:border-slate-900 focus:bg-white outline-none transition-all font-mono text-xs font-bold"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-3 top-2.5 p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-4 text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">
                CogniLit Research Mentor // v1.0.4-Stable
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}