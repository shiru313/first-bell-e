'use client';

import {
  Box,
  BookText,
  PartyPopper,
  Coffee,
  PenTool,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

interface SpecialCustomServicesProps {
  onServiceClick?: (slug: string) => void;
}

const SERVICES = [
  {
    slug: 'gift-packing',
    title: 'Gift Packing',
    icon: Box,
    image: '/gift-packing.png',
  },
  {
    slug: 'custom-notebook',
    title: 'Custom Notebook',
    icon: BookText,
    image: '/noteBook.png',
  },
  {
    slug: 'surprise-gift',
    title: 'Surprise Gift',
    icon: PartyPopper,
    image: '/surprise-gift.png',
  },
  {
    slug: 'custom-mug',
    title: 'Custom Mug',
    icon: Coffee,
    image: '/mug.png',
  },
  {
    slug: 'other-services',
    title: 'Other Services',
    icon: PenTool,
    image: '/other-services.png',
  },
];

export default function SpecialCustomServices({
  onServiceClick,
}: SpecialCustomServicesProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Detect scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardWidth = 182;
      const index = Math.round(container.scrollLeft / cardWidth);
      setActiveIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 182;

    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });

    setActiveIndex(index);
  };

  return (
    <section className="w-full py-12 -mb-[4rem]">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3 -mt-[3rem]">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Special Services
          </h2>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth -mb-[20px]"
        >
      {SERVICES.map(({ slug, title, image }) => (
  <div
    key={slug}
    onClick={() => onServiceClick?.(slug)}
    className="flex-shrink-0 w-[170px] bg-[#005F55] rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:shadow-xl"
  >
    <img
      src={image}
      alt={title}
      className="w-17 h-16 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
    />

    <h3 className="text-sm font-semibold text-white leading-snug">
      {title}
    </h3>

    <div className="mt-3 h-[3px] w-8 bg-[#FFC000] rounded-full group-hover:w-12 transition-all duration-300" />
  </div>
))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-9">
          {SERVICES.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-6 bg-[#005F55]'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

      </div>

      {/* 🔥 Hide Scrollbar Without Global CSS */}
      <style jsx>{`
        div[ref] {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        div[ref]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}