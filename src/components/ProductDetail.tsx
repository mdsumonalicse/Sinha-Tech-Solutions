import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Zap, 
  Laptop, 
  ArrowLeft, 
  Star, 
  CheckCircle2,
  Image as ImageIcon,
  CreditCard,
  Copy,
  Download,
  Terminal,
  Share2,
  Sparkles
} from 'lucide-react';
import OrderModal from './OrderModal';
import ProductCard from './ProductCard';

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copyPrompt = () => {
    if (product?.prompt) {
      navigator.clipboard.writeText(product.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareProduct = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
    
    // Use native share if available
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Sinha Tech Solutions`,
        url: url,
      }).catch(console.error);
    }
  };

  useEffect(() => {
    const fetchProductAndRecommended = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentProduct = { id: docSnap.id, ...data };
          setProduct(currentProduct);
          setSelectedImage(data.image);

          // Fetch recommended items from same category
          if (data.category) {
            const q = query(
              collection(db, 'products'),
              where('category', '==', data.category),
              limit(5)
            );
            const querySnapshot = await getDocs(q);
            const recommended = querySnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(item => item.id !== productId)
              .slice(0, 4);
            setRecommendedItems(recommended);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRecommended();
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    if (isOrderModalOpen) {
      const handlePopState = () => {
        setIsOrderModalOpen(false);
      };
      
      window.history.pushState({ modal: 'order' }, '');
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOrderModalOpen]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/" className="text-brand-primary font-bold hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const features = [
    "100% Genuine Retail Key",
    "Instant Email Delivery",
    "Lifetime Activation Guarantee",
    "Regular Official Updates",
    "Multi-language Support",
    "Priority Technical Support"
  ];

  return (
    <div className="max-w-7xl mx-auto py-0 lg:py-8 px-0 lg:px-8">
      <div className="px-4 py-6 lg:px-0 lg:py-0 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
          <ArrowLeft size={16} />
          Back to Store
        </Link>
        <button 
          onClick={shareProduct}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm ${shared ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400 hover:text-gray-900 border border-gray-100'}`}
        >
          {shared ? (
            <CheckCircle2 size={16} />
          ) : (
            <Share2 size={16} />
          )}
          {shared ? 'Link Copied' : 'Share Product'}
        </button>
      </div>

      <div className="bg-white rounded-none lg:rounded-[3rem] border-0 lg:border lg:border-gray-100 p-0 lg:p-16 shadow-none lg:shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24">
          {/* Product Image Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 lg:space-y-8"
          >
            <div className="aspect-square lg:aspect-square bg-gray-50 rounded-none lg:rounded-[3rem] overflow-hidden flex items-center justify-center p-0 lg:p-12 border-b lg:border border-gray-100 lg:border-gray-50 lg:shadow-inner group">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover lg:object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2 px-4 lg:px-0 lg:gap-4">
              <button 
                onClick={() => setSelectedImage(product.image)}
                className={`aspect-square bg-gray-50 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden p-2 ${selectedImage === product.image ? 'border-brand-primary shadow-lg shadow-brand-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={product.image} className="w-full h-full object-contain" alt="Main" />
              </button>
              {product.gallery?.map((img: string, i: number) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square bg-gray-50 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden p-2 ${selectedImage === img ? 'border-brand-primary shadow-lg shadow-brand-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-contain" alt={`Gallery ${i + 1}`} />
                </button>
              ))}
              {/* Fillers if gallery is less than 3 */}
              {[...Array(Math.max(0, 3 - (product.gallery?.length || 0)))].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-50 rounded-2xl border border-dashed border-gray-100 flex items-center justify-center">
                  <ImageIcon size={20} className="text-gray-200" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <div className="flex flex-col px-4 pb-12 lg:px-0 lg:pb-0">
            <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-emerald-50 text-emerald-600 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-4 lg:mb-8 w-fit border border-emerald-100">
              <CheckCircle2 size={12} className="sm:w-3 sm:h-3" />
              In Stock - Instant Delivery
            </div>

            <h1 className="text-2xl lg:text-5xl font-black text-gray-900 mb-4 lg:mb-6 leading-none lg:leading-tight tracking-tighter uppercase font-sans line-clamp-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 lg:mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-orange-400 text-orange-400 lg:w-4 lg:h-4" />
                ))}
              </div>
              <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Assets</span>
            </div>

            {product.type !== 'prompt' && (
              <div className="flex items-center gap-4 mb-8 lg:mb-10">
                <span className="text-3xl lg:text-5xl font-black text-brand-primary tracking-tighter">৳{product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="text-lg lg:text-2xl text-gray-300 line-through font-bold">৳{product.oldPrice.toLocaleString()}</span>
                )}
              </div>
            )}

            <p className="text-gray-500 font-bold text-xs lg:text-sm uppercase tracking-tight leading-relaxed mb-8 lg:mb-12 border-l-4 border-brand-primary/20 pl-4 lg:pl-6">
              {product.description}
            </p>

            <div className="space-y-4 mb-8 lg:mb-12">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 lg:mb-6 underline decoration-brand-primary decoration-2 underline-offset-4">Premium Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] lg:text-[11px] text-gray-600 font-black uppercase tracking-tight">
                    <div className="p-1 bg-emerald-50 text-emerald-500 rounded-md">
                      <CheckCircle2 size={12} className="lg:w-3.5 lg:h-3.5" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {product.type === 'prompt' && (
              <div className="mb-8 lg:mb-12">
                 <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Terminal size={14} className="text-brand-primary" />
                   AI Generation Prompt
                 </h3>
                 <div className="bg-gray-50 rounded-2xl p-6 relative group overflow-hidden border border-gray-100">
                    <pre className="text-xs font-bold text-gray-600 uppercase whitespace-pre-wrap leading-relaxed">
                       {product.prompt}
                    </pre>
                    <button 
                      onClick={copyPrompt}
                      className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-all text-brand-primary"
                    >
                       {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    {copied && (
                      <div className="absolute inset-0 bg-brand-primary/5 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                         <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Prompt Copied!</span>
                      </div>
                    )}
                 </div>
              </div>
            )}

            <div className="flex flex-col gap-3 lg:gap-4 mt-auto">
              {product.type === 'prompt' ? (
                <button 
                  onClick={copyPrompt}
                  className="w-full bg-brand-primary text-white h-14 lg:h-16 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:bg-opacity-90 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {copied ? 'Copied to Matrix' : 'Copy AI Prompt'} <Copy size={18} className="hidden sm:block" />
                </button>
              ) : product.type === 'download' ? (
                <a 
                  href={product.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-500 text-white h-14 lg:h-16 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-600 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Download Asset <Download size={18} className="hidden sm:block" />
                </a>
              ) : (
                <>
                  <button 
                    onClick={() => setIsOrderModalOpen(true)}
                    className="w-full bg-gray-900 text-white h-14 lg:h-16 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Order Now <CreditCard size={18} className="hidden sm:block" />
                  </button>
                  <a 
                    href={`https://wa.me/8801611065415?text=${encodeURIComponent(`Greetings, I am interested in purchasing the ${product.name} license for ৳${product.price.toLocaleString()}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#24CC63] text-white h-14 lg:h-16 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-[#20b859] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    WhatsApp Order
                  </a>
                </>
              )}
              
              <button 
                onClick={shareProduct}
                className={`w-full h-14 lg:h-16 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${shared ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-100' : 'bg-gray-50 text-gray-400 hover:text-gray-900 border-gray-100'}`}
              >
                {shared ? <CheckCircle2 size={18} /> : <Share2 size={18} />}
                {shared ? 'Link Copied to Clipboard' : 'Share This Product'}
              </button>
            </div>

            <OrderModal 
              isOpen={isOrderModalOpen} 
              onClose={() => setIsOrderModalOpen(false)} 
              product={product} 
            />

            <div className="mt-8 lg:mt-12 pt-8 lg:pt-12 border-t border-gray-50 flex justify-between gap-2">
               <div className="flex flex-col items-center gap-2 lg:gap-3 text-center flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 text-gray-400 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <Zap size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Instant<br/>Delivery</span>
               </div>
               <div className="flex flex-col items-center gap-2 lg:gap-3 text-center flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 text-gray-400 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Secure<br/>System</span>
               </div>
               <div className="flex flex-col items-center gap-2 lg:gap-3 text-center flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 text-gray-400 rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <Laptop size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Official<br/>Software</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {recommendedItems.length > 0 && (
        <div className="mt-12 lg:mt-24 px-4 lg:px-0">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-xl lg:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                <Sparkles className="text-brand-primary" />
                Recommended for You
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Based on your current interest in {product.category}</p>
            </div>
            <Link to="/" className="text-brand-primary text-[10px] font-black uppercase tracking-widest hover:underline whitespace-nowrap">View Store →</Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {recommendedItems.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
