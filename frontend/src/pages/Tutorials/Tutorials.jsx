import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios"; // Your axios instance
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, Sparkles, ArrowLeft, 
  Zap, Clock, Play, Fingerprint, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tutorials() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const fetchCourseStructure = async () => {
      try {
        const response = await api.get(`/study/tutorials/courses/${courseId}`);
        setCourseData(response.data);
        
        // Auto-open the first section if data exists
        if (response.data.sections?.length > 0) {
          setOpenSection(response.data.sections[0].id);
        }
      } catch (error) {
        console.error("Neural Link Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseStructure();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!courseData) return <div>Archive not found.</div>;

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row relative font-sans overflow-hidden">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -skew-x-6 translate-x-20 -z-10 border-l border-slate-100" />

      {/* LEFT: DYNAMIC INDEX */}
      <div className="w-full lg:w-[420px] flex flex-col p-8 lg:p-12 z-10 border-r border-slate-100/50">
        <button 
          onClick={() => navigate('/learning-vault')}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all mb-16"
        >
          <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Vault
        </button>

        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900 leading-[0.9] mb-6">
            {courseData.title}
          </h1>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
              <span className="text-[10px] font-black text-primary uppercase">Active</span>
            </div>
            <Progress value={40} className="h-[2px] bg-slate-100" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <Accordion 
            type="single" 
            value={openSection} 
            onValueChange={setOpenSection} 
            collapsible 
            className="space-y-6"
          >
            {courseData.sections.map((section, idx) => (
              <AccordionItem key={section.id} value={section.id} className="border-none">
                <AccordionTrigger className="hover:no-underline p-0 group">
                  <div className="flex items-center gap-5 w-full text-left">
                    <span className={`text-4xl font-black transition-colors duration-500 ${openSection === section.id ? "text-primary" : "text-slate-100 group-hover:text-slate-200"}`}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                      {section.name}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6 pb-2 ml-14 space-y-3 border-l-2 border-slate-50">
                  {section.chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => { setSelectedSection(section); setSelectedChapter(ch); }}
                      className={`w-full text-left px-5 py-2 text-[12px] font-bold transition-all flex items-center justify-between group/item ${
                        selectedChapter?.id === ch.id ? "text-primary bg-slate-50/50 rounded-r-lg" : "text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {ch.is_completed && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {ch.title}
                      </div>
                      <ChevronRight size={14} className={`transition-all ${selectedChapter?.id === ch.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} />
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* RIGHT: THE VIEWPORT */}
      <div className="flex-1 relative flex items-center justify-center p-8 lg:p-20 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedChapter ? (
            <motion.div
              key={selectedChapter.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full max-w-5xl"
            >
              <div className="flex items-center gap-4 mb-10">
                <Badge variant="outline" className="border-slate-200 text-slate-400 font-black px-4 py-1 text-[9px] tracking-[0.2em] uppercase rounded-full">
                  Node: {selectedChapter.id.split('-')[0]}
                </Badge>
                <div className="h-[1px] w-12 bg-slate-100" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> {selectedChapter.time}
                </span>
              </div>

              <h2 className="text-7xl lg:text-9xl font-black text-slate-900 tracking-[-0.07em] leading-[0.8] mb-12">
                {selectedChapter.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 0 ? "block" : "block text-transparent stroke-text"}>
                    {word}
                  </span>
                ))}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
                <div className="space-y-10">
                  <p className="text-2xl text-slate-500 font-bold leading-tight max-w-md tracking-tight">
                    {selectedChapter.overview}
                  </p>
                  
                  <div className="flex gap-10 border-t border-slate-100 pt-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">
                        <Fingerprint className="inline mr-1" size={12}/> Complexity
                      </span>
                      <span className="font-black text-slate-900 uppercase text-[12px] tracking-widest">{selectedChapter.complexity}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">
                        <Zap className="inline mr-1" size={12}/> Yield
                      </span>
                      <span className="font-black text-slate-900 uppercase text-[12px] tracking-widest">+50 XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-6">
                  <button 
                    onClick={() => navigate(`/tutorials/${courseId}/${openSection}/${selectedChapter.id}`)}
                    className="group relative h-32 w-32 rounded-full border-2 border-slate-900 flex items-center justify-center transition-all hover:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200"
                  >
                    <Play className="text-slate-900 group-hover:text-white group-hover:scale-125 transition-all ml-1" fill="currentColor" size={32} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">Execute Module</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-left space-y-6">
              <Sparkles className="text-slate-100" size={80} />
              <h3 className="text-8xl font-black text-slate-100 tracking-tighter uppercase leading-none select-none">
                Awaiting<br/>Input.
              </h3>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text { -webkit-text-stroke: 1.5px #0f172a; }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; }
      `}} />
    </div>
  );
}