'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VariantWithPrice } from '@/lib/variantSearch';
import { Star } from 'lucide-react';

interface ProductVariantGroupProps {
  productName: string;
  productSlug: string;
  thumbnail: string;
  basePrice: number;
  rating?: number;
  variants: VariantWithPrice[];
  discount?: number;
}

export function ProductVariantGroup({
  productName,
  productSlug,
  thumbnail,
  basePrice,
  rating,
  variants,
  discount,
}: ProductVariantGroupProps) {
  // Get unique colors and sizes
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  // Calculate discount from cheapest variant
  const minPrice = Math.min(...variants.map((v) => v.price));
  const discountPercent = basePrice > minPrice 
    ? Math.round(((basePrice - minPrice) / basePrice) * 100)
    : 0;

  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#EF4444',
      blue: '#3B82F6',
      green: '#10B981',
      yellow: '#FCD34D',
      pink: '#EC4899',
      purple: '#A855F7',
      brown: '#92400E',
      black: '#1F2937',
      white: '#FFFFFF',
      gray: '#9CA3AF',
      orange: '#F97316',
    };
    return colorMap[colorName.toLowerCase()] || '#D1D5DB';
  };

  const inStock = variants.some((v) => v.stock > 0);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white border border-gray-200">
      <Link href={`/product/${productSlug}`}>
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          <img
            src={thumbnail}
            alt={productName}
            className="w-full h-full object-contain p-3 hover:scale-110 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Link href={`/product/${productSlug}`}>
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-[#005F5F] transition-colors">
            {productName}
          </h3>
        </Link>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({rating.toFixed(1)})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">₹{minPrice}</span>
          {discountPercent > 0 && (
            <>
              <span className="text-sm text-gray-500 line-through">₹{basePrice}</span>
              <span className="text-xs font-bold text-green-600">{discountPercent}% off</span>
            </>
          )}
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Colors Available</p>
            <div className="flex gap-1.5 flex-wrap">
              {colors.map((color) => (
                <div
                  key={color}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:border-[#005F5F] transition-colors"
                  style={{ backgroundColor: getColorValue(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Available Sizes</p>
            <div className="flex gap-1.5 flex-wrap">
              {sizes.map((size) => (
                <Badge
                  key={size}
                  variant="outline"
                  className="text-xs font-medium cursor-pointer hover:bg-[#005F5F] hover:text-white"
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className="pt-2 border-t border-gray-200">
          <span className={`text-xs font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? '✓ In Stock' : '✕ Out of Stock'}
          </span>
        </div>
      </div>
    </Card>
  );
}
