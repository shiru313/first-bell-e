'use client';

import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';

interface DynamicSectionProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  products: any[];
  viewAllUrl?: string;
  variant?: 'default' | 'minimal' | 'highlighted';
  bgColor?: string;
}

export function DynamicSection({
  title,
  subtitle,
  emoji,
  products,
  viewAllUrl,
  variant = 'default',
  bgColor,
}: DynamicSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {variant === 'highlighted' && bgColor && (
        <div
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-center gap-2 mb-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {subtitle && <p className="text-sm text-gray-700">{subtitle}</p>}
        </div>
      )}

      {variant !== 'highlighted' && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {emoji && <span className="text-3xl">{emoji}</span>}
        </div>
      )}

      <ProductGrid products={products.slice(0, 8)} />

      {viewAllUrl && products.length > 8 && (
        <div className="flex justify-center mt-4">
          <Link href={viewAllUrl}>
            <Button variant="outline">View All</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
