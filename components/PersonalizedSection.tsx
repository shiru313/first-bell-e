'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMostSearchedCategory, getViewedProducts } from '@/lib/personalization';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  slug: string;
  mainCategory?: { categoryId: string };
}

interface PersonalizedSectionProps {
  allProducts: Product[];
  categoryName?: string;
}

export function PersonalizedSection({
  allProducts,
  categoryName = 'Your Interests',
}: PersonalizedSectionProps) {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [hasPersonalization, setHasPersonalization] = useState(false);

  useEffect(() => {
    // Get most searched category
    const mostSearched = getMostSearchedCategory();
    const viewedIds = getViewedProducts();

    if (mostSearched) {
      // Show products from most searched category
      const categoryProducts = allProducts.filter(
        (p) =>
          p.mainCategory?.categoryId === mostSearched &&
          !viewedIds.includes(p.id),
      );

      if (categoryProducts.length > 0) {
        setRecommendedProducts(categoryProducts.slice(0, 6));
        setHasPersonalization(true);
      }
    } else if (viewedIds.length > 0) {
      // Fallback: Show products from categories of recently viewed items
      const viewedCategories = new Set<string>();
      viewedIds.forEach((id) => {
        const viewed = allProducts.find((p) => p.id === id);
        if (viewed?.mainCategory?.categoryId) {
          viewedCategories.add(viewed.mainCategory.categoryId);
        }
      });

      if (viewedCategories.size > 0) {
        const categoryArray = Array.from(viewedCategories);
        const recommendations = allProducts.filter((p) =>
          categoryArray.includes(p.mainCategory?.categoryId || ''),
        );

        if (recommendations.length > 0) {
          setRecommendedProducts(recommendations.slice(0, 6));
          setHasPersonalization(true);
        }
      }
    }
  }, [allProducts]);

  if (!hasPersonalization || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{categoryName}</h2>
        <Link href="/store" className="flex items-center gap-1 text-sm text-blue-600">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {recommendedProducts.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative bg-gray-100 aspect-square overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ₹{product.price}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
