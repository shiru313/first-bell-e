'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Brand {
  id: string;
  name: string;
  logo: string;
}

export default function BrandAd() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const loadBrands = async () => {
      const snap = await getDocs(collection(db, 'brands'));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Brand, 'id'>),
      }));

      setBrands(data);
    };

    loadBrands();
  }, []);

  if (!brands.length) return null;

  return (
    <section className="relative bg-white overflow-hidden ">

      {/* Fade Left */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-[100PX] z-10 bg-gradient-to-r from-white to-transparent" />

      {/* Fade Right */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[100PX] z-10 bg-gradient-to-l from-white to-transparent" />

      {/* Sliding Track */}
      <div className="flex  animate-slide whitespace-nowrap">
        {[...brands, ...brands].map((brand, index) => (
          <div
            key={index}
            className="flex items-center justify-center min-w-[100px]"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-12 object-contain transition duration-300 brand-logo"
            />
          </div>
        ))}
      </div>
        {/* Micro-Disclaimer */}
      <div className="px-5 mt-2 flex justify-between items-center opacity-60">
        <span className="h-[1px] flex-1 bg-gray-200"></span>
        <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-[0.2em] px-3">
          Brand Partners
        </p>
        <span className="h-[1px] flex-1 bg-gray-200"></span>
      </div>

      {/* Animation + Color Style */}
      <style jsx global>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-slide {
          animation: slide 7s linear infinite;
        }

        /* Convert logos to #005F5F tone */
        .brand-logo {
          filter: brightness(0) saturate(100%) invert(24%) sepia(88%) saturate(509%) hue-rotate(140deg) brightness(92%) contrast(95%);
          opacity: 0.9;
        }

        .brand-logo:hover {
          opacity: 1;
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}