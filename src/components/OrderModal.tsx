import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Phone, CreditCard, Send, ShieldCheck, Info } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function OrderModal({ isOpen, onClose, product }: OrderModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    transactionId: '',
    paymentMethod: 'bkash'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await getDoc(doc(db, 'settings', 'global'));
      if (s.exists()) setSettings(s.data());
    };
    if (isOpen) fetchSettings();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        ...formData,
        productId: product.id,
        productName: product.name,
        price: product.price,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setStep(1);
        setSuccess(false);
        setFormData({ name: '', phone: '', transactionId: '', paymentMethod: 'bkash' });
      }, 5000);
    } catch (error) {
      console.error("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="bg-white w-full max-w-[500px] rounded-[3rem] overflow-hidden relative z-10 flex flex-col shadow-2xl p-8 lg:p-12"
          >
            <button 
              onClick={onClose}
              className="absolute top-10 right-10 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-20"
            >
              <X size={24} />
            </button>

            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">Order Received!</h3>
                <p className="text-gray-500 font-bold px-8 leading-relaxed uppercase text-sm tracking-tight">
                  Your order for <span className="text-brand-primary">{product.name}</span> has been submitted. We are verifying your transaction. You will receive an email/call shortly.
                </p>
                <div className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Auto-closing in 5 seconds...
                </div>
              </div>
            ) : (
              <div className="custom-scrollbar overflow-y-auto max-h-[85vh] pr-2">
                <div className="mb-10">
                  <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">Procure License</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Secure Transaction Protocol</p>
                </div>

                {step === 1 ? (
                  <div className="space-y-8">
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Order Summary</span>
                        <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-brand-primary uppercase shadow-sm">
                          Instant Node
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">{product.name}</h4>
                      <div className="text-2xl font-black text-brand-primary tracking-tighter">৳{product.price.toLocaleString()}</div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest pl-2">1. Select Payment Method</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setFormData({...formData, paymentMethod: 'bkash'})}
                          className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.paymentMethod === 'bkash' ? 'border-brand-primary bg-rose-50 shadow-lg' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                        >
                          <div className="w-12 h-12 bg-[#D12053] rounded-xl flex items-center justify-center text-white font-black text-xs">bKash</div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Personal</span>
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, paymentMethod: 'nagad'})}
                          className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.paymentMethod === 'nagad' ? 'border-brand-primary bg-orange-50 shadow-lg' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                        >
                          <div className="w-12 h-12 bg-[#F7941D] rounded-xl flex items-center justify-center text-white font-black text-xs">Nagad</div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Personal</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-brand-primary/5 rounded-3xl p-8 border border-brand-primary/10">
                      <div className="flex items-center gap-3 mb-6">
                        <Info size={18} className="text-brand-primary" />
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Payment Instructions</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-500 uppercase">Transfer To:</span>
                          <span className="text-sm font-black text-gray-900 select-all">{formData.paymentMethod === 'bkash' ? (settings?.bkash || '01611065415') : (settings?.nagad || '01611065415')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-500 uppercase">Amount:</span>
                          <span className="text-sm font-black text-brand-primary uppercase tracking-tighter">৳{product.price.toLocaleString()}</span>
                        </div>
                        <div className="pt-4 border-t border-brand-primary/10">
                          <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed text-center">
                            {settings?.orderDescription || "Send money to the number above. After successful payment, copy the Transaction ID and click next to complete your order."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      Process Transaction <Send size={18} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
                          <input 
                            required 
                            type="text"
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" 
                            placeholder="YOUR NAME"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Contact Number</label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input 
                              required 
                              type="tel"
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                              className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" 
                              placeholder="01XXXXXXXXX"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Transaction ID (TrxID)</label>
                          <div className="relative">
                            <CreditCard size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input 
                              required 
                              type="text"
                              value={formData.transactionId} 
                              onChange={(e) => setFormData({...formData, transactionId: e.target.value})} 
                              className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" 
                              placeholder="ABC123XYZ"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
                       <ShieldCheck size={24} className="text-emerald-500 shrink-0 mt-1" />
                       <p className="text-[10px] text-emerald-600 font-bold uppercase leading-relaxed">
                         By submitting, you verify that you have completed the payment of ৳{product.price.toLocaleString()} via {formData.paymentMethod}. Unauthorized or fake transaction IDs will lead to permanent blacklisting.
                       </p>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="p-6 bg-gray-50 text-gray-400 rounded-2xl hover:text-gray-900 transition-all"
                      >
                        <X size={24} />
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-6 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Finalize Order <Send size={18} /></>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
