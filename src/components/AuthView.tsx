import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, CompanyProfile } from '../types';

interface AuthViewProps {
  users: User[];
  onLogin: (user: User) => void;
  profile: CompanyProfile;
}

export function AuthView({ users, onLogin, profile }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        setError('No account found with this email address.');
        setLoading(false);
        return;
      }

      if (!user.active) {
        setError('Your account has been deactivated. Please contact administration.');
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        setError('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      onLogin(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4 font-sans selection:bg-[#141414] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-2xl overflow-hidden border border-[#141414]/5"
          >
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white">
                <TrendingUp size={32} />
              </div>
            )}
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold tracking-tighter text-[#141414]"
          >
            {profile.name}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#141414]/50 font-serif italic text-sm"
          >
            Budget Forecasting & Management Portal
          </motion.p>
        </div>

        <Card className="border-[#141414] border-2 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] bg-white overflow-hidden">
          <CardHeader className="bg-[#141414] text-white py-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck size={20} />
              Secure Login
            </CardTitle>
            <CardDescription className="text-white/60 font-serif italic text-xs">Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30 group-focus-within:text-[#141414] transition-colors" size={18} />
                  <Input 
                    type="email" 
                    placeholder="name@institution.com" 
                    className="pl-10 h-12 border-[#141414]/10 border-2 focus-visible:ring-0 focus-visible:border-[#141414] transition-all bg-[#F5F5F4]/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/40">Password</label>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414]">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30 group-focus-within:text-[#141414] transition-colors" size={18} />
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10 h-12 border-[#141414]/10 border-2 focus-visible:ring-0 focus-visible:border-[#141414] transition-all bg-[#F5F5F4]/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#141414]/30 hover:text-[#141414] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#141414] hover:bg-[#141414]/90 text-white font-bold tracking-tight rounded-xl group relative overflow-hidden transition-all disabled:opacity-70 shadow-lg"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In to Account
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-[#F5F5F4]/50 p-6 flex flex-col items-center gap-2">
            <p className="text-[10px] text-[#141414]/40 text-center font-serif italic">
              Authorized Personnel Only. All session activities are logged in the secure audit trail. IP address tracking enabled.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] border-[#141414]/10 px-2 py-0">SECURE V2.4</Badge>
              <Badge variant="outline" className="text-[10px] border-[#141414]/10 px-2 py-0">ENCRYPTED</Badge>
            </div>
          </CardFooter>
        </Card>

        {/* Mock Demo Info */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white border-t-4 border-t-[#141414]/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#141414]/60">Admin</p>
              <p className="text-[10px] text-[#141414]/40 truncate">jampel91@gmail.com</p>
              <p className="text-[10px] text-[#141414]/40">pass: password123</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#141414]/60">Staff</p>
              <p className="text-[10px] text-[#141414]/40 truncate">staff@microfinance.com</p>
              <p className="text-[10px] text-[#141414]/40">pass: staff123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
