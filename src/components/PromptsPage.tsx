import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Copy, CheckCircle2, Search, Terminal, Sparkles, Share2, ArrowLeft } from 'lucide-react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('type', '==', 'prompt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrompts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (prompt: any) => {
    const url = `${window.location.origin}/prompts#${prompt.id}`;
    navigator.clipboard.writeText(url);
    setSharedId(prompt.id);
    setTimeout(() => setSharedId(null), 2000);

    if (navigator.share) {
      navigator.share({
        title: prompt.name,
        text: `Check out this AI Prompt: ${prompt.name}`,
        url: url,
      }).catch(console.error);
    }
  };

  const filteredPrompts = prompts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <button 
        onClick={() => window.history.back()}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-gray-100 sm:hidden"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Sparkles size={32} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4"
          >
            AI Prompt <span className="text-purple-600">Engineering</span> Library
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] max-w-2xl mx-auto"
          >
            Free access to our curated collection of high-performing AI prompts. Copy and use them instantly for your projects.
          </motion.p>
        </div>
      </div>

      {/* Search & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH PROMPTS BY KEYWORD OR TECHNOLOGY..."
            className="w-full bg-white shadow-xl shadow-gray-200/50 rounded-2xl sm:rounded-3xl py-6 pl-16 pr-8 text-xs font-black uppercase outline-none focus:ring-4 focus:ring-purple-500/10 transition-all border-none"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-purple-100 transition-all group flex flex-col"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 border-b border-gray-50">
                  <img 
                    src={prompt.image} 
                    alt={prompt.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                      {prompt.category || 'AI PROMPT'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <p className="text-white text-[10px] font-bold line-clamp-2 uppercase leading-tight">
                      {prompt.description}
                    </p>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-4 line-clamp-1">
                    {prompt.name}
                  </h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 relative group/box">
                    <pre className="text-[10px] font-bold text-gray-500 uppercase whitespace-pre-wrap line-clamp-3 leading-relaxed">
                      {prompt.prompt}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(prompt.id, prompt.prompt)}
                      className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        copiedId === prompt.id 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-gray-900 text-white hover:bg-purple-600 shadow-xl shadow-gray-200'
                      }`}
                    >
                      {copiedId === prompt.id ? (
                        <>COPIED <CheckCircle2 size={14} /></>
                      ) : (
                        <>COPY <Copy size={14} /></>
                      )}
                    </button>
                    <button 
                      onClick={() => handleShare(prompt)}
                      className={`p-4 rounded-xl transition-all flex items-center justify-center ${
                        sharedId === prompt.id 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-white text-gray-400 hover:text-gray-900 border border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {sharedId === prompt.id ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
