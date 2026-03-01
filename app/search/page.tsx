'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFromCache, saveToCache } from '@/lib/cache';
import {
  expandProductVariants,
  searchVariants,
  sortVariants,
  getPriceRange,
  getAvailableColors,
  getAvailableSizes,
  VariantWithPrice,
} from '@/lib/variantSearch';
import { trackCategorySearch } from '@/lib/personalization';
import { groupVariantsByProduct } from '@/lib/variantGrouping';
import { MobileHeader } from '@/components/MobileHeader';
import { VariantCard } from '@/components/VariantCard';
import { ProductVariantGroup } from '@/components/ProductVariantGroup';
import { Button } from '@/components/ui/button';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ChevronDown } from 'lucide-react';
import { Gift, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();

  const { products: allProducts, loading: isLoading } = useProducts();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'relevance' | 'price-low' | 'price-high' | 'newest' | 'rating'
  >('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const { products: realtimeProducts, loading } = useProducts();

  // Load categories + generate suggestions (products come from useProducts)
useEffect(() => {
  const loadCategories = async () => {
    try {
      const catSnap = await getDocs(collection(db, "categories"));

      const loadedCategories = catSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  loadCategories();
}, 



[]); 

useEffect(() => {
  if (!allProducts?.length) return;

  const uniqueSuggestions = new Set<string>();

  allProducts.forEach((product: any) => {
    if (product.name) uniqueSuggestions.add(product.name);

    if (product.searchKeywords) {
      product.searchKeywords.forEach((k: string) =>
        uniqueSuggestions.add(k)
      );
    }

    if (product.brand) uniqueSuggestions.add(product.brand);
  });

  setSuggestions(Array.from(uniqueSuggestions).slice(0, 12));
}, [allProducts]);

  // Expand products to variants
  const allVariants = useMemo(
    () => expandProductVariants(allProducts),
    [allProducts],
  );

  // Filter and search variants
  const filteredVariants = useMemo(() => {
    const searched = searchVariants(allVariants, query, {
      category: selectedCategory || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock: inStockOnly,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

    return sortVariants(searched, sortBy);
  }, [
    allVariants,
    query,
    selectedCategory,
    priceRange,
    selectedColor,
    selectedSize,
    inStockOnly,
    sortBy,
  ]);

  // Get unique colors and sizes from filtered results
  const availableColors = useMemo(
    () => getAvailableColors(filteredVariants),
    [filteredVariants],
  );
  const availableSizes = useMemo(
    () => getAvailableSizes(filteredVariants),
    [filteredVariants],
  );
  const { min: minPrice, max: maxPrice } = useMemo(
    () => getPriceRange(filteredVariants),
    [filteredVariants],
  );

  // Pagination
  const ITEMS_PER_PAGE = 12;
  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVariants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVariants, currentPage]);

  const totalPages = Math.ceil(filteredVariants.length / ITEMS_PER_PAGE);

  // Group variants by product for better display
  const groupedProducts = useMemo(
    () => groupVariantsByProduct(filteredVariants),
    [filteredVariants],
  );

  // Paginate grouped products instead of individual variants
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * 6; // 6 products per page
    return groupedProducts.slice(start, start + 6);
  }, [groupedProducts, currentPage]);

  const totalProductPages = Math.ceil(groupedProducts.length / 6);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
    trackCategorySearch(categoryId);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <MobileHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#005F5F] border-t-[#FFC000] rounded-full animate-spin mb-2"></div>
            <p className="text-xs text-gray-600">Finding items...</p>
          </div>
        </div>
      </main>
    );
  }

  function hexToColorName(hex: string) {
  if (!hex) return "";

  const h = hex.replace("#", "").toLowerCase();

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  if (r > 200 && g < 80 && b < 80) return "red";
  if (g > 200 && r < 80 && b < 80) return "green";
  if (b > 200 && r < 80 && g < 80) return "blue";
  if (r > 200 && g > 200 && b < 100) return "yellow";
  if (r > 200 && g > 100 && b < 80) return "orange";
  if (r > 180 && g < 80 && b > 180) return "purple";
  if (r < 50 && g < 50 && b < 50) return "black";
  if (r > 220 && g > 220 && b > 220) return "white";

  return "";
}



  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* Search Header */}
    

        <div className="flex gap-4">
          {/* Filters Panel - Mobile */}
          <div className="hidden md:block w-64">
            <div className="bg-white rounded-lg p-4 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`block text-sm py-1 ${
                      selectedCategory === null
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.categoryId)}
                      className={`block text-sm py-1 ${
                        selectedCategory === cat.categoryId
                          ? 'font-semibold text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </p>
              </div>

              {/* Color Filter */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Colors</h3>
                  <div className="space-y-2">
                    {availableColors.map((c) => (
                      <button
                        key={c.color}
                        onClick={() =>
                          setSelectedColor(
                            selectedColor === c.color ? null : c.color,
                          )
                        }
                        className={`block text-sm py-1 ${
                          selectedColor === c.color
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-600'
                        }`}
                      >
                        {c.color} ({c.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Sizes</h3>
                  <div className="space-y-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s.size}
                        onClick={() =>
                          setSelectedSize(
                            selectedSize === s.size ? null : s.size,
                          )
                        }
                        className={`block text-sm py-1 ${
                          selectedSize === s.size
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-600'
                        }`}
                      >
                        {s.size} ({s.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setIsDrawerOpen(true)}
                className="text-sm"
              >
                Filter & Sort
              </Button>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'relevance'
                      | 'price-low'
                      | 'price-high'
                      | 'newest'
                      | 'rating',
                  )
                }
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Desktop Sort */}
            <div className="hidden md:flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing {paginatedVariants.length} of {filteredVariants.length} variants
              </p>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'relevance'
                      | 'price-low'
                      | 'price-high'
                      | 'newest'
                      | 'rating',
                  )
                }
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

          <div className="flex justify-between items-center mb-3">
  <p className="text-xs text-gray-500">
    {filteredVariants.length} items
  </p>
</div>


{/* Variant Grid */}
{query.trim() === "" ? (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <h3 className="text-sm font-semibold mb-4 text-gray-800">
      Suggestions
    </h3>

    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() =>
            router.push(`/search?q=${encodeURIComponent(s)}`)
          }
          className="px-4 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
) : paginatedVariants.length > 0 ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
   {paginatedVariants.map((variant: VariantWithPrice) => {
const hasDiscount =
  typeof variant.mrp === "number" &&
  variant.mrp > variant.price;

      const discount =
        hasDiscount
          ? Math.round(
              ((variant.mrp - variant.price) /
                variant.mrp) *
                100
            )
          : 0;

      const isLowStock =
        variant.stock > 0 && variant.stock < 4;

      return (
        <div
          key={variant.variantId}
          onClick={() =>
  router.push(`/product/${variant.productSlug}`)
}
          className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95 border border-gray-100"
        >
          {/* IMAGE */}
          <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow">
                -{discount}%
              </div>
            )}

            {/* Gift Packing Icon */}
            {variant.giftPacking?.available && (
              <div className="absolute top-2 right-2 bg-white shadow-md rounded-full p-1.5 border border-gray-100">
                <Gift className="w-4 h-4 text-[#005F5F]" />
              </div>
            )}

            {/* Low Stock */}
            {isLowStock && (
              <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
                Only {variant.stock} left!
              </div>
            )}

            {/* Out of Stock */}
            {variant.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
                Out of Stock
              </div>
            )}

            <img
              src={variant.image || variant.thumbnail}
              alt={variant.productName}
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* DETAILS */}
          <div className="space-y-1.5">

            {/* Name */}
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
              {variant.productName}
            </h3>

            {/* Variant Info */}
            <p className="text-xs text-[#FFC000] font-medium">
              {variant.color && hexToColorName(variant.color)}
              {variant.size && ` • ${variant.size}`}
              {variant.unit && ` ${variant.unit}`}
            </p>

            {/* Delivery Badge */}
            {variant.deliveryDays && (
              <div className="flex items-center gap-1 text-[11px] text-[#005F5F] font-medium bg-[#005F5F]/10 w-fit px-2 py-0.5 rounded-full">
                <Truck className="w-3 h-3" />
                Delivery in {variant.deliveryDays} day
                {variant.deliveryDays > 1 ? "s" : ""}
              </div>
            )}

            {/* PRICE SECTION */}
            <div className="mt-2">

              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through">
                  ₹{variant.mrp}
                </p>
              )}

              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-[#005F5F]">
                  ₹{variant.price}
                </p>

                {discount > 0 && (
                  <span className="text-xs text-green-600 font-semibold">
                    Save {discount}%
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="text-center py-16 text-sm text-gray-500">
    No products found
  </div>
)}

            {/* Pagination */}
            {totalProductPages > 1 && (
              <div className="flex justify-center gap-2 pb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 p-0"
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(totalProductPages, currentPage + 1))
                  }
                  disabled={currentPage === totalProductPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        categories={categories}
      />
    </div>
  );
}
