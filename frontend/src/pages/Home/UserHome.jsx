import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, Trophy, Zap, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🚀 Use your custom api axios instance to pass your JWT auth interceptors safely!
import api from "@/api/axios"; 

const UserHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Points to our updated FastAPI endpoint passing through security layers
        const res = await api.get("/user/dashboard"); // Adjusted prefix based on APIRouter mount
        setUserData(res.data.stats);
        setActiveCourse(res.data.currentCourse);
      } catch (err) {
        console.error("Failed to load dashboard telemetry stream", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 text-left">
            Welcome back, {userData?.name || 'Learner'}! 👋
          </h1>
          <p className="text-slate-500 text-left mt-1">
            {userData?.dailyGoalStatus || "Keep pushing your goals!"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/achievements')} className="gap-2 rounded-none border-slate-200">
            <Trophy size={18} className="text-yellow-500" /> {userData?.totalXP || 0} XP
          </Button>
          <Button 
            disabled={!activeCourse}
            className="bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-900 transition-colors gap-2 rounded-none shadow-sm"
            onClick={() => navigate(`/tutorials/${activeCourse?.id}`)}
          >
            <Zap size={18} /> Resume Learning
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Current Course */}
        <div className="lg:col-span-2 space-y-6">
          {activeCourse ? (
            <Card className="overflow-hidden border-none shadow-sm rounded-none bg-white group">
              <div className="h-1 bg-slate-900 w-full" />
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-slate-100 relative overflow-hidden min-h-[200px]">
                    <img 
                      src={activeCourse.thumbnail_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995"} 
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                      alt={activeCourse.title}
                    />
                    <div 
                      className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity" 
                      onClick={() => navigate(`/tutorials/${activeCourse.id}`)}
                    >
                       <PlayCircle size={48} className="text-white" />
                    </div>
                  </div>
                  <div className="p-6 md:w-2/3 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl font-bold text-slate-900 text-left tracking-tight leading-tight">{activeCourse.title}</h3>
                        <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-none uppercase tracking-wider whitespace-nowrap">
                          {activeCourse.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>Course Progress</span>
                        <span className="text-slate-900">{activeCourse.progress}%</span>
                      </div>
                      <Progress value={activeCourse.progress} className="h-1.5 rounded-none" />
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                      <span className="flex items-center gap-1"><Clock size={14}/> {activeCourse.timeLeft} left</span>
                      <span className="flex items-center gap-1"><BookOpen size={14}/> {activeCourse.completedLectures}/{activeCourse.totalLectures} Lectures</span>
                    </div>

                    <Button className="w-full mt-2 rounded-none bg-slate-900 text-white hover:bg-slate-800" onClick={() => navigate(`/tutorials/${activeCourse.id}`)}>
                      Continue Where You Left Off
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200 rounded-none bg-white">
              <p className="text-sm font-bold uppercase text-slate-400 tracking-wider">No active courses. Time to generate one!</p>
              <Button className="mt-4 rounded-none bg-slate-900 text-white hover:bg-slate-800" onClick={() => navigate('/generate')}>Explore Topics</Button>
            </Card>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm rounded-none bg-white">
              <CardContent className="p-5 flex items-center gap-4 text-left">
                <div className="p-3 bg-slate-100 text-slate-800 rounded-none"><Trophy size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Category</p>
                  <p className="text-xl font-black italic tracking-tight text-slate-900 uppercase">{userData?.topCategory || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-none bg-white">
              <CardContent className="p-5 flex items-center gap-4 text-left">
                <div className="p-3 bg-yellow-400/10 text-yellow-600 rounded-none"><Zap size={20} className="fill-yellow-500 text-yellow-500" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</p>
                  <p className="text-xl font-black italic tracking-tight text-slate-900">{userData?.avgScore || 0}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar: Activity/Goals */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-none bg-white">
            <CardHeader className="border-b border-slate-50"><CardTitle className="text-xs font-black uppercase tracking-widest text-slate-900 text-left">Daily Goals</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-4">
              {userData?.goals?.map((goal, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-none border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer">
                  <div className={`w-4 h-4 rounded-none border-2 flex items-center justify-center transition-colors ${goal.done ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                    {goal.done && <div className="w-1.5 h-1.5 bg-white" />}
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-bold ${goal.done ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{goal.label}</span>
                </div>
              )) || <p className="text-xs text-slate-400 italic">Set a goal to stay consistent!</p>}
            </CardContent>
          </Card>
          
          <Button variant="ghost" className="w-full text-slate-400 bg-white border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-none h-24 flex flex-col gap-1 transition-all">
            <span className="font-black uppercase tracking-wider text-xs text-slate-700">+ Add Custom Goal</span>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Tailor your roadmap</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserHome;