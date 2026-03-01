'use client';

import Link from 'next/link';
import { Star, Gift, Plus, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { addToCart } from '@/lib/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  thumbnail: string;
  slug: string;
  rating?: number;
  tags?: string[];
  deliveryDays?: number;
  giftPacking?: {
    available: boolean;
    charge: number;
  };
  comboProducts?: {
  id: string;
  name?: string;
}[];
}



interface FeaturedProductsProps {
  title: string;
  products: Product[];
  columns?: 2 | 3;
}

export function FeaturedProducts({
  title,
  products,
  columns = 2,
}: FeaturedProductsProps) {

  /* 🔥 Fisher-Yates Shuffle */
  const shuffledProducts = useMemo(() => {
    const array = [...products];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [products]);

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <Link href="/store" className="text-sm text-[#005F5F] hover:underline">
          See all
        </Link>
      </div>

      <div
        className={`grid gap-4 ${
          columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
        }`}
      >
        {shuffledProducts.map((product) => {

          const discount =
            product.mrp && product.mrp > product.price
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
              : 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden hover:shadow-md transition relative group"
            >

              {/* IMAGE SECTION */}
              <Link href={`/product/${product.slug}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden relative">

                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    loading="lazy"   // 🔥 LAZY LOAD
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />

                  {/* NEW Badge */}
                  {product.tags?.includes('new') && (
                    <span className="absolute top-2 left-2 bg-[#FFC000] text-[#005F5F] text-xs font-bold px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discount}%
                    </span>
                  )}

                
                </div>
              </Link>

              {/* DETAILS */}
              <div className="p-3">

                <Link href={`/product/${product.slug}`}>
                  <p className="text-xs font-medium text-gray-600 line-clamp-2 mb-1">
                    {product.name}
                  </p>
                </Link>

               <div className="flex items-start justify-between">

  {/* PRICE */}
  <div>
    {product.mrp && product.mrp > product.price && (
      <p className="text-xs text-gray-400 line-through">
        ₹{product.mrp}
      </p>
    )}

    <p className="font-bold text-gray-900">
      ₹{product.price}
    </p>
  </div>

  {/* 🚚 DELIVERY INFO */}
 {product.deliveryDays && (
  <div className="flex items-center gap-1 text-[10px] text-[#005F5F] font-medium mt-1">
    <Truck className="w-3 h-3" />
    <span>
      Delivery in {product.deliveryDays} day
      {product.deliveryDays > 1 ? 's' : ''}
    </span>
  </div>
)}

</div>



                  {/* 🎁 Gift Packing Badge */}
                  {product.giftPacking?.available && (
                    <div className="absolute bottom-3 left-2 bg-white shadow-md rounded-full p-1">
                      <Gift className="w-4 h-4 text-[#005F5F]" />
                    </div>
                  )}

                {/* ➕ ADD TO CART BUTTON */}
                <button
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      thumbnail: product.thumbnail,
                      mrp: product.mrp,
                      quantity: 1,
                      comboProducts: product.comboProducts || [],
                      giftPacking: product.giftPacking?.available
                        ? {
                            enabled: false,
                            charge: product.giftPacking.charge,
                          }
                        : undefined,
                    })
                  }
                  className="mt-3 w-full flex items-center justify-center gap-1 bg-[#005F5F] text-white text-xs py-1.5 rounded-md hover:bg-[#004444] transition active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}