import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const ResetPassword = () => {
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    // Logic to call your backend /auth/reset-password
    console.log("Password Reset Successful");
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-primary p-8 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold">Secure Reset</h2>
            <p className="text-blue-100 text-sm">Almost there! Choose a strong password.</p>
          </div>

          <CardContent className="p-10 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type={showPass ? "text" : "password"}
                    className="pl-10 h-12 rounded-xl focus-visible:ring-primary"
                    placeholder="••••••••"
                    required
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type={showPass ? "text" : "password"}
                    className="pl-10 h-12 rounded-xl focus-visible:ring-primary"
                    placeholder="••••••••"
                    required
                    onChange={(e) => setFormData({...formData, confirm: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;