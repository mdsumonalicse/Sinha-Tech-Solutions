import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, PackageSearch } from 'lucide-react';

import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductRequestModal({ isOpen, onClose }: ProductRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productName: '',
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'requests'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({ name: '', email: '', phone: '', productName: '', details: '' });
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-[550px] aspect-square rounded-[4rem] p-12 relative shadow-2xl pointer-events-auto flex flex-col items-center justify-center overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-10 right-10 p-2 text-gray-300 hover:text-gray-900 transition-colors z-20"
              >
                <X size={24} />
              </button>

              <div className="w-full text-center">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12"
                  >
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                      <Send size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">Request Sent!</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto">
                      Our elite team will source your software and contact you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-brand-primary/5 text-brand-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <PackageSearch size={40} />
                    </div>
                    
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Request Item</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-10">Premium Software On Demand</p>

                    <form onSubmit={handleSubmit} className="w-full max-w-[380px] mx-auto space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
                          <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="NAME"
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Phone</label>
                          <input
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="017XXX"
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Email Address</label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="EMAIL@EXAMPLE.COM"
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-200"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Product Name</label>
                        <input
                          required
                          type="text"
                          name="productName"
                          value={formData.productName}
                          onChange={handleChange}
                          placeholder="E.G., ADOBE CC 2024"
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-200"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Additional Details</label>
                        <textarea
                          name="details"
                          value={formData.details}
                          onChange={handleChange}
                          placeholder="ANY SPECIFIC VERSION OR REQUIREMENTS?"
                          rows={2}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-gray-200 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-primary text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                          'Submit Request'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
