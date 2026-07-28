import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, AlertCircle, Eye } from "lucide-react";
import api from "@/api/axios";

export default function QuizSession() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode Detection Flags
  const isReviewMode = location.state?.testData?.reviewMode || false;
  const savedAnswers = location.state?.testData?.savedAnswers || {};

  // State Management
  const [testMetadata, setTestMetadata] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. SYNC LOGIC: Load from State or Redis Recovery
  useEffect(() => {
    const initializeSession = async () => {
      // Priority 1: Use data passed from Dashboard/Result navigation state
      if (location.state?.testData) {
        const { questions, session_id, node_name, reviewMode, savedAnswers } = location.state.testData;
        console.log(`📐 CORE TERMINAL DATA RECV [Review: ${!!reviewMode}]:`, questions);
        
        setQuestions(questions);
        setTestMetadata({ session_id, node_name });
        
        // If coming in for a historical audit, pipe saved values straight into local state
        if (reviewMode && savedAnswers) {
          setSelectedAnswers(savedAnswers);
        }
        
        setIsLoading(false);
      } 
      // Priority 2: Recovery if page was refreshed (Only valid for standard non-review runs)
      else {
        const savedSessionId = sessionStorage.getItem("active_neural_session");
        if (savedSessionId) {
          try {
            const res = await api.get(`/study/test/sync/${savedSessionId}`);
            setQuestions(res.data.questions);
            setTestMetadata({ session_id: savedSessionId, node_name: res.data.node_name });
          } catch (err) {
            console.error("Session sync failed:", err);
            navigate("/test"); 
          } finally {
            setIsLoading(false);
          }
        } else {
          navigate("/test");
        }
      }
    };

    initializeSession();
  }, [location.state, navigate]);

  // 2. INTERACTION HANDLERS
  const handleAnswerSelect = (answer) => {
    if (isReviewMode) return; // Prevent mutation during analysis audit
    setSelectedAnswers(prev => ({
      ...prev,
      [currentStep]: answer
    }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (isReviewMode) {
        navigate("/test", { replace: true }); // Exit review mode gracefully back to terminal dashboard
      } else {
        await handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 3. FINAL SUBMISSION TO POSTGRES
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Calculate Score
      const correctCount = questions.reduce((acc, q, idx) => {
        return acc + (selectedAnswers[idx] === q.answer ? 1 : 0);
      }, 0);
      
      const scorePercentage = Math.round((correctCount / questions.length) * 100);

      // Submit to Backend
      const res = await api.post(`/study/test/submit?session_id=${testMetadata.session_id}`, {
        node_name: testMetadata.node_name,
        score: scorePercentage,
        total_questions: questions.length,
        analysis: {
          difficulty: location.state?.testData?.depth || "General",
          completed_at: new Date().toISOString()
        }
      });

      sessionStorage.removeItem("active_neural_session");
      
      // Navigate to results passing the complete dataset payload context
      navigate("/test/result", { 
        replace: true,
        state: { 
          result: res.data,              
          questions: questions,          
          selectedAnswers: selectedAnswers, 
          depth: location.state?.testData?.depth || "Intermediate"
        } 
      });
    } catch (err) {
      console.error("Sync to Postgres failed:", err);
      alert("Neural sync rejected. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-900" size={48} />
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Armored option parsing block
  const renderedOptions = currentQuestion
    ? [
        currentQuestion.option1,
        currentQuestion.option2,
        currentQuestion.option3,
        currentQuestion.option4
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-16">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Target Node</span>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              {testMetadata?.node_name}
            </h2>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Progress</span>
             <p className="text-xl font-black italic tracking-tighter tabular-nums">
                {currentStep + 1} / {questions.length}
             </p>
          </div>
        </div>

        <Card className="shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border-none rounded-none bg-white">
          <CardHeader className="p-0">
             <Progress value={progress} className="h-1 rounded-none bg-slate-100 accent-slate-900" />
          </CardHeader>

          <CardContent className="p-10 lg:p-16 min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        {isReviewMode ? (
                          <Eye size={14} className="text-blue-500" />
                        ) : (
                          <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            {isReviewMode ? "Diagnostic Review Stream" : "Neural Query"}
                        </span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        {currentQuestion?.question}
                    </h3>
                </div>

                <RadioGroup 
                    value={selectedAnswers[currentStep] || ""} 
                    onValueChange={handleAnswerSelect}
                    disabled={isReviewMode}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {renderedOptions.map((opt, i) => {
                    const optionKeyString = `option${i + 1}`;
                    const isSelected = selectedAnswers[currentStep] === optionKeyString;
                    const isCorrect = currentQuestion?.answer === optionKeyString;

                    // Compute dynamic stylistic variants depending on runtime execution engine mode
                    let optionStyles = "border-slate-100 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-slate-900 peer-data-[state=checked]:text-white hover:bg-slate-50 text-slate-900";
                    
                    if (isReviewMode) {
                      if (isCorrect) {
                        optionStyles = "border-emerald-500 bg-emerald-50 text-emerald-900 font-black";
                      } else if (isSelected && !isCorrect) {
                        optionStyles = "border-red-500 bg-red-50 text-red-900 opacity-90 line-through";
                      } else {
                        optionStyles = "border-slate-100 bg-white text-slate-400 opacity-40 cursor-default";
                      }
                    }

                    return (
                      <div key={i} className="relative">
                        <RadioGroupItem value={optionKeyString} id={`opt-${i}`} className="peer sr-only" />
                        <Label 
                          htmlFor={`opt-${i}`} 
                          className={`flex items-center h-full p-6 border-2 rounded-none text-base font-bold uppercase tracking-tight italic transition-all ${
                            isReviewMode ? 'cursor-default' : 'cursor-pointer'
                          } ${optionStyles}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{opt}</span>
                            {isReviewMode && isCorrect && (
                              <span className="text-[9px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-none tracking-normal not-italic">CORRECT</span>
                            )}
                            {isReviewMode && isSelected && !isCorrect && (
                              <span className="text-[9px] bg-red-500 text-white font-black px-2 py-0.5 rounded-none tracking-normal not-italic">FAULT_INPUT</span>
                            )}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="p-10 border-t border-slate-50 flex justify-between items-center bg-white">
            {/* Left Button Block: Allow navigation backtracking if reviewing */}
            <div>
              {isReviewMode && currentStep > 0 ? (
                <Button 
                  variant="outline"
                  onClick={handlePrevious}
                  className="h-16 px-8 rounded-none border-2 border-slate-900 font-black uppercase tracking-wider text-xs hover:bg-slate-900 hover:text-white transition-all"
                >
                  ← Back
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-slate-300">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                       {isReviewMode ? "Audit Lock: Mutations Prohibited" : "Caution: Sync permanent after submission"}
                    </p>
                </div>
              )}
            </div>
            
            <Button 
                size="lg" 
                className={`h-16 px-12 text-sm font-black uppercase tracking-[0.2em] rounded-none transition-all duration-500 ${
                    !selectedAnswers[currentStep] && !isReviewMode
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 hover:bg-yellow-400 hover:text-slate-900 text-white'
                }`}
                onClick={handleNext}
                disabled={(!selectedAnswers[currentStep] && !isReviewMode) || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isReviewMode ? (
                currentStep === questions.length - 1 ? "Exit Review" : "Next Query →"
              ) : currentStep === questions.length - 1 ? (
                "Finalize Sync"
              ) : (
                "Commit →"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* FOOTER METADATA */}
        <div className="mt-8 flex justify-between items-center opacity-30 px-2">
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Session_ID: {testMetadata?.session_id}</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">
               {isReviewMode ? "STATIC_HISTORICAL_STREAM" : "Secure_Transfer_Active"}
            </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .peer-data-\[state\=checked\]\:border-slate-900[data-state=checked] {
          border-color: #0f172a !important;
        }
      `}} />
    </div>
  );
}