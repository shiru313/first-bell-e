import { VariantWithPrice } from './variantSearch';

export interface GroupedProduct {
  productId: string;
  productName: string;
  productSlug: string;
  thumbnail: string;
  basePrice: number;
  rating?: number;
  mainCategory?: any;
  variants: VariantWithPrice[];
}

/**
 * Groups variants by product ID
 * This allows showing all variants of a product together
 */
export function groupVariantsByProduct(
  variants: VariantWithPrice[],
): GroupedProduct[] {
  const grouped = new Map<string, GroupedProduct>();

  variants.forEach((variant) => {
    if (!grouped.has(variant.productId)) {
      grouped.set(variant.productId, {
        productId: variant.productId,
        productName: variant.productName,
        productSlug: variant.productSlug,
        thumbnail: variant.thumbnail,
        basePrice: variant.basePrice,
        rating: variant.rating,
        mainCategory: variant.mainCategory,
        variants: [],
      });
    }

    grouped.get(variant.productId)!.variants.push(variant);
  });

  return Array.from(grouped.values());
}

/**
 * Get unique colors from a list of variants
 */
export function getColorsFromVariants(variants: VariantWithPrice[]): string[] {
  const colors = new Set<string>();
  variants.forEach((v) => {
    if (v.color) colors.add(v.color);
  });
  return Array.from(colors);
}

/**
 * Get unique sizes from a list of variants
 */
export function getSizesFromVariants(variants: VariantWithPrice[]): string[] {
  const sizes = new Set<string>();
  variants.forEach((v) => {
    if (v.size) sizes.add(v.size);
  });
  return Array.from(sizes);
}

/**
 * Get the lowest price from variants
 */
export function getLowestPrice(variants: VariantWithPrice[]): number {
  if (variants.length === 0) return 0;
  return Math.min(...variants.map((v) => v.price));
}

/**
 * Check if any variant is in stock
 */
export function isProductInStock(variants: VariantWithPrice[]): boolean {
  return variants.some((v) => v.stock > 0);
}
