import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, FileText, Calendar, Smile, Camera, Briefcase, Sparkles, RefreshCw
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
    confirmPassword: '',
    // Step 2: Profile Metrics Layer
    bio: '',
    experience: '',
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

  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);

  const fetchSuggestions = async () => {
    setSuggesting(true);
    setError('');
    try {
      const { data } = await api.post('/auth/suggest-interests', {
        experience: formData.experience,
        age: parseInt(formData.age, 10) || null,
      });
      setSuggestions(data.interests || []);
      setFormData(prev => ({ ...prev, tech_stack: {} }));
    } catch (err) {
      setError("Could not generate suggestions. Please try again.");
    } finally {
      setSuggesting(false);
    }
  };

  useEffect(() => {
    if (step === 3 && suggestions.length === 0 && !suggesting) fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // --- Step 1: Integrity Check & Validation ---
  const handleProceedToStep2 = async () => {
    setError('');
    
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Security check: Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
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
    
    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.experience.trim().length < 10) {
      setError("Tell us a little about your experience (at least 10 characters) so AI can tailor your interests.");
      return;
    }

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
    if (Object.keys(formData.tech_stack).length === 0) {
      setError("Select at least one interest.");
      return;
    }
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
      dataPayload.append('experience', formData.experience || '');

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
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <motion.div layout className="max-w-xl w-full bg-card rounded-dialog shadow-2xl shadow-border/60 overflow-hidden border border-muted">
        <div className="flex">
          {/* Progress Sidebar */}
          <div className="w-2 bg-surface flex flex-col">
            <div className={`flex-1 transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-transparent'}`} />
            <div className={`flex-1 transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-transparent'}`} />
            <div className={`flex-1 transition-all duration-500 ${step >= 3 ? 'bg-primary' : 'bg-transparent'}`} />
          </div>

          <div className="flex-1 p-10 lg:p-14">
            {/* Global Error Notification */}
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl bg-danger-subtle text-danger border-danger-soft text-left">
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Account</h2>
                    <p className="text-muted-foreground mt-2">Step 1 of 3 — your login credentials.</p>
                  </header>
                  
                  <div className="space-y-4 text-left">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-subtle" size={18} />
                      <Input 
                        type="email" 
                        placeholder="Email Address" 
                        value={formData.email}
                        className="pl-10 h-12 rounded-xl"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-subtle" size={18} />
                      <Input 
                        type="password" 
                        placeholder="Choose Password (min. 8 chars)" 
                        value={formData.password}
                        className="pl-10 h-12 rounded-xl"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-subtle" size={18} />
                      <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={formData.confirmPassword}
                        className="pl-10 h-12 rounded-xl"
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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

                  <p className="text-center text-sm text-muted-foreground pt-2">
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Profile Identity</h2>
                    <p className="text-muted-foreground mt-2">Step 2 of 3 — tell us about yourself.</p>
                  </header>

                  <div className="space-y-6">
                    {/* 🆕 PROFILE PICTURE DYNAMIC FILECHOOSER BLOCK */}
                    <div className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed border-border rounded-2xl bg-surface/50 hover:bg-surface transition-all group">
                      <div className="relative w-24 h-24 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center shadow-inner">
                        {formData.photoPreview ? (
                          <img 
                            src={formData.photoPreview} 
                            alt="Avatar Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Camera size={28} className="text-subtle group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      
                      <label className="cursor-pointer bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm hover:bg-primary-hover active:scale-95 transition-all">
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
                      <span className="text-compact text-subtle font-mono">PNG, JPG or JPEG up to 5MB</span>
                    </div>

                    {/* DEMOGRAPHIC VARIABLES */}
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-subtle" size={18} />
                        <Input 
                          placeholder="Full Name" 
                          value={formData.full_name}
                          className="pl-10 h-12 rounded-xl"
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 text-subtle" size={18} />
                          <Input 
                            type="number"
                            placeholder="Age" 
                            value={formData.age}
                            className="pl-10 h-12 rounded-xl"
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                          />
                        </div>

                        <div className="relative">
                          <Smile className="absolute left-3 top-3 text-subtle" size={18} />
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
                        <FileText className="absolute left-3 top-3 text-subtle" size={18} />
                        <Input 
                          placeholder="Short Biography / Objectives (Optional)" 
                          value={formData.bio}
                          className="pl-10 h-12 rounded-xl"
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-subtle" size={18} />
                        <textarea
                          placeholder="Your experience (e.g. 2 years of Excel analytics, learning Python...)"
                          value={formData.experience}
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
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

              {/* STEP 3: AI-SUGGESTED INTERESTS */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <header>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Interests</h2>
                    <p className="text-muted-foreground mt-2">Step 3 of 3 — AI picked these from your experience. Tap to select; tap again to change level.</p>
                  </header>

                  {suggesting ? (
                    <div className="flex items-center gap-3 py-10 justify-center text-muted-foreground text-sm">
                      <Sparkles className="animate-pulse text-primary" size={18} /> Generating suggestions...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 py-4">
                      {suggestions.map(({ name, level, reason }) => {
                        const activeLevel = formData.tech_stack[name];
                        const levels = ['Beginner', 'Intermediate', 'Pro'];
                        const handleCycleLevel = () => {
                          setFormData(prev => {
                            const updated = { ...prev.tech_stack };
                            if (!activeLevel) updated[name] = levels.includes(level) ? level : 'Beginner';
                            else if (activeLevel === 'Beginner') updated[name] = 'Intermediate';
                            else if (activeLevel === 'Intermediate') updated[name] = 'Pro';
                            else delete updated[name];
                            return { ...prev, tech_stack: updated };
                          });
                        };

                        return (
                          <button
                            key={name}
                            type="button"
                            title={reason}
                            onClick={handleCycleLevel}
                            className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-95 duration-200
                              ${activeLevel === 'Beginner' ? 'bg-info-subtle border-info text-info-strong font-black' : ''}
                              ${activeLevel === 'Intermediate' ? 'bg-plum-subtle border-plum text-plum-strong font-black' : ''}
                              ${activeLevel === 'Pro' ? 'bg-success-subtle border-success text-success-strong font-black ring-2 ring-success/10' : ''}
                              ${!activeLevel ? 'bg-card border-border text-soft hover:border-subtle' : ''}
                            `}
                          >
                            {name}
                            {activeLevel && (
                              <span className="text-label uppercase px-1.5 py-0.5 rounded bg-card border font-extrabold shadow-sm tracking-wider">
                                {activeLevel}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={fetchSuggestions}
                    disabled={suggesting || loading}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw size={12} /> Regenerate suggestions
                  </button>

                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" className="flex-1 h-12" onClick={() => setStep(2)} disabled={loading}>
                      <ChevronLeft className="mr-2" size={18} /> Back
                    </Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl bg-success hover:bg-success-strong font-bold" 
                      onClick={handleSubmit}
                      disabled={loading || suggesting}
                    >
                      {loading ? "Creating account..." : "Complete Setup"} <CheckCircle2 className="ml-2" size={18} />
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