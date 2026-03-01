'use client';

import Link from 'next/link';
import { getCategoryIcon } from '@/lib/seasonalContent';

interface Category {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  productCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((category) => {
          const { emoji, color } = getCategoryIcon(
            category.categoryId || category.id,
          );

          return (
            <Link
              key={category.id}
              href={`/store?category=${category.categoryId || category.id}`}
            >
              <div
                className="p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: color + '15', borderLeft: `4px solid ${color}` }}
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                  {category.name}
                </h3>
                {category.productCount && (
                  <p className="text-xs text-gray-600 mt-1">
                    {category.productCount} products
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
