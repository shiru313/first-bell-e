'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VariantWithPrice } from '@/lib/variantSearch';

interface VariantCardProps {
  variant: VariantWithPrice;
  onVariantSelect?: (variant: VariantWithPrice) => void;
}

export function VariantCard({ variant, onVariantSelect }: VariantCardProps) {
  const discountPercent = variant.discount
    ? Math.round(((variant.basePrice - variant.price) / variant.basePrice) * 100)
    : 0;

  const stockStatus =
    variant.stock > 10
      ? 'In Stock'
      : variant.stock > 0
        ? `Only ${variant.stock} left`
        : 'Out of Stock';

  return (
    <Link href={`/product/${variant.productSlug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={variant.thumbnail}
            alt={`${variant.productName} - ${variant.color || variant.size || 'default'}`}
            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
          />

          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}

          {variant.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
            {variant.productName}
          </h3>

          <div className="flex gap-2 mb-2 flex-wrap">
            {variant.color && (
              <Badge
                variant="outline"
                className="text-xs"
              >
                {variant.color}
              </Badge>
            )}
            {variant.size && (
              <Badge variant="outline" className="text-xs">
                {variant.size}
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{variant.price}
            </span>
            {discountPercent > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ₹{variant.basePrice}
              </span>
            )}
          </div>

          {variant.rating && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-sm font-semibold text-gray-900">
                {variant.rating.toFixed(1)}
              </span>
              <span className="text-yellow-400">★</span>
            </div>
          )}

          <div className="text-xs font-medium">
            {variant.stock > 0 ? (
              <span className="text-green-600">{stockStatus}</span>
            ) : (
              <span className="text-red-600">{stockStatus}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
