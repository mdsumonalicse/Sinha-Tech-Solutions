import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs,
  setDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Check, 
  Copy, 
  Calendar, 
  RefreshCw,
  AlertCircle,
  User,
  Phone,
  Sparkles,
  CheckCircle2,
  Lock,
  Share2,
  Filter,
  ShieldAlert,
  HelpCircle,
  UserCheck,
  Edit2,
  Mail,
  MessageCircle,
  Send,
  X
} from 'lucide-react';

interface Coupon {
  code: string;
  used: boolean;
  expiresAt: any;
  createdAt: any;
  usedAt?: any;
  usedBy?: string;
  productId?: string;
  productName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  
  // Create Coupon Form State
  const [customCode, setCustomCode] = useState('');
  const [durationValue, setDurationValue] = useState(24); // default 24
  const [durationType, setDurationType] = useState<'minutes' | 'hours' | 'days' | 'lifetime'>('hours');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // New Fields for target validation & client tracking
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Editing Coupon States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditCoupon, setSelectedEditCoupon] = useState<Coupon | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProductId, setEditProductId] = useState('all');
  const [editUsed, setEditUsed] = useState(false);
  const [editExpiryType, setEditExpiryType] = useState<'keep' | 'lifetime' | 'custom'>('keep');
  const [editExpiryCustom, setEditExpiryCustom] = useState('');

  // Toast / Copy notification states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedShareIndex, setCopiedShareIndex] = useState<string | null>(null);
  const [openSendMenuCode, setOpenSendMenuCode] = useState<string | null>(null);

  // Fetch coupons on real-time listener
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'coupons'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Coupon[] = [];
      snapshot.forEach((doc) => {
        list.push({ code: doc.id, ...doc.data() } as Coupon);
      });
      // Sort client-side by createdAt desc
      list.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      setCoupons(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching coupons:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all products to bind to drop-down selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const list: any[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProducts(list);
      } catch (err) {
        console.error("Error fetching products for coupons selector:", err);
      }
    };
    fetchProducts();
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SINHA-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCustomCode(code);
    setError(null);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessCode(null);

    const finalCode = customCode.trim().toUpperCase();
    if (!finalCode) {
      setError('অনুগ্রহ করে কুপন কোড প্রবেশ করুন অথবা জেনারেট করুন।');
      return;
    }

    if (finalCode.length < 4) {
      setError('কুপন কোডটি কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (!customerName.trim()) {
      setError('গ্রাহকের নাম অবশ্যই দিন (Customer Name is required).');
      return;
    }

    if (!customerPhone.trim()) {
      setError('গ্রাহকের মোবাইল নাম্বার দিন (Customer Phone is required).');
      return;
    }

    setIsCreating(true);

    try {
      // Calculate expiration time
      let expireDate: Date | null = null;
      if (durationType !== 'lifetime') {
        let multiplier = 60 * 60 * 1000; // default hours
        if (durationType === 'minutes') {
          multiplier = 60 * 1000;
        } else if (durationType === 'days') {
          multiplier = 24 * 60 * 60 * 1000;
        }
        const offsetMs = durationValue * multiplier;
        expireDate = new Date(Date.now() + offsetMs);
      }

      // Find selected product metadata
      const targetProduct = selectedProductId === 'all' 
        ? null 
        : products.find(p => p.id === selectedProductId);

      await setDoc(doc(db, 'coupons', finalCode), {
        code: finalCode,
        used: false,
        expiresAt: expireDate ? Timestamp.fromDate(expireDate) : null,
        createdAt: serverTimestamp(),
        productId: selectedProductId,
        productName: targetProduct ? targetProduct.name : 'All Products (No Lock)',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase()
      });

      setSuccessCode(finalCode);
      setCustomCode('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedProductId('all');
      
      // Auto close success badge after 8 sec
      setTimeout(() => setSuccessCode(null), 8000);
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      setError(err?.message || 'Failed to create coupon.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে কুপন কোডটি [ ${code} ] ডিলেট করতে চান?`)) return;
    try {
      await deleteDoc(doc(db, 'coupons', code));
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'আজীবন (Lifetime)';
    if (ts.toDate) {
      return ts.toDate().toLocaleString('bn-BD', { hour12: true });
    }
    return new Date(ts).toLocaleString('bn-BD', { hour12: true });
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expiresAt) return false;
    const expireTime = coupon.expiresAt.toDate ? coupon.expiresAt.toDate().getTime() : new Date(coupon.expiresAt).getTime();
    return Date.now() > expireTime;
  };

  // Pre-formatted copy-share text helper
  const handleCopyShareMessage = (coupon: Coupon) => {
    const msg = getShareMessage(coupon);
    navigator.clipboard.writeText(msg);
    setCopiedShareIndex(coupon.code);
    setTimeout(() => setCopiedShareIndex(null), 2000);
  };

  // Pre-formatted text for WhatsApp & Email with beautiful Bengali styling
  const getShareMessage = (coupon: Coupon) => {
    const timeFormatted = formatTimestamp(coupon.expiresAt);
    const softName = coupon.productName || 'কাঙ্ক্ষিত সফটওয়্যার';
    
    let expireMsg = '';
    if (coupon.expiresAt) {
      expireMsg = `⌛ মেয়াদ শেষ হবে: ${timeFormatted}`;
    } else {
      expireMsg = `⌛ মেয়াদ: আজীবন (Lifetime Access)`;
    }

    return `আসসালামু আলাইকুম, ${coupon.customerName || 'সম্মানিত গ্রাহক'}\n` +
           `সিনহা টেক সলিউশনস (Sinha Tech Solutions) থেকে আপনার ডিজিটাল সফটওয়্যার ডাউনলোড কুপন কোডটি প্রস্তুত করা হয়েছে! 😊\n\n` +
           `🔑 কুপন কোড: ${coupon.code}\n` +
           `🔒 সফটওয়্যার: ${softName}\n` +
           `${expireMsg}\n\n` +
           `📥 কুপন ব্যবহারের নির্দেশনা:\n` +
           `১. আমাদের ওয়েবসাইটে কাঙ্ক্ষিত প্রোডাক্ট বা সফটওয়্যার পেজে যান।\n` +
           `২. "Verify Coupon to Download" বাটনে ক্লিক করুন।\n` +
           `৩. আপনার কুপন কোডটি [ ${coupon.code} ] সাবমিট করুন।\n` +
           `৪. কুপনটি সফলভাবে যাচাই হওয়ার পর ডাউনলোড বাটনে ক্লিক করে ফাইলটি ডাউনলোড করে নিন।\n\n` +
           `আপনার যেকোনো প্রিমিয়াম সহযোগিতা বা ইনস্টলেশন সমস্যার জন্য আমাদের সাথে যোগাযোগ করতে পারেন।\n\n` +
           `ধন্যবাদ,\n` +
           `সিনহা টেক সলিউশনস`;
  };

  // Format timestamp to input datetime-local compatible format
  const timestampToDatetimeLocal = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const pad = (num: number) => String(num).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Open Edit Modal & load coupon data
  const handleOpenEditModal = (coupon: Coupon) => {
    setSelectedEditCoupon(coupon);
    setEditName(coupon.customerName || '');
    setEditPhone(coupon.customerPhone || '');
    setEditEmail(coupon.customerEmail || '');
    setEditProductId(coupon.productId || 'all');
    setEditUsed(coupon.used || false);
    setEditExpiryType(coupon.expiresAt ? 'custom' : 'lifetime');
    setEditExpiryCustom(timestampToDatetimeLocal(coupon.expiresAt));
    setIsEditModalOpen(true);
  };

  // Handle saving the updated coupon details
  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditCoupon) return;

    try {
      const docRef = doc(db, 'coupons', selectedEditCoupon.code);
      
      let finalExpiresAt = selectedEditCoupon.expiresAt;
      if (editExpiryType === 'lifetime') {
        finalExpiresAt = null;
      } else if (editExpiryType === 'custom') {
        if (editExpiryCustom) {
          finalExpiresAt = Timestamp.fromDate(new Date(editExpiryCustom));
        } else {
          finalExpiresAt = null;
        }
      }

      const targetProduct = editProductId === 'all' 
        ? null 
        : products.find(p => p.id === editProductId);

      const updateData: any = {
        customerName: editName.trim(),
        customerPhone: editPhone.trim(),
        customerEmail: editEmail.trim(),
        productId: editProductId,
        productName: targetProduct ? targetProduct.name : 'All Products (No Lock)',
        used: editUsed,
        expiresAt: finalExpiresAt,
      };

      // Reset use details if changing state
      if (editUsed && !selectedEditCoupon.used) {
        updateData.usedAt = serverTimestamp();
        updateData.usedBy = 'Admin Edit Override';
      } else if (!editUsed) {
        updateData.usedAt = null;
        updateData.usedBy = null;
      }

      await setDoc(docRef, updateData, { merge: true });
      setIsEditModalOpen(false);
      setSelectedEditCoupon(null);
    } catch (err) {
      console.error("Error updating coupon:", err);
      alert("কুপন আপডেট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    }
  };

  // Predefined triggers for WhatsApp sharing with Bangladesh country formatting
  const handleWhatsAppSend = (coupon: Coupon) => {
    const msg = getShareMessage(coupon);
    let originalPhone = coupon.customerPhone ? coupon.customerPhone.trim() : '';
    let cleanedPhone = originalPhone.replace(/[^0-9]/g, '');
    
    if (cleanedPhone.startsWith('0') && cleanedPhone.length === 11) {
      cleanedPhone = '88' + cleanedPhone;
    }
    
    const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Predefined triggers for Email client sharing with Gmail/standard client pre-filling
  const handleEmailSend = (coupon: Coupon) => {
    const msg = getShareMessage(coupon);
    const subject = `আপনার কুপন কোড প্রস্তুত - সিনহা টেক সলিউশনস`;
    const emailStr = coupon.customerEmail ? coupon.customerEmail.trim() : '';
    
    const mailtoUrl = `mailto:${emailStr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Filter coupons based on Search & Status tabs
  const filteredCoupons = coupons.filter(c => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) {
      // If empty, match based on statusFilter only
      const expired = isExpired(c);
      if (statusFilter === 'active') return !c.used && !expired;
      if (statusFilter === 'used') return c.used;
      if (statusFilter === 'expired') return !c.used && expired;
      return true;
    }

    // Clean input search and phone values for numeric comparisons (removing spacing, hyphens, prefixes)
    const cleanSearchStr = s.replace(/[^0-9]/g, '');
    const cleanPhone = c.customerPhone ? c.customerPhone.replace(/[^0-9]/g, '') : '';
    
    const matchesPhone = cleanPhone && (
      cleanPhone.includes(s) || 
      (cleanSearchStr && cleanPhone.includes(cleanSearchStr))
    );

    // Deep search in name, middle name, email, product and code
    const matchesSearch = (
      c.code.toLowerCase().includes(s) ||
      (c.usedBy && c.usedBy.toLowerCase().includes(s)) ||
      (c.customerName && c.customerName.toLowerCase().includes(s)) ||
      (c.customerPhone && c.customerPhone.toLowerCase().includes(s)) ||
      matchesPhone ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(s)) ||
      (c.productName && c.productName.toLowerCase().includes(s))
    );

    if (!matchesSearch) return false;

    const expired = isExpired(c);
    if (statusFilter === 'active') return !c.used && !expired;
    if (statusFilter === 'used') return c.used;
    if (statusFilter === 'expired') return !c.used && expired;
    return true; // all
  });

  // Filter products belonging to "Android Software" category
  const androidSoftwareProducts = products.filter(p => p.category?.trim().toLowerCase() === 'android software');

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Upper Banner Section */}
      <div className="bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent p-6 rounded-3xl border border-brand-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-lg">Admin Utility</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tighter mt-1">Download Coupons Hub</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">
            ম্যানেজ করুন এবং গ্রাহক-লকড ডাউনলোড কুপন কোড প্রসেস করুন।
          </p>
        </div>
        
        {/* Modern Bento Cards Stats */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white/90 backdrop-blur-sm px-5 py-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:scale-102 transition duration-200">
            <div className="w-9 h-9 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center shrink-0">
              <Ticket size={18} />
            </div>
            <div>
              <div className="text-base font-black text-gray-900 leading-none">{coupons.length}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">Total Keys</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm px-5 py-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:scale-102 transition duration-200">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-base font-black text-gray-900 leading-none">{coupons.filter(c => c.used).length}</div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">Acquired</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Create Coupon Generator form */}
        <div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-gray-100/80 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <Plus size={18} className="text-brand-primary" />
              কুপন তৈরি করুন
            </h3>
            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-bold uppercase">Locked Mode</span>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-bold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successCode && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 text-emerald-700 rounded-2xl text-[11px] font-bold space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    <span>কুপন কোড তৈরি হয়েছে!</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(successCode)}
                    className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-800 transition flex items-center gap-1"
                  >
                    <span className="text-[9px]">{copiedCode === successCode ? 'কপিড!' : 'কপি করুন'}</span>
                    <Copy size={12} />
                  </button>
                </div>
                <div className="bg-white p-2.5 rounded-xl text-center font-mono font-black text-sm border border-emerald-200 text-emerald-800 select-all tracking-wider shadow-sm">
                  {successCode}
                </div>
              </div>
            )}

            {/* Customer Details segment */}
            <div className="bg-teal-50/30 p-4 rounded-2xl border border-teal-100/50 space-y-3.5 shadow-inner">
              <div className="text-[9px] font-black text-teal-800 uppercase tracking-widest flex items-center gap-1">
                <UserCheck size={12} className="text-teal-600" /> Target Customer Tracking
              </div>

              {/* Customer Name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-650 uppercase tracking-wider pl-1 font-sans">১. গ্রাহকের নাম *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="উদাঃ শামীম হাসান"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-800 placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Customer Phone input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-650 uppercase tracking-wider pl-1 font-sans">২. মোবাইল নম্বর *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="উদাঃ 01711XXXXXX"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-800 placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Customer Email input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-650 uppercase tracking-wider pl-1 font-sans">৩. ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="উদাঃ customer@email.com"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-800 placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Locked Product Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                <Lock size={12} className="text-amber-500" /> ৩. নির্দিষ্ট সফটওয়্যার লক করুন
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-gray-800"
              >
                <option value="all">⭐ সকল সফটওয়্যার (নো রেস্ট্রিকশন)</option>
                {androidSoftwareProducts.length > 0 && (
                  <optgroup label="Android Software List">
                    {androidSoftwareProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        📱 {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {/* Fallback option if list is loading */}
                {products.length > 0 && androidSoftwareProducts.length === 0 && (
                  <optgroup label="All digital files">
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        🎁 {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <span className="text-[9px] text-gray-400 font-bold block leading-snug tracking-tight">
                * নির্দিষ্ট প্রোডাক্ট সিলেক্ট করলে গ্রাহক কেবল সেটিই নামাতে পারবেন, অন্য সফ্টওয়্যারে এটি কাজ করবে না।
              </span>
            </div>

            {/* Coupon Code input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">৪. কুপন কোড (সরাসরি লিখুন বা অটো দিন)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="উদাঃ SINHA-X7Y8Z"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-3.5 text-xs font-black uppercase font-mono outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-all shrink-0 border border-gray-200"
                  title="Generate Random Code"
                >
                  <RefreshCw size={12} />
                  <span>অটো</span>
                </button>
              </div>
            </div>

            {/* Validity Period Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1 font-sans">৫. মেয়াদ নির্ধারণ করুন</label>
              <div className="flex gap-2">
                {durationType !== 'lifetime' && (
                  <input 
                    type="number"
                    min="1"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded-xl py-3 px-3.5 text-xs font-black text-center outline-none focus:ring-2 focus:ring-brand-primary/25 transition-all"
                  />
                )}
                <select
                  value={durationType}
                  onChange={(e: any) => setDurationType(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-3 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-primary/25 transition-all text-gray-700"
                >
                  <option value="minutes">মিনিট (Minutes)</option>
                  <option value="hours">ঘণ্টা (Hours)</option>
                  <option value="days">দিন (Days)</option>
                  <option value="lifetime">আজীবন (Lifetime)</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/15 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isCreating ? 'তৈরি হচ্ছে...' : 'কুপন কোড তৈরি করুন'} 
                <Ticket size={14} />
              </button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-550 leading-relaxed bg-slate-50 p-3 rounded-2xl">
            <h4 className="font-extrabold text-gray-805 uppercase tracking-wide mb-1 flex items-center gap-1">
              <ShieldAlert size={12} className="text-brand-primary" />
              নিরাপত্তা রুলস
            </h4>
            <ul className="list-disc pl-3 space-y-1 font-bold">
              <li>একবার ব্যবহার করা কুপন দ্বিতীয়বার ব্যবহৃত হবে না।</li>
              <li>মেয়াদ শেষ হলে কুপন স্বয়ংক্রিয়ভাবে অচল হয়ে দাঁড়াবে।</li>
            </ul>
          </div>
        </div>

        {/* Dynamic Coupons Database History */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar & Search on Top of list */}
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text"
                placeholder="সার্চ করুন (কোড, কাস্টমার নেম, ফোন নম্বর বা প্রোডাক্ট নাম দিয়ে)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-11 pr-5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all text-gray-800 placeholder:text-gray-300 uppercase tracking-tight"
              />
            </div>

            {/* Smart Real-time Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mr-2 flex items-center gap-1 shrink-0">
                <Filter size={12} /> ফিল্টার:
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10' 
                    : 'bg-slate-50 hover:bg-slate-100 text-gray-600'
                }`}
              >
                সব কুপন ({coupons.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === 'active' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                সচল ({coupons.filter(c => !c.used && !isExpired(c)).length})
              </button>
              <button
                onClick={() => setStatusFilter('used')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === 'used' 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/10' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                ব্যবহৃত ({coupons.filter(c => c.used).length})
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === 'expired' 
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                মেয়াদোত্তীর্ণ ({coupons.filter(c => !c.used && isExpired(c)).length})
              </button>
            </div>
          </div>

          {/* Results Block */}
          <div className="bg-white rounded-[2rem] p-4 sm:p-6 border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center flex-1">
                <div className="w-9 h-9 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ডাটা ডাটাবেস থেকে লোড হচ্ছে...</span>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl flex-1 flex flex-col justify-center">
                <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">কোনো কুপন কোড পাওয়া যায়নি</p>
                <p className="text-[10px] text-gray-350 mt-1">অনুগ্রহ করে অন্য শব্দ দিয়ে বা ক্যাটাগরি পরিবর্তন করে আবার খুজুন।</p>
              </div>
            ) : (
              <>
                {/* 1. Mobile & Touch Screen Viewports Card-List Layout (HIDDEN ON DESKTOP) */}
                <div className="block md:hidden space-y-4 flex-1">
                  {filteredCoupons.map((coupon) => {
                    const expired = isExpired(coupon);
                    const isLocked = coupon.productId && coupon.productId !== 'all';
                    return (
                      <div 
                        key={coupon.code} 
                        className={`p-4 rounded-2xl border transition-all ${
                          coupon.used 
                            ? 'bg-gray-50/50 border-gray-100' 
                            : expired 
                            ? 'bg-amber-50/20 border-amber-100/50' 
                            : 'bg-white border-slate-100 hover:border-brand-primary/20 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="space-y-1">
                            {/* CODE & COPY */}
                            <button 
                              type="button"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-sm font-mono font-black text-gray-950 hover:text-brand-primary flex items-center gap-1.5"
                            >
                              <span>{coupon.code}</span>
                              {copiedCode === coupon.code ? (
                                <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 rounded font-black">কপিড!</span>
                              ) : (
                                <Copy size={11} className="text-gray-400" />
                              )}
                            </button>
                            
                            {/* STATUS BADGE */}
                            <div>
                              {coupon.used ? (
                                <span className="p-1 px-2.5 rounded bg-rose-50 text-rose-600 border border-rose-105 text-[8.5px] font-black uppercase tracking-wider">
                                  USED / নিয়োজিত
                                </span>
                              ) : expired ? (
                                <span className="p-1 px-2.5 rounded bg-amber-50 text-amber-600 border border-amber-105 text-[8.5px] font-black uppercase tracking-wider">
                                  EXPIRED
                                </span>
                              ) : (
                                <span className="p-1 px-2.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-105 text-[8.5px] font-black uppercase tracking-wider animate-pulse">
                                  ACTIVE / সচল
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 justify-end max-w-[170px] relative">
                            {/* Send options dropdown */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() => setOpenSendMenuCode(openSendMenuCode === coupon.code ? null : coupon.code)}
                                className={`p-1.5 px-2 rounded-lg text-[9px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                                  openSendMenuCode === coupon.code 
                                    ? 'bg-brand-primary text-white' 
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
                                }`}
                                title="গ্রাহককে কুপন পাঠান"
                              >
                                <Send size={10} className="shrink-0" />
                                <span>Send</span>
                              </button>

                              {openSendMenuCode === coupon.code && (
                                <>
                                  <div className="fixed inset-0 z-40 bg-transparent" onClick={(e) => { e.stopPropagation(); setOpenSendMenuCode(null); }} />
                                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden text-left divide-y divide-gray-50">
                                    {/* Option 1: WhatsApp */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsAppSend(coupon);
                                        setOpenSendMenuCode(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-[10px] font-black text-gray-700 hover:bg-emerald-50 hover:text-emerald-850 flex items-center gap-2 transition-all cursor-pointer text-left"
                                    >
                                      <MessageCircle size={13} className="text-emerald-550 shrink-0" />
                                      <span>WhatsApp-এ পাঠান</span>
                                    </button>

                                    {/* Option 2: Email */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEmailSend(coupon);
                                        setOpenSendMenuCode(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-[10px] font-black text-gray-700 hover:bg-blue-550 hover:text-white flex items-center gap-2 transition-all cursor-pointer text-left"
                                    >
                                      <Mail size={13} className="text-blue-500 shrink-0 hover:text-white" />
                                      <span>ইমেইলে পাঠান</span>
                                    </button>

                                    {/* Option 3: Copy Message */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyShareMessage(coupon);
                                        setOpenSendMenuCode(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-[10px] font-black text-gray-700 hover:bg-purple-550 hover:text-white flex items-center gap-2 transition-all cursor-pointer text-left"
                                    >
                                      <Share2 size={13} className="text-purple-500 shrink-0 hover:text-white" />
                                      <span>{copiedShareIndex === coupon.code ? 'মেসেজ কপিড!' : 'কুপন মেসেজ কপি'}</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Edit Coupon */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(coupon)}
                              className="p-1.5 px-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-250 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all"
                              title="কুপন এডিট করুন"
                            >
                              <Edit2 size={10} className="text-slate-500 shrink-0" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(coupon.code)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                              title="কুপন ডিলেট"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Customer Meta Details */}
                        <div className="grid grid-cols-2 gap-3 pt-2.5 mt-2 border-t border-slate-100 text-[10px] text-gray-650 font-bold uppercase font-sans">
                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-400 font-black block tracking-wider">CUSTOMER</span>
                            <div className="flex items-center gap-1 text-slate-800 font-bold normal-case">
                              <User size={11} className="text-teal-600 shrink-0" />
                              <span className="truncate">{coupon.customerName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 font-mono text-[9px] lowercase">
                              <Phone size={10} className="text-teal-600 shrink-0" />
                              <span>{coupon.customerPhone || 'N/A'}</span>
                            </div>
                            {coupon.customerEmail && (
                              <div className="flex items-center gap-1 text-gray-400 font-mono text-[8.5px] truncate lowercase mt-0.5">
                                <Mail size={10} className="text-teal-655 shrink-0" />
                                <span className="truncate">{coupon.customerEmail}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] text-gray-400 font-black block tracking-wider">LOCK EXCLUSIVITY</span>
                            <div className="flex items-start gap-1">
                              {isLocked ? (
                                <>
                                  <Lock size={10} className="text-amber-500 mt-0.5 shrink-0" />
                                  <span className="text-amber-800 leading-tight block line-clamp-2 normal-case">{coupon.productName}</span>
                                </>
                              ) : (
                                <span className="text-emerald-600 font-extrabold text-[9px] flex items-center gap-1">
                                  ⭐ UNLOCKED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-2.5 pt-2 border-t border-dashed border-gray-100 text-[8.5px] text-gray-400 flex justify-between items-center font-bold uppercase font-sans">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            Expires: {formatTimestamp(coupon.expiresAt)}
                          </span>
                          {coupon.used && (
                            <span className="text-rose-550 font-black">
                              USED AT: {formatTimestamp(coupon.usedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Structured Desktop Layout (HIDDEN ON MOBILE VIEWPORTS) */}
                <div className="hidden md:block overflow-x-auto max-h-[700px] custom-scrollbar pr-1 flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100/80 pb-3">
                        <th className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest pb-3 pl-2">কুপন / স্ট্যাটাস</th>
                        <th className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest pb-3 pl-2">গ্রাহকের প্রোফাইল</th>
                        <th className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest pb-3 border-l border-gray-100 pl-3">লকড প্রোডাক্ট</th>
                        <th className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest pb-3">মেয়াদ ও বিবরণী</th>
                        <th className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest pb-3 text-right pr-2">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/70">
                      {filteredCoupons.map((coupon) => {
                        const expired = isExpired(coupon);
                        const isLocked = coupon.productId && coupon.productId !== 'all';
                        return (
                          <tr key={coupon.code} className="hover:bg-slate-50/50 transition-colors group">
                            {/* CODE & STATUS badge */}
                            <td className="py-3.5 pl-2">
                              <div className="flex flex-col gap-1 align-start">
                                <button 
                                  type="button"
                                  onClick={() => copyToClipboard(coupon.code)}
                                  className="inline-flex items-center gap-1.5 font-mono font-black text-xs text-slate-900 hover:text-brand-primary active:scale-95 transition-all"
                                  title="কপি করতে ক্লিক করুন"
                                >
                                  <span>{coupon.code}</span>
                                  {copiedCode === coupon.code ? (
                                    <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 rounded font-normal shrink-0">কপিড!</span>
                                  ) : (
                                    <Copy size={11} className="text-gray-300 hover:text-brand-primary shrink-0 transition" />
                                  )}
                                </button>
                                <div>
                                  {coupon.used ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[8.5px] font-black uppercase tracking-wider">
                                      USED / নিয়োজিত
                                    </span>
                                  ) : expired ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[8.5px] font-black uppercase tracking-wider">
                                      EXPIRED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-650 border border-emerald-100 text-[8.5px] font-black uppercase tracking-wider animate-pulse">
                                      ACTIVE / সচল
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Customer Information detail block */}
                            <td className="py-3.5 max-w-[175px]">
                              <div className="space-y-1">
                                {coupon.customerName ? (
                                  <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-[11px] uppercase tracking-tight">
                                    <User size={12} className="text-teal-600 shrink-0" />
                                    <span className="truncate">{coupon.customerName}</span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Legacy System</span>
                                )}
                                {coupon.customerPhone && (
                                  <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px] font-bold">
                                    <Phone size={11} className="text-teal-600 shrink-0" />
                                    <span className="select-all">{coupon.customerPhone}</span>
                                  </div>
                                )}
                                {coupon.customerEmail && (
                                  <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[9px] font-bold">
                                    <Mail size={11} className="text-teal-600 shrink-0" />
                                    <span className="select-all font-sans lowercase truncate block max-w-[150px]">{coupon.customerEmail}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Product Lock Restriction description */}
                            <td className="py-3.5 max-w-[180px] border-l border-gray-100 pl-3">
                              <div className="space-y-1 pr-2">
                                {isLocked ? (
                                  <div className="flex items-start gap-1 text-slate-900 font-black text-[10px] uppercase tracking-tight leading-tight">
                                    <Lock size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2 text-amber-800">{coupon.productName || 'Restricted Product'}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-tight flex items-center gap-1">
                                    <Sparkles size={11} className="text-emerald-500 shrink-0" /> Unlocked
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Validity timelines and uses logs */}
                            <td className="py-3.5 text-[10px] text-gray-500 font-bold uppercase">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 font-sans">
                                  <Calendar size={11} className="text-gray-400 shrink-0" />
                                  <span>মেয়াদ শেষ: {formatTimestamp(coupon.expiresAt)}</span>
                                </div>
                                <div className="text-[8.5px] text-gray-400 block font-sans">
                                  {coupon.used ? (
                                    <div className="text-rose-550 font-black uppercase">
                                      ব্যবহৃত হয়েছে: {formatTimestamp(coupon.usedAt)}
                                      <span className="block text-[7.5px] text-gray-450 font-normal lowercase italic pl-3">
                                        by: {coupon.usedBy}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>তৈরি হয়েছে: {formatTimestamp(coupon.createdAt)}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Share, Edit & Delete Action blocks */}
                            <td className="py-3.5 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5 ml-auto font-sans relative">
                                {/* Custom dropdown Send button */}
                                <div className="relative inline-block text-left">
                                  <button
                                    type="button"
                                    onClick={() => setOpenSendMenuCode(openSendMenuCode === coupon.code ? null : coupon.code)}
                                    className={`p-1.5 px-2.5 rounded-lg text-[9.5px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                                      openSendMenuCode === coupon.code 
                                        ? 'bg-brand-primary text-white scale-98' 
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/80'
                                    }`}
                                    title="গ্রাহককে পাঠান"
                                  >
                                    <Send size={11} className={openSendMenuCode === coupon.code ? "text-white" : "text-emerald-700"} />
                                    <span>Send / পাঠান</span>
                                  </button>

                                  {openSendMenuCode === coupon.code && (
                                    <>
                                      <div className="fixed inset-0 z-40 bg-transparent" onClick={(e) => { e.stopPropagation(); setOpenSendMenuCode(null); }} />
                                      <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-155 rounded-2xl shadow-xl z-50 py-1 flex flex-col overflow-hidden text-left divide-y divide-gray-105">
                                        {/* Option: WhatsApp Send */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhatsAppSend(coupon);
                                            setOpenSendMenuCode(null);
                                          }}
                                          className="w-full px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-emerald-500 hover:text-white flex items-center gap-2.5 transition-all text-left cursor-pointer"
                                        >
                                          <MessageCircle size={13} className="text-emerald-500 hover:text-inherit shrink-0" />
                                          <span>WhatsApp-এ পাঠান</span>
                                        </button>

                                        {/* Option: Email Send */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmailSend(coupon);
                                            setOpenSendMenuCode(null);
                                          }}
                                          className="w-full px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-blue-500 hover:text-white flex items-center gap-2.5 transition-all text-left cursor-pointer"
                                        >
                                          <Mail size={13} className="text-blue-500 hover:text-inherit shrink-0" />
                                          <span>ইমেইলে পাঠান</span>
                                        </button>

                                        {/* Option: Copy Share Template */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyShareMessage(coupon);
                                            setOpenSendMenuCode(null);
                                          }}
                                          className="w-full px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-purple-500 hover:text-white flex items-center gap-2.5 transition-all text-left cursor-pointer"
                                        >
                                          <Share2 size={13} className="text-purple-500 hover:text-inherit shrink-0" />
                                          <span>
                                            {copiedShareIndex === coupon.code ? 'Copied / কপিড!' : 'কুপন মেসেজ কপি'}
                                          </span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Edit Coupon button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(coupon)}
                                  className="p-1.5 px-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200 rounded-lg text-[9.5px] font-black flex items-center gap-1 transition-all hover:text-brand-primary"
                                  title="কুপন সম্পাদনা করুন"
                                >
                                  <Edit2 size={11} className="text-slate-500 shrink-0" />
                                  <span>Edit</span>
                                </button>

                                {/* Delete single coupon button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCoupon(coupon.code)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                                  title="কুপন ডিলেট"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Coupon Modal */}
      {isEditModalOpen && selectedEditCoupon && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />
          
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden relative z-[160] flex flex-col shadow-2xl p-6 sm:p-8 md:p-10 max-h-[85vh]">
            {/* Close Button */}
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 sm:top-8 sm:right-8 w-11 h-11 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all z-20 cursor-pointer border border-gray-100"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center shrink-0 border border-brand-primary/10">
                <Ticket size={24} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Edit Coupon (কুপন তথ্য এডিট করুন)</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">
                  Coupon Code: <span className="text-brand-primary font-mono">{selectedEditCoupon.code}</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateCoupon} className="flex-1 overflow-y-auto pr-1 space-y-5 py-2">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Customer Name (গ্রাহকের নাম)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                    <User size={14} />
                  </span>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Rohim Ali"
                    className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 pl-11 pr-5 text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner" 
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Customer Phone (ফোন নম্বর)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                    <Phone size={14} />
                  </span>
                  <input 
                    type="text" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 pl-11 pr-5 text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner" 
                  />
                </div>
              </div>

              {/* Customer Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Customer Email (ইমেইল এড্রেস)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. example@gmail.com"
                    className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 pl-11 pr-5 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner" 
                  />
                </div>
              </div>

              {/* Locked Product selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                  Lock on Product (নির্দিষ্ট প্রোডাক্ট লক করুন)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <select
                    value={editProductId}
                    onChange={(e) => setEditProductId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 pl-11 pr-5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="all">All Products (No Lock / যেকোনো প্রোডাক্ট)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (৳{p.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Coupon Status used / unused */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                    Coupon Status (কুপন ব্যবহার স্থিতি)
                  </label>
                  <div className="relative">
                    <select
                      value={editUsed ? 'used' : 'active'}
                      onChange={(e) => setEditUsed(e.target.value === 'used')}
                      className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 px-5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner cursor-pointer"
                    >
                      <option value="active">Active (সচল / অব্যবহৃত)</option>
                      <option value="used">Used (ব্যবহৃত / নিয়োজিত)</option>
                    </select>
                  </div>
                </div>

                {/* Expiry Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                    Expiry Type (মেয়াদ কোড টাইপ)
                  </label>
                  <div className="relative">
                    <select
                      value={editExpiryType}
                      onChange={(e) => setEditExpiryType(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 px-5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-inner cursor-pointer"
                    >
                      <option value="lifetime">Lifetime (আজীবন কুপন)</option>
                      <option value="custom">Custom Date (নির্দিষ্ট মেয়াদ)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Custom Expiry Input if chosen */}
              {editExpiryType === 'custom' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 flex items-center gap-1">
                    <Calendar size={12} /> Custom Expiry Time (মেয়াদ শেষ হওয়ার সময়)
                  </label>
                  <input
                    type="datetime-local"
                    value={editExpiryCustom}
                    onChange={(e) => setEditExpiryCustom(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-100/80 rounded-2xl py-3.5 px-5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all shadow-inner select-none cursor-pointer"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 rounded-2xl transition-all cursor-pointer"
                >
                  Cancel / বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-primary/90 rounded-2xl shadow-lg shadow-brand-primary/20 focus:ring-4 focus:ring-brand-primary/20 hover:scale-102 transition-all cursor-pointer"
                >
                  Save Changes / সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
