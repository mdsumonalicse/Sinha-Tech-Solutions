import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Copy, CheckCircle2, Share2, ArrowLeft, Terminal, Sparkles, Wand2, Info, ChevronRight } from 'lucide-react';

export default function PromptDetailPage() {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchPromptData = async () => {
      if (!promptId) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', promptId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const promptData: any = { id: docSnap.id, ...docSnap.data() };
          setPrompt(promptData);
          
          // Fetch recommendations
          const q = query(
            collection(db, 'products'), 
            where('type', '==', 'prompt'),
            where('category', '==', promptData.category || 'AI Prompt'),
            limit(4)
          );
          const querySnapshot = await getDocs(q);
          const recs = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== promptId);
          setRecommendations(recs);
        }
      } catch (error) {
        console.error("Error fetching prompt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromptData();
    window.scrollTo(0, 0);
  }, [promptId]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Clipboard API failed', err);
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  };

  const handleCopy = async () => {
    if (prompt?.prompt) {
      const success = await copyToClipboard(prompt.prompt);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt?.name,
          text: `Check out this AI Prompt: ${prompt?.name}`,
          url: url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (error) {
        console.log("Share failed", error);
      }
    }

    const success = await copyToClipboard(url);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Terminal size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-black text-gray-900 uppercase">Prompt Not Found</h2>
          <Link to="/prompts" className="mt-4 text-brand-primary font-bold uppercase text-xs hover:underline inline-block">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 mb-8 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/prompts')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={16} /> BACK TO LIBRARY
          </button>
          
          <div className="flex flex-col lg:flex-row gap-8 pb-12">
            <div className="w-full lg:w-1/2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-purple-100 group"
              >
                <img 
                  src={prompt.image} 
                  alt={prompt.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
            
            <div className="w-full lg:w-1/2 flex flex-col pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {prompt.category || 'AI PROMPT'}
                </span>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Verified Engineering
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4 leading-none">
                {prompt.name}
              </h1>
              
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-8 leading-relaxed">
                {prompt.description}
              </p>

              <div className="mt-auto space-y-4">
                <button 
                  onClick={handleShare}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${
                    shared 
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' 
                      : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-gray-900 hover:text-gray-900'
                  }`}
                >
                  {shared ? <>LINK COPIED <CheckCircle2 size={16} /></> : <>SHARE PROMPT <Share2 size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Prompt Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={18} className="text-purple-600" /> THE PROMPT
              </h2>
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-brand-primary text-white hover:opacity-90 shadow-xl shadow-brand-primary/20'
                }`}
              >
                {copied ? <>COPIED <CheckCircle2 size={14} /></> : <>COPY PROMPT <Copy size={14} /></>}
              </button>
            </div>
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 relative group">
              <pre className="text-xs sm:text-sm font-bold text-gray-600 whitespace-pre-wrap leading-relaxed select-all">
                {prompt.prompt}
              </pre>
              <div className="absolute top-4 right-4 text-gray-100 group-hover:text-purple-100 transition-colors">
                <Sparkles size={48} />
              </div>
            </div>
          </section>

          {/* How to use - Bengali / English */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-brand-primary to-purple-600 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Wand2 size={20} />
                </div>
                <h3 className="font-black text-xs uppercase tracking-widest">কিভাবে ব্যবহার করবেন?</h3>
              </div>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-wide opacity-90">
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center shrink-0">১</span>
                  <span>উপরের 'COPY PROMPT' বাটনে ক্লিক করে প্রম্পটটি কপি করুন।</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center shrink-0">২</span>
                  <span>আপনার পছন্দের AI টুল (যেমন: Midjourney বা Leonardo AI) ওপেন করুন।</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center shrink-0">৩</span>
                  <span>AI টুলের ইমেজ জেনারেটর সেকশনে প্রম্পটটি পেস্ট করুন।</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center shrink-0">৪</span>
                  <span>এন্টার চাপুন এবং আপনার কাঙ্খিত চমৎকার ইমেজ বা ভিডিও তৈরি হয়ে যাবে।</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-brand-primary/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6 text-brand-primary">
                <div className="p-2 bg-brand-primary/10 rounded-xl">
                  <Info size={20} />
                </div>
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">How to use?</h3>
              </div>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-gray-100 text-gray-900 rounded-md flex items-center justify-center shrink-0">1</span>
                  <span>Click the 'COPY PROMPT' button above to copy the prompt.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-gray-100 text-gray-900 rounded-md flex items-center justify-center shrink-0">2</span>
                  <span>Open your preferred AI tool like Midjourney, Leonardo or Runway.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-gray-100 text-gray-900 rounded-md flex items-center justify-center shrink-0">3</span>
                  <span>Paste the command in the generator box and customize if needed.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-gray-100 text-gray-900 rounded-md flex items-center justify-center shrink-0">4</span>
                  <span>Press generate to create your masterpiece instantly.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recommended For You</h2>
                <Link to="/prompts" className="text-[10px] font-black text-brand-primary uppercase hover:underline">View All Library</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/prompts/${item.id}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3 border border-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-900 uppercase line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {item.name}
                    </h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
