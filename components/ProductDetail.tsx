'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Truck, Gift, User } from "lucide-react";
import { useRouter } from 'next/navigation';
import { addToCart, getCart, updateCartQuantity } from '@/lib/cart';

interface Variant {
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
  image?: string;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    brand?: string;
    stock: number;
    description?: string;
    thumbnail: string;
    images?: string[];
    variants?: Variant[];
    comboProducts?: any[];

    // ✅ ADD THESE
    deliveryDays?: number;
    targetAudience?: string;
    giftPacking?: {
      available: boolean;
      charge: number;
    };
  };
  relatedProducts: any[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);

  const images = useMemo(() => {
    return [product.thumbnail, ...(product.images || [])];
  }, [product]);

  const variants = product.variants || [];

  const hasColor = variants.some(v => v.color);
  const hasSize = variants.some(v => v.size);

  const availableColors = useMemo(() => {
    return [
      ...new Set(
        variants
          .filter(v => !selectedSize || v.size === selectedSize)
          .map(v => v.color)
          .filter(Boolean)
      ),
    ];
  }, [variants, selectedSize]);

  const availableSizes = useMemo(() => {
    return [
      ...new Set(
        variants
          .filter(v => !selectedColor || v.color === selectedColor)
          .map(v => v.size)
          .filter(Boolean)
      ),
    ];
  }, [variants, selectedColor]);

  const matchedVariant = useMemo(() => {
    return variants.find(v =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize)
    );
  }, [variants, selectedColor, selectedSize]);

 const variantKey = matchedVariant ? `${matchedVariant.color || ''}-${matchedVariant.size || ''}` : undefined;

  const requiresVariant =
    (hasColor && !selectedColor) ||
    (hasSize && !selectedSize);

  const isDisabled =
    product.stock === 0 || requiresVariant;

  const displayPrice =
    matchedVariant?.price || product.price;

  const discount = product.mrp
    ? Math.round(
        ((product.mrp - displayPrice) / product.mrp) * 100
      )
    : 0;

  useEffect(() => {
    const cart = getCart();

    const existing = cart.find(
      item =>
        item.id === product.id &&
        item.variant?.key === variantKey
    );

    setCartQuantity(existing?.quantity || 0);
  }, [product.id, variantKey]);

  useEffect(() => {
    if (matchedVariant?.image) {
      setCurrentImageIndex(0);
    }
  }, [matchedVariant]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const maxScroll =
        container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">

      {/* IMAGE SECTION */}
<div className="space-y-4">

  {/* Main Image */}
  <div
    onClick={() =>
      setCurrentImageIndex(
        (prev) => (prev + 1) % images.length
      )
    }
    className="relative aspect-square bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer group"
  >

    {/* Subtle Hover Effect */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-300 z-10" />

    <img
      src={
        matchedVariant?.image &&
        currentImageIndex === 0
          ? matchedVariant.image
          : images[currentImageIndex]
      }
      alt={product.name}
      className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
    />

  </div>

  {/* Thumbnails */}
  {images.length > 1 && (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide">

      {images.slice(0, 6).map((img, i) => {
        const isActive = currentImageIndex === i;

        return (
          <button
            key={i}
            onClick={() => setCurrentImageIndex(i)}
            className={`
              relative w-16 h-16 rounded-xl overflow-hidden 
              border-2 transition-all duration-300
              ${
                isActive
                  ? "border-[#005F5F] shadow-md scale-105"
                  : "border-gray-200 hover:border-gray-400"
              }
            `}
          >
            <img
              src={img}
              alt={`Thumbnail ${i}`}
              className="w-full h-full object-contain p-2"
            />
          </button>
        );
      })}

    </div>
  )}

</div>

      {/* PRODUCT INFO */}
<div className="space-y-4">

  {/* Brand */}
  {product.brand && (
    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
      {product.brand}
    </p>
  )}

  {/* Product Name */}
  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
    {product.name}
  </h1>

  {/* Price Section */}
  <div className="space-y-2">

    <div className="flex items-center gap-3">

      {/* Sale Price */}
      <span className="text-3xl font-bold text-gray-900">
        ₹{displayPrice}
      </span>

      {/* MRP */}
      {product.mrp && product.mrp > displayPrice && (
        <span className="text-lg text-gray-400 line-through">
          ₹{product.mrp}
        </span>
      )}

      {/* Discount */}
      {discount > 0 && (
        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {discount}% OFF
        </span>
      )}
    </div>

{/* Micro Info Row */}
<div className="flex flex-wrap items-center gap-5 text-xs text-gray-600 pt-2">

  {/* Delivery */}
  {product.deliveryDays && (
    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
      <Truck className="w-4 h-4 text-[#005F5F]" />
      <span className="tracking-wide">
        Delivery in {product.deliveryDays} day
        {product.deliveryDays > 1 ? "s" : ""}
      </span>
    </div>
  )}

  {/* Gift Packing */}
  {product.giftPacking?.available && (
    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
      <Gift className="w-4 h-4 text-[#005F5F]" />
      <span className="tracking-wide">
        Gift Wrap Available
      </span>
    </div>
  )}

  {/* Target Audience */}
  {product.targetAudience && (
    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
      <User className="w-4 h-4 text-[#005F5F]" />
      <span className="tracking-wider text-[7px] text-gray-700 uppercase">
        {Array.isArray(product.targetAudience)
  ? product.targetAudience.join("  . ")
  : typeof product.targetAudience === "string"
  ? product.targetAudience.split(" ").join("   ")
  : ""}
      </span>
    </div>
  )}

</div>

  </div>

</div>
      {/* VARIANTS */}
{variants.length > 0 && (
  <div className=" border border-gray-200 p-5 rounded-2xl shadow-sm space-y-6">

    {/* COLOR SECTION */}
    {hasColor && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
            Select Color
          </h3>

        
        </div>

        <div className="flex gap-4 flex-wrap">
          {availableColors.map((color) => {
            const isActive = selectedColor === color;

            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color as string)}
                className={`
                  relative w-11 h-11 rounded-full border-2 
                  transition-all duration-300
                  ${isActive
                    ? 'border-[#005F5F] scale-110 shadow-lg'
                    : 'border-gray-300 hover:scale-105'}
                `}
                style={{ backgroundColor: color as string }}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 bg-white rounded-full shadow-md" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {/* SIZE SECTION */}
    {hasSize && (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
            Select Size
          </h3>

          {selectedSize && (
            <span className="text-xs text-gray-500">
              Selected: <span className="font-medium text-gray-800">{selectedSize}</span>
            </span>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {availableSizes.map((size) => {
            const isActive = selectedSize === size;

            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size as string)}
                className={`
                  min-w-[48px] px-4 py-2 rounded-xl text-sm font-medium
                  border transition-all duration-300
                  ${isActive
                    ? 'bg-[#005F5F] text-white border-[#005F5F] shadow-md scale-105'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#005F5F] hover:text-[#005F5F]'}
                `}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    )}

  </div>
)}

   {/* ACTION BUTTONS */}
<div className="flex gap-3 mt-4">

  {/* ADD TO CART */}
  <div className="flex-1">
    {cartQuantity === 0 ? (
      <button
        disabled={isDisabled}
        onClick={() => {
          if (requiresVariant) return;

          addToCart({
            id: product.id,
            name: product.name,
            price: displayPrice,
            mrp: product.mrp,
            thumbnail:
              matchedVariant?.image || product.thumbnail,
            quantity: 1,
            variant: {
              key: variantKey,
              color: matchedVariant?.color,
              size: matchedVariant?.size,
              image: matchedVariant?.image,
            },
            giftPacking: product.giftPacking?.available
              ? {
                  enabled: false,
                  charge: product.giftPacking.charge,
                }
              : undefined,
            comboProducts: product.comboProducts || [],
          });

          setCartQuantity(1);
        }}
        className={`w-full py-3 rounded-lg text-sm font-semibold 
          flex items-center justify-center gap-2 shadow-sm
          transition-all duration-300 active:scale-[0.97]
          ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#005F5F] text-white hover:bg-[#004747] hover:shadow-md"
          }`}
      >
        <ShoppingCart className="w-4 h-4" />
        {requiresVariant ? "Select Variant" : "Add to Cart"}
      </button>
    ) : (
      <div className="flex items-center justify-between bg-[#005F5F] text-white rounded-lg px-4 py-2 shadow-sm animate-cartSlide">

        <span className="text-xs font-medium">Added</span>

        <div className="flex items-center gap-3">

          <button
            onClick={() => {
              updateCartQuantity(product.id, variantKey, -1);
              setCartQuantity(prev => (prev > 1 ? prev - 1 : 0));
            }}
            className="text-lg font-bold hover:scale-110 transition"
          >
            −
          </button>

          <span className="text-sm font-bold w-5 text-center">
            {cartQuantity}
          </span>

          <button
            onClick={() => {
              updateCartQuantity(product.id, variantKey, 1);
              setCartQuantity(prev => prev + 1);
            }}
            className="text-lg font-bold hover:scale-110 transition"
          >
            +
          </button>

        </div>
      </div>
    )}
  </div>

  {/* BUY NOW */}
  <button
    disabled={isDisabled}
  onClick={() => {
  if (requiresVariant) return;

  addToCart({
    id: product.id,
    name: product.name,
    price: displayPrice,
    mrp: product.mrp,
    thumbnail:
      matchedVariant?.image || product.thumbnail,
    quantity: 1,
    variant: {
      key: variantKey,
      color: matchedVariant?.color,
      size: matchedVariant?.size,
      image: matchedVariant?.image,
    },
    giftPacking: product.giftPacking?.available
      ? {
          enabled: false,
          charge: product.giftPacking.charge,
        }
      : undefined,
    comboProducts: product.comboProducts || [],
  });

  router.push(`/orders?focus=${product.id}&variant=${variantKey || ""}`);
}}
    className={`flex-1 py-3 rounded-lg text-sm font-semibold shadow-sm
      transition-all duration-300 active:scale-[0.97]
      ${
        isDisabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-[#FFC000] text-[#005F5F] hover:bg-[#e6ac00] hover:shadow-md"
      }`}
  >
    Buy Now
  </button>

</div>

<style jsx global>{`
  @keyframes cartSlide {
    0% {
      transform: translateY(10px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-cartSlide {
    animation: cartSlide 0.3s ease forwards;
  }
`}</style>

     {/* DESCRIPTION */}
{product.description && (
  <div className=" border border-gray-200 rounded-2xl p-6 shadow-sm">

    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
        Product Details
      </h3>
      <div className="h-[1px] flex-1 mx-4 bg-gray-200" />
    </div>

    {/* Content */}
    <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
      {product.description}
    </p>

  </div>
)}

      {/* RELATED PRODUCTS */}
{relatedProducts.length > 0 && (
  <div className="pt-10 border-t border-gray-200">

    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold tracking-wide text-gray-900">
        You May Also Like
      </h3>
      <div className="h-[1px] flex-1 ml-4 bg-gray-200" />
    </div>

    {/* Scroll Container */}
    <div
      ref={scrollRef}
      className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
    >
      {relatedProducts.map((p) => {

        const hasDiscount =
          p.mrp && p.mrp > p.price;

        const discount =
          hasDiscount
            ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
            : 0;

        const hasColor =
          p.variants?.some((v: any) => v.color);

        const hasSize =
          p.variants?.some((v: any) => v.size);

        return (
          <div
            key={p.id}
            onClick={() =>
              router.push(`/product/${p.slug}`)
            }
            className="min-w-[200px] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
          >

            {/* Image Section */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">

              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow">
                  -{discount}%
                </span>
              )}

              <img
                src={p.thumbnail}
                alt={p.name}
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">

              {/* Name */}
              <p className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[38px]">
                {p.name}
              </p>

              {/* Price Section */}
              <div className="space-y-1">
                {hasDiscount && (
                  <p className="text-xs text-gray-400 line-through">
                    ₹{p.mrp}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-[#005F5F]">
                    ₹{p.price}
                  </p>

                  {discount > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      Save {discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Preview */}
              {(hasColor || hasSize) && (
                <div className="pt-2 border-t border-gray-100 space-y-1">

                  {hasColor && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                       {p.variants?.filter((v: any) => v.color).length} Colors
                    </div>
                  )}

                  {hasSize && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                     {p.variants?.filter((v: any) => v.size).length} Models
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

    </div>
  );
}