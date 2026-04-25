import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Mail, Lock, AlertCircle, UserCircle } from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
      navigate('/admin');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0f172a] w-full max-w-[500px] aspect-square rounded-[4rem] p-12 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col items-center justify-center overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-10 right-10 p-2 text-white/20 hover:text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="w-full text-center">
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-1 ring-brand-primary/20">
                <LogIn size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mb-10">
                {isSignUp ? 'Join our community' : 'Login to your account'}
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center gap-3 border border-red-500/20"
                >
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-tight">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-[340px] mx-auto space-y-3">
                {isSignUp && (
                  <div className="relative group">
                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="FULL NAME"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase text-white tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white/10 transition-all"
                    />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase text-white tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white/10 transition-all"
                  />
                </div>
                
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase text-white tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white/10 transition-all"
                  />
                </div>

                {isSignUp && (
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input
                      required
                      type="password"
                      placeholder="CONFIRM PASSWORD"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase text-white tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white/10 transition-all"
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-2"
                >
                  {loading && !error ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : (isSignUp ? 'Register' : 'Login')}
                </button>
              </form>

              <div className="mt-8 space-y-4">
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                >
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>

                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="h-[1px] w-8 bg-white/5" />
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-brand-primary transition-colors group"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-3 h-3 grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100" alt="" />
                    Social Auth
                  </button>
                  <div className="h-[1px] w-8 bg-white/5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
