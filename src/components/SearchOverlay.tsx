import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ArrowRight, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

export default function SearchOverlay({ isOpen, onClose, products }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const source = products.length > 0 ? products : PRODUCTS;
      const filtered = source.filter((p: any) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, products]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const newHistory = [searchQuery, ...history.filter(h => h !== searchQuery)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    onClose();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white lg:hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-gray-400">
              <X size={24} />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Search premium assets..."
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none placeholder:text-gray-400"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {query.trim().length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Results</span>
                </div>
                <div className="space-y-4">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.id}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-all text-left group"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-black text-gray-900 group-hover:text-brand-primary transition-colors">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.category}</span>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-primary transition-all" />
                    </button>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-sm text-gray-400 font-medium italic">No matches found for "{query}"</p>
                    </div>
                  )}
                </div>
                {suggestions.length > 0 && (
                  <button 
                    onClick={() => handleSearch(query)}
                    className="w-full py-4 bg-brand-primary/5 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/10 transition-all"
                  >
                    View all results for "{query}"
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-10">
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Searches</span>
                      <button onClick={clearHistory} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Clear</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(h)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          <Clock size={12} />
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Trending Now</span>
                  <div className="grid grid-cols-2 gap-3">
                    {['CapCut Pro', 'Canva Premium', 'Remini Pro', 'VIVA Cut'].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="p-4 bg-gray-50 rounded-2xl text-left hover:bg-brand-primary/5 hover:text-brand-primary transition-all group"
                      >
                        <span className="text-xs font-black uppercase tracking-tighter block">{term}</span>
                        <span className="text-[9px] text-gray-400 group-hover:text-brand-primary/60 font-bold uppercase mt-1">Trending 🔥</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
