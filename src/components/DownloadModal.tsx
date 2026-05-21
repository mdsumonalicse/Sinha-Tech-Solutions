import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  Ticket, 
  ShieldCheck, 
  MessageCircle, 
  ArrowRight, 
  Download, 
  AlertCircle, 
  Copy, 
  Check, 
  Smartphone,
  Info
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function DownloadModal({ isOpen, onClose, product }: DownloadModalProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [copiedType, setCopiedType] = useState<'bkash' | 'nagad' | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await getDoc(doc(db, 'settings', 'global'));
        if (s.exists()) setSettings(s.data());
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    if (isOpen) {
      fetchSettings();
      // Reset state when opening
      setCouponCode('');
      setError(null);
      setSuccess(false);
      setCopiedType(null);
    }
  }, [isOpen]);

  const handleValidateAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    const enteredCode = couponCode.trim().toUpperCase();
    if (!enteredCode) {
      setError('Please enter a coupon code.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const couponRef = doc(db, 'coupons', enteredCode);
      const couponSnap = await getDoc(couponRef);

      if (!couponSnap.exists()) {
        setError('ভুয়া বা ভুল কুপন কোড! দয়া করে সঠিক কোড দিন অথবা এডমিনের সাথে যোগাযোগ করুন।');
        setIsValidating(false);
        return;
      }

      const data = couponSnap.data();

      // Check if Coupon is Locked to a specific product ID
      if (data.productId && data.productId !== 'all') {
        if (data.productId !== product.id) {
          setError(`এই কুপন কোডটি শুধুমাত্র "${data.productName || 'নির্দিষ্ট সফটওয়্যার'}" ডাউনলোডের জন্য নির্ধারিত! আপনি ভুল সফটওয়্যারে এটি ব্যবহার করার চেষ্টা করছেন।`);
          setIsValidating(false);
          return;
        }
      }

      // Check if already used
      if (data.used) {
        setError('এই কুপন কোডটি ইতিমধ্যে এক বার ব্যবহার করা হয়ে গিয়েছে! একটি কোড কেবল ১ বারই ব্যবহার করা সম্ভব।');
        setIsValidating(false);
        return;
      }

      // Check Expiration
      if (data.expiresAt) {
        const expireTime = data.expiresAt.toDate ? data.expiresAt.toDate().getTime() : new Date(data.expiresAt).getTime();
        if (Date.now() > expireTime) {
          setError('এই কুপন কোডটির মেয়াদ শেষ হয়ে গিয়েছে!');
          setIsValidating(false);
          return;
        }
      }

      // Valid coupon! Mark it as used
      await updateDoc(couponRef, {
        used: true,
        usedAt: serverTimestamp(),
        usedBy: `Download: ${product.name}`
      });

      setSuccess(true);
      setIsValidating(false);

      // Trigger automatic download
      if (product.downloadUrl) {
        window.open(product.downloadUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setError('কুপন কোড যাচাই করার সময় ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
      setIsValidating(false);
    }
  };

  const bkashNumber = settings?.bkash || '01611065415';
  const nagadNumber = settings?.nagad || '01611065415';

  const copyNumber = (num: string, type: 'bkash' | 'nagad') => {
    navigator.clipboard.writeText(num);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const whatsappMessage = `Hello, I paid 100 Taka for the download coupon code of "${product?.name}". Please send me an active coupon code!`;
  const whatsappUrl = `https://wa.me/8801611065415?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-0"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white w-full max-w-[460px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative z-10 flex flex-col shadow-2xl border border-slate-100 max-h-[95vh]"
          >
            {/* Upper Accent Color Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 shrink-0" />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full flex items-center justify-center transition-all z-20 shadow-sm border border-slate-100 active:scale-95"
            >
              <X size={16} />
            </button>

            {success ? (
              <div className="text-center py-10 px-5 sm:px-10">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
                >
                  <CheckCircle2 size={36} className="animate-pulse" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">কোড সফলভাবে যাচাই করা হয়েছে!</h3>
                <p className="text-gray-500 font-bold px-2 leading-relaxed text-[11px] sm:text-xs tracking-wide mb-8">
                  সুপার! আপনার কুপন কোডটি সফল হয়েছে। আপনার কাঙ্ক্ষিত সফটওয়্যার <span className="text-brand-primary font-black">"{product?.name}"</span> ডাউনলোড হওয়া শুরু হচ্ছে।
                </p>

                {product?.downloadUrl && (
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={product.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-emerald-200 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    Direct Download <Download size={15} />
                  </motion.a>
                )}

                <div className="mt-8 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 py-3 rounded-xl">
                  Happy Downloading with SINHA TECH SOLUTIONS
                </div>
              </div>
            ) : product?.isFree ? (
              <div className="overflow-y-auto no-scrollbar px-4 sm:px-7 py-6 sm:py-8 space-y-6 text-center">
                {/* Header title */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <Download size={28} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Free Download</h3>
                    <p className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold uppercase tracking-[0.25em] mt-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100 font-sans">
                      সম্পূর্ণ ফ্রি সফটওয়্যার
                    </p>
                  </div>
                </div>

                {/* Selected Software Details Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/20 via-slate-50 to-emerald-50/20 rounded-2xl p-4 sm:p-5 border border-slate-100 text-left font-sans">
                  <div className="absolute right-3 -bottom-3 text-slate-200/50 shrink-0 select-none">
                    <Smartphone size={72} />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[8px] sm:text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Category: {product?.category}</div>
                    <h4 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-tight line-clamp-1 mb-1 pr-10">{product?.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.05em] flex items-center gap-1 mt-1.5 font-sans">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      Status: Safe, Secured & Free to Use
                    </p>
                  </div>
                </div>

                {/* Direct download Button */}
                <div className="space-y-3 pt-2">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={product?.downloadUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-emerald-250 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Direct Download (ডাউনলোড করুন) <Download size={15} />
                  </motion.a>
                  
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-relaxed">
                    * ডাউনলোড করতে কোনো কুপন লাগবে না। লিংকটি সরাসরি অফিশিয়াল ও নিরাপদ সার্ভার থেকে ফাইল ডাউনলোড করবে।
                  </p>
                </div>

                {/* Direct Security guarantee */}
                <div className="bg-emerald-50/40 border border-emerald-100/30 rounded-2xl p-4 flex items-start gap-2.5 text-left">
                  <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-emerald-700 font-bold uppercase leading-relaxed tracking-tight">
                    We strive to provide premium, secure application packages. Feel free to contact Sinha support if you experience issues.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto no-scrollbar px-4 sm:px-7 py-5 sm:py-7 space-y-4">
                {/* Header title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-brand-primary rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode size={20} className="sm:size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-none uppercase">Download Software</h3>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Sinha Secure Verification Hub</p>
                  </div>
                </div>

                {/* Selected Software Details Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-3.5 sm:p-4.5 border border-slate-100">
                  <div className="absolute right-3 -bottom-3 text-slate-200/45 shrink-0 select-none">
                    <Smartphone size={60} className="sm:size-[72px]" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[8px] sm:text-[9px] font-black text-purple-600 uppercase tracking-widest mb-0.5">Selected Product</div>
                    <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-1 mb-0.5 pr-10">{product?.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.05em] flex items-center gap-1">
                      <Ticket size={11} className="text-brand-primary" />
                      Required: 1 Unique Valid Token Key
                    </p>
                  </div>
                </div>

                {/* Validation Form */}
                <form onSubmit={handleValidateAndDownload} className="space-y-4">
                  <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50/70 via-indigo-50/45 to-pink-50/30 p-4 rounded-2xl border border-purple-100/80 shadow-inner">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">
                        Apply Your Active Coupon Code
                      </label>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">
                        <Ticket size={8} /> Enter Code Here
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Ticket size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                        <input 
                          required 
                          type="text"
                          value={couponCode} 
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setError(null);
                          }} 
                          className="w-full bg-white border-2 border-brand-primary/45 rounded-xl py-3.5 pl-11 pr-3 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all font-mono text-gray-900 placeholder:text-gray-300 shadow-sm" 
                          placeholder="SINHA-XXXXXX"
                        />
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        disabled={isValidating}
                        className="w-full sm:w-auto px-6 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                      >
                        {isValidating ? 'Checking...' : (
                          <>
                            Apply & Download <ArrowRight size={13} />
                          </>
                        )}
                      </motion.button>
                    </div>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                      * কুপন কোডটি এখানে পেস্ট বা টাইপ করুন (উদাঃ SINHA-ABC123)
                    </span>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-start gap-2 uppercase tracking-wide leading-relaxed"
                    >
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </form>

                {/* How to get coupon segment */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Info size={11} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-wider">কিভাবে কুপন কোড সংগ্রহ করবেন?</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 leading-relaxed">
                        কুপন কোড নেওয়ার জন্য আপনাকে <span className="text-brand-primary font-black">৳১০০ টাকা</span> পেমেন্ট করতে হবে। পেমেন্ট করার পর সেন্ড মানি স্ক্রিনশট দেখালে এডমিন আপনাকে একটি অনন্য ওয়ান-টাইম ইউজ কোড দিবেন।
                      </p>
                    </div>
                  </div>

                  {/* Payment numbers */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* bKash card */}
                    <div className="bg-gradient-to-br from-pink-50/40 via-white to-pink-50/20 rounded-2xl p-3 border border-pink-100/50 flex flex-col items-center relative group">
                      <div className="px-2 py-0.5 bg-[#D12053] rounded text-[8px] font-black text-white mb-2 uppercase select-none tracking-wider">
                        bKash
                      </div>
                      <span className="text-xs font-black text-slate-800 leading-none mb-1 font-mono">{bkashNumber}</span>
                      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Personal (Send Money)</span>
                      
                      <button 
                        type="button" 
                        onClick={() => copyNumber(bkashNumber, 'bkash')}
                        className="mt-2 text-[9px] font-black flex items-center gap-1 text-[#D12053] hover:text-pink-700 uppercase bg-pink-50 px-2 py-1 rounded-md transition"
                      >
                        {copiedType === 'bkash' ? (
                          <>COPIED <Check size={10} /></>
                        ) : (
                          <>COPY <Copy size={10} /></>
                        )}
                      </button>
                    </div>

                    {/* Nagad card */}
                    <div className="bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 rounded-2xl p-3 border border-orange-100/50 flex flex-col items-center relative group">
                      <div className="px-2 py-0.5 bg-[#F7941D] rounded text-[8px] font-black text-white mb-2 uppercase select-none tracking-wider">
                        Nagad
                      </div>
                      <span className="text-xs font-black text-slate-800 leading-none mb-1 font-mono">{nagadNumber}</span>
                      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Personal (Send Money)</span>
                      
                      <button 
                        type="button" 
                        onClick={() => copyNumber(nagadNumber, 'nagad')}
                        className="mt-2 text-[9px] font-black flex items-center gap-1 text-[#F7941D] hover:text-orange-700 uppercase bg-orange-50 px-2 py-1 rounded-md transition"
                      >
                        {copiedType === 'nagad' ? (
                          <>COPIED <Check size={10} /></>
                        ) : (
                          <>COPY <Copy size={10} /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Support Button */}
                  <motion.a 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-[#25D366] text-white hover:bg-[#20ba59] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    Get Coupon on WhatsApp <ArrowRight size={13} />
                  </motion.a>

                  {/* Direct Security guarantee */}
                  <div className="bg-emerald-50/40 border border-emerald-100/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-emerald-700 font-bold uppercase leading-relaxed tracking-tight">
                      We offer fully genuine premium APKs & soft licensed files. If any issue arises, our instant support team will verify your payment details and assist you 24/7.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
