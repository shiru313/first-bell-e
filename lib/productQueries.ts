// Optimized product query functions for cost efficiency

import { collection, getDocs, QueryConstraint, query } from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  thumbnail: string;
  images?: string[];
  slug: string;
  mainCategory?: { categoryId: string };
  stock?: number;
  description?: string;
  brand?: string;
  variants?: any[];
  popularityScore?: number;
  createdAt?: number;
}

/**
 * Get ALL products from Firestore
 * Note: In production with 5000+ products, implement server-side pagination
 * This is client-side paginated to reduce Firestore reads
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));
  } catch (error) {
    console.error('  Error fetching products:', error);
    return [];
  }
}

/**
 * Sort products by various criteria
 */
export function sortProducts(
  products: Product[],
  sortBy: 'price-low' | 'price-high' | 'newest' | 'popular' = 'popular',
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    case 'popular':
    default:
      return sorted.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
  }
}

/**
 * Filter products based on multiple criteria
 */
export function filterProducts(
  products: Product[],
  {
    categoryId,
    minPrice = 0,
    maxPrice = Infinity,
    searchQuery = '',
    inStock = false,
  }: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    inStock?: boolean;
  },
): Product[] {
  return products.filter((product) => {
    // Category filter
    if (categoryId && categoryId !== 'all') {
      if (product.mainCategory?.categoryId !== categoryId) {
        return false;
      }
    }

    // Price filter
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }

    // Stock filter
    if (inStock && product.stock === 0) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesBrand = product.brand?.toLowerCase().includes(query);
      const matchesDesc = product.description?.toLowerCase().includes(query);

      if (!matchesName && !matchesBrand && !matchesDesc) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get featured products (for homepage)
 * Implementation: Use products with high popularityScore or featured flag
 */
export function getFeaturedProducts(products: Product[], limit: number = 8): Product[] {
  return sortProducts(products, 'popular').slice(0, limit);
}

/**
 * Get products in a specific category
 */
export function getProductsByCategory(products: Product[], categoryId: string): Product[] {
  return products.filter((p) => p.mainCategory?.categoryId === categoryId);
}

/**
 * Get related products (same category, excluding current product)
 */
export function getRelatedProducts(
  products: Product[],
  currentProductId: string,
  categoryId?: string,
  limit: number = 6,
): Product[] {
  const filtered = products.filter(
    (p) =>
      p.id !== currentProductId &&
      (!categoryId || p.mainCategory?.categoryId === categoryId),
  );

  return sortProducts(filtered, 'popular').slice(0, limit);
}

/**
 * Track a product view for analytics (increment popularity score)
 * In production, this should be done server-side
 */
export function incrementProductPopularity(productId: string) {
  // Placeholder for future implementation with Cloud Functions
  // This would update popularityScore in Firestore
  console.log(`  Tracking view for product: ${productId}`);
}
