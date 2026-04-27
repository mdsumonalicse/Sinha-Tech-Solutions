import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Copy, CheckCircle2, Search, Terminal, Sparkles, Share2, ArrowLeft, Eye } from 'lucide-react';

export default function PromptsPage() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  const [isPageShared, setIsPageShared] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'products'), 
      where('type', '==', 'prompt')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      // In-memory sort by createdAt desc
      data.sort((a, b) => {
        const dateA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const dateB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return dateB - dateA;
      });
      setPrompts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Clipboard API failed, falling back', err);
    }

    // Fallback for non-secure contexts or older mobile browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Ensure it's not visible but exists in DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // For iOS
      textArea.setSelectionRange(0, 99999);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed', err);
      return false;
    }
  };

  const handlePageShare = async () => {
    const url = window.location.origin + '/prompts';
    const title = 'Sinha Tech Solutions - AI Prompt Engineering Library';
    const text = 'Curated collection of high-performing AI prompts. Copy and use them instantly!';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setIsPageShared(true);
        setTimeout(() => setIsPageShared(false), 2000);
        return;
      } catch (error) {
        console.log("Share failed or cancelled", error);
      }
    }

    const success = await copyToClipboard(url);
    if (success) {
      setIsPageShared(true);
      setTimeout(() => setIsPageShared(false), 2000);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (prompt: any) => {
    const url = `${window.location.origin}/prompts/${prompt.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.name,
          text: `Check out this AI Prompt: ${prompt.name}`,
          url: url,
        });
        setSharedId(prompt.id);
        setTimeout(() => setSharedId(null), 2000);
        return;
      } catch (error) {
        console.log("Share failed or cancelled", error);
      }
    }

    const success = await copyToClipboard(url);
    if (success) {
      setSharedId(prompt.id);
      setTimeout(() => setSharedId(null), 2000);
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
            className="flex flex-col items-center justify-center gap-3 mb-6"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <span className="font-display font-black text-3xl sm:text-5xl text-gray-900 leading-none tracking-tighter whitespace-nowrap">
                SINHA <span className="text-purple-600 font-bold text-base sm:text-lg tracking-[0.3em] ml-2">TECH SOLUTIONS</span>
              </span>
            </div>
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
            className="text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] max-w-2xl mx-auto mb-8"
          >
            Free access to our curated collection of high-performing AI prompts. Copy and use them instantly for your projects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={handlePageShare}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                isPageShared 
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' 
                  : 'bg-white text-brand-primary border-2 border-brand-primary hover:bg-brand-primary hover:text-white shadow-xl shadow-brand-primary/10'
              }`}
            >
              {isPageShared ? (
                <>LINK COPIED! <CheckCircle2 size={16} /></>
              ) : (
                <>SHARE LIBRARY <Share2 size={16} /></>
              )}
            </button>
          </motion.div>
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
                <div 
                  className="aspect-[2/3] relative overflow-hidden bg-gray-50 border-b border-gray-50 cursor-pointer"
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                >
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
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mt-auto">
                    <h3 
                      className="text-xs font-black text-gray-900 tracking-tighter cursor-pointer hover:text-brand-primary transition-colors shrink-0"
                      onClick={() => navigate(`/prompts/${prompt.id}`)}
                    >
                      {prompt.name}
                    </h3>
                    
                    <div className="flex-1 flex gap-1.5 justify-end">
                    <button 
                      onClick={() => navigate(`/prompts/${prompt.id}`)}
                      className="p-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all flex items-center justify-center border border-purple-100"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(prompt.id, prompt.prompt);
                      }}
                      className={`px-3 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        copiedId === prompt.id 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {copiedId === prompt.id ? (
                        <>COPIED <CheckCircle2 size={12} /></>
                      ) : (
                        <>COPY <Copy size={12} /></>
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(prompt);
                      }}
                      className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
                        sharedId === prompt.id 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-900 hover:text-gray-900'
                      }`}
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
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
