import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Code, Database, Sparkles, 
  ArrowRight, Clock, Star, Layout,
  CheckCircle2, Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearningVault() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const response = await api.get("/study/tutorials/my-vault"); // Updated path
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error("Vault Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVault();
  }, []);

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
        
        {/* Header (Keep your existing header) */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`group relative border-none bg-white rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-500 flex flex-col h-full border border-transparent ${course.is_ready ? 'hover:border-primary/20 hover:shadow-2xl' : 'opacity-80'}`}>
                
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${course.gradient || 'from-primary/20 to-blue-500/20'} rounded-bl-[5rem] -z-0 opacity-50 transition-transform ${course.is_ready && 'group-hover:scale-110'}`} />
                
                <CardContent className="p-8 space-y-6 relative z-10 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                      <Brain className={course.is_ready ? "text-primary" : "text-slate-300"} size={32} />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100">
                      {course.is_ready ? course.category : "Constructing"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-left">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none transition-colors group-hover:text-primary">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2">
                      {course.is_ready ? course.description : "Our AI is currently architecting your neural roadmap. This usually takes 60 seconds."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Sync Progress</span>
                      <span className="text-primary">{Math.round(course.progress || 0)}%</span>
                    </div>
                    <Progress value={course.progress || 0} className="h-2 bg-slate-100" />
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0 relative z-10">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Layout size={14} />
                        <span className="text-xs font-bold">{course.nodes || 0} Nodes</span>
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
                          ? "bg-slate-50 hover:bg-primary text-slate-900 hover:text-white hover:shadow-lg" 
                          : "bg-slate-50 text-slate-300 cursor-not-allowed"
                      }`}
                    >
                      {course.is_ready ? <ArrowRight size={20} /> : <Loader2 size={20} className="animate-spin" />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}