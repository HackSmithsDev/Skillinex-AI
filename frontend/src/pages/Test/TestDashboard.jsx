import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Activity, Rocket, ChevronRight, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios"; 

// 1. IMPORT RECHARTS MODULES
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TestDashboard() {
  const navigate = useNavigate();
  
  // State for Controls
  const [level, setLevel] = useState("Intermediate");
  const [units, setUnits] = useState(15);
  const [targetNode, setTargetNode] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);

  // State for Data/UI Loading
  const [recentSyncs, setRecentSyncs] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [actionError, setActionError] = useState("");

  // 1. DYNAMIC DATA FETCHING: Courses & History
  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        const coursesRes = await api.get("/study/tutorials/my-vault"); 
        const readyCourses = coursesRes.data.filter(course => course.is_ready);
        setAvailableCourses(readyCourses);

        if (readyCourses.length > 0) {
          setTargetNode(readyCourses[0].title);
        }

        const historyRes = await api.get("/study/test/history");
        setRecentSyncs(historyRes.data);

      } catch (err) {
        console.error("Neural Terminal sync failed:", err);
        setActionError(err.response?.data?.detail || "Could not load your assessment data.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchTerminalData();
  }, []);

  // 2. INITIALIZE ASSESSMENT: Creates Redis Session & Navigates
  const handleInitialize = async () => {
    if (!targetNode) return;

    setActionError("");
    setIsInitializing(true);
    try {
      const res = await api.post("/study/test/generate", {
        node: targetNode,
        depth: level,
        units: units,
        scope: "Node Only"
      });

      const { session_id, questions, node_name } = res.data;
      sessionStorage.setItem("active_neural_session", session_id);

      navigate(`/test/session/`, { 
        state: { 
          testData: { session_id, questions, node_name, depth: level } 
        } 
      });
    } catch (err) {
      console.error("Neural initialization failed", err);
      setActionError(err.response?.data?.detail || "Could not initialize the assessment. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  // 3. TRANSFORM DATA FOR GRAPH (Chronological: Left to Right)
  const chartData = [...recentSyncs]
    .reverse()
    .map(sync => ({
      // Formats timestamp into compact dots: "DD.MM"
      date: new Date(sync.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace(/\//g, '.'),
      score: sync.score,
      node: sync.node_name.toUpperCase()
    }));

  return (
    <div className="min-h-screen w-full bg-card text-foreground p-6 lg:p-16 font-sans">
      
      {/* HEADER */}
      <header className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-2 w-2 bg-primary animate-pulse" />
            <span className="text-compact font-black uppercase tracking-display text-subtle">Skillinex Systems</span>
          </div>
          <h1 className="text-7xl lg:text-display-xl font-black tracking-tight-max leading-ultra-tight uppercase italic">
            Skill <br /> 
            <span className="text-transparent stroke-text">Terminal</span>
          </h1>
        </div>
        <div className="lg:pb-4">
          <div className="h-0.5 w-32 bg-muted mb-4 ml-auto" />
          <p className="text-right text-compact font-bold uppercase tracking-wide text-line-strong max-w-message-preview">
            Neural assessment & roadmap sync engine
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* LEFT COLUMN: ANALYTICS */}
        <div className="lg:col-span-8 space-y-24 light-selection-zone">
          
          {/* UPGRADED GRAPH BLOCK */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
               <BarChart3 size={20} strokeWidth={3} />
               <h3 className="text-compact font-black uppercase tracking-expanded">Neural Growth</h3>
            </div>
            
            <div className="h-chart-panel w-full bg-surface border border-muted relative p-6 flex flex-col justify-between">
              {isLoadingHistory ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-20">
                  <span className="text-compact font-black text-subtle uppercase tracking-display animate-pulse">
                    Syncing_Data_Stream...
                  </span>
                </div>
              ) : chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-20">
                  <span className="text-compact font-black text-line-strong uppercase tracking-display">
                    Awaiting_Telemetry_Data
                  </span>
                </div>
              ) : null}

              {/* Responsive Graph Canvas Engine */}
              <div className="w-full h-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.00}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--subtle)', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickCount={5}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--subtle)', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}
                    />
                    <Tooltip 
                      cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-primary text-primary-foreground p-4 rounded-none border border-card/10 shadow-2xl min-w-data-filter">
                              <p className="text-caption font-black text-highlight uppercase tracking-widest mb-1">
                                {payload[0].payload.node}
                              </p>
                              <div className="flex justify-between items-baseline gap-4">
                                <span className="text-label font-bold text-primary-foreground/50 uppercase">Score:</span>
                                <span className="text-xl font-black italic tracking-tighter text-primary-foreground">
                                  {payload[0].value}%
                                </span>
                              </div>
                              <p className="text-caption text-primary-foreground/30 font-mono mt-1 text-right">
                                SYNC.{payload[0].payload.date}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--primary)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#scoreGradient)" 
                      activeDot={{ r: 6, stroke: 'var(--card)', strokeWidth: 2, fill: 'var(--primary)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* RECENT SYNCS TABLE */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b-2 border-primary pb-4">
               <Activity size={20} strokeWidth={3} />
               <h3 className="text-compact font-black uppercase tracking-expanded">Recent Syncs</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-muted hover:bg-transparent">
                  <TableHead className="text-label font-black uppercase tracking-widest px-0">Node</TableHead>
                  <TableHead className="text-label font-black uppercase tracking-widest text-center">Score</TableHead>
                  <TableHead className="text-label font-black uppercase tracking-widest text-right px-0">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSyncs.length > 0 ? (
                  recentSyncs.map((sync) => (
                    <TableRow key={sync.id} className="group border-surface">
                      <TableCell className="py-8 px-0">
                        <span className="block text-base font-black uppercase tracking-tighter italic">{sync.node_name}</span>
                        <span className="text-label text-line-strong font-bold uppercase tracking-widest italic">
                            {new Date(sync.completed_at).toLocaleDateString('en-GB').replace(/\//g, '.')}
                        </span>
                      </TableCell>
                      <TableCell className="py-8 text-center">
                         <span className="text-3xl font-black italic tracking-tighter">{sync.score}%</span>
                      </TableCell>
                      <TableCell className="py-8 text-right px-0">
                         <span className="text-compact font-black uppercase text-success italic">Synced</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-border text-compact font-black uppercase tracking-widest italic">
                        No History Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        </div>

        {/* RIGHT COLUMN: CONTROL MODULE */}
        <aside className="lg:col-span-4 lg:sticky lg:top-10 dark-selection-zone">
          <div className="bg-primary text-muted p-10 relative overflow-hidden border border-card/5 shadow-2xl">
            
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-highlight/10 blur-glow-sm pointer-events-none" />
            
            <div className="relative z-10 mb-12">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-highlight fill-highlight" />
                <span className="text-label font-black uppercase tracking-hero text-highlight">Initialization</span>
              </div>
              <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-primary-foreground">
                Deploy <br/> 
                <span className="text-transparent stroke-text-white opacity-30 text-3xl">Assessment</span>
              </h3>
            </div>

            <div className="space-y-10 relative z-10">
              {/* 1. DYNAMIC NODE SELECT */}
              <div className="space-y-3">
                <label className="text-label font-black uppercase tracking-expanded text-primary-foreground/30 px-1">Target Node</label>
                <Select value={targetNode} onValueChange={setTargetNode}>
                  <SelectTrigger className="bg-card/5 border-card/10 text-primary-foreground h-14 rounded-none focus:ring-0 focus:border-highlight text-compact font-bold uppercase tracking-widest px-6 hover:bg-card/10 transition-colors">
                    <SelectValue placeholder="Select Course Node" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary border-card/10 text-primary-foreground rounded-none dark-selection-zone">
                    {availableCourses.map((course) => (
                      <SelectItem 
                        key={course.id} 
                        value={course.title} 
                        className="focus:bg-highlight focus:text-foreground font-black uppercase text-label cursor-pointer"
                      >
                        {course.title}
                      </SelectItem>
                    ))}
                    {availableCourses.length === 0 && (
                      <SelectItem value="none" disabled className="text-primary-foreground/20 italic text-label">No Enrolled Nodes</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. LEVEL BUTTONS */}
              <div className="space-y-3">
                <label className="text-label font-black uppercase tracking-expanded text-primary-foreground/30 px-1">Proficiency Depth</label>
                <div className="grid grid-cols-3 gap-1 bg-card/5 p-1 border border-card/5">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button 
                      key={lvl} 
                      onClick={() => setLevel(lvl)}
                      className={`py-3 text-label font-black uppercase transition-all duration-300 relative ${
                        level === lvl 
                        ? 'bg-highlight text-foreground shadow-xl scale-hover z-10 font-black'
                        : 'text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-card/5'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. ASSESSMENT SIZE */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3 border-l border-card/10 pl-5">
                  <label className="text-label font-black uppercase tracking-expanded text-primary-foreground/30 italic">Units</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black italic tracking-tighter text-primary-foreground">{units}</span>
                    <span className="text-caption font-black text-primary-foreground/20 uppercase tracking-widest">Queries</span>
                  </div>
                  <input 
                    type="range" min="5" max="30" value={units} 
                    onChange={(e) => setUnits(parseInt(e.target.value))}
                    className="w-full accent-highlight h-0.5 bg-card/10 appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3 border-l border-card/10 pl-5">
                  <label className="text-label font-black uppercase tracking-expanded text-primary-foreground/30 italic">Scope</label>
                  <p className="text-compact font-black uppercase tracking-editorial text-highlight">Selected Course</p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-8">
                <button 
                  onClick={handleInitialize}
                  disabled={isInitializing || availableCourses.length === 0}
                  className="group w-full h-20 bg-card hover:bg-highlight transition-all duration-700 flex items-center justify-center overflow-hidden relative active:scale-press disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-6 relative z-10 px-4 text-foreground">
                    <span className="font-black uppercase tracking-ultra text-xs group-hover:tracking-max transition-all duration-500">
                        {isInitializing ? "Initializing..." : "Initialize"}
                    </span>
                    {isInitializing ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Rocket size={20} className="group-hover:translate-x-20 group-hover:-translate-y-20 transition-all duration-1000 ease-in-out" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-highlight translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                </button>
                {actionError && <p role="alert" className="mt-3 text-sm font-bold text-danger">{actionError}</p>}
                
                <div className="mt-8 flex justify-between items-end px-1 opacity-40">
                  <div className="space-y-1 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <span className="text-tiny font-black text-primary-foreground/40 tracking-expanded uppercase">System_Active</span>
                      <span className="text-tiny font-black text-highlight/80 uppercase">Node_Connected</span>
                    </div>
                    <div className="h-10 w-full bg-card/5 flex items-center px-3 border-l-2 border-highlight">
                      <p className="text-compact font-mono font-black text-primary-foreground/80 tracking-tighter truncate uppercase italic">
                        {targetNode ? `REQ://ASSESSMENT.${targetNode.replace(/\s+/g, '_')}` : "AWAITING_SELECTION"}
                      </p>
                    </div>
                    <div className="flex justify-between text-micro font-bold text-primary-foreground/20 uppercase tracking-widest">
                      <span>© 2026 SKILLINEX</span>
                      <span>ENCRYPTED_TCP/IP</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 w-1 rounded-full ${i === 0 && !isInitializing ? 'bg-highlight animate-pulse' : i === 0 && isInitializing ? 'bg-highlight animate-ping' : 'bg-card'}`} 
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}