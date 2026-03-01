'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getHeroBannerContent } from '@/lib/seasonalContent';

export function HeroBanner() {
  const banner = getHeroBannerContent();

  return (
    <div
      className="w-full rounded-xl overflow-hidden mb-6 animate-in fade-in-50 duration-500"
      style={{ backgroundColor: banner.bgColor }}
    >
      <div className="p-6 sm:p-8 md:p-12 flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="text-5xl sm:text-6xl mb-4">{banner.emoji}</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
            {banner.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-700 mb-4 max-w-md">
            {banner.subtitle}
          </p>
          <Link href="/store">
            <Button
              className="bg-white text-gray-900 hover:bg-gray-100"
              style={{ backgroundColor: banner.color, color: 'white' }}
            >
              Shop Now
            </Button>
          </Link>
        </div>

        <div className="hidden sm:block text-7xl md:text-8xl opacity-20 animate-bounce">
          {banner.emoji}
        </div>
      </div>
    </div>
  );
}
