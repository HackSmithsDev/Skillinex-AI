import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlayCircle, FileText, Download, Bot, 
  Clock, CheckCircle, ArrowLeft, Layers, 
  ChevronRight, Sparkles, Zap, Loader2 
} from "lucide-react";

import Chatbot from "@/components/Chatbot";

export default function Lecture() {
  const navigate = useNavigate();
  const { courseId, sectionId, lectureId } = useParams();

  const [lectureData, setLectureData] = useState(null);
  const [courseHierarchy, setCourseHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch specific lecture content (Markdown + Video Query)
        const lectureRes = await api.get(`/study/tutorials/lecture/${lectureId}`);
        setLectureData(lectureRes.data);

        // 2. Fetch sidebar hierarchy to populate the "Section Stack"
        const hierarchyRes = await api.get(`/study/tutorials/courses/${courseId}`);
        setCourseHierarchy(hierarchyRes.data);
      } catch (error) {
        console.error("Neural Node Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lectureId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Find current section info for the HUD
  const activeSection = courseHierarchy?.sections.find(s => s.id === sectionId);
  const playlist = activeSection?.chapters || [];

  return (
    <div className="bg-[#FCFDFF] min-h-screen font-sans">
      <div className="max-w-[1500px] mx-auto p-4 lg:p-10 space-y-8">
        
        {/* HUD / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/tutorials/${courseId}`)} 
              className="rounded-2xl h-12 w-12 p-0 hover:bg-white shadow-sm border border-slate-100"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="text-left">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                <span>Course Archive</span>
                <ChevronRight size={10} />
                <span className="text-primary">{courseHierarchy?.title}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{activeSection?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100">
            <div className="px-4 py-2 bg-slate-900 rounded-xl text-white flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">Section Node</span>
            </div>
            <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">
              {lectureData?.title}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* MAIN STAGE */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* The Video Node */}
            <div className="group relative aspect-video w-full rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-900 border-[10px] border-white ring-1 ring-slate-100">
              {/* Note: In a real app, you'd use the lectureData.video_query to fetch a YouTube ID via an API */}
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed?listType=search&list=${lectureData?.video_query}`} 
                title="Lecture Video" 
                allowFullScreen 
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-100">
              <div className="text-left space-y-2">
                <Badge className="bg-primary/10 text-primary border-none rounded-lg font-black uppercase tracking-widest text-[9px]">Module Active</Badge>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                  {lectureData?.title}
                </h1>
              </div>
              <Button 
                onClick={async () => {
                  await api.post(`/study/tutorials/lecture/${lectureId}/complete`);
                  alert("XP Synchronized: +50 XP");
                }}
                className="rounded-[1.25rem] h-16 px-8 gap-3 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black"
              >
                <CheckCircle size={22} /> Complete Module
              </Button>
            </div>

            {/* Markdown Content Section */}
            <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 prose prose-slate max-w-none text-left">
                <h4 className="flex items-center gap-2 font-black text-slate-900 mb-8 uppercase tracking-[0.2em] text-[10px]">
                  <Sparkles size={16} className="text-primary" /> Knowledge Briefing
                </h4>
                <div className="text-slate-600 font-medium leading-relaxed">
                   <ReactMarkdown>{lectureData?.raw_text}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex flex-col justify-center gap-2 text-left">
                  <span className="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Node Yield
                  </span>
                  <div className="text-3xl font-black tracking-tighter">+50 XP Points</div>
              </div>
              <button onClick={() => setIsChatOpen(true)} className="p-8 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center gap-6 hover:border-primary transition-all group">
                <div className="p-5 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Bot size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-xl text-slate-900">CogniLit AI</p>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Start Dialogue</p>
                </div>
              </button>
            </div>
          </div>

          {/* SIDEBAR PLAYLIST */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-black text-slate-900 text-xl tracking-tight px-2 flex items-center gap-2">
              <PlayCircle size={22} className="text-primary" /> Section Stack
            </h3>

            <ScrollArea className="h-[800px] rounded-[3rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                {playlist.map((item, idx) => (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/tutorials/${courseId}/${sectionId}/${item.id}`)}
                    className={`group cursor-pointer p-4 rounded-[2rem] transition-all text-left ${item.id === lectureId ? "bg-slate-50 ring-1 ring-slate-100" : "hover:bg-slate-50/50"}`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${item.id === lectureId ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                         {idx + 1}
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Node Status: {item.is_completed ? "Synced" : "Offline"}</p>
                          <p className={`font-black tracking-tight leading-none ${item.id === lectureId ? "text-primary" : "text-slate-700"}`}>
                            {item.title}
                          </p>
                       </div>
                       {item.is_completed && <CheckCircle className="text-emerald-500" size={18} />}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        lectureTitle={lectureData?.title} 
      />
    </div>
  );
}