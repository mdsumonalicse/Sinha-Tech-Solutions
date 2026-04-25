import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import SearchResults from './components/SearchResults';
import AdminDashboard from './components/AdminDashboard';
import Hero from './components/Hero';
import { AuthProvider } from './lib/AuthContext';
import { PRODUCTS, CATEGORIES } from './constants';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

import { useAuth } from './lib/AuthContext';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function Home({ activeCategory, setActiveCategory, categories, products, loading }: any) {
  const filteredProducts = activeCategory === 'all' 
    ? (products.length > 0 ? products : PRODUCTS)
    : products.filter((p: any) => p.category && p.category.toLowerCase() === activeCategory.toLowerCase());

  const currentCategories = categories.length > 0 ? categories : CATEGORIES;

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Hero />
      <CategoryBar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
        categories={currentCategories}
      />
      <div className="grid grid-cols-12 gap-8 mt-12">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 border-l-4 border-brand-primary pl-3">
            Top Categories
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`bg-white p-3 rounded-xl border flex items-center gap-3 hover:shadow-md transition-all cursor-pointer group ${activeCategory === 'all' ? 'border-brand-primary/40 shadow-sm' : 'border-gray-100'}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${activeCategory === 'all' ? 'text-brand-primary bg-brand-primary/5' : 'bg-gray-50 text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/5'}`}>
                <LucideIcons.LayoutGrid size={20} />
              </div>
              <span className={`text-xs font-bold transition-all ${activeCategory === 'all' ? 'text-brand-primary' : 'text-gray-700 group-hover:text-brand-primary'}`}>
                All Products
              </span>
            </button>
            {currentCategories.map((cat: any) => {
              // @ts-ignore
              const Icon = LucideIcons[cat.icon] || LucideIcons.Package;
              const isActive = activeCategory === cat.name;
              return (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.name)}
                  className={`bg-white p-3 rounded-xl border flex items-center gap-3 hover:shadow-md transition-all cursor-pointer group ${isActive ? 'border-brand-primary/40 shadow-sm' : 'border-gray-100'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive ? 'text-brand-primary bg-brand-primary/5' : 'bg-gray-50 text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/5'}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-xs font-bold transition-all ${isActive ? 'text-brand-primary' : 'text-gray-700 group-hover:text-brand-primary'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Trust Badge Pin */}
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 mt-8">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2">Need a custom plan?</h4>
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed mb-4">
              Enterprise solutions and team accounts are available upon request.
            </p>
            <a 
              href="https://wa.me/8801611065415?text=Hello, I need a custom software plan for my team/enterprise." 
              target="_blank" 
              rel="noreferrer"
              className="block w-full py-2 bg-brand-primary text-white text-[10px] font-black rounded-lg hover:opacity-90 uppercase tracking-tighter transition-all text-center"
            >
              Contact Support
            </a>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="col-span-12 lg:col-span-9">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider border-l-4 border-brand-primary lg:border-none lg:pl-0 pl-3">
              Featured Products
            </h3>
            <span className="text-xs text-brand-primary font-bold cursor-pointer hover:underline">
              View All →
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Why Trust Us Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-white rounded-3xl border border-gray-100 p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm"
          >
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase whitespace-normal">WHY CHOOSE SINHA TECH SOLUTIONS?</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                We are Bangladesh's leading provider of genuine software keys. With over 10,000+ satisfied customers, we guarantee 100% official activation and lifetime support on all our digital products.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black">10k+</div>
                <span className="text-[9px] font-black text-gray-400 uppercase">Users</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black">24h</div>
                <span className="text-[9px] font-black text-gray-400 uppercase">Support</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black">100%</div>
                <span className="text-[9px] font-black text-gray-400 uppercase">Genuine</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}


function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const qProds = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProds = onSnapshot(qProds, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    });

    const qCats = query(collection(db, 'categories'));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
      setLoading(false);
    });

    return () => {
      unsubProds();
      unsubCats();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans">
          <Navbar 
            categories={categories.length > 0 ? categories : CATEGORIES}
            products={products.length > 0 ? products : PRODUCTS}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          
          <main className="flex-1 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={
                  <Home 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory} 
                    categories={categories}
                    products={products}
                    loading={loading}
                  />
                } />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/search" element={<SearchResults products={products} />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
              </Routes>
            </div>
          </main>

          <Footer />
          <MobileNav onOpenCategories={() => setIsMobileMenuOpen(true)} />
        </div>
      </Router>
    </AuthProvider>
  );
}
