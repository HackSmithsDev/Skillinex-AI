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
            className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[60]"
          />
          
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-card shadow-[-20px_0_50px_var(--shadow-ink)] z-[61] flex flex-col border-l-4 border-primary"
          >
            {/* Header */}
            <div className="p-8 border-b-2 border-muted flex justify-between items-center bg-card">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-border">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-[0.2em] text-foreground">CogniLit AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-success rounded-full animate-pulse" />
                    <p className="text-[9px] text-subtle font-black uppercase tracking-widest">Neural_Link_Active</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X size={24} className="text-subtle" />
              </button>
            </div>

            {/* Chat Space */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface selection:bg-primary selection:text-primary-foreground">
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
                    ? 'bg-primary text-primary-foreground rounded-tr-none font-bold' 
                    : 'bg-card border-2 border-muted shadow-xl shadow-border/50 rounded-tl-none prose prose-slate italic font-medium'
                  }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface p-6 rounded-[2rem] rounded-tl-none border-2 border-muted animate-pulse">
                    <Loader2 className="animate-spin text-subtle" size={20} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleSendMessage} className="p-8 bg-card border-t-2 border-muted">
              <div className="relative group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="INPUT_COMMAND_HERE..."
                  className="w-full bg-surface border-2 border-muted rounded-2xl py-5 pl-8 pr-16 focus:border-primary focus:bg-card outline-none transition-all font-mono text-xs font-bold"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="absolute right-3 top-2.5 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-brand transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-4 text-[8px] font-black text-line-strong uppercase tracking-widest text-center">
                CogniLit Research Mentor // v1.0.4-Stable
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}