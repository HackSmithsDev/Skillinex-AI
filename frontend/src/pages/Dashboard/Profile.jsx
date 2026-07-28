import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  Zap, Settings, ShieldCheck, LogOut, Camera, Edit3,
  Database, Save, X, Trash2, KeyRound, Terminal, MessageSquare, Calendar, Smile, Plus
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

// Modular Components
import { SecurityModal } from '../../components/modals/SecurityModal';

const Profile = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null); // Reference hook targeting the hidden file browser input node
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'account', 'graph', 'password', 'feedback', 'delete'
  
  const [formData, setFormData] = useState({ 
    full_name: '', 
    bio: '', 
    age: '', 
    gender: '' 
  });
  const [graphData, setGraphData] = useState({});
  const [pwdData, setPwdData] = useState({ old_password: '', new_password: '' });

  const systemAvailableInterests = ["React", "Python", "AI/ML", "Django", "FastAPI", "UI/UX", "Data Science"];

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        age: user.age || '',
        gender: user.gender || ''
      });
      setGraphData(user.tech_stack || {});
    }
    const fetchDashboardSync = async () => {
      try {
        const res = await api.get('/user/dashboard');
        setActiveCourse(res.data.currentCourse);
      } catch (err) { 
        console.error("Dashboard Core Sync Failure", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboardSync();
  }, [user]);

  // ⚡ URL Sanitizer to perfectly eliminate double-slash 404 network vectors
  const cleanAvatarUrl = (path) => {
    if (!path) return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(user?.email || 'default')}`;
    
    // Strip trailing api path suffixes cleanly
    const base = api.defaults.baseURL.replace('/api', '').replace(/\/+$/, '');
    const cleanPath = path.startsWith('//') ? path.replace(/^\/+/, '/') : path;
    
    return `${base}${cleanPath}`;
  };

  // Handles profile picture upload transmission streams directly to FastAPI
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert("UNSUPPORTED_FORMAT: Only JPEG, JPG, and PNG payloads are accepted.");
      return;
    }

    const uploadPayload = new FormData();
    uploadPayload.append("file", file);

    try {
      const res = await api.post('/user/upload-avatar', uploadPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(res.data);
      alert("Avatar image matrix fully synchronized.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "UPLOAD_CRITICAL_FAILURE: Multipart transmission failed.");
    }
  };

  const handleCycleNodeLevel = (nodeName) => {
    setGraphData(prev => {
      const updatedStack = { ...prev };
      const currentLevel = updatedStack[nodeName];

      if (!currentLevel) {
        updatedStack[nodeName] = 'Beginner';
      } else if (currentLevel === 'Beginner') {
        updatedStack[nodeName] = 'Intermediate';
      } else if (currentLevel === 'Intermediate') {
        updatedStack[nodeName] = 'Pro';
      } else {
        delete updatedStack[nodeName];
      }
      return updatedStack;
    });
  };

  const handleAddCustomNode = () => {
    const newNode = prompt("Initialize Custom Tech Stack Node:");
    if (newNode && newNode.trim() !== "") {
      const cleaned = newNode.trim();
      setGraphData(prev => ({
        ...prev,
        [cleaned]: 'Beginner'
      }));
    }
  };

  const handleIdentityUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        full_name: formData.full_name,
        bio: formData.bio,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender
      };
      const res = await api.patch('/user/me', payload);
      setUser(res.data);
      setModalType(null);
    } catch (err) { 
      alert("CRITICAL_FAILURE: Identity sync failed."); 
    }
  };

  const handleGraphUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/user/me', { tech_stack: graphData });
      setUser(res.data);
      setModalType(null);
    } catch (err) {
      alert("CRITICAL_FAILURE: Knowledge Matrix generation fault.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try { 
      await api.post('/user/change-password', pwdData); 
      setModalType(null); 
      setPwdData({ old_password: '', new_password: '' });
      alert("Security Protocol Updated Successfully."); 
    } catch (err) { 
      alert(err.response?.data?.detail || "Authorization Cryptography Fault."); 
    }
  };

  const handleFinalPurge = async () => {
    const password = prompt("Enter password to authorize permanent matrix termination:");
    if (!password) return;
    try {
      await api.delete('/user/me', { data: { password } });
      logout();
    } catch (err) { 
      alert("Termination routine rejected: Unauthorized parameters."); 
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 md:p-12 font-sans selection:bg-slate-900 selection:text-white text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-2 border-slate-900 pb-12">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 bg-slate-900 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                 User_Identity_Model // {user?.id ? String(user.id).substring(0,8) : "GUEST"}
               </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.8] group">
              {user?.full_name?.split(' ')[0] || 'Learner'} <br />
              <span className="text-transparent stroke-text italic group-hover:text-slate-900 transition-all duration-300">Protocol</span>
            </h1>
          </div>

          <div className="flex flex-col items-end gap-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setModalType('account')}
                className="flex items-center gap-3 px-6 py-3 border-2 border-slate-900 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all"
              >
                <Settings size={16} /> Configure_Identity
              </button>
            </div>
            <div className="flex gap-8 border-l-2 border-slate-100 pl-4 py-1">
               <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white bg-slate-900 px-1 mb-1 flex items-center gap-2"><Database size={12}/> Sync_Date</p>
                  <p className="text-sm font-black uppercase tracking-tighter">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "05/2026"}</p>
               </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">
            
            {/* IDENTITY METADATA DISPLAY */}
            <section className="flex flex-col md:flex-row gap-10 items-start">
              <div className="relative w-52 h-52 shrink-0 group mx-auto md:mx-0">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-slate-900" />
                <div 
                    className="w-44 h-44 bg-slate-100 border-2 border-slate-900 overflow-hidden relative"
                    style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
                >
                    <img 
                      src={cleanAvatarUrl(user?.photo_url)} 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" 
                      alt="User Matrix" 
                    />
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept=".jpg,.jpeg,.png" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-slate-900 text-white p-3 border-2 border-white hover:bg-emerald-500 transition-all cursor-pointer"
                >
                  <Camera size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="flex flex-wrap gap-6 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Calendar size={12}/> Age Metrics</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{user?.age ? `${user.age} Years` : "Not Configured"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Smile size={12}/> Gender Anchor</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{user?.gender || "Not Configured"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Identity_Brief</p>
                  <p className="text-md font-medium leading-relaxed italic text-slate-600 max-w-2xl">{user?.bio || "// No description profile data indexed."}</p>
                </div>
              </div>
            </section>

            {/* TECHNICAL KNOWLEDGE GRAPH DISPLAY */}
            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <Terminal size={16} /> Targeted_Knowledge_Graph
                </h3>
                <button 
                  onClick={() => { setGraphData(user?.tech_stack || {}); setModalType('graph'); }}
                  className="text-[9px] border-2 border-slate-900 px-3 py-1 uppercase font-black tracking-wider bg-slate-50 hover:bg-slate-950 hover:text-white transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                >
                  <Plus size={12} /> Configure Graph
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {user?.tech_stack && Object.keys(user.tech_stack).length > 0 ? (
                  Object.entries(user.tech_stack).map(([node, lvl]) => (
                    <div 
                      key={node} 
                      className="px-5 py-2.5 bg-slate-50 text-slate-900 border-2 border-slate-900 text-xs font-black uppercase tracking-wider rounded-none flex items-center gap-2"
                      style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                      {node}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black uppercase tracking-tight
                        ${lvl === 'Beginner' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          lvl === 'Intermediate' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }
                      `}>
                        {lvl}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-mono">// Core mapping arrays empty.</p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE CONSOLE */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="bg-slate-950 text-white p-8 border-b-8 border-emerald-500">
               <div className="flex justify-between items-start mb-12">
                 <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">XP_Core_v1</p>
                 <Zap size={20} className="text-yellow-400 fill-yellow-400" />
               </div>
               <span className="text-7xl font-black italic tracking-tighter leading-none">{user?.xp_points || 0}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-2 mb-2">System_Directives</h3>
              <div className="grid grid-cols-1 gap-1">
                <DirectiveBtn icon={<Edit3 size={14}/>} label="Account Details" onClick={() => setModalType('account')} />
                <DirectiveBtn icon={<ShieldCheck size={14}/>} label="Security Protocol" onClick={() => setModalType('password')} />
                <DirectiveBtn icon={<MessageSquare size={14}/>} label="Submit Feedback" onClick={() => setModalType('feedback')} />
                <DirectiveBtn icon={<LogOut size={14}/>} label="Terminate Session" onClick={logout} />
                <DirectiveBtn icon={<Trash2 size={14}/>} label="Purge Identity" onClick={() => setModalType('delete')} danger />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODALS LAYOUT CONTAINER */}
      
      {/* 1. CLEAN ACCOUNT DETAILS OVERRIDE */}
      <SecurityModal 
        isOpen={modalType === 'account'} 
        onClose={() => setModalType(null)} 
        title="Identity_Configuration" 
        subtitle="Manual_Override"
        icon={Edit3}
      >
        <form onSubmit={handleIdentityUpdate} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 italic">Full_Name_Entry</label>
            <input 
              type="text"
              className="w-full border-2 border-slate-200 p-3 font-mono text-xs outline-none focus:border-slate-900 bg-slate-50"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Age</label>
              <input 
                type="number"
                className="w-full border-2 border-slate-200 p-3 font-mono text-xs outline-none focus:border-slate-900 bg-slate-50"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 italic">Gender</label>
              <select
                className="w-full border-2 border-slate-200 p-3 text-xs outline-none focus:border-slate-900 bg-slate-50 rounded-none h-[42px]"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 italic">Identity_Brief</label>
            <textarea 
              className="w-full border-2 border-slate-200 p-3 font-mono text-xs h-24 outline-none focus:border-slate-900 bg-slate-50 resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-4 mt-2 font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors text-xs">
            Commit_Changes
          </button>
        </form>
      </SecurityModal>

      {/* 2. TARGETED KNOWLEDGE GRAPH MODAL */}
      <SecurityModal
        isOpen={modalType === 'graph'}
        onClose={() => setModalType(null)}
        title="Knowledge_Graph_Engine"
        subtitle="Route_Mapping_And_Tiers"
        icon={Terminal}
      >
        <form onSubmit={handleGraphUpdate} className="space-y-6 text-left">
          <div className="flex justify-between items-center border-b pb-2 border-slate-100">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Cycle through nodes to adjust tracking</span>
            <button 
              type="button"
              onClick={handleAddCustomNode}
              className="text-[9px] border px-2 py-1 uppercase font-black bg-slate-950 text-white tracking-wider"
            >
              + Add Custom Node
            </button>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {systemAvailableInterests.map(interest => {
                const activeLevel = graphData[interest];
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => handleCycleNodeLevel(interest)}
                    className={`px-3 py-2 border-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 select-none ${
                      activeLevel === 'Beginner' ? 'bg-blue-50 border-blue-400 text-blue-700' :
                      activeLevel === 'Intermediate' ? 'bg-purple-50 border-purple-400 text-purple-700' :
                      activeLevel === 'Pro' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/10' :
                      'bg-white border-slate-200 text-slate-400 hover:border-slate-900'
                    }`}
                  >
                    {interest}
                    {activeLevel && (
                      <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-white border font-black">
                        {activeLevel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {Object.keys(graphData).filter(i => !systemAvailableInterests.includes(i)).length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Custom Sub-Nodes</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(graphData)
                    .filter(([tech]) => !systemAvailableInterests.includes(tech))
                    .map(([customNode, activeLevel]) => (
                      <button
                        type="button"
                        key={customNode}
                        onClick={() => handleCycleNodeLevel(customNode)}
                        className={`px-3 py-1.5 border-2 text-[10px] font-black uppercase rounded-full flex items-center gap-2 transition-all ${
                          activeLevel === 'Beginner' ? 'bg-blue-50/70 border-blue-300 text-blue-700' :
                          activeLevel === 'Intermediate' ? 'bg-purple-50/70 border-purple-300 text-purple-700' :
                          activeLevel === 'Pro' ? 'bg-emerald-50/70 border-emerald-400 text-emerald-700' :
                          'bg-red-50 border-red-200 text-red-500'
                        }`}
                      >
                        {customNode}
                        <span className="text-[8px] uppercase px-1 bg-white border font-black">
                          {activeLevel || "REMOVE"}
                        </span>
                      </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-4 font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors text-xs">
            Save_Knowledge_Matrix
          </button>
        </form>
      </SecurityModal>

      {/* 3. SECURITY PROTOCOL MODAL */}
      <SecurityModal 
        isOpen={modalType === 'password'} 
        onClose={() => setModalType(null)} 
        title="Security_Protocol" 
        subtitle="Access_Key_Rotate"
        icon={KeyRound}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
          <input type="password" placeholder="CURRENT_KEY" className="w-full border-2 border-slate-200 p-3 font-mono text-xs outline-none focus:border-slate-900 bg-slate-50" value={pwdData.old_password} onChange={(e) => setPwdData({...pwdData, old_password: e.target.value})} />
          <input type="password" placeholder="NEW_SIGNATURE" className="w-full border-2 border-slate-200 p-3 font-mono text-xs outline-none focus:border-slate-900 bg-slate-50" value={pwdData.new_password} onChange={(e) => setPwdData({...pwdData, new_password: e.target.value})} />
          <button type="submit" className="w-full bg-slate-900 text-white py-4 font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors text-xs">Authorize Update</button>
        </form>
      </SecurityModal>

      {/* 4. FEEDBACK MODAL */}
      <SecurityModal 
        isOpen={modalType === 'feedback'} 
        onClose={() => setModalType(null)} 
        title="System_Feedback" 
        subtitle="Neural_Uplink"
        icon={MessageSquare}
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api.post('/user/feedback', { comment: e.target.feedback.value });
            setModalType(null);
            e.target.reset();
            alert("Feedback Transmission Received.");
          } catch (err) { alert("Uplink Matrix Communication Failed."); }
        }} className="space-y-4 text-left">
          <textarea name="feedback" placeholder="INPUT_META_DATA..." className="w-full border-2 border-slate-200 p-3 font-mono text-xs h-24 outline-none focus:border-slate-900 bg-slate-50 resize-none" />
          <button type="submit" className="w-full bg-slate-900 text-white py-4 font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors text-xs">Send Transmission</button>
        </form>
      </SecurityModal>

      {/* 5. DELETE TERMINATION MODAL */}
      <SecurityModal 
        isOpen={modalType === 'delete'} 
        onClose={() => setModalType(null)} 
        title="Account_Termination" 
        subtitle="Permanent_Purge"
        icon={Trash2}
        type="danger"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs font-bold text-red-500 uppercase leading-relaxed italic">Warning: This action will permanently purge all learning arrays from the Skillinex matrix.</p>
          <button onClick={handleFinalPurge} className="w-full bg-red-500 text-white py-4 font-black uppercase tracking-widest hover:bg-red-700 transition-colors text-xs">Confirm_Purge</button>
        </div>
      </SecurityModal>

      <style dangerouslySetInnerHTML={{ __html: `.stroke-text { -webkit-text-stroke: 2px #0f172a; }` }} />
    </div>
  );
};

const DirectiveBtn = ({ icon, label, onClick, danger }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-4 border transition-all font-black text-[10px] uppercase tracking-widest w-full
      ${danger ? 'border-red-100 text-red-500 hover:bg-red-500 hover:text-white' : 'border-slate-100 bg-slate-50/50 text-slate-900 hover:border-slate-900'}`}
  >
    <span className="flex items-center gap-3 italic">{icon} {label}</span>
  </button>
);

export default Profile;