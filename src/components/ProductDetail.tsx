import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
  CreditCard
} from 'lucide-react';
import OrderModal from './OrderModal';

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          setSelectedImage(data.image);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

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
    <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-8 font-black text-[10px] uppercase tracking-[0.2em]">
        <ArrowLeft size={16} />
        Back to Store
      </Link>

      <div className="bg-white rounded-[3rem] border border-gray-100 p-6 lg:p-16 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Product Image Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="aspect-square bg-gray-50 rounded-[3rem] overflow-hidden flex items-center justify-center p-12 border border-gray-50 shadow-inner group">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
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
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest mb-8 w-fit border border-emerald-100">
              <CheckCircle2 size={12} />
              In Stock - Instant Delivery
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tighter uppercase font-sans">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                ))}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified 42+ Inquiries</span>
            </div>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-5xl font-black text-brand-primary tracking-tighter">৳{product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="text-2xl text-gray-300 line-through font-bold">৳{product.oldPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-500 font-bold text-sm uppercase tracking-tight leading-relaxed mb-12 border-l-4 border-brand-primary/20 pl-6">
              {product.description}
            </p>

            <div className="space-y-4 mb-12">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6 underline decoration-brand-primary decoration-2 underline-offset-4">Security Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] text-gray-600 font-black uppercase tracking-tight">
                    <div className="p-1 bg-emerald-50 text-emerald-500 rounded-md">
                      <CheckCircle2 size={14} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button 
                onClick={() => setIsOrderModalOpen(true)}
                className="flex-1 bg-gray-900 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-gray-200 flex items-center justify-center gap-3"
              >
                Order Now <CreditCard size={18} />
              </button>
              <a 
                href={`https://wa.me/8801611065415?text=${encodeURIComponent(`Greetings, I am interested in purchasing the ${product.name} license for ৳${product.price.toLocaleString()}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#25D366] text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-green-100 flex items-center justify-center gap-3"
              >
                WhatsApp Order
              </a>
            </div>

            <OrderModal 
              isOpen={isOrderModalOpen} 
              onClose={() => setIsOrderModalOpen(false)} 
              product={product} 
            />

            <div className="mt-12 pt-12 border-t border-gray-50 grid grid-cols-3 gap-6">
               <div className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all">
                    <Zap size={24} />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">Instant Node<br/>Delivery</span>
               </div>
               <div className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-2xl flex items-center justify-center transition-all">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">End-to-End<br/>Secure</span>
               </div>
               <div className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-rose-50 group-hover:text-rose-600 rounded-2xl flex items-center justify-center transition-all">
                    <Laptop size={24} />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">Expert Tech<br/>Support</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
