import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Just send the object directly. 
      // Axios will use the default 'application/json' from your axios.js file.
      const res = await api.post('/auth/token', {
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', res.data.access_token);
      await fetchUser(); 
      navigate('/');
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      
      // Robust error handling to prevent React crash
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Validation error");
      } else {
        setError(detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-[2.5rem] shadow-2xl shadow-border/50 p-10 border border-muted"
      >
        <h2 className="text-3xl font-bold text-center text-foreground tracking-tight">Welcome Back</h2>
        <p className="text-muted-foreground text-center mt-2">Log in to continue your journey</p>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-danger text-sm mt-4 bg-danger-subtle p-3 rounded-xl border border-danger-soft text-center"
          >
            {error}
          </motion.p>
        )}
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-subtle" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-subtle" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-subtle hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="text-right px-1">
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-primary hover:text-info-strong transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-info-strong shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-soft">
          New to Skillinex? <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;