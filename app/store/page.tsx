'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, slugify } from '@/lib/firebase';
import { getFromCache, saveToCache, setVisitCookie } from '@/lib/cache';
import { trackCategorySearch } from '@/lib/personalization';
import { paginateProducts, PRODUCTS_PER_PAGE } from '@/lib/pagination';
import { MobileHeader } from '@/components/MobileHeader';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  thumbnail: string;
  images?: string[];
  slug: string;
  mainCategory?: {
    categoryId: string;
  };
}

export default function StorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load data from Firebase with caching
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get cached data first
        const cachedCategories = getFromCache<Category[]>('categories');
        const cachedProducts = getFromCache<Product[]>('products');

        if (cachedCategories && cachedProducts) {
          console.log('  Loading from cache');
          setCategories(cachedCategories);
          setAllProducts(cachedProducts);
          setIsLoading(false);
          setVisitCookie();
          return;
        }

        // If not cached, fetch from Firebase
        console.log('  Fetching from Firebase');
        const catSnap = await getDocs(collection(db, 'categories'));
        const catsData = catSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Category[];
        setCategories(catsData);
        saveToCache('categories', catsData);

        // Load products
        const prodSnap = await getDocs(collection(db, 'products'));
        const prodsData = prodSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            slug: data.slug || slugify(data.name),
          } as Product;
        });
        setAllProducts(prodsData);
        saveToCache('products', prodsData);

        setVisitCookie();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const categoryMatch =
        selectedCategory === 'all' ||
        selectedCategory === null ||
        product.mainCategory?.categoryId === selectedCategory;

      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const searchMatch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return categoryMatch && priceMatch && searchMatch;
    });
  }, [allProducts, selectedCategory, priceRange, searchQuery]);

  // Paginate filtered products
  const { items: paginatedProducts, pagination } = useMemo(() => {
    return paginateProducts(filteredProducts, currentPage);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId === 'all' ? 'all' : categoryId;
    setSelectedCategory(newCategory);
    setCurrentPage(1); // Reset to first page on filter change
    if (newCategory !== 'all') {
      trackCategorySearch(newCategory); // Track for personalization
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader
        onMenuClick={() => setIsDrawerOpen(true)}
        onSearch={setSearchQuery}
        isMenuOpen={isDrawerOpen}
      />

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
      />

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || searchQuery || priceRange[1] < 999999) && (
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>
                    Category:{' '}
                    {categories.find((c) => c.id === selectedCategory)?.name ||
                      'All'}
                  </span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="font-bold hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <span>Search: "{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="font-bold hover:text-green-900"
                  >
                    ×
                  </button>
                </div>
              )}
              {priceRange[1] < 999999 && (
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <span>
                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                  <button
                    onClick={() => setPriceRange([0, 999999])}
                    className="font-bold hover:text-purple-900"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#131921] rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600 text-center">
              No products found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
             
              {filteredProducts.length > 0 && (
                <p className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>
            <ProductGrid products={paginatedProducts} />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-1 mt-6 pb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-sm"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 p-0 text-sm"
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="text-sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
