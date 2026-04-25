import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../constants';
import { Link } from 'react-router-dom';
import { Eye, GitCompare } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full p-2 sm:p-4 relative"
    >
      <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 mb-2 sm:mb-4 flex items-center justify-center">
        <Link to={`/product/${product.id}`} className="w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        
        {product.badge && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-brand-primary text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded uppercase tracking-wider z-10">
            {product.badge}
          </div>
        )}

        {/* Action Buttons Overlay - Hidden on small mobile to avoid clutter */}
        <div className="absolute top-2 right-2 hidden sm:flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button 
            title="Add to Compare"
            className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary shadow-sm transition-colors"
          >
            <GitCompare size={14} />
          </button>
          <Link 
            to={`/product/${product.id}`}
            title="Quick View"
            className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary shadow-sm transition-colors"
          >
            <Eye size={14} />
          </Link>
        </div>

        {/* Quick View Middle Button */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
          <Link
            to={`/product/${product.id}`}
            className="bg-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            Quick View
          </Link>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <Link to={`/product/${product.id}`}>
          <h4 className="text-[11px] sm:text-sm font-bold text-gray-800 line-clamp-1 mb-0.5 sm:mb-1 group-hover:text-brand-primary transition-colors uppercase tracking-tight">
            {product.name}
          </h4>
        </Link>
        <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 sm:mb-3">
          {product.category}
        </p>
        
        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-50">
          <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-xs sm:text-base font-black text-brand-primary">৳ {product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="text-[8px] sm:text-[10px] text-gray-300 line-through font-bold">৳ {product.oldPrice.toLocaleString()}</span>
            )}
          </div>
          
          <a 
            href={`https://wa.me/8801611065415?text=${encodeURIComponent(`Hello, I want to order ${product.name} from Sinha Tech Solutions.`)}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full py-2 bg-gray-900 text-white text-[9px] sm:text-[11px] font-black rounded-lg hover:bg-brand-primary uppercase tracking-tighter transition-all text-center"
          >
            Order Now
          </a>
        </div>
      </div>
    </motion.div>
  );
}
