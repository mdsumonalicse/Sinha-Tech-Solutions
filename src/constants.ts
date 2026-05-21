export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  badge?: string;
  type?: 'buy' | 'download' | 'prompt';
  prompt?: string;
  downloadUrl?: string;
  appVersion?: string;
  lastUpdated?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'adobe', name: 'Adobe Products', icon: 'Layout' },
  { id: 'ai', name: 'AI & Tools', icon: 'Bot' },
  { id: 'windows', name: 'Windows License', icon: 'Monitor' },
  { id: 'office', name: 'Microsoft Office', icon: 'FileText' },
  { id: 'streaming', name: 'OTT Subscriptions', icon: 'Tv' },
  { id: 'design', name: 'Designing Tools', icon: 'Palette' },
  { id: 'prompts', name: 'AI Prompts', icon: 'Terminal' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Adobe Creative Cloud All Apps Individual',
    description: 'Full access to 20+ Adobe apps including Photoshop, Illustrator, Premiere Pro.',
    price: 3500,
    oldPrice: 4500,
    category: 'adobe',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400',
    badge: 'Popular'
  },
  {
    id: '2',
    name: 'Canva Pro Price In BD',
    description: 'Design anything with Canva Pro. Team access available.',
    price: 499,
    oldPrice: 800,
    category: 'design',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    name: 'Windows 11 Pro Retail Key',
    description: 'Lifetime activation for Windows 11 Pro. Genuine retail key.',
    price: 850,
    oldPrice: 1200,
    category: 'windows',
    image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '4',
    name: 'Microsoft Office 365 Yearly',
    description: 'Full suite of Office apps + 1TB OneDrive storage.',
    price: 1500,
    oldPrice: 2000,
    category: 'office',
    image: 'https://images.unsplash.com/photo-1633113088453-0818203815fe?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '5',
    name: 'YouTube Premium Subscription',
    description: 'Ad-free YouTube, background play, and YouTube Music.',
    price: 199,
    oldPrice: 250,
    category: 'streaming',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '6',
    name: 'CapCut Pro Activation',
    description: 'Professional video editing tools with CapCut Pro features.',
    price: 350,
    oldPrice: 500,
    category: 'ai',
    image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&q=80&w=400',
  }
];
