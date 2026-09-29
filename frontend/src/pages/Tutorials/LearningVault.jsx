import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Code, Database, Sparkles, 
  ArrowRight, Clock, Star, Layout,
  CheckCircle2, Loader2, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearningVault() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  const fetchVault = async (isBackground = false) => {
    // 1. Verify access token exists before firing
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    try {
      const response = await api.get("/study/tutorials/my-vault");
      const data = Array.isArray(response.data) ? response.data : [];
      setEnrolledCourses(data);
      setError(null);

      // 2. Auto-poll if any course is still constructing (is_ready == false)
      const hasUnreadyCourse = data.some((course) => !course.is_ready);
      if (hasUnreadyCourse && !pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          fetchVault(true);
        }, 6000);
      } else if (!hasUnreadyCourse && pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    } catch (err) {
      console.error("Vault Sync Error:", err);
      if (!isBackground) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          navigate("/auth/login");
        } else {
          setError("Failed to synchronize your vault archives.");
        }
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchVault();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Icon resolver based on category
  const getCategoryIcon = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("code") || cat.includes("web") || cat.includes("dev")) {
      return Code;
    }
    if (cat.includes("data") || cat.includes("sql") || cat.includes("db")) {
      return Database;
    }
    if (cat.includes("ai") || cat.includes("ml") || cat.includes("neural")) {
      return Brain;
    }
    return Sparkles;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto animate-spin text-primary" size={40} />
          <p className="text-slate-400 font-black italic tracking-tighter">SYNCHRONIZING ARCHIVE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/60 pb-8">
          <div className="space-y-2 text-left">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
              Personal Repository
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Learning Vault
            </h1>
            <p className="text-slate-500 font-medium">
              Access your active AI-generated roadmaps, modules, and mastery progress.
            </p>
          </div>

          <Button 
            onClick={() => navigate("/tutorials")}
            className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            <Sparkles size={18} className="mr-2" />
            Explore Courses
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && enrolledCourses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-xl font-bold text-slate-800">Your Vault is Empty</h3>
              <p className="text-sm text-slate-400">
                You haven't enrolled in or generated any tutorial roadmaps yet.
              </p>
            </div>
            <Button 
              onClick={() => navigate("/tutorials")} 
              className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              Browse Tutorials
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course, idx) => {
            const CategoryIcon = getCategoryIcon(course.category);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className={`group relative border-none bg-white rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-500 flex flex-col h-full border border-transparent ${course.is_ready ? 'hover:border-primary/20 hover:shadow-2xl' : 'opacity-85'}`}>
                  
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${course.gradient || 'from-primary/20 to-blue-500/20'} rounded-bl-[5rem] -z-0 opacity-50 transition-transform ${course.is_ready && 'group-hover:scale-110'}`} />
                  
                  <CardContent className="p-8 space-y-6 relative z-10 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                        <CategoryIcon className={course.is_ready ? "text-primary" : "text-slate-300"} size={32} />
                      </div>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100">
                        {course.is_ready ? (course.category || "General") : "Constructing"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-left">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none transition-colors group-hover:text-primary">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2">
                        {course.is_ready 
                          ? (course.description || "Comprehensive modular learning path.")
                          : "Our AI is currently architecting your neural roadmap. This usually takes 60 seconds."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Sync Progress</span>
                        <span className="text-primary font-bold">{Math.round(course.progress || 0)}%</span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2 bg-slate-100" />
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0 relative z-10">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Layout size={14} />
                          <span className="text-xs font-bold">{course.nodes || course.chapters_count || 0} Nodes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {course.is_ready ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <Clock size={14} className="animate-pulse text-amber-500" />
                          )}
                          <span className="text-xs font-bold">
                            {course.is_ready ? "Online" : "Building"}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        disabled={!course.is_ready}
                        onClick={() => navigate(`/tutorials/${course.id}`)}
                        className={`rounded-xl px-4 py-6 transition-all shadow-none ${
                          course.is_ready 
                            ? "bg-slate-50 hover:bg-primary text-slate-900 hover:text-white hover:shadow-lg cursor-pointer" 
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        {course.is_ready ? <ArrowRight size={20} /> : <Loader2 size={20} className="animate-spin text-slate-400" />}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}