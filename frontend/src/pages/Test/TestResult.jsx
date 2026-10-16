import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, RotateCcw, BookOpen, Share2, Zap, Search } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";

export default function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReinitializing, setIsReinitializing] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  
  // Retrieve evaluation artifacts passed back from the Postgres persistence handler
  const { result, questions, selectedAnswers, depth } = location.state || {};

  useEffect(() => {
    if (!result) navigate("/test", { replace: true });
  }, [navigate, result]);

  // Structural safety fallback configurations
  const finalResult = result || {
    id: "0x-SYNC-VOID",
    score: 0,
    total_questions: questions?.length || 0,
    node_name: "Null_Node"
  };

  const percentage = finalResult.score;
  const isPassed = percentage >= 70;

  // 1. RE-INITIALIZE ROUTING FIX
  const handleReInitialize = async () => {
    if (!questions?.length || !finalResult.node_name) {
      navigate("/test", { replace: true }); // Fail-safe fallback to dashboard
      return;
    }
    setIsReinitializing(true);
    try {
      const response = await api.post("/study/test/generate", {
        node: finalResult.node_name,
        depth: depth || "Intermediate",
        units: questions.length,
        scope: "Node Only"
      });
      sessionStorage.setItem("active_neural_session", response.data.session_id);
      navigate("/test/session", {
        replace: true,
        state: { testData: { ...response.data, depth: depth || "Intermediate" } }
      });
    } catch (error) {
      window.alert(error.response?.data?.detail || "Could not initialize a new assessment. Please try again.");
    } finally {
      setIsReinitializing(false);
    }
  };

  // 2. REVIEW DIAGNOSTICS DISPATCH
  const handleReviewDiagnostics = () => {
    if (!questions?.length) return;
    
    navigate("/test/session", {
      replace: true,
      state: {
        testData: {
          session_id: finalResult.id,
          questions: questions,
          node_name: finalResult.node_name,
          depth: depth || "Intermediate",
          // Pass down analytical arrays to intercept standard interactive flows
          reviewMode: true,
          savedAnswers: selectedAnswers || {}
        }
      }
    });
  };

  const handleShareResult = async () => {
    const shareText = `I scored ${percentage}% on ${finalResult.node_name} in Skillinex.`;
    setShareStatus("");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Skillinex assessment result", text: shareText });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareStatus("Result copied to clipboard.");
      } else {
        window.prompt("Copy your result:", shareText);
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareStatus("Could not share the result.");
    }
  };

  return (
    <div className="min-h-screen bg-surface/50 flex items-center justify-center p-6 lg:p-16 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full"
      >
        <Card className="border-none shadow-result-depth rounded-none overflow-hidden relative bg-card">
          
          <div className="absolute top-0 right-0 p-8 opacity-trace pointer-events-none">
             <Trophy size={300} strokeWidth={1} />
          </div>

          <CardContent className="p-10 lg:p-16 text-center space-y-12 relative z-10">
            
            {/* XP Gained Indicator */}
            <div className="flex justify-center">
              <div className="bg-primary text-highlight px-6 py-2 flex items-center gap-3 shadow-lg">
                <Zap size={14} className="fill-highlight text-highlight" />
                <span className="text-compact font-black uppercase tracking-wide">+{percentage * 2} XP Synced</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-compact font-black uppercase tracking-hero text-subtle">Assessment_Complete</span>
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-heading">
                Node <br />
                <span className="text-transparent stroke-text">{isPassed ? "Synced" : "Failed"}</span>
              </h1>
            </div>

            <div className="flex items-center justify-center gap-12 bg-surface py-8 px-6 border border-muted">
               <div className="text-center">
                  <p className="text-label font-black uppercase text-subtle mb-1 tracking-widest">Efficiency</p>
                  <p className={`text-5xl font-black italic tracking-tighter ${isPassed ? 'text-success' : 'text-danger'}`}>
                    {percentage}%
                  </p>
               </div>
               <div className="h-12 w-px bg-border" />
               <div className="text-center">
                  <p className="text-label font-black uppercase text-subtle mb-1 tracking-widest">Integrity</p>
                  <p className="text-5xl font-black italic tracking-tighter text-foreground">
                    {Math.round((percentage / 100) * finalResult.total_questions)}/{finalResult.total_questions}
                  </p>
               </div>
            </div>

            {/* ACTION PIPELINE GRIDS */}
            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={handleReviewDiagnostics}
                  disabled={!questions?.length}
                  className="h-16 bg-primary text-primary-foreground rounded-none font-black uppercase tracking-widest hover:bg-highlight hover:text-foreground transition-all group border border-primary"
                >
                  <Search className="mr-2 group-hover:scale-110 transition-transform" size={16} /> Review Answers
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleReInitialize}
                  disabled={isReinitializing}
                  className="h-16 border-2 border-primary bg-transparent text-foreground rounded-none font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {isReinitializing ? "Initializing..." : <><RotateCcw className="mr-2" size={16} /> Re-Initialize</>}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => navigate("/test", { replace: true })}
                  className="h-14 bg-muted text-soft hover:bg-border rounded-none font-black uppercase tracking-widest text-detail transition-all"
                >
                  <BookOpen className="mr-2" size={14} /> Return to Terminal Dashboard
                </Button>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => navigate("/", { replace: true })}
                className="w-full text-label font-black uppercase tracking-expanded text-subtle hover:text-foreground pt-4"
              >
                <ArrowLeft size={10} className="mr-2" /> Disconnect from Skillinex Core
              </Button>
            </div>

            {/* Terminal Metadata Footer */}
            <div className="pt-8 flex justify-between items-end border-t border-muted opacity-50">
                <div className="text-left">
                  <p className="text-caption font-black uppercase tracking-widest text-subtle">Session_Record_Hash</p>
                  <p className="text-label font-mono font-bold text-soft">{finalResult.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShareResult}
                  aria-label="Share assessment result"
                  title="Share assessment result"
                  className="h-8 w-8 text-subtle hover:text-foreground"
                >
                  <Share2 size={14} />
                </Button>
            </div>
            {shareStatus && <p role="status" className="text-xs text-subtle">{shareStatus}</p>}

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}