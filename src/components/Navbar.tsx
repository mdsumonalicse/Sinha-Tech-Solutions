import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Menu, Phone, Mail, X, PackagePlus, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import ProductRequestModal from './ProductRequestModal';
import LoginModal from './LoginModal';
import MobileMenu from './MobileMenu';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../lib/useSettings';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface NavbarProps {
  categories?: any[];
  products?: any[];
  activeCategory?: string;
  onCategoryChange?: (id: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({ 
  categories = [], 
  products = [],
  activeCategory = 'all', 
  onCategoryChange = () => {},
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const source = products.length > 0 ? products : PRODUCTS;
      const filtered = source.filter((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };
  return (
    <>
      {/* Top Banner */}
      <div className="bg-brand-primary text-white py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] sm:text-xs font-semibold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone size={12} /> {settings.phone}</span>
          <span className="hidden md:flex items-center gap-1"><Mail size={12} /> {settings.email}</span>
        </div>
        <div className="flex gap-4">
          <span 
            className="cursor-pointer hover:underline"
            onClick={() => !user && setIsLoginModalOpen(true)}
          >
            {user ? (user.displayName || user.email?.split('@')[0]) : 'My Account'}
          </span>
          <span className="cursor-pointer hover:underline">Order Tracking</span>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 hover:text-brand-primary transition-colors"
              >
                <Menu size={24} />
              </button>
              <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-28 sm:h-28 flex items-center justify-center drop-shadow-lg">
                  <img 
                    src="https://i.postimg.cc/CKp5SGF3/backgrounderaser-1777119211.png" 
                    alt="Sinha Tech Solutions Logo" 
                    className="h-full w-full object-contain transition-transform hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-black text-gray-900 tracking-tighter leading-none uppercase whitespace-nowrap">
                    {settings.siteName}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1 whitespace-nowrap">
                    Premium Digital Solutions
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex-1 max-w-xl mx-4 lg:mx-8">
              <form onSubmit={handleSearch} className="relative w-full" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full bg-gray-100 border-none rounded-2xl py-2 px-4 pl-4 focus:ring-2 focus:ring-brand-primary outline-none text-xs transition-all"
                />
                <div className="absolute right-2 top-1 flex items-center gap-1">
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="bg-brand-primary p-1 rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    <Search className="text-white" size={14} />
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]"
                    >
                      <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Suggestions</span>
                      </div>
                      <div className="flex flex-col">
                        {suggestions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSuggestionClick(p.id)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-brand-primary transition-colors">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category}</span>
                            </div>
                            <div className="ml-auto">
                              <span className="text-xs font-black text-brand-primary">৳ {p.price}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={handleSearch}
                        className="w-full p-3 bg-gray-50 text-[10px] font-black text-center text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all"
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRequestModalOpen(true)}
                className="hidden lg:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all border border-gray-100 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                  <PackagePlus size={18} />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Can't Find?</span>
                  <span className="text-xs font-black text-gray-900 uppercase">Product Request</span>
                </div>
              </motion.button>

              {user ? (
                isAdmin ? (
                  <Link to="/admin" className="hidden lg:flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-xl text-brand-primary hover:bg-brand-primary/20 transition-all">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-black">
                      {(user.displayName || user.email || 'A')[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tight leading-none">
                        {user.displayName || 'Admin'}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                        Dashboard
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                      <button 
                        onClick={() => signOut(auth)}
                        className="text-[8px] font-bold text-brand-primary uppercase tracking-widest leading-none mt-1 hover:underline cursor-pointer"
                      >
                        Logout Session
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="hidden lg:flex items-center gap-2 text-gray-400 hover:text-brand-primary transition-colors hover:scale-105"
                >
                  <UserCircle size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Login / Signup</span>
                </button>
              )}

              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Shopping Cart</span>
                <span className="text-sm font-black text-brand-primary leading-none">৳ 0.00</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-brand-primary hover:bg-gray-200 transition-all cursor-pointer"
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  0
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <ProductRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
    </>
  );
}
