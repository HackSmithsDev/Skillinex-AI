import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Rocket, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, FileText, Calendar, Smile, Camera
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../api/axios';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Access Credentials
    full_name: '',
    email: '',
    password: '',
    // Step 2: Profile Metrics Layer
    bio: '',
    age: '',
    gender: '',
    photoFile: null,      // Stores raw binary file payload object
    photoPreview: null,   // Stores client-side visual preview cache URI string
    // Step 3: Granular Matrix Mapping
    tech_stack: {}        // Stores key-values like e.g., {"Python": "Pro"}
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const availableInterests = ["React", "Python", "AI/ML", "Django", "FastAPI", "UI/UX", "Data Science"];

  // --- Step 1: Integrity Check & Validation ---
  const handleProceedToStep2 = async () => {
    setError('');
    
    if (!formData.full_name || !formData.email || !formData.password) {
      setError("Please fill in all identity fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Security check: Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/auth/check-email?email=${formData.email}`);
      if (response.data.exists) {
        setError(response.data.message);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("System connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Demographic Matrix Validation ---
  const handleProceedToStep3 = () => {
    setError('');
    
    if (!formData.age || !formData.gender) {
      setError("Demographic metrics (Age & Gender) are required to sync your profile context.");
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setError("Please insert a structurally valid age parameter (10 - 100).");
      return;
    }

    setStep(3);
  };

  // --- Final Step: Multipart Submission Handler ---
  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      
      // 🆕 Create browser native FormData multi-stream container instance
      const dataPayload = new FormData();
      
      // Append text fields cleanly
      dataPayload.append('full_name', formData.full_name);
      dataPayload.append('email', formData.email);
      dataPayload.append('password', formData.password);
      dataPayload.append('age', parseInt(formData.age, 10));
      dataPayload.append('gender', formData.gender);
      dataPayload.append('bio', formData.bio || '');

      // ⚡ Key change: tech_stack object structured into stringified JSON format
      dataPayload.append('tech_stack', JSON.stringify(formData.tech_stack));

      // Append binary picture data stream if chosen
      if (formData.photoFile) {
        dataPayload.append('file', formData.photoFile);
      }
      
      // Ship multipart matrix package over the network array layers
      await api.post('/auth/signup', dataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        const detail = err.response.data.detail;
        setError(Array.isArray(detail) ? detail[0].msg : detail || "Signup synchronization routine aborted.");
      } else {
        setError("Network layer conversion crash encountered during deployment.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div layout className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="flex">
          {/* Progress Sidebar */}
          <div className="w-2 bg-slate-50 flex flex-col">
            <div className={`flex-1 transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-transparent'}`} />
            <div className={`flex-1 transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-transparent'}`} />
            <div className={`flex-1 transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-transparent'}`} />
            <div className={`flex-1 transition-all duration-500 ${step >= 4 ? 'bg-primary' : 'bg-transparent'}`} />
          </div>

          <div className="flex-1 p-10 lg:p-14">
            {/* Global Error Notification */}
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl bg-red-50 text-red-600 border-red-100 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: CREDENTIALS */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <header className="text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
                    <p className="text-slate-500 mt-2">Let's start with the access credentials.</p>
                  </header>
                  
                  <div className="space-y-4 text-left">
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        placeholder="Full Name" 
                        value={formData.full_name}
                        className="pl-10 h-12 rounded-xl"
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        type="email" 
                        placeholder="Email Address" 
                        value={formData.email}
                        className="pl-10 h-12 rounded-xl"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        type="password" 
                        placeholder="Choose Password (min. 8 chars)" 
                        value={formData.password}
                        className="pl-10 h-12 rounded-xl"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-12 rounded-xl group" 
                    onClick={handleProceedToStep2}
                    disabled={loading}
                  >
                    {loading ? "Verifying Matrix..." : "Continue"} 
                    {!loading && <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />}
                  </Button>

                  <p className="text-center text-sm text-slate-500 pt-2">
                    Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                  </p>
                </motion.div>
              )}

              {/* STEP 2: PROFILE IDENTITY */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <header>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Profile Identity</h2>
                    <p className="text-slate-500 mt-2">Initialize your demographic variables and layout identity assets.</p>
                  </header>

                  <div className="space-y-6">
                    {/* 🆕 PROFILE PICTURE DYNAMIC FILECHOOSER BLOCK */}
                    <div className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all group">
                      <div className="relative w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center shadow-inner">
                        {formData.photoPreview ? (
                          <img 
                            src={formData.photoPreview} 
                            alt="Avatar Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Camera size={28} className="text-slate-400 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      
                      <label className="cursor-pointer bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm hover:bg-slate-800 active:scale-95 transition-all">
                        Choose Profile Pic
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg,.png"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                            if (!allowedTypes.includes(file.type)) {
                              alert("UNSUPPORTED_FORMAT: Only JPEG, JPG, and PNG formats are accepted.");
                              return;
                            }

                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({
                                ...formData,
                                photoFile: file,
                                photoPreview: reader.result
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">PNG, JPG or JPEG up to 5MB</span>
                    </div>

                    {/* DEMOGRAPHIC VARIABLES */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                          <Input 
                            type="number"
                            placeholder="Age" 
                            value={formData.age}
                            className="pl-10 h-12 rounded-xl"
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                          />
                        </div>

                        <div className="relative">
                          <Smile className="absolute left-3 top-3 text-slate-400" size={18} />
                          <select
                            value={formData.gender}
                            className="w-full pl-10 pr-4 h-12 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring appearance-none"
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          >
                            <option value="" disabled hidden>Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                        <Input 
                          placeholder="Short Biography / Objectives (Optional)" 
                          value={formData.bio}
                          className="pl-10 h-12 rounded-xl"
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="ghost" className="flex-1 h-12" onClick={() => setStep(1)}>
                      <ChevronLeft className="mr-2" size={18} /> Back
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl" onClick={handleProceedToStep3}>
                      Next <ChevronRight className="ml-2" size={18} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: GRANULAR TECH INTERACTION */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <header>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Stack</h2>
                    <p className="text-slate-500 mt-2">Tap each node multiple times to specify your unique level metrics.</p>
                  </header>

                  <div className="flex flex-wrap gap-3 py-4">
                    {availableInterests.map(interest => {
                      const activeLevel = formData.tech_stack[interest];
                      
                      const handleCycleLevel = () => {
                        setFormData(prev => {
                          const updated = { ...prev.tech_stack };
                          if (!activeLevel) {
                            updated[interest] = 'Beginner';
                          } else if (activeLevel === 'Beginner') {
                            updated[interest] = 'Intermediate';
                          } else if (activeLevel === 'Intermediate') {
                            updated[interest] = 'Pro';
                          } else {
                            delete updated[interest];
                          }
                          return { ...prev, tech_stack: updated };
                        });
                      };

                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={handleCycleLevel}
                          className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-95 duration-200
                            ${activeLevel === 'Beginner' ? 'bg-blue-50 border-blue-400 text-blue-700 font-black' : ''}
                            ${activeLevel === 'Intermediate' ? 'bg-purple-50 border-purple-400 text-purple-700 font-black' : ''}
                            ${activeLevel === 'Pro' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black ring-2 ring-emerald-500/10' : ''}
                            ${!activeLevel ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-400' : ''}
                          `}
                        >
                          {interest}
                          {activeLevel && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white border font-extrabold shadow-sm tracking-wider">
                              {activeLevel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" className="flex-1 h-12" onClick={() => setStep(2)}>
                      <ChevronLeft className="mr-2" size={18} /> Back
                    </Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl" 
                      onClick={() => {
                        if (Object.keys(formData.tech_stack).length === 0) {
                          setError("Configure proficiency parameters for at least one stack node!");
                        } else {
                          setError("");
                          setStep(4);
                        }
                      }}
                    >
                      Next <ChevronRight className="ml-2" size={18} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: GRANULAR REVIEW & SUBMIT */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-slate-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Ready to Blast Off?</h2>
                  <p className="text-slate-500 text-sm">Your custom learning path is being prepared. Click complete to finish registration.</p>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-left space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 hidden md:block">Identity Verification Matrix</p>
                    <div className="flex items-center gap-3 mb-2">
                      {formData.photoPreview && (
                        <img 
                          src={formData.photoPreview} 
                          alt="Thumbnail" 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                        />
                      )}
                      <div>
                        <p className="text-sm text-slate-700 font-bold">{formData.full_name} <span className="text-xs font-normal text-slate-400 ml-1">({formData.gender}, {formData.age})</span></p>
                        <p className="text-xs text-slate-500 font-mono italic truncate">{formData.email}</p>
                      </div>
                    </div>
                    {formData.bio && <p className="text-xs text-slate-500 line-clamp-1 border-t border-slate-100 pt-1">"{formData.bio}"</p>}
                    
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      {Object.entries(formData.tech_stack).map(([tech, lvl]) => (
                        <span 
                          key={tech} 
                          className={`text-[10px] border px-2 py-0.5 rounded-md font-bold tracking-wide flex items-center gap-1
                            ${lvl === 'Beginner' ? 'bg-blue-50/50 border-blue-100 text-blue-700' : ''}
                            ${lvl === 'Intermediate' ? 'bg-purple-50/50 border-purple-100 text-purple-700' : ''}
                            ${lvl === 'Pro' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : ''}
                          `}
                        >
                          {tech}: <span className="font-extrabold uppercase text-[9px]">{lvl}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" className="flex-1 h-12" onClick={() => setStep(3)} disabled={loading}>Back</Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold" 
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? "Deploying Layer..." : "Complete Setup"} <CheckCircle2 className="ml-2" size={18} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;