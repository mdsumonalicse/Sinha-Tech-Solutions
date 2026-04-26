import React from 'react';
import { Home, Grid, Search, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';

interface MobileNavProps {
  onOpenCategories: () => void;
  onOpenSearch: () => void;
}

export default function MobileNav({ onOpenCategories, onOpenSearch }: MobileNavProps) {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  if (location.pathname.startsWith('/admin') || location.pathname === '/prompts') return null;

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Grid size={20} />, label: 'Categories', onClick: onOpenCategories },
    { icon: <Search size={20} />, label: 'Search', onClick: onOpenSearch },
    { 
      icon: <User size={20} />, 
      label: isAdmin ? 'Admin' : 'Me', 
      path: isAdmin ? '/admin' : '/#login' 
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        {navItems.map((item, idx) => {
          const isActive = item.path ? location.pathname === item.path : false;
          const content = (
            <>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-all ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}
              >
                {item.icon}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-primary/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </>
          );

          if (item.onClick) {
            return (
              <button key={idx} onClick={item.onClick} className="relative flex flex-col items-center gap-1">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.path || idx} to={item.path!} className="relative flex flex-col items-center gap-1">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
