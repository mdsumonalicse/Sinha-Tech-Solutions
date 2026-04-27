import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../lib/useSettings';

export default function Hero() {
  const { settings } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left

  const banners = settings.banners && settings.banners.length > 0 
    ? settings.banners 
    : ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop'];

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <section className="relative lg:py-12">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden aspect-video sm:aspect-auto sm:min-h-[500px] lg:min-h-[450px] lg:rounded-[2rem]">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={banners[currentIndex]} 
                className="w-full h-full object-cover"
                alt="Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-gray-900 via-gray-900/60 lg:via-gray-900/80 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 p-4 sm:p-8 lg:p-16 h-full flex flex-col justify-end lg:justify-center aspect-video sm:aspect-auto sm:min-h-[500px] lg:min-h-[450px]">
            <motion.div
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              key={`content-${currentIndex}`}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl pb-4 lg:pb-0"
            >
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-full text-[7px] sm:text-[10px] font-bold uppercase tracking-wider mb-3 sm:mb-6">
                <Zap size={12} />
                Exclusive Software Hub
              </div>
              <h2 className="text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-2 sm:mb-4 tracking-tighter uppercase">
                Premium Digital <br />
                <span className="text-brand-primary">Services & Solutions</span>
              </h2>
              <p className="text-gray-300 text-[9px] sm:text-sm lg:text-base mb-4 sm:mb-8 max-w-lg font-medium leading-tight sm:leading-relaxed uppercase tracking-wide opacity-90 hidden sm:block">
                Get genuine software licenses, tools, and digital assets at the best prices in Bangladesh. Instant delivery & guaranteed support.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-brand-primary text-white px-6 sm:px-10 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-3"
                >
                  Explore <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px]" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          {banners.length > 1 && (
            <>
              <div className="absolute top-1/2 -translate-y-1/2 left-4 lg:left-10 z-20 hidden lg:flex">
                <button 
                  onClick={prev}
                  className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-brand-primary transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-10 z-20 hidden lg:flex">
                <button 
                  onClick={next}
                  className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-brand-primary transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-16 lg:translate-x-0 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setDirection(i > currentIndex ? 1 : -1);
                      setCurrentIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-10 bg-brand-primary' : 'w-3 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Abstract elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 hidden lg:flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-brand-primary opacity-20 rounded-full blur-[100px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
