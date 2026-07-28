import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowRight, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <KeyRound className="text-primary" size={32} />
        </div>

        <h2 className="text-3xl font-bold text-center text-slate-900">
          {step === 1 ? "Forgot Password?" : "Verify OTP"}
        </h2>
        <p className="text-center text-slate-500 mt-2">
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
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="button" className="w-full h-12 text-lg" onClick={() => setStep(2)}>
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
              />
              <Button type="button" className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                Verify Code
              </Button>
            </div>
          )}
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