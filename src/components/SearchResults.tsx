import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../constants';
import ProductCard from './ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronDown, LayoutGrid, List, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchResults({ products = [] }: { products?: any[] }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    const source = products.length > 0 ? products : PRODUCTS;
    let results = source.filter((p: any) => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
    );

    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.category));
    }

    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low':
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return results;
  }, [query, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  return (
    <div className="py-8 min-h-screen">
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Search Results</span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter mt-1 uppercase">
              {query ? `Results for "${query}"` : 'All Products'}
              <span className="ml-3 text-sm font-bold text-gray-400 normal-case tracking-normal">
                ({filteredProducts.length} items found)
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg p-1 border border-gray-100">
                  <button className="p-1.5 text-brand-primary bg-brand-primary/10 rounded-md">
                      <LayoutGrid size={16} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-all">
                      <List size={16} />
                  </button>
              </div>
              <div className="relative group">
                  <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none bg-white border border-gray-100 rounded-lg py-2 pl-4 pr-10 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer transition-all shadow-sm"
                  >
                      <option value="default">Sort by: Default</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Alphabetical</option>
                  </select>
                  <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
          </div>
        </div>

        {/* Local Search Input for Mobile/Quick Access */}
        <div className="relative max-w-lg lg:hidden">
          <input 
            type="text"
            defaultValue={query}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                navigate(`/search?q=${encodeURIComponent(val)}`);
              }
            }}
            placeholder="Search within these results..."
            className="w-full bg-white border border-gray-100 rounded-xl py-3 px-12 text-xs font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className={`col-span-12 lg:col-span-3 space-y-8 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-brand-primary" />
                    Filters
                </h3>
                <button 
                    onClick={() => {
                        setSelectedCategories([]);
                        setPriceRange([0, 100000]);
                    }}
                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                >
                    Clear All
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Categories</h4>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="flex items-center w-full group"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        selectedCategories.includes(cat.id) 
                        ? 'bg-brand-primary border-brand-primary text-white' 
                        : 'bg-white border-gray-200 group-hover:border-brand-primary'
                    }`}>
                        {selectedCategories.includes(cat.id) && <ChevronDown size={12} className="rotate-[-45deg]" />}
                    </div>
                    <span className={`ml-3 text-xs font-bold transition-colors ${
                        selectedCategories.includes(cat.id) ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Price Range</h4>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-brand-primary cursor-pointer mb-2"
                />
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600">
                  <span>৳ {priceRange[0]}</span>
                  <span>৳ {priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="col-span-12 lg:col-span-9">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Search size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase mb-2">No results found</h3>
                <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto mb-8 leading-relaxed">
                    We couldn't find anything matching your search. Try adjusting your filters or search terms.
                </p>
                <button 
                    onClick={() => {
                        setSelectedCategories([]);
                        setPriceRange([0, 100000]);
                    }}
                    className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >
                    Reset All Filters
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
