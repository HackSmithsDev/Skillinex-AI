import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, Trophy, Zap, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateRoadmapModal from "@/components/CreateRoadmapModal";

// 🚀 Use your custom api axios instance to pass your JWT auth interceptors safely!
import api from "@/api/axios"; 

const UserHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Points to our updated FastAPI endpoint passing through security layers
        const res = await api.get("/user/dashboard"); // Adjusted prefix based on APIRouter mount
        setUserData(res.data.stats);
        setActiveCourse(res.data.currentCourse);
        setDashboardError("");
      } catch (err) {
        console.error("Failed to load dashboard telemetry stream", err);
        setDashboardError(err.response?.data?.detail || "Could not load your dashboard. Refresh to try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-card">
      <Loader2 className="animate-spin text-foreground" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-left">
            Welcome back, {userData?.name || 'Learner'}! 👋
          </h1>
          <p className="text-muted-foreground text-left mt-1">
            {userData?.dailyGoalStatus || "Keep pushing your goals!"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/achievements')} className="gap-2 rounded-none border-border">
            <Trophy size={18} className="text-highlight" /> {userData?.totalXP || 0} XP
          </Button>
          <Button 
            disabled={!activeCourse}
            className="bg-primary text-primary-foreground hover:bg-highlight hover:text-foreground transition-colors gap-2 rounded-none shadow-sm"
            onClick={() => navigate(`/tutorials/${activeCourse?.id}`)}
          >
            <Zap size={18} /> Resume Learning
          </Button>
        </div>
      </div>
      {dashboardError && <p role="alert" className="rounded border border-danger-soft bg-danger-subtle p-4 text-sm font-semibold text-danger">{dashboardError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Current Course */}
        <div className="lg:col-span-2 space-y-6">
          {activeCourse ? (
            <Card className="overflow-hidden border-none shadow-sm rounded-none bg-card group">
              <div className="h-1 bg-primary w-full" />
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-muted relative overflow-hidden min-h-card-visual">
                    <img 
                      src={activeCourse.thumbnail_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995"} 
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                      alt={activeCourse.title}
                    />
                    <div 
                      className="absolute inset-0 bg-inverse/20 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity" 
                      onClick={() => navigate(`/tutorials/${activeCourse.id}`)}
                    >
                       <PlayCircle size={48} className="text-primary-foreground" />
                    </div>
                  </div>
                  <div className="p-6 md:w-2/3 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl font-bold text-foreground text-left tracking-tight leading-tight">{activeCourse.title}</h3>
                        <span className="text-compact font-black text-foreground bg-muted px-2 py-1 rounded-none uppercase tracking-wider whitespace-nowrap">
                          {activeCourse.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-subtle">
                        <span>Course Progress</span>
                        <span className="text-foreground">{activeCourse.progress}%</span>
                      </div>
                      <Progress value={activeCourse.progress} className="h-1.5 rounded-none" />
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-subtle uppercase tracking-wider pt-2">
                      <span className="flex items-center gap-1"><Clock size={14}/> {activeCourse.timeLeft} left</span>
                      <span className="flex items-center gap-1"><BookOpen size={14}/> {activeCourse.completedLectures}/{activeCourse.totalLectures} Lectures</span>
                    </div>

                    <Button className="w-full mt-2 rounded-none bg-primary text-primary-foreground hover:bg-primary-hover" onClick={() => navigate(`/tutorials/${activeCourse.id}`)}>
                      Continue Where You Left Off
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-border rounded-none bg-card">
              <p className="text-sm font-bold uppercase text-subtle tracking-wider">No active courses. Time to generate one!</p>
              <Button className="mt-4 rounded-none bg-primary text-primary-foreground hover:bg-primary-hover" onClick={() => setRoadmapModalOpen(true)}>Explore Topics</Button>
            </Card>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm rounded-none bg-card">
              <CardContent className="p-5 flex items-center gap-4 text-left">
                <div className="p-3 bg-muted text-primary-hover rounded-none"><Trophy size={20} /></div>
                <div>
                  <p className="text-compact font-black text-subtle uppercase tracking-widest">Top Category</p>
                  <p className="text-xl font-black italic tracking-tight text-foreground uppercase">{userData?.topCategory || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-none bg-card">
              <CardContent className="p-5 flex items-center gap-4 text-left">
                <div className="p-3 bg-highlight/10 text-highlight rounded-none"><Zap size={20} className="fill-highlight text-highlight" /></div>
                <div>
                  <p className="text-compact font-black text-subtle uppercase tracking-widest">Avg Score</p>
                  <p className="text-xl font-black italic tracking-tight text-foreground">{userData?.avgScore || 0}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar: Activity/Goals */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-none bg-card">
            <CardHeader className="border-b border-surface"><CardTitle className="text-xs font-black uppercase tracking-widest text-foreground text-left">Daily Goals</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-4">
              {userData?.goals?.map((goal, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-none border border-transparent hover:border-muted hover:bg-surface/50 transition-all">
                  <div className={`w-4 h-4 rounded-none border-2 flex items-center justify-center transition-colors ${goal.done ? 'bg-primary border-primary' : 'border-line-strong'}`}>
                    {goal.done && <div className="w-1.5 h-1.5 bg-card" />}
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-bold ${goal.done ? 'text-line-strong line-through' : 'text-soft'}`}>{goal.label}</span>
                </div>
              )) || <p className="text-xs text-subtle italic">Set a goal to stay consistent!</p>}
            </CardContent>
          </Card>
          
          <Button onClick={() => setGoalDialogOpen(true)} variant="ghost" className="w-full text-subtle bg-card border-2 border-dashed border-border hover:border-subtle rounded-none h-24 flex flex-col gap-1 transition-all">
            <span className="font-black uppercase tracking-wider text-xs text-soft">+ Add Custom Goal</span>
            <span className="text-label uppercase font-bold text-subtle tracking-widest">Tailor your roadmap</span>
          </Button>
        </div>
      </div>

      {goalDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
          onClick={() => setGoalDialogOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm bg-card border-2 border-primary p-6 text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black uppercase tracking-wider text-foreground">Custom Goals</h3>
            <p className="text-sm text-subtle">This feature is a work in progress and is unavailable right now. Check back soon!</p>
            <Button className="w-full rounded-none" onClick={() => setGoalDialogOpen(false)}>Got it</Button>
          </div>
        </div>
      )}
      <CreateRoadmapModal
        isOpen={roadmapModalOpen}
        onClose={() => setRoadmapModalOpen(false)}
        onCreated={() => navigate('/learning-vault')}
      />
    </div>
  );
}

export default UserHome;