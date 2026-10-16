import { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Play, Loader2, RefreshCw } from "lucide-react";
import api from "@/api/axios";

const defaultCompilerOptions = [
  { id: "python", label: "Python 3", course: "Python / AI / Data Science" },
  { id: "javascript", label: "JavaScript / Node.js", course: "Frontend / Full Stack" },
  { id: "java", label: "Java", course: "Backend / Enterprise" },
  { id: "cpp", label: "C++", course: "Systems Programming" },
  { id: "csharp", label: "C#", course: ".NET / Backend" },
  { id: "go", label: "Go", course: "Cloud / DevOps" },
  { id: "bash", label: "Bash / Shell", course: "DevOps / Linux" },
];

export default function Practice() {
  const [compilerOptions, setCompilerOptions] = useState(defaultCompilerOptions);
  const [language, setLanguage] = useState("python");
  const [task, setTask] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);

  // Map backend language ID to Monaco Editor syntax highlighting
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case "csharp": return "csharp";
      case "cpp": return "cpp";
      case "bash": return "shell";
      case "go": return "go";
      case "javascript": return "javascript";
      case "java": return "java";
      default: return "python";
    }
  };

  const loadEnvironment = useCallback(async () => {
    setLoadingTask(true);
    try {
      const [langRes, taskRes] = await Promise.allSettled([
        api.get("/study/practice/user-languages"),
        api.get("/study/practice/active-task"),
      ]);

      if (langRes.status === "fulfilled" && Array.isArray(langRes.value.data) && langRes.value.data.length > 0) {
        const mapped = langRes.value.data.map((item) => ({
          id: item.id,
          label: item.display_name || item.id,
          course: item.origin || "Skillinex Node",
        }));
        setCompilerOptions(mapped);
      }

      if (taskRes.status === "fulfilled" && taskRes.value.data) {
        const t = taskRes.value.data;
        setTask(t);
        setLanguage(t.language || "python");
        setCode(t.starter_code || "");
      } else {
        setCode("# Implement your solution here\ndef solve():\n    return 1\n");
      }
    } catch (error) {
      console.warn("Lab environment initialization error:", error);
    } finally {
      setLoadingTask(false);
    }
  }, []);

  useEffect(() => {
    loadEnvironment();
  }, [loadEnvironment]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (task && newLang === task.language) {
      setCode(task.starter_code);
    } else {
      setCode(`// Switched runtime to ${newLang}\n// Implement task logic below\n`);
    }
  };

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const log = (msg, type = "info") =>
      setOutput((prev) => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);

    try {
      const { data } = await api.post("/study/practice/execute", {
        raw_context: task?.topic || compilerOptions.find((o) => o.id === language)?.course || "practice",
        language,
        code,
      });

      const stdout = data?.run?.stdout || "";
      const stderr = data?.run?.stderr || "";
      const isPassed = data?.run?.passed || stdout.trim() === "1" || stdout.trim().includes("SUCCESS");

      if (stdout) {
        log(stdout.trim(), "success");
      }

      if (stderr) {
        log(stderr.trim(), "error");
      }

      if (isPassed) {
        log("Verification Check Passed! Syncing XP...", "system");
        await syncLabSuccess();
      } else if (!stdout && !stderr) {
        log("Execution completed with status 0 (no output).", "system");
      }
    } catch (error) {
      const detail = error.response?.data?.detail || "Kernel Panic: Execution cluster unreachable.";
      log(detail, "error");
    } finally {
      setIsRunning(false);
    }
  };

  const syncLabSuccess = async () => {
    try {
      const { data } = await api.post("/study/practice/verify-lab", {
        task_id: task?.task_id || "general-task-01",
        course_id: task?.topic || "general",
        success: true,
      });
      if (data?.xp_awarded) {
        setOutput((prev) => [
          ...prev,
          {
            msg: `+${data.xp_awarded} XP Synchronized to Account! (Total: ${data.xp_points} XP)`,
            type: "system",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to sync XP", err);
    }
  };

  return (
    <div className="min-h-screen bg-card p-4 lg:p-8 font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* 1. TOP HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-muted pb-8">
        <div className="flex items-center gap-5">
          <div className="bg-primary p-3 rounded-none text-primary-foreground">
            <Cpu size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-subtle mb-0.5">
              Lab_v2.4 // {task?.topic ? task.topic.toUpperCase() : "ACTIVE_NODE"}
            </h2>
            <p className="text-xl font-black text-foreground uppercase tracking-tighter italic">Skillinex Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[220px] bg-primary text-primary-foreground border-none font-black text-[10px] uppercase tracking-widest h-11 rounded-none">
              <SelectValue placeholder="Select Engine" />
            </SelectTrigger>
            <SelectContent className="bg-primary text-primary-foreground rounded-none border-none">
              {compilerOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={runCode}
            disabled={isRunning || loadingTask}
            className="bg-success text-inverse font-black uppercase tracking-widest rounded-none h-11 px-8 hover:bg-success"
          >
            {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={14} className="mr-2" />}
            Run_Sync
          </Button>
        </div>
      </header>

      {/* 2. DYNAMIC WORKSPACE MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
        
        {/* Dynamic Task Briefing */}
        <aside className="lg:col-span-3 space-y-4">
          <Card className="rounded-none border-2 border-primary h-full">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Badge className="bg-primary text-primary-foreground rounded-none text-[9px] font-black uppercase">
                    {task?.difficulty || "Intermediate"}
                  </Badge>
                  <button 
                    onClick={loadEnvironment} 
                    title="Refresh Task"
                    className="text-subtle hover:text-foreground transition-colors"
                  >
                    <RefreshCw size={14} className={loadingTask ? "animate-spin" : ""} />
                  </button>
                </div>

                <h3 className="text-lg font-black italic uppercase mb-2">
                  {task?.title || "Operational Task"}
                </h3>
                
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                  {task?.description || "Implement the solution in the editor satisfying all assertion checks."}
                </p>

                {task?.target_criteria && (
                  <div className="bg-surface border border-border p-3 mb-4">
                    <p className="text-[9px] font-black uppercase text-subtle mb-1">Target Criteria</p>
                    <p className="text-[11px] font-mono text-foreground">{task.target_criteria}</p>
                  </div>
                )}
              </div>

              <div className="text-[10px] uppercase tracking-widest text-muted-foreground border-t border-muted pt-4">
                Active Runtime: <span className="text-foreground font-black uppercase">{language}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Editor & Console Output */}
        <main className="lg:col-span-9 flex flex-col gap-4">
          <div className="flex-1 border-2 border-primary overflow-hidden relative">
            <div className="absolute top-0 right-0 z-10 bg-primary text-primary-foreground px-4 py-1 text-[8px] font-black uppercase tracking-widest">
              workspace/{language === "python" ? "main.py" : language === "javascript" ? "index.js" : `main.${language}`}
            </div>
            <Editor
              height="100%"
              theme="vs-dark"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                padding: { top: 20 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="h-48 bg-inverse border-2 border-primary flex flex-col">
            <div className="px-4 py-2 border-b border-card/10 flex justify-between">
              <span className="text-[9px] font-black text-primary-foreground/40 uppercase tracking-widest">Console_Output</span>
              <button 
                onClick={() => setOutput([])} 
                className="text-[8px] text-primary-foreground/20 hover:text-primary-foreground uppercase font-black"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1">
              {output.map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-primary-foreground/20">[{line.time}]</span>
                  <span className={line.type === 'error' ? 'text-danger' : line.type === 'system' ? 'text-info' : 'text-success'}>
                    {line.msg}
                  </span>
                </div>
              ))}
              {output.length === 0 && <p className="text-primary-foreground/20 italic">Awaiting execution run...</p>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}