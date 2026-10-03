import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Flame, Target, Code2, Brain, Zap, 
  Activity, ChevronRight, Loader2, Moon 
} from "lucide-react";
import api from '@/api/axios'; 

// Icon Mapping Object to convert JSON strings to Lucide Components
const ICON_MAP = {
  Trophy: Trophy,
  Flame: Flame,
  Target: Target,
  Code2: Code2,
  Brain: Brain,
  Zap: Zap,
  Activity: Activity,
  Moon: Moon
};

export default function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get("/user/achievements/");
        setData(res.data);
      } catch (err) {
        console.error("Neural sync failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-card">
      <Loader2 className="animate-spin text-foreground" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-card p-6 md:p-12 lg:p-20 selection:bg-primary selection:text-primary-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-24"
      >
        {/* SYSTEM HEADER */}
        <header className="space-y-6 border-b-2 border-primary pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-subtle">
                  {data.system_status}_Node_Active
                </span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] italic">
                SKILL<span className="text-transparent stroke-text">_LOG</span>
              </h1>
            </div>

            <div className="flex flex-col items-end text-right font-mono text-[10px] text-subtle uppercase tracking-widest">
              <p>RANK: {data.rank}</p>
              <p>STATUS: Sync_Verified</p>
              <p>DEPL_DATE: 04.2026</p>
            </div>
          </div>
        </header>
      
        {/* REAL-TIME HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-primary">
          <StatNode label="Operational_Streak" value={data.streak} icon={<Flame size={24} className="text-warning" />} />
          <StatNode label="System_XP" value={data.total_xp.toLocaleString()} icon={<Trophy size={24} className="text-highlight" />} border />
          <StatNode label="Nodes_Deployed" value={data.skills.length} icon={<Target size={24} className="text-subtle" />} border />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* PROGRESSION MATRIX */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-muted pb-4">
              <Activity size={20} strokeWidth={3} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Progression_Matrix</h3>
            </div>

            <div className="space-y-10">
              {data.skills.map((skill, i) => (
                <div key={i} className="group relative">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary text-primary-foreground">
                        {skill.name.toUpperCase().includes("AI") ? <Brain size={16} /> : <Code2 size={16} />}
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">{skill.name}</span>
                    </div>
                    <span className="text-[10px] font-black italic text-subtle uppercase">LVL_{skill.level}</span>
                  </div>
                  <div className="h-4 bg-muted border border-border relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.xp}%` }}
                      className="h-full bg-primary relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--stripe)_25%,transparent_25%,transparent_50%,var(--stripe)_50%,var(--stripe)_75%,transparent_75%,transparent)] bg-[size:20px_20px]" />
                    </motion.div>
                  </div>
                  <p className="text-[8px] font-black text-line-strong mt-2 tracking-widest uppercase">
                    Efficiency: {skill.xp}% // Data_Points: {skill.attempts}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC BADGE REPOSITORY */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4 border-b border-muted pb-4">
              <Zap size={20} strokeWidth={3} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Unlocked_Nodes</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {data.badges.map((badge, idx) => {
                const IconComponent = ICON_MAP[badge.icon] || Trophy; // Fallback to Trophy
                return (
                  <div 
                    key={idx}
                    className={`p-5 border-2 transition-all flex items-center justify-between group
                    ${badge.earned ? 'border-primary bg-card shadow-[4px_4px_0px_0px_var(--primary)]' : 'border-muted opacity-30 grayscale'}`}
                  >
                    <div className="flex items-center gap-4">
                      <IconComponent 
                        size={18} 
                        className={badge.earned ? "text-foreground" : "text-line-strong"} 
                      />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{badge.title}</p>
                        <p className="text-[8px] font-bold text-subtle mt-1 uppercase">{badge.desc}</p>
                      </div>
                    </div>
                    {badge.earned && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

const StatNode = ({ label, value, icon, border }) => (
  <div className={`p-8 flex flex-col items-center justify-center text-center gap-2 ${border ? 'md:border-l-2 border-primary' : ''}`}>
    <div className="mb-2 opacity-50">{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-subtle">{label}</span>
    <span className="text-4xl font-black italic tracking-tighter text-foreground">{value}</span>
  </div>
);