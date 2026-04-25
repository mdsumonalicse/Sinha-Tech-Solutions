import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface SiteSettings {
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
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Sinha Tech Solutions',
  phone: '+880 1611-065415',
  email: 'sts.support@gmail.com',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
  tiktok: 'https://tiktok.com',
  youtube: 'https://youtube.com',
  footerText: 'Genuine License Hub',
  banners: [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607791375725-9da884ff161a?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop'
  ]
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
