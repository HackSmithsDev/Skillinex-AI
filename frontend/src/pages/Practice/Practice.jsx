import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Play, Loader2 } from "lucide-react";
import api from "@/api/axios";

const defaultCompilerOptions = [
  { id: "python", label: "Python 3", course: "Python / AI / Data Science" },
  { id: "javascript", label: "JavaScript / Node.js", course: "Frontend / Web / Full Stack" },
  { id: "java", label: "Java", course: "Backend / DSA / Enterprise" },
  { id: "cpp", label: "C++", course: "Competitive Programming / Systems" },
  { id: "csharp", label: "C#", course: ".NET / Backend" },
  { id: "go", label: "Go", course: "Cloud / APIs / DevOps" },
  { id: "kotlin", label: "Kotlin", course: "Android / JVM" },
  { id: "php", label: "PHP", course: "Web Backend" },
  { id: "swift", label: "Swift", course: "iOS / Apple" },
];

export default function Practice() {
  const [compilerOptions, setCompilerOptions] = useState(defaultCompilerOptions);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("# Initializing Terminal...\ndef and_gate_logic(a, b):\n    return a and b");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadCompilerOptions = async () => {
      try {
        const { data } = await api.get("/study/practice/user-languages");
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            label: item.display_name || item.id,
            course: item.origin || "Skillinex Course",
          }));
          setCompilerOptions(mapped);
          if (!mapped.some((item) => item.id === language)) {
            setLanguage(mapped[0].id);
          }
        }
      } catch (error) {
        console.warn("Using default compiler list because the backend language endpoint is unavailable.", error);
      }
    };

    loadCompilerOptions();
  }, []);

  const runCode = async () => {
    setIsRunning(true);
    const log = (msg, type = "info") =>
      setOutput((prev) => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);

    try {
      const { data } = await api.post("/study/practice/execute", {
        raw_context: compilerOptions.find((option) => option.id === language)?.course || "practice",
        language,
        code,
      });

      const stdout = data?.run?.stdout || "";
      const stderr = data?.run?.stderr || "";
      const codeOutput = data?.run?.code;

      if (stdout) {
        log(stdout.trim(), "success");
        if (stdout.trim() === "1") {
          await syncLabSuccess();
        }
      }

      if (stderr) {
        log(stderr.trim(), "error");
      }

      if (!stdout && !stderr && codeOutput !== undefined) {
        log("Execution completed without output.", "system");
      }
    } catch (error) {
      const detail = error.response?.data?.detail || "Kernel Panic: Connection lost.";
      log(detail, "error");
    } finally {
      setIsRunning(false);
    }
  };

  const syncLabSuccess = async () => {
    try {
      await api.post("/study/practice/verify-lab", {
        task_id: "logic-gate-01",
        course_id: "cse-ai-ml",
        success: true,
      });
    } catch (err) {
      console.error("Failed to sync XP", err);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8 font-sans selection:bg-slate-900 selection:text-white overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-3 rounded-none text-white">
            <Cpu size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-0.5">Lab_v2.0 // Active</h2>
            <p className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Skillinex Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[220px] bg-slate-900 text-white border-none font-black text-[10px] uppercase tracking-widest h-11 rounded-none">
              <SelectValue placeholder="Select Engine" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 text-white rounded-none border-none">
              {compilerOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-emerald-500 text-slate-950 font-black uppercase tracking-widest rounded-none h-11 px-8 hover:bg-emerald-400"
          >
            {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={14} className="mr-2" />}
            Run_Sync
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
        <aside className="lg:col-span-3 space-y-4">
          <Card className="rounded-none border-2 border-slate-900 h-full">
            <CardContent className="p-6">
              <Badge className="bg-slate-900 text-white rounded-none mb-4 text-[9px] font-black uppercase">Current Task</Badge>
              <h3 className="text-lg font-black italic uppercase mb-2">Binary Sync Logic</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Implement <code className="bg-slate-100 px-1">and_gate_logic(a, b)</code>. Inputs will be 0 or 1.
              </p>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                Recommended runtime: <span className="text-slate-900 font-black">{compilerOptions.find((item) => item.id === language)?.label || "Python"}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-9 flex flex-col gap-4">
          <div className="flex-1 border-2 border-slate-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 z-10 bg-slate-900 text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest">
              Editor_v4.2
            </div>
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                padding: { top: 20 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="h-48 bg-black border-2 border-slate-900 flex flex-col">
            <div className="px-4 py-2 border-b border-white/10 flex justify-between">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Console_Output</span>
              <button onClick={() => setOutput([])} className="text-[8px] text-white/20 hover:text-white uppercase font-black">Clear</button>
            </div>
            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1">
              {output.map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-white/20">[{line.time}]</span>
                  <span className={line.type === 'error' ? 'text-red-400' : line.type === 'system' ? 'text-blue-400' : 'text-emerald-400'}>
                    {line.msg}
                  </span>
                </div>
              ))}
              {output.length === 0 && <p className="text-white/20 italic">Waiting for execution...</p>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}