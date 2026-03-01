'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Truck, Gift, Plus } from 'lucide-react';
import { addToCart } from '@/lib/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  thumbnail: string;
  images?: string[];
  slug: string;
  deliveryDays?: number;

  stock?: number;

  giftPacking?: {
    available: boolean;
    charge: number;
  };

  comboProducts?: {
    id: string;
    name?: string;
  }[];
}

interface ProductGridProps {
  products: Product[];
}



export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [product.thumbnail, ...(product.images || [])];

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [images.length]);

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">

      {/* IMAGE SECTION */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow">
              -{discount}%
            </div>
          )}

          {/* 🎁 Gift Badge */}
          {product.giftPacking?.available && (
            <div className="absolute top-2 right-2 bg-white shadow-md rounded-full p-1">
              <Gift className="w-4 h-4 text-[#005F5F]" />
            </div>
          )}

          {/* ⚠️ Last Stock Badge */}
          {product.stock !== undefined && product.stock < 4 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
              Only {product.stock} left!
            </div>
          )}

          <img
            src={images[currentImageIndex]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* DETAILS */}
      <div className="p-3 flex flex-col flex-grow">

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        {/* PRICE SECTION */}
        <div className="mt-2 space-y-1">

          {product.mrp && product.mrp > product.price && (
            <p className="text-xs text-gray-400 line-through">
              ₹{product.mrp}
            </p>
          )}

          <p className="text-lg font-bold text-gray-900">
            ₹{product.price}
          </p>

          {product.deliveryDays && (
            <div className="flex items-center gap-1 text-[11px] text-[#005F5F] font-medium">
              <Truck className="w-3 h-3" />
              Delivery in {product.deliveryDays} day
              {product.deliveryDays > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={(e) => {
            e.preventDefault();

            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              thumbnail: product.thumbnail,
              quantity: 1,
              comboProducts: product.comboProducts || [],
              giftPacking: product.giftPacking?.available
                ? {
                    enabled: false,
                    charge: product.giftPacking.charge,
                  }
                : undefined,
            });
          }}
          disabled={product.stock === 0}
          className={`mt-3 w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg transition active:scale-95
            ${
              product.stock === 0
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#005F5F] hover:bg-[#004444] text-white'
            }`}
        >
          <Plus className="w-3 h-3" />
          {product.stock === 0 ? 'Out of Stock' : 'Add'}
        </button>

      </div>
    </Card>
  );
}