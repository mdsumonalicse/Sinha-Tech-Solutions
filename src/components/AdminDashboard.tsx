import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Settings as SettingsIcon, 
  MessageSquare, 
  LogOut, 
  Plus, 
  Search,
  ChevronRight,
  TrendingUp,
  Users,
  ShoppingBag,
  Bell,
  Trash2,
  Edit2,
  LayoutGrid,
  X,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Globe,
  Phone,
  Mail,
  CreditCard,
  Terminal,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Download,
  Ticket
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import CouponsTab from './CouponsTab';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  badge?: string;
  gallery?: string[];
  type?: 'buy' | 'download' | 'prompt';
  prompt?: string;
  downloadUrl?: string;
}

interface SiteSettings {
  siteName: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok?: string;
  youtube?: string;
  footerText: string;
  banners?: string[];
  bkash?: string;
  nagad?: string;
  orderDescription?: string;
}

interface Order {
  id: string;
  name: string;
  phone: string;
  transactionId: string;
  paymentMethod: 'bkash' | 'nagad';
  productId: string;
  productName: string;
  price: number;
  status: 'pending' | 'verified' | 'delivered' | 'cancelled';
  createdAt: any;
}

interface UserRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  productName: string;
  details: string;
  status: 'pending' | 'contacted' | 'fulfilled' | 'cancelled';
  createdAt: any;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase mb-4">Access Denied</h2>
          <p className="text-gray-500 font-medium mb-4">
            You don't have permission to access the admin panel. Please login with an authorized account.
          </p>
          {user && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 underline decoration-brand-primary">Your User ID (UID)</span>
              <code className="text-xs font-black text-brand-primary break-all select-all">{user.uid}</code>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-3">An existing admin must update your role to "admin" in the user management tab.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 transition-all"
            >
              Back to Home
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="w-full bg-white border border-gray-100 text-gray-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Logout and Try Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'prompts', label: 'Manage Prompts', icon: Terminal },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'users', label: 'User Management', icon: ShieldCheck },
    { id: 'coupons', label: 'Download Coupons', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const hasOpenModal = isProductModalOpen || isPromptModalOpen || !!selectedRequest || !!selectedOrder;
    if (hasOpenModal) {
      const handlePopState = () => {
        setIsProductModalOpen(false);
        setIsPromptModalOpen(false);
        setSelectedRequest(null);
        setSelectedOrder(null);
      };
      
      window.history.pushState({ modal: 'admin' }, '');
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isProductModalOpen, isPromptModalOpen, selectedRequest, selectedOrder]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden h-[73px]" />
      <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-[40]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
          >
            <LogOut size={20} className="rotate-180" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <Package size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm text-gray-900 leading-none">SINHA</span>
              <span className="font-display font-bold text-[7px] tracking-[0.1em] uppercase text-brand-primary">Admin</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <LayoutGrid size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col z-[50] transition-transform duration-300 lg:static lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <Package size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl text-gray-900 tracking-tighter uppercase leading-none">SINHA</span>
              <span className="font-display font-bold text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] mt-1">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="active" className="ml-auto">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="bg-gray-50 rounded-[2rem] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
                <img 
                  src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"} 
                  className="w-full h-full object-cover" 
                  alt={user.displayName || "Admin"}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-black text-gray-900 truncate uppercase">{user.displayName || 'Administrator'}</span>
                <span className="text-[9px] text-gray-400 font-bold truncate tracking-widest leading-none mt-1">SUPER ADMIN</span>
              </div>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black text-brand-primary hover:bg-brand-primary hover:text-white rounded-2xl transition-all border border-brand-primary/10 bg-white uppercase tracking-[0.2em]"
              >
                <ExternalLink size={14} />
                Exit to Website
              </button>
              <button 
                onClick={() => signOut(auth)}
                className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-100 uppercase tracking-[0.2em]"
              >
                <LogOut size={14} />
                Logout Session
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 lg:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 lg:mb-12">
          <div>
            {activeTab !== 'overview' && (
              <button 
                onClick={() => setActiveTab('overview')}
                className="lg:hidden flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft size={14} /> Back to Overview
              </button>
            )}
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <span className="hover:text-brand-primary cursor-pointer transition-colors">Digital Dashboard</span>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-brand-primary">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <input 
                type="text" 
                placeholder="GLOBAL SEARCH..." 
                className="w-64 bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all shadow-sm group-hover:shadow-md"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-primary transition-colors" size={16} />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="hidden sm:flex w-14 h-14 bg-white border border-gray-100 rounded-2xl items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all shadow-sm relative group">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute top-4 right-4 w-2 h-2 bg-brand-primary rounded-full border-2 border-white" />
              </button>
              {activeTab === 'products' && (
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus size={16} />
                  New Product
                </button>
              )}
              {activeTab === 'prompts' && (
                <button 
                  onClick={() => setIsPromptModalOpen(true)}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-purple-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus size={16} />
                  New AI Prompt
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && (
            <ProductsTab 
              onEdit={(product) => {
                setEditingProduct(product);
                setIsProductModalOpen(true);
              }} 
            />
          )}
          {activeTab === 'prompts' && (
            <PromptsTab 
              onEdit={(prompt) => {
                setEditingPrompt(prompt);
                setIsPromptModalOpen(true);
              }} 
            />
          )}
          {activeTab === 'orders' && <OrdersTab onSelect={setSelectedOrder} />}
          {activeTab === 'requests' && <RequestsTab onSelect={setSelectedRequest} />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'coupons' && <CouponsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {/* Modals */}
      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
      />
      <PromptModal 
        isOpen={isPromptModalOpen} 
        onClose={() => {
          setIsPromptModalOpen(false);
          setEditingPrompt(null);
        }}
        editingPrompt={editingPrompt}
      />
      <RequestModal 
        isOpen={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
      <OrderDetailModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}

function OrderDetailModal({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: Order | null }) {
  if (!order) return null;

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
            className="bg-white w-full max-w-[600px] rounded-[3rem] overflow-hidden relative z-10 flex flex-col shadow-2xl p-8 lg:p-12"
          >
            <button 
              onClick={onClose}
              className="absolute top-10 right-10 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="mb-12">
              <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">Order Details</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Transaction Verification Module</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Customer Identity</label>
                  <p className="bg-gray-50 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-tight">{order.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Contact Link</label>
                  <p className="bg-gray-50 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 tracking-tight">{order.phone}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Requested License Item</label>
                <div className="bg-gray-50 rounded-2xl py-4 px-6 flex items-center justify-between">
                   <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{order.productName}</span>
                   <span className="text-sm font-black text-brand-primary tracking-tighter">৳{Number(order.price || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Payment Method</label>
                  <div className={`rounded-2xl py-4 px-6 text-sm font-black uppercase tracking-widest flex items-center gap-3 ${order.paymentMethod === 'bkash' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                    <CreditCard size={16} />
                    {order.paymentMethod}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Transaction ID</label>
                  <p className="bg-gray-900 text-white rounded-2xl py-4 px-6 text-sm font-black tracking-widest select-all">{order.transactionId}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Current System Status</label>
                <div className={`rounded-2xl py-4 px-6 text-sm font-black uppercase tracking-widest text-center ${
                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-500' : 
                  order.status === 'cancelled' ? 'bg-red-50 text-red-500' : 
                  order.status === 'verified' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  {order.status}
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a 
                href={`tel:${order.phone}`}
                className="flex-1 py-6 bg-gray-50 text-gray-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-4"
              >
                Call Customer <Phone size={18} />
              </a>
              <button 
                onClick={onClose}
                className="flex-1 py-6 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all"
              >
                Dismiss View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Sub-components
function OverviewTab() {
  const stats = [
    { label: 'Licensed Items', value: '428', trend: '+12%', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Open Inquiries', value: '18', trend: '+3', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Traffic Surge', value: '25.4k', trend: '+28%', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Gross Volume', value: '৳ 3.2M', trend: '+15%', icon: TrendingUp, color: 'text-brand-primary', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-emerald-500 mb-0.5">{stat.trend}</span>
                  <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</span>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${stat.bg} opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-50 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Recent Business Performance</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Growth analytics for the current quarter</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Weekly</button>
              <button className="px-4 py-2 bg-gray-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-white">Monthly</button>
            </div>
          </div>
          <div className="h-80 flex items-end justify-between gap-2 px-4">
            {[45, 60, 35, 80, 55, 90, 70, 85, 40, 75, 65, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className="flex-1 bg-gray-50 rounded-t-xl relative group"
              >
                <div className={`absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl`} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {h}% UP
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Live Activity</h3>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] text-gray-900 font-black leading-tight uppercase group-hover:text-brand-primary transition-colors">New product request from #User7{i}</p>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{i * 12} minutes ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ onEdit }: { onEdit: (product: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs
        .map(doc => ({ docId: doc.id, ...doc.data() } as any))
        .filter((p: any) => p.type !== 'prompt');
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product permanently?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
      {/* List / Card View for Mobile */}
      <div className="lg:hidden divide-y divide-gray-50">
        {products.map((product: any) => (
          <div key={product.docId} className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-50 p-2 flex items-center justify-center flex-shrink-0">
                <img src={product.image} className="w-full h-full object-contain" alt="" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-gray-900 uppercase tracking-tighter truncate">{product.name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.category}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-brand-primary tracking-tighter">৳{product.price}</span>
                {product.oldPrice && <span className="text-[10px] text-gray-300 font-bold line-through">৳{product.oldPrice}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(product)} className="p-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(product.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Information</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">System Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product: any) => (
              <tr key={product.docId} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 p-2 flex items-center justify-center flex-shrink-0 group-hover:rotate-3 transition-transform">
                      <img src={product.image} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">{product.name}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px] mt-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className="px-4 py-2 bg-gray-50 text-[9px] font-black text-gray-500 rounded-lg uppercase tracking-widest">{product.category}</span>
                </td>
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-brand-primary tracking-tighter">৳{product.price}</span>
                    {product.oldPrice && <span className="text-[10px] text-gray-300 font-bold line-through">৳{product.oldPrice}</span>}
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(product)} className="p-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(product.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab({ onSelect }: { onSelect: (order: Order) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as any));
      setOrders(ords);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
      {/* Card View for Mobile */}
      <div className="lg:hidden divide-y divide-gray-50">
        {orders.map((order: any) => (
          <div key={order.docId} onClick={() => onSelect(order)} className="p-4 sm:p-6 space-y-4 active:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">{order.name}</span>
                <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">{order.phone}</span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black ${
                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-500' : 
                order.status === 'cancelled' ? 'bg-red-50 text-red-500' : 
                order.status === 'verified' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
              }`}>
                {order.status}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Item</span>
                <span className="text-sm font-black text-gray-900 uppercase tracking-tighter truncate max-w-[150px]">{order.productName}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Payment</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-gray-500">{order.paymentMethod}</span>
                  <span className="text-xs font-black text-brand-primary">৳{Number(order.price || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(order.docId);
                }} 
                className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left font-black">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="p-8 text-[10px] text-gray-400 uppercase tracking-[0.2em]">Customer Name</th>
              <th className="p-8 text-[10px] text-gray-400 uppercase tracking-[0.2em]">Order Item</th>
              <th className="p-8 text-[10px] text-gray-400 uppercase tracking-[0.2em]">Transaction (TrxID)</th>
              <th className="p-8 text-[10px] text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="p-8 text-[10px] text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order: any) => (
              <tr key={order.docId} onClick={() => onSelect(order)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900 uppercase tracking-tighter">{order.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">{order.phone}</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900 uppercase tracking-tighter truncate max-w-[150px]">{order.productName}</span>
                    <span className="text-[10px] text-brand-primary font-bold">৳{Number(order.price || 0).toLocaleString()}</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black ${order.paymentMethod === 'bkash' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                      {order.paymentMethod}
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-lg select-all">{order.transactionId}</span>
                  </div>
                </td>
                <td className="p-8" onClick={e => e.stopPropagation()}>
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.docId, e.target.value)}
                    className={`bg-gray-50 border-none rounded-xl py-3 px-4 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer ${
                      order.status === 'delivered' ? 'text-emerald-500' : 
                      order.status === 'cancelled' ? 'text-red-500' : 
                      order.status === 'verified' ? 'text-blue-500' : 'text-amber-500'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-8" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleDelete(order.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Package');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setCategories(cats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addDoc(collection(db, 'categories'), {
      name: newCatName.trim(),
      id: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: newCatIcon,
      createdAt: serverTimestamp()
    });
    setNewCatName('');
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', docId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `categories/${docId}`);
      }
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Category Name</label>
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g., ADOBE APPS" 
              className="bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Icon Name (Lucide)</label>
            <input 
              type="text" 
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              placeholder="e.g., LayoutGrid" 
              className="bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all">
              Add Category
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
        {/* Mobile List View */}
        <div className="lg:hidden divide-y divide-gray-50">
          {categories.map((cat) => (
            <div key={cat.docId} className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                    <LayoutGrid size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="p-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(cat.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identifier</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Icon</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.docId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-8">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">{cat.name}</span>
                  </td>
                  <td className="p-8">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{cat.id}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                        <LayoutGrid size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{cat.icon}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(cat.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </div>
  );
}

function CategoryModal({ isOpen, onClose, category }: { isOpen: boolean, onClose: () => void, category: any }) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Package'
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        icon: category.icon || 'Package'
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const oldName = category.name;
      const newName = formData.name;

      await updateDoc(doc(db, 'categories', category.docId), {
        name: newName,
        id: newName.toLowerCase().replace(/\s+/g, '-'),
        icon: formData.icon
      });

      // Cascade update products if name changed
      if (oldName !== newName) {
        const productsRef = collection(db, 'products');
        const q = query(productsRef);
        const querySnapshot = await getDocs(q);
        
        const updatePromises = querySnapshot.docs
          .filter(doc => doc.data().category === oldName)
          .map(docSnap => updateDoc(doc(db, 'products', docSnap.id), { category: newName }));
        
        await Promise.all(updatePromises);
      }

      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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

            <div className="mb-12">
              <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mb-6">
                <LayoutGrid size={32} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">Edit Category</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">System Taxonomy Editor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Category Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Icon Name (Lucide)</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-8 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-6 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4"
                >
                  Save Changes <Save size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


function RequestsTab({ onSelect }: { onSelect: (req: UserRequest) => void }) {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as any));
      setRequests(reqs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'requests', id), { status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this request?')) {
      try {
        await deleteDoc(doc(db, 'requests', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `requests/${id}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {requests.map((request: any) => (
        <motion.div
          key={request.docId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onSelect(request)}
          className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm relative group overflow-hidden cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-6">
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
              request.status === 'pending' ? 'bg-amber-50 text-amber-500' :
              request.status === 'contacted' ? 'bg-blue-50 text-blue-500' :
              request.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-500' :
              'bg-red-50 text-red-500'
            }`}>
              {request.status}
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              {request.createdAt?.toDate()?.toLocaleDateString()}
            </span>
          </div>

          <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4 truncate">{request.productName}</h4>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Users size={14} /></div>
              <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{request.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Mail size={14} /></div>
              <span className="text-xs font-black text-gray-600 truncate">{request.email}</span>
            </div>
          </div>

          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <select 
              value={request.status}
              onChange={(e) => updateStatus(request.docId, e.target.value)}
              className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={() => handleDelete(request.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  const toggleRole = async (userDocId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Change role to ${newRole}?`)) {
      try {
        await updateDoc(doc(db, 'users', userDocId), { role: newRole });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userDocId}`);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.uid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-4 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tighter">User Management</h3>
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage global access and platform roles</p>
            </div>
          </div>
          
          <div className="relative group w-full lg:max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text"
              placeholder="SEARCH USERS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* mobile card view for users */}
        <div className="lg:hidden divide-y divide-gray-50 -mx-6 sm:-mx-10">
          {filteredUsers.map((u) => (
            <div key={u.docId} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner p-1">
                  <img 
                    src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} 
                    className="w-full h-full object-cover rounded-xl"
                    alt=""
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-black text-gray-900 truncate uppercase">{u.displayName || 'No Name'}</span>
                  <span className="text-[10px] text-gray-400 font-bold truncate tracking-widest lowercase">{u.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  u.role === 'admin' 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {u.role || 'user'}
                </span>
                <button 
                  onClick={() => toggleRole(u.docId, u.role)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    u.role === 'admin'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-emerald-50 text-emerald-500'
                  }`}
                >
                  {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Identifier (UID)</th>
                <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Role Type</th>
                <th className="p-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.docId} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner p-1">
                        <img 
                          src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} 
                          className="w-full h-full object-cover rounded-xl"
                          alt=""
                        />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-black text-gray-900 truncate uppercase">{u.displayName || 'No Name'}</span>
                        <span className="text-[10px] text-gray-400 font-bold truncate tracking-widest lowercase">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <code className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-lg select-all">{u.uid}</code>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="p-8">
                    <button 
                      onClick={() => toggleRole(u.docId, u.role)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        u.role === 'admin'
                          ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                          : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No matching users found in the matrix</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Sinha Tech Solutions',
    phone: '+880 1611-065415',
    email: 'sts.support@gmail.com',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
    footerText: 'Genuine License Hub',
    banners: ['', '', '', '', ''],
    bkash: '01611065415',
    nagad: '01611065415',
    orderDescription: 'Copy the number and send money via BKash or Nagad. Paste the TrxID below.'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await getDoc(doc(db, 'settings', 'global'));
      if (s.exists()) {
        const data = s.data() as SiteSettings;
        setSettings({
          ...data,
          banners: data.banners || ['', '', '', '', '']
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // Filter empty banners
    const cleanedSettings = {
      ...settings,
      banners: settings.banners?.filter(b => b.trim() !== '') || []
    };
    await setDoc(doc(db, 'settings', 'global'), cleanedSettings);
    setLoading(false);
    alert('Settings synchronized globally!');
  };

  const updateBanner = (index: number, value: string) => {
    const newBanners = [...(settings.banners || ['', '', '', '', ''])];
    newBanners[index] = value;
    setSettings({ ...settings, banners: newBanners });
  };

  return (
    <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-10 border border-gray-50 shadow-sm space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 sm:p-4 bg-gray-900 text-white rounded-2xl"><Globe size={20} className="sm:w-6 sm:h-6" /></div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tighter">Global Identity</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Brand Name</label>
            <input 
              type="text" 
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
          {/* ... existing fields ... */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Direct Contact Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Support Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Hero Banner Slider (Max 5 Images)</h4>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400">{i + 1}</div>
                  <input 
                    type="text" 
                    value={settings.banners?.[i] || ''}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => updateBanner(i, e.target.value)}
                    className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 text-[9px] font-black outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Payment Configuration</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">bKash Personal Number</label>
                <input 
                  type="text" 
                  value={settings.bkash}
                  onChange={(e) => setSettings({...settings, bkash: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-black outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nagad Personal Number</label>
                <input 
                  type="text" 
                  value={settings.nagad}
                  onChange={(e) => setSettings({...settings, nagad: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-xs font-black outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order Process Description</label>
                <textarea 
                  rows={3}
                  value={settings.orderDescription}
                  onChange={(e) => setSettings({...settings, orderDescription: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-10 border border-gray-50 shadow-sm space-y-8 flex flex-col">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 sm:p-4 bg-brand-primary/10 text-brand-primary rounded-2xl"><ExternalLink size={20} className="sm:w-6 sm:h-6" /></div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tighter">Social Channels</h3>
        </div>

        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600"><Facebook size={20} /></div>
            <input 
              type="text" 
              value={settings.facebook}
              placeholder="https://facebook.com/..."
              onChange={(e) => setSettings({...settings, facebook: e.target.value})}
              className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black tracking-tight outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-rose-500"><Instagram size={20} /></div>
            <input 
              type="text" 
              value={settings.instagram}
              placeholder="https://instagram.com/..."
              onChange={(e) => setSettings({...settings, instagram: e.target.value})}
              className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black tracking-tight outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black"><Twitter size={20} /></div>
            <input 
              type="text" 
              value={settings.twitter}
              placeholder="https://twitter.com/..."
              onChange={(e) => setSettings({...settings, twitter: e.target.value})}
              className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black tracking-tight outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-red-600"><Youtube size={20} /></div>
            <input 
              type="text" 
              value={settings.youtube}
              placeholder="https://youtube.com/..."
              onChange={(e) => setSettings({...settings, youtube: e.target.value})}
              className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black tracking-tight outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black"><Music2 size={20} /></div>
            <input 
              type="text" 
              value={settings.tiktok}
              placeholder="https://tiktok.com/..."
              onChange={(e) => setSettings({...settings, tiktok: e.target.value})}
              className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black tracking-tight outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>SAVE GLOBAL CHANGES <Save size={18} /></>}
        </button>
      </div>
    </div>
  );
}

function RequestModal({ isOpen, onClose, request }: { isOpen: boolean, onClose: () => void, request: UserRequest | null }) {
  if (!request) return null;

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
            className="bg-white w-full max-w-[600px] rounded-[3rem] overflow-hidden relative z-10 flex flex-col shadow-2xl p-8 lg:p-12"
          >
            <button 
              onClick={onClose}
              className="absolute top-10 right-10 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="mb-12">
              <div className="w-16 h-16 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">Request Details</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Customer Inquiry Module</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Customer Name</label>
                  <p className="bg-gray-50 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-tight">{request.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Contact Phone</label>
                  <p className="bg-gray-50 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 tracking-tight">{request.phone}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Email Address</label>
                <p className="bg-gray-50 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 tracking-tight">{request.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Requested Product</label>
                <p className="bg-gray-50 rounded-2xl py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-tight">{request.productName}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Additional Details</label>
                <div className="bg-gray-50 rounded-2xl py-6 px-8 text-sm font-bold text-gray-600 uppercase leading-relaxed min-h-[120px]">
                  {request.details || 'No additional details provided.'}
                </div>
              </div>
            </div>

            <div className="mt-12">
              <a 
                href={`mailto:${request.email}`}
                className="w-full py-6 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4"
              >
                Send Response <Mail size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ProductModal({ isOpen, onClose, editingProduct }: { isOpen: boolean, onClose: () => void, editingProduct: any }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    oldPrice: 0,
    category: '',
    image: '',
    badge: '',
    gallery: ['', '', ''],
    type: 'buy',
    prompt: '',
    downloadUrl: '',
    appVersion: '',
    lastUpdated: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        gallery: editingProduct.gallery || ['', '', ''],
        type: editingProduct.type || 'buy',
        prompt: editingProduct.prompt || '',
        downloadUrl: editingProduct.downloadUrl || '',
        appVersion: editingProduct.appVersion || '',
        lastUpdated: editingProduct.lastUpdated || ''
      });
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        price: 0, 
        oldPrice: 0, 
        category: '', 
        image: '', 
        badge: '',
        gallery: ['', '', ''],
        type: 'buy',
        prompt: '',
        downloadUrl: '',
        appVersion: '',
        lastUpdated: ''
      });
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isAndroid = formData.category?.trim().toLowerCase() === 'android software';
      let autoLastUpdated = formData.lastUpdated;

      if (isAndroid && formData.appVersion) {
        const oldVersion = editingProduct?.appVersion || '';
        if (formData.appVersion !== oldVersion || !formData.lastUpdated) {
          const today = new Date();
          const formattedDate = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          autoLastUpdated = formattedDate;
        }
      }

      // Filter out empty gallery images
      const cleanedData = {
        ...formData,
        lastUpdated: autoLastUpdated,
        gallery: formData.gallery.filter(url => url.trim() !== '')
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.docId), cleanedData);
      } else {
        await addDoc(collection(db, 'products'), { ...cleanedData, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateGallery = (index: number, value: string) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = value;
    setFormData({ ...formData, gallery: newGallery });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
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
            className="bg-white w-full max-w-[800px] max-h-[90vh] rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden relative z-10 flex flex-col shadow-2xl"
          >
            <div className="p-6 sm:p-8 lg:p-12 overflow-y-auto w-full custom-scrollbar">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 sm:top-10 sm:right-10 w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-20"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <div className="w-full text-center mt-2 sm:mt-4">
                <h3 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-1">{editingProduct ? 'Edit Asset' : 'New License'}</h3>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-8 sm:mb-12">Asset Deployment Module</p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Asset Name</label>
                      <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Asset Type</label>
                      <select 
                        required 
                        value={formData.type} 
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})} 
                        className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="buy">Buy/Order License (অর্ডার অপশন)</option>
                        <option value="download">Coupon Download (কুপন দিয়ে ডাউনলোড)</option>
                        <option value="both">Both (উভয় অপশনই থাকবে)</option>
                        <option value="prompt">AI Prompt</option>
                      </select>
                    </div>

                    {formData.type === 'prompt' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">AI Prompt Content</label>
                        <textarea 
                          rows={3} 
                          value={formData.prompt} 
                          onChange={(e) => setFormData({...formData, prompt: e.target.value})} 
                          placeholder="Paste AI prompt here..." 
                          className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none" 
                        />
                      </div>
                    )}

                    {(formData.type === 'download' || formData.type === 'both') && (
                      <div className="space-y-1.5 bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-2 flex items-center gap-1">
                          <Download size={12} /> Download URL (Protected - Client needs Coupon Code)
                        </label>
                        <input 
                          required
                          value={formData.downloadUrl} 
                          onChange={(e) => setFormData({...formData, downloadUrl: e.target.value})} 
                          placeholder="https://..." 
                          className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-xs font-black outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all" 
                        />
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight block mt-1">
                          * কুপন কোড কোডবক্স-এ মিলিয়ে গ্রাহক ভেরিফিকেশন করার পর তাকে এই লিংকে নিয়ে ডাউনলোড করানো হবে।
                        </span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Category Selection</label>
                      <select 
                        required 
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})} 
                        className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {(formData.category?.trim().toLowerCase() === 'android software' || formData.category?.trim().toLowerCase() === 'android_software') && (
                      <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-emerald-500 animate-spin-slow" /> App Version (অ্যাপ সংস্করণ)
                          </label>
                          <input 
                            value={formData.appVersion || ''} 
                            onChange={(e) => setFormData({...formData, appVersion: e.target.value})} 
                            placeholder="e.g. v2.1.4, v4.5 Premium (Latest)" 
                            className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                          />
                        </div>
                        {formData.appVersion && (
                          <div className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider pl-1 flex items-center gap-1.5 mt-2 bg-emerald-100/40 p-2.5 rounded-lg border border-emerald-100/50">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <span>Last Updated (স্বয়ংক্রিয় আপডেট সময়):</span>
                            <span className="text-gray-600 font-black">
                              {formData.lastUpdated || 'Will auto-generate on save'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.type !== 'prompt' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sale Price (৳)</label>
                            <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Regular Price</label>
                            <input type="number" value={formData.oldPrice} onChange={(e) => setFormData({...formData, oldPrice: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Promotion Badge (Optional)</label>
                          <input value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} placeholder="e.g. POPULAR, -50% OFF" className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Main Image (Primary)</label>
                      <input required value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="HTTPS URL..." className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" />
                    </div>
                  </div>

                  {/* Gallery & Description Section */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Gallery Showcase (Optional 3 Images)</label>
                      {formData.gallery.map((url, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            value={url} 
                            onChange={(e) => updateGallery(i, e.target.value)} 
                            placeholder={`GALLERY IMAGE ${i + 1} URL...`}
                            className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all" 
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Asset Description</label>
                      <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="DETAILED DESCRIPTION..." className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-[10px] font-bold uppercase transition-all outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-7 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-black/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>{editingProduct ? 'Update System' : 'Deploy License'} <Save size={20} /></>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PromptsTab({ onEdit }: { onEdit: (prompt: any) => void }) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('type', '==', 'prompt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() as any }));
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

  const handleDelete = async (id: string) => {
    if (confirm('Delete this AI Prompt permanently?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  if (loading) return (
    <div className="p-20 flex justify-center">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Prompt Image</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Prompt content</th>
              <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {prompts.map((p: any) => (
              <tr key={p.docId} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-8">
                  <img src={p.image} className="w-16 h-12 object-cover rounded-xl" alt="" />
                </td>
                <td className="p-8">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{p.name}</span>
                </td>
                <td className="p-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase line-clamp-2 max-w-xs">{p.prompt}</p>
                </td>
                <td className="p-8">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(p)} className="p-3 bg-gray-50 hover:bg-purple-600 hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.docId)} className="p-3 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile view */}
      <div className="lg:hidden divide-y divide-gray-50">
        {prompts.map((p: any) => (
          <div key={p.docId} className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <img src={p.image} className="w-12 h-12 object-cover rounded-xl" alt="" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-900 uppercase">{p.name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{p.prompt}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(p)} className="flex-1 py-3 bg-gray-50 text-[10px] font-black uppercase text-purple-600 rounded-xl">Edit</button>
              <button onClick={() => handleDelete(p.docId)} className="flex-1 py-3 bg-gray-50 text-[10px] font-black uppercase text-red-500 rounded-xl">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptModal({ isOpen, onClose, editingPrompt }: { isOpen: boolean, onClose: () => void, editingPrompt: any }) {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    prompt: '',
    category: 'AI Prompts'
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (editingPrompt) {
      setFormData({
        name: editingPrompt.name || '',
        image: editingPrompt.image || '',
        prompt: editingPrompt.prompt || '',
        category: editingPrompt.category || 'AI Prompts'
      });
      setPreviewImage(editingPrompt.image || null);
    } else {
      setFormData({
        name: '',
        image: '',
        prompt: '',
        category: 'AI Prompts'
      });
      setPreviewImage(null);
    }
  }, [editingPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalName = formData.name;
      
      // Auto-generate name if it's a new prompt
      if (!editingPrompt) {
        const q = query(collection(db, 'products'), where('type', '==', 'prompt'));
        const snapshot = await getDocs(q);
        const count = snapshot.size;
        finalName = `2026-${count + 1}`;
      }

      const data = {
        ...formData,
        name: finalName,
        type: 'prompt',
        price: 0,
        updatedAt: serverTimestamp(),
      };

      if (editingPrompt) {
        await updateDoc(doc(db, 'products', editingPrompt.docId), {
          ...data,
          // Keep original createdAt if it exists
          createdAt: editingPrompt.createdAt || serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter font-display italic">
                    {editingPrompt ? 'Update' : 'Deploy'} AI Prompt
                  </h2>
                  <div className="flex flex-col mt-1">
                    <span className="font-display font-black text-xl text-gray-900 leading-none">SINHA</span>
                    <span className="font-display font-bold text-[8px] tracking-[0.3em] uppercase text-gray-400 mt-1">Tech Solutions</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {previewImage && (
                  <div className="relative mx-auto w-full aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50 mb-4">
                    <img 
                      src={previewImage} 
                      className="w-full h-full object-cover" 
                      alt="Preview" 
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Image Reference URL</label>
                  <input 
                    value={formData.image} 
                    onChange={(e) => {
                      setFormData({...formData, image: e.target.value});
                      setPreviewImage(e.target.value);
                    }} 
                    placeholder="HTTPS://IMAGE-LINK.PNG" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-black outline-none focus:ring-2 focus:ring-purple-500/10 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">The Prompt</label>
                  <textarea required rows={6} value={formData.prompt} onChange={(e) => setFormData({...formData, prompt: e.target.value})} placeholder="PASTE SYSTEM PROMPT HERE..." className="w-full bg-gray-50 border-none rounded-2xl py-5 px-8 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-purple-500/10 resize-none uppercase" />
                </div>

                <button type="submit" disabled={loading} className="w-full py-6 bg-purple-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-200 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {editingPrompt ? 'Update System' : 'Deploy Prompt'} <Save size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
