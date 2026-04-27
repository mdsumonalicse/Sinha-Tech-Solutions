import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutGrid, Package, ChevronRight, ShieldCheck } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function MobileMenu({ isOpen, onClose, categories, activeCategory, onCategoryChange }: MobileMenuProps) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCategoryClick = (cat: any) => {
    const isPrompt = cat.name.toLowerCase() === 'prompt' || cat.name.toLowerCase() === 'ai prompts';
    if (isPrompt) {
      onClose();
      navigate('/prompts');
    } else {
      onCategoryChange(cat.name);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[101] shadow-2xl lg:hidden flex flex-col"
          >
            {/* Header with User Info */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 flex items-center justify-center relative z-10">
                      <img 
                        src="https://i.postimg.cc/CKp5SGF3/backgrounderaser-1777119211.png" 
                        alt="Logo" 
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-lg -z-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-xl tracking-tighter leading-none text-gray-900">SINHA</span>
                    <span className="font-display font-bold text-[8px] tracking-[0.2em] uppercase text-brand-primary mt-1">Tech Solutions</span>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-lg">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 line-clamp-1">{user.displayName || user.email?.split('@')[0]}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isAdmin ? 'Administrator' : 'Customer Account'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Join our community</p>
                  <button 
                    onClick={() => {
                      onClose();
                      // We don't have a direct way to open login modal from here yet without more props, but we can suggest it
                    }}
                    className="w-full py-3 bg-brand-primary text-white text-xs font-black rounded-xl uppercase tracking-tighter hover:opacity-90 transition-all"
                  >
                    Login to Account
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
              <div className="mb-4 px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Categories</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    onClose();
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    activeCategory === 'all' 
                      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100/50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory === 'all' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-gray-400'}`}>
                    <LayoutGrid size={20} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest flex-1 text-left">All Products</span>
                  <ChevronRight size={16} className={activeCategory === 'all' ? 'opacity-100' : 'opacity-40'} />
                </button>

                {categories.map((cat) => {
                  // @ts-ignore
                  const Icon = LucideIcons[cat.icon] || LucideIcons.Package;
                  const isPrompt = cat.name.toLowerCase() === 'prompt' || cat.name.toLowerCase() === 'ai prompts';
                  const isActive = isPrompt ? false : activeCategory === cat.name;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all relative overflow-hidden ${
                        isActive || isPrompt
                          ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                          : 'bg-gray-50 text-gray-600 border border-gray-100/50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive || isPrompt ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-gray-400'}`}>
                        <Icon size={20} className={isPrompt ? 'animate-pulse' : ''} />
                      </div>
                      <div className="flex flex-col flex-1 items-start">
                        <span className={`font-black text-xs uppercase tracking-widest text-left ${isPrompt ? 'bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-purple-600' : ''}`}>
                          {cat.name}
                        </span>
                        {isPrompt && (
                          <span className="text-[9px] font-black text-purple-400 uppercase tracking-tight">Exclusive AI Assets</span>
                        )}
                      </div>
                      <ChevronRight size={16} className={isActive ? 'opacity-100' : 'opacity-40'} />
                    </button>
                  );
                })}
              </div>

              {isAdmin && (
                <div className="mt-8 pt-8 border-t border-gray-100 px-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Management</span>
                  <Link 
                    to="/admin"
                    onClick={onClose}
                    className="w-full p-4 rounded-2xl flex items-center gap-4 bg-gray-900 text-white shadow-xl shadow-gray-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-black text-xs uppercase tracking-widest text-left">Admin Panel</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight text-left">Store Management</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-4">
                <a href="tel:+8801611065415" className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-1 group">
                  < LucideIcons.Phone size={18} className="text-brand-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Call Us</span>
                </a>
                <a href="https://wa.me/8801611065415" target="_blank" rel="noreferrer" className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-1 group">
                  < LucideIcons.MessageSquare size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
