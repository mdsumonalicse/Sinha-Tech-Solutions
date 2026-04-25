import * as LucideIcons from 'lucide-react';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  categories?: any[];
}

export default function CategoryBar({ activeCategory, onCategoryChange, categories = [] }: CategoryBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 overflow-x-auto scrollbar-hide sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 min-w-max">
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all' ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'
            }`}
          >
            <LucideIcons.LayoutGrid size={14} />
            All Products
          </button>
          {categories.map((category) => {
            // @ts-ignore
            const Icon = LucideIcons[category.icon] || LucideIcons.Package;
            const isActive = activeCategory === category.name;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.name)}
                className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'
                }`}
              >
                <Icon size={14} />
                {category.name}
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
