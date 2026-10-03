import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import api from '@/api/axios';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const ResetPassword = () => {
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  if (!state?.email || !state?.code) return <Navigate to="/forgot-password" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: state.email,
        code: state.code,
        new_password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-primary p-8 text-primary-foreground text-center space-y-2">
            <div className="w-16 h-16 bg-card/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold">Secure Reset</h2>
            <p className="text-info-soft text-sm">Almost there! Choose a strong password.</p>
          </div>

          <CardContent className="p-10 bg-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-subtle" size={18} />
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
                    className="absolute right-3 top-3 text-subtle hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-subtle" size={18} />
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
                  className="flex items-center gap-2 text-danger text-sm bg-danger-subtle p-3 rounded-lg border border-danger-soft"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
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