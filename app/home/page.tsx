'use client';

import { useProducts } from "@/hooks/useProducts";

import SpecialCustomServices from '@/components/SpecialCustomServices';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFromCache, saveToCache } from '@/lib/cache';
import { MobileHeader } from '@/components/MobileHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { useEffect, useState, useMemo, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import PageFooter from '@/components/PageFooter';
import { TrustFeatures } from '@/components/TrustFeatures';
import BrandAd from '@/components/BrandAdSlid';
interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  slug: string;
  rating?: number;
  tags?: string[];
  mainCategory?: { categoryId: string };
  popularityScore?: number;
}
interface HeroCard {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  imageUrl: string;
  bgColor: string;
  updatedAt: number;
}
interface MidCard {
  url: string;
  link: string;
  bgColor: string;
}
export default function HomePage() {
  const router = useRouter();

  // ✅ REALTIME PRODUCTS (from hook)
  const { products: allProducts, loading: isLoading } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [heroCards, setHeroCards] = useState<HeroCard[]>([]);
  const [midCards, setMidCards] = useState<MidCard[]>([]);

  // ✅ Load banner cards only (products are handled by hook)
  useEffect(() => {
    const loadCards = async () => {
      try {
        const cardsSnap = await getDocs(collection(db, 'cards'));

        const cardsData: HeroCard[] = cardsSnap.docs
          .filter((doc) => doc.id !== 'mid')
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<HeroCard, 'id'>),
          }))
          .sort((a, b) => Number(a.id) - Number(b.id));

        setHeroCards(cardsData);

        const midSnap = await getDoc(doc(db, 'cards', 'mid'));

        if (midSnap.exists()) {
          const midData = midSnap.data();
          setMidCards(midData.images || []);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
      }
    };

    loadCards();
  }, []);

  
  // Filter products by category if selected
  const categoryFilteredProducts = useMemo(() => {
    if (!selectedCategory) return allProducts;
    return allProducts.filter((p) => p.mainCategory?.categoryId === selectedCategory);
  }, [allProducts, selectedCategory]);

  // Get trending products (by popularity or rating)
  const trendingProducts = useMemo(() => {
    return categoryFilteredProducts
      .sort(
        (a, b) =>
          (b.popularityScore || b.rating || 0) -
          (a.popularityScore || a.rating || 0),
      )
      .slice(0, 6);
  }, [categoryFilteredProducts]);

  // Get budget-friendly products (under 500)
  const budgetProducts = useMemo(() => {
    return categoryFilteredProducts
      .filter((p) => p.price < 500)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  }, [categoryFilteredProducts]);

  // Get new products
  const newProducts = useMemo(() => {
    return categoryFilteredProducts
      .filter((p) => p.tags?.includes('new'))
      .slice(0, 6);
  }, [categoryFilteredProducts]);

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };






function HeroCarousel({ cards }: { cards: HeroCard[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ AUTO SLIDE
  useEffect(() => {
    if (!cards.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === cards.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [cards.length]);

  // ✅ SCROLL WHEN INDEX CHANGES
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.offsetWidth * 0.85;

    container.scrollTo({
      left: activeIndex * cardWidth,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  if (!cards.length) {
    return (
      <div className="px-4">
        <div className="h-40 rounded-xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {cards.map((card) => {
          const hasImage = !!card.imageUrl;

          return (
            <div
              key={card.id}
              onClick={() => card.link && router.push(card.link)}
              className="relative min-w-[85%] h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-md cursor-pointer active:scale-95 transition-transform"
              style={{
                backgroundColor: !hasImage
                  ? card.bgColor || '#ffffff'
                  : undefined,
              }}
            >
              {hasImage && (
                <>
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0" />
                </>
              )}

              <div
                className={`relative z-10 p-5 ${
                  hasImage ? 'text-white' : 'text-gray-900'
                }`}
              >
                {card.title && (
                  <h2 className="text-lg font-bold mb-1">
                    {card.title}
                  </h2>
                )}
                {card.subtitle && (
                  <p className="text-sm opacity-90">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-3">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i === activeIndex
                ? 'bg-[#005F5F] w-4'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
   




function MidSection({ cards }: { cards: MidCard[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!cards.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [cards]);

  if (!cards.length) return null;

  const current = cards[index];
  const hasImage = !!current.url;

  return (
    <section className="px-4 py-5">
      <div
        onClick={() => current.link && router.push(current.link)}
        className="relative w-full h-36 rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 active:scale-95"
        style={{
          backgroundColor: !hasImage
            ? current.bgColor || '#f3f3f3'
            : undefined,
        }}
      >
        {hasImage && (
          <img
            src={current.url}
            alt="mid"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
        )}
      </div>
    </section>
  );
}


  return (
   <main className="min-h-screen bg-white -mb-[100px]">
      <MobileHeader />  
{/* Hero Section */}
<section className="pt-6 pb-4">
 <HeroCarousel cards={heroCards} />
</section>

      {/* Category Chips */}
      <section className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-600">BROWSE CATEGORIES</p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-[#005F5F] hover:underline font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
        <CategoryChips onCategorySelect={handleCategorySelect} />
        {selectedCategory && (
          <p className="text-xs text-[#005F5F] mt-2 font-medium">
            Filtering by selected category
          </p>
        )}
      </section>

      {/* Featured Sections */}
      {!isLoading && (
        <>
          {trendingProducts.length > 0 && (
  <>
   
   
     
    {/* First 2 Trending Products */}
    <FeaturedProducts
      title=""
      products={trendingProducts.slice(0,2)}
      columns={2}
    />

    {/* Special Custom Services Between */}
    <SpecialCustomServices
      onServiceClick={(slug) => console.log(slug)}
    />

    {/* Remaining Trending Products */}
    {trendingProducts.length > 2 && (
      <FeaturedProducts
        title=""
        products={trendingProducts.slice(2)}
        columns={2}
      />
    )}
  </>
)}
        {/* Mid Section */}
<MidSection cards={midCards} />

{budgetProducts.length > 0 && (
  <>
    {/* Budget Title */}
    <section className="px-4 pt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Budget Friendly (Under ₹500)
      </h2>
    </section>

    {/* First Row (2 Items) */}
    <FeaturedProducts
      title=""
      products={budgetProducts.slice(0, 2)}
      columns={2}
    />

    {/* Brand Slider Between Rows */}
    <BrandAd />

    {/* Remaining Budget Items */}
    {budgetProducts.length > 2 && (
      <FeaturedProducts
        title=""
        products={budgetProducts.slice(2)}
        columns={2}
      />
    )}
  </>
)}

          {newProducts.length > 0 && (
            <FeaturedProducts
              title="NEw Arrivals"
              products={newProducts}
              columns={2}
            />
          )}
        </>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#005F5F] border-t-[#FFC000] rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-600">Loading wonder products...</p>
          </div>
        </div>
      )}

          {!isLoading && allProducts.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No products available</p>
        </div>
      )}
      <TrustFeatures />
      <PageFooter />
    </main>
  );
}
