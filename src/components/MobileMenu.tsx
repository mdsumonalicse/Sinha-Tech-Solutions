import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutGrid, Package, ChevronRight, ShieldCheck } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function MobileMenu({ isOpen, onClose, categories, activeCategory, onCategoryChange }: MobileMenuProps) {
  const { isAdmin } = useAuth();
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
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Categories</h2>
                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1">Explore Products</span>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    onClose();
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    activeCategory === 'all' 
                      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                      : 'bg-gray-50 text-gray-600 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory === 'all' ? 'bg-brand-primary text-white' : 'bg-white text-gray-400'}`}>
                    <LayoutGrid size={20} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest flex-1 text-left">All Products</span>
                  <ChevronRight size={16} className={activeCategory === 'all' ? 'opacity-100' : 'opacity-0'} />
                </button>

                {categories.map((cat) => {
                  // @ts-ignore
                  const Icon = LucideIcons[cat.icon] || LucideIcons.Package;
                  const isPrompt = cat.name.toLowerCase() === 'prompt' || cat.name.toLowerCase() === 'ai prompts';
                  const isActive = isPrompt ? false : activeCategory === cat.name;

                  const handleClick = () => {
                    if (isPrompt) {
                      onClose();
                      window.location.href = '/prompts';
                    } else {
                      onCategoryChange(cat.name);
                      onClose();
                    }
                  };

                  return (
                    <button
                      key={cat.id}
                      onClick={handleClick}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all relative overflow-hidden ${
                        isActive || isPrompt
                          ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                          : 'bg-gray-50 text-gray-600 border border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive || isPrompt ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-gray-400'}`}>
                        <Icon size={20} className={isPrompt ? 'animate-pulse' : ''} />
                      </div>
                      <div className="flex flex-col flex-1 items-start">
                        <span className={`font-black text-xs uppercase tracking-widest text-left ${isPrompt ? 'bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-purple-600 animate-gradient' : ''}`}>
                          {cat.name}
                        </span>
                        {isPrompt && (
                          <span className="text-[9px] font-black text-purple-400 uppercase tracking-tight animate-pulse">Exclusive Assets</span>
                        )}
                      </div>
                      {isPrompt && (
                        <div className="absolute top-0 right-0 p-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                          </span>
                        </div>
                      )}
                      <ChevronRight size={16} className={isActive ? 'opacity-100' : 'opacity-40'} />
                    </button>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      onClick={onClose}
                      className="w-full p-4 rounded-2xl flex items-center gap-4 bg-brand-primary/5 text-brand-primary border border-brand-primary/10 mt-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-black text-xs uppercase tracking-widest text-left">Admin Dashboard</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-left">Control Panel</span>
                      </div>
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Support</span>
                <a href="tel:+8801611065415" className="text-xs font-black text-gray-900 block hover:text-brand-primary transition-colors">+880 1611 065415</a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
