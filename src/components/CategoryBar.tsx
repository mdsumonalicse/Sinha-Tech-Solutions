import * as LucideIcons from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  categories?: any[];
}

export default function CategoryBar({ activeCategory, onCategoryChange, categories = [] }: CategoryBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName.toLowerCase() === 'prompt' || categoryName.toLowerCase() === 'ai prompts') {
      navigate('/prompts');
    } else {
      if (location.pathname !== '/') {
        navigate('/');
      }
      onCategoryChange(categoryName);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3 overflow-x-auto scrollbar-hide sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 min-w-max">
          <button
            onClick={() => {
              if (location.pathname !== '/') navigate('/');
              onCategoryChange('all');
            }}
            className={`relative flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap px-1 py-1 ${
              activeCategory === 'all' && location.pathname === '/' ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'
            }`}
          >
            <LucideIcons.LayoutGrid size={14} />
            All Products
            {activeCategory === 'all' && location.pathname === '/' && (
              <motion.div 
                layoutId="activeCategory"
                className="absolute -bottom-3 left-0 right-0 h-0.5 bg-brand-primary"
                initial={false}
              />
            )}
          </button>
          
          {categories.map((category) => {
            // @ts-ignore
            const Icon = LucideIcons[category.icon] || LucideIcons.Package;
            const isPrompt = category.name.toLowerCase() === 'prompt' || category.name.toLowerCase() === 'ai prompts';
            const isActive = isPrompt ? location.pathname === '/prompts' : (activeCategory === category.name && location.pathname === '/');
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`relative flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap px-1 py-1 ${
                  isActive ? 'text-brand-primary font-black' : 'text-gray-600 font-bold hover:text-brand-primary'
                } ${isPrompt ? 'text-brand-primary group' : ''}`}
              >
                <Icon size={14} className={isPrompt ? 'animate-pulse' : ''} />
                <span className={isPrompt ? 'bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-purple-600 font-black' : ''}>
                  {category.name}
                </span>

                {isPrompt && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                )}

                {isActive && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute -bottom-3 left-0 right-0 h-0.5 bg-brand-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          
          <div className="ml-auto flex items-center text-[#10B981] text-[11px] font-black uppercase tracking-wider gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            Flash Sale
          </div>
        </div>
      </div>
    </div>
  );
}
