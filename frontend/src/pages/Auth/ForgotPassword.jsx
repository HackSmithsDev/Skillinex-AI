import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { KeyRound, ArrowRight, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendCode = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    navigate('/reset-password', { state: { email, code } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-[2rem] shadow-xl p-10 border border-muted"
      >
        <div className="w-16 h-16 bg-info-subtle rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <KeyRound className="text-primary" size={32} />
        </div>

        <h2 className="text-3xl font-bold text-center text-foreground">
          {step === 1 ? "Forgot Password?" : "Verify OTP"}
        </h2>
        <p className="text-center text-muted-foreground mt-2">
          {step === 1 
            ? "No worries, we'll send you recovery instructions." 
            : `We've sent a 6-digit code to ${email}`}
        </p>

        <form className="mt-8 space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="button" disabled={loading || !email} className="w-full h-12 text-lg" onClick={sendCode}>
                Send Reset Link <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input 
                type="text" 
                placeholder="000000" 
                className="h-14 text-center text-2xl tracking-[1em] font-bold"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <Button type="button" onClick={verifyCode} className="w-full h-12 text-lg bg-success hover:bg-success-strong">
                Verify Code
              </Button>
            </div>
          )}
          {error && <p className="mt-4 text-sm text-danger text-center">{error}</p>}
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;