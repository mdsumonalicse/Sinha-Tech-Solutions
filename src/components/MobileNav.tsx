import React from 'react';
import { Home, Grid, Search, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';

interface MobileNavProps {
  onOpenCategories: () => void;
  onOpenSearch: () => void;
}

export default function MobileNav({ onOpenCategories, onOpenSearch }: MobileNavProps) {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Grid size={20} />, label: 'Browse', onClick: onOpenCategories },
    { icon: <Search size={20} />, label: 'Search', onClick: onOpenSearch },
    { 
      icon: <User size={20} />, 
      label: 'Profile', 
      onClick: () => {
        if (isAdmin) {
          navigate('/admin');
        } else if (user) {
          // Maybe a profile page later, for now just home or scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Trigger login modal via dispatch or similar, but for now we skip
        }
      }
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-sm">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/20 px-6 py-3 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between">
        {navItems.map((item, idx) => {
          const isActive = item.path ? location.pathname === item.path : false;
          
          const handleClick = () => {
            if (item.onClick) item.onClick();
            if (item.path) navigate(item.path);
          };

          return (
            <button 
              key={idx} 
              onClick={handleClick} 
              className="relative flex flex-col items-center gap-1 group"
            >
              <div className={`p-2 rounded-2xl transition-all relative ${isActive ? 'text-brand-primary bg-brand-primary/10' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full"
                  />
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
