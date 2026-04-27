import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Music2, ShieldCheck, Mail, Clock, CreditCard, Zap, Phone, MapPin, ChevronRight } from 'lucide-react';
import { useSettings } from '../lib/useSettings';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-[#0B0F19] pt-20 pb-28 lg:pb-16 mt-16 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-gray-800">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-white/5">
                <img 
                  src="https://i.postimg.cc/7hZRv2qc/backgrounderaser-1777268520.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                {settings.siteName}
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-medium opacity-80 uppercase tracking-tight">
              Premium digital solutions hub in Bangladesh. Providing genuine licenses with instant email delivery and expert lifetime support.
            </p>
            <div className="flex gap-3">
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-white hover:bg-[#1877F2] hover:scale-110 transition-all border border-white/5">
                <Facebook size={18} />
              </a>
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-white hover:bg-[#E4405F] hover:scale-110 transition-all border border-white/5">
                <Instagram size={18} />
              </a>
              <a href={settings.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-white hover:bg-black hover:scale-110 transition-all border border-white/5">
                <Twitter size={18} />
              </a>
              <a href={settings.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-white hover:bg-[#FF0000] hover:scale-110 transition-all border border-white/5">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8 relative">
              Explore
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-brand-primary" />
            </h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-[0.15em]">
              <li>
                <Link to="/" className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/prompts" className="hover:text-brand-primary transition-colors flex items-center gap-2 group text-purple-400">
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  AI Prompt Library
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  Admin Portal
                </Link>
              </li>
              <li>
                <a href="#login" className="hover:text-brand-primary transition-colors flex items-center gap-2 group">
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  Member Access
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8 relative">
              Support
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-brand-primary" />
            </h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-[0.15em]">
              <li><a href="#" className="hover:text-brand-primary transition-colors flex items-center gap-2">Privacy & Security</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors flex items-center gap-2">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors flex items-center gap-2">Official Refund Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors flex items-center gap-2">Delivery Agreement</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8 relative">
              Get in Touch
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-brand-primary" />
            </h4>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform border border-white/5">
                  <Phone size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Call Us</span>
                  <span className="text-xs font-black text-white">{settings.phone || '+880 1611 065415'}</span>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform border border-white/5">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Email</span>
                  <span className="text-xs font-black text-white">{settings.email}</span>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform border border-white/5">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Location</span>
                  <span className="text-xs font-black text-white">Dhaka, Bangladesh</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              © {new Date().getFullYear()} {settings.siteName}. {settings.footerText}.
            </p>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Developed by Sinha Tech Engineering Division.
            </p>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2">Secure Gateway:</span>
            <div className="flex items-center gap-4 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
              <CreditCard size={20} className="text-white" />
              <ShieldCheck size={20} className="text-white" />
              <Zap size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
