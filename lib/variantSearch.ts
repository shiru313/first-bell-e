// Utility for handling product variant search and display

export interface VariantWithPrice {
  productId: string;
  variantId: string;

  productName: string;
  productSlug: string;

  thumbnail: string;
  image?: string;

  mainCategory?: {
    categoryId?: string;
    categoryName?: string;
  };

  basePrice: number;
  price: number;
  mrp?: number;

  stock: number;

  color?: string;
  size?: string;
  quantity?: string;
  unit?: string; // ✅ added

  variantIndex: number;
  rating?: number;

  deliveryDays?: number;
  giftPacking?: {
    available: boolean;
    charge: number;
  } | null;
}

export function expandProductVariants(products: any[]): VariantWithPrice[] {
  const variants: VariantWithPrice[] = [];

  products.forEach((product) => {
    const {
      id,
      name,
      slug,
      thumbnail,
      mainCategory,
      price = 0,
      mrp,
      stock,
      rating,
      deliveryDays,
      giftPacking,
      variants: productVariants,
    } = product;

    // 🔹 No variants → treat as single variant
    if (!productVariants || productVariants.length === 0) {
      variants.push({
        productId: id,
        variantId: `${id}-0`,
        productName: name,
        productSlug: slug,
        thumbnail,
        image: thumbnail,
        mainCategory,
        basePrice: price,
        price,
        mrp: mrp ?? price,
        stock: stock ?? 0,
        variantIndex: 0,
        rating,
        deliveryDays: deliveryDays ?? 0,
        giftPacking: giftPacking ?? null,
      });
      return;
    }

    // 🔹 Expand variants
    productVariants.forEach((variant: any, index: number) => {
      const finalPrice = variant.price ?? price;
      const finalMrp = variant.mrp ?? mrp ?? finalPrice;

      variants.push({
        productId: id,
        variantId: `${id}-${index}`,
        productName: name,
        productSlug: slug,
        thumbnail,
        image: variant.image ?? thumbnail,
        mainCategory,
        basePrice: price,

        color: variant.color,
        size: variant.size,
        quantity: variant.quantity,
        unit: variant.unit, // ✅ added

        price: finalPrice,
        mrp: finalMrp,

        stock: variant.stock ?? stock ?? 0,

        variantIndex: index,
        rating,

        deliveryDays: deliveryDays ?? 0,
        giftPacking: giftPacking ?? null,
      });
    });
  });

  return variants;
}

export function searchVariants(
  variants: VariantWithPrice[],
  query: string,
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    color?: string;
    size?: string;
  },
): VariantWithPrice[] {
  const trimmedQuery = query.trim().toLowerCase();
  const queryWords = trimmedQuery.split(/\s+/);

  return variants.filter((variant) => {
    // 🔎 Query Match
    const queryMatch =
      !trimmedQuery ||
      queryWords.every((word) =>
        variant.productName.toLowerCase().includes(word) ||
        variant.color?.toLowerCase().includes(word) ||
        variant.size?.toLowerCase().includes(word) ||
        variant.mainCategory?.categoryName?.toLowerCase().includes(word),
      );

    // 📂 Category
    const categoryMatch =
      !filters?.category ||
      variant.mainCategory?.categoryId === filters.category;

    // 💰 Price (FIXED zero bug)
    const priceMatch =
      (filters?.minPrice === undefined ||
        variant.price >= filters.minPrice) &&
      (filters?.maxPrice === undefined ||
        variant.price <= filters.maxPrice);

    // 📦 Stock
    const stockMatch = !filters?.inStock || variant.stock > 0;

    // 🎨 Color
    const colorMatch =
      !filters?.color || variant.color === filters.color;

    // 📏 Size
    const sizeMatch =
      !filters?.size || variant.size === filters.size;

    return (
      queryMatch &&
      categoryMatch &&
      priceMatch &&
      stockMatch &&
      colorMatch &&
      sizeMatch
    );
  });
}

export function sortVariants(
  variants: VariantWithPrice[],
  sortBy:
    | 'relevance'
    | 'price-low'
    | 'price-high'
    | 'newest'
    | 'rating' = 'relevance',
): VariantWithPrice[] {
  const sorted = [...variants];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);

    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    case 'newest':
      return sorted.reverse();

    default:
      return sorted;
  }
}

export function getPriceRange(variants: VariantWithPrice[]) {
  if (variants.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = variants.map((v) => v.price);

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function getAvailableColors(
  variants: VariantWithPrice[],
): Array<{ color: string; count: number }> {
  const colorMap = new Map<string, number>();

  variants.forEach((variant) => {
    if (variant.color) {
      colorMap.set(
        variant.color,
        (colorMap.get(variant.color) ?? 0) + 1,
      );
    }
  });

  return Array.from(colorMap.entries()).map(([color, count]) => ({
    color,
    count,
  }));
}

export function getAvailableSizes(
  variants: VariantWithPrice[],
): Array<{ size: string; count: number }> {
  const sizeMap = new Map<string, number>();

  variants.forEach((variant) => {
    if (variant.size) {
      sizeMap.set(
        variant.size,
        (sizeMap.get(variant.size) ?? 0) + 1,
      );
    }
  });

  return Array.from(sizeMap.entries()).map(([size, count]) => ({
    size,
    count,
  }));
}