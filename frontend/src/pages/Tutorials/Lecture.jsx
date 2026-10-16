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
  const [loadError, setLoadError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

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
        setLoadError("");
      } catch (error) {
        console.error("Neural Node Error:", error);
        setLoadError(error.response?.data?.detail || "Could not load this lecture.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lectureId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
        <p role="alert" className="font-semibold text-danger">{loadError}</p>
        <Button onClick={() => navigate(`/tutorials/${courseId}`)}>Return to course</Button>
      </div>
    );
  }

  // Find current section info for the HUD
  const activeSection = courseHierarchy?.sections.find(s => s.id === sectionId);
  const playlist = activeSection?.chapters || [];
  const currentChapter = playlist.find((item) => item.id === lectureId);

  const handleComplete = async () => {
    if (isCompleting || currentChapter?.is_completed) return;
    setIsCompleting(true);
    setCompletionMessage("");
    try {
      const response = await api.post(`/study/tutorials/lecture/${lectureId}/complete`);
      setCourseHierarchy((current) => current && ({
        ...current,
        sections: current.sections.map((section) => section.id !== sectionId ? section : ({
          ...section,
          chapters: section.chapters.map((chapter) => chapter.id === lectureId
            ? { ...chapter, is_completed: true }
            : chapter)
        }))
      }));
      setCompletionMessage(response.data.xp_earned
        ? `Module complete. +${response.data.xp_earned} XP earned.`
        : "Module already completed. No additional XP was awarded.");
    } catch (error) {
      setCompletionMessage(error.response?.data?.detail || "Could not complete this module. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen font-sans">
      <div className="max-w-page-wide mx-auto p-4 lg:p-10 space-y-8">
        
        {/* HUD / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/tutorials/${courseId}`)} 
              className="rounded-2xl h-12 w-12 p-0 hover:bg-card shadow-sm border border-muted"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="text-left">
              <div className="flex items-center gap-2 text-compact font-black uppercase tracking-editorial text-subtle mb-1">
                <span>Course Archive</span>
                <ChevronRight size={10} />
                <span className="text-primary">{courseHierarchy?.title}</span>
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tighter">{activeSection?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-card p-2 rounded-card shadow-sm border border-muted">
            <div className="px-4 py-2 bg-primary rounded-xl text-primary-foreground flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">Section Node</span>
            </div>
            <div className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {lectureData?.title}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* MAIN STAGE */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* The Video Node */}
            <div className="group relative aspect-video w-full rounded-feature overflow-hidden shadow-2xl bg-primary border-video-frame border-card ring-1 ring-muted">
              {/* Note: In a real app, you'd use the lectureData.video_query to fetch a YouTube ID via an API */}
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed?listType=search&list=${lectureData?.video_query}`} 
                title="Lecture Video" 
                allowFullScreen 
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-muted">
              <div className="text-left space-y-2">
                <Badge className="bg-primary/10 text-primary border-none rounded-lg font-black uppercase tracking-widest text-label">Module Active</Badge>
                <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                  {lectureData?.title}
                </h1>
              </div>
              <Button
                onClick={handleComplete}
                disabled={isCompleting || currentChapter?.is_completed}
                className="rounded-control h-16 px-8 gap-3 bg-brand hover:bg-brand-strong shadow-xl shadow-brand-soft font-black"
              >
                {isCompleting ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle size={22} />}
                {currentChapter?.is_completed ? "Module Completed" : "Complete Module"}
              </Button>
              {completionMessage && <p role="status" className="text-sm font-semibold text-subtle">{completionMessage}</p>}
            </div>

            {/* Markdown Content Section */}
            <Card className="border-none bg-card shadow-xl shadow-border/50 rounded-dialog overflow-hidden">
              <CardContent className="p-10 prose prose-slate max-w-none text-left">
                <h4 className="flex items-center gap-2 font-black text-foreground mb-8 uppercase tracking-editorial text-compact">
                  <Sparkles size={16} className="text-primary" /> Knowledge Briefing
                </h4>
                <div className="text-soft font-medium leading-relaxed">
                   <ReactMarkdown>{lectureData?.raw_text}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <div className="p-8 bg-primary text-primary-foreground rounded-dialog flex flex-col justify-center gap-2 text-left">
                  <span className="text-primary font-black uppercase text-compact tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Node Yield
                  </span>
                  <div className="text-3xl font-black tracking-tighter">+50 XP Points</div>
              </div>
              <button onClick={() => setIsChatOpen(true)} className="p-8 bg-card border-2 border-dashed border-border rounded-dialog flex items-center gap-6 hover:border-primary transition-all group">
                <div className="p-5 bg-brand-soft text-brand rounded-2xl group-hover:bg-brand group-hover:text-primary-foreground transition-all">
                  <Bot size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-xl text-foreground">CogniLit AI</p>
                  <p className="text-sm text-subtle font-bold uppercase tracking-widest">Start Dialogue</p>
                </div>
              </button>
            </div>
          </div>

          {/* SIDEBAR PLAYLIST */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-black text-foreground text-xl tracking-tight px-2 flex items-center gap-2">
              <PlayCircle size={22} className="text-primary" /> Section Stack
            </h3>

            <ScrollArea className="h-lecture-player rounded-hero border border-muted bg-card p-6 shadow-sm">
              <div className="space-y-6">
                {playlist.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/tutorials/${courseId}/${sectionId}/${item.id}`)}
                    className={`group cursor-pointer p-4 rounded-panel transition-all text-left ${item.id === lectureId ? "bg-surface ring-1 ring-muted" : "hover:bg-surface/50"}`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${item.id === lectureId ? "bg-primary text-primary-foreground" : "bg-muted text-subtle"}`}>
                         {idx + 1}
                       </div>
                       <div className="flex-1">
                          <p className="text-compact font-black uppercase tracking-widest text-subtle mb-1">Node Status: {item.is_completed ? "Synced" : "Offline"}</p>
                          <p className={`font-black tracking-tight leading-none ${item.id === lectureId ? "text-primary" : "text-soft"}`}>
                            {item.title}
                          </p>
                       </div>
                       {item.is_completed && <CheckCircle className="text-success" size={18} />}
                    </div>
                  </button>
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