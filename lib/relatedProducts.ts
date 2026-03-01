// Utility for finding related and similar products

export interface RelatedProductsResult {
  sameCategory: any[];
  crossCategory: any[];
  bundleRecommendations: any[];
}

export function findRelatedProducts(
  currentProduct: any,
  allProducts: any[],
  limit = 8,
): RelatedProductsResult {
  const categoryId = currentProduct.mainCategory?.categoryId;

  // Same category products (excluding current)
  const sameCategory = allProducts
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        p.mainCategory?.categoryId === categoryId,
    )
    .slice(0, Math.ceil(limit / 2));

  // Cross-category recommendations (different category, similar price range)
  const priceRange = currentProduct.price * 0.5; // 50% price variation
  const crossCategory = allProducts
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        p.mainCategory?.categoryId !== categoryId &&
        p.price >= currentProduct.price - priceRange &&
        p.price <= currentProduct.price + priceRange,
    )
    .slice(0, Math.ceil(limit / 2));

  // Bundle recommendations (products often bought together)
  const bundleRecommendations = findBundleRecommendations(
    currentProduct,
    allProducts,
  ).slice(0, 4);

  return {
    sameCategory,
    crossCategory,
    bundleRecommendations,
  };
}

function findBundleRecommendations(currentProduct: any, allProducts: any[]) {
  // For school items + gifts + toys, suggest complementary products
  const categoryId = currentProduct.mainCategory?.categoryId;

  const complementaryCategories: Record<string, string[]> = {
    // School supplies -> gift wrapping, notebooks
    school_supplies: ['gift_wrapping', 'notebooks', 'pens'],
    // Toys -> gift items, accessories
    toys: ['gifts', 'toy_accessories', 'games'],
    // Gifts -> gift wrapping, cards
    gifts: ['gift_wrapping', 'gift_cards', 'decoration'],
    // Notebooks -> pens, pencils, markers
    notebooks: ['pens', 'pencils', 'markers'],
  };

  const complementary = complementaryCategories[categoryId] || [];

  return allProducts.filter(
    (p) =>
      p.id !== currentProduct.id &&
      complementary.includes(p.mainCategory?.categoryId),
  );
}

export function getSimilarByTag(product: any, allProducts: any[], limit = 6) {
  if (!product.tags || product.tags.length === 0) {
    return [];
  }

  const similar = allProducts
    .filter((p) => {
      if (p.id === product.id) return false;
      const commonTags = p.tags?.filter((tag: string) =>
        product.tags.includes(tag),
      ) || [];
      return commonTags.length > 0;
    })
    .sort((a, b) => {
      const aCommon = (a.tags || []).filter((tag: string) =>
        product.tags.includes(tag),
      ).length;
      const bCommon = (b.tags || []).filter((tag: string) =>
        product.tags.includes(tag),
      ).length;
      return bCommon - aCommon;
    })
    .slice(0, limit);

  return similar;
}

export function getSeasonalRelated(product: any, allProducts: any[]) {
  const month = new Date().getMonth();
  const season = getSeason(month);
  const occasion = getOccasion(month);

  return {
    seasonal: allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.tags?.includes(season) || p.tags?.includes(occasion)),
    ),
    occasion: allProducts.filter(
      (p) =>
        p.id !== product.id &&
        p.occasion &&
        p.occasion === occasion,
    ),
  };
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getOccasion(month: number): string {
  // Back to school: July-August
  if (month === 6 || month === 7) return 'back-to-school';
  // Diwali: October-November
  if (month === 9 || month === 10) return 'diwali';
  // Christmas: December
  if (month === 11) return 'christmas';
  // New Year: December-January
  if (month === 11 || month === 0) return 'new-year';
  return 'general';
}

export function getProductBundles(
  product: any,
  allProducts: any[],
): Array<{
  name: string;
  products: any[];
  savingPercentage: number;
  bundlePrice: number;
}> {
  const bundles = [];

  // Bundle 1: Complete Study Kit (school supplies)
  if (
    product.mainCategory?.categoryId === 'school_supplies' ||
    product.mainCategory?.categoryId === 'notebooks'
  ) {
    const studyKit = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.mainCategory?.categoryId === 'school_supplies' ||
          p.mainCategory?.categoryId === 'notebooks' ||
          p.mainCategory?.categoryId === 'pens'),
    );
    if (studyKit.length >= 3) {
      const totalPrice = studyKit.reduce((sum, p) => sum + p.price, 0);
      const bundlePrice = totalPrice * 0.85; // 15% discount
      bundles.push({
        name: 'Complete Study Kit',
        products: studyKit.slice(0, 4),
        savingPercentage: 15,
        bundlePrice,
      });
    }
  }

  // Bundle 2: Gift Set (gifts + wrapping)
  if (
    product.mainCategory?.categoryId === 'gifts' ||
    product.mainCategory?.categoryId === 'toys'
  ) {
    const giftSet = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.mainCategory?.categoryId === 'gifts' ||
          p.mainCategory?.categoryId === 'gift_wrapping' ||
          p.mainCategory?.categoryId === 'toys'),
    );
    if (giftSet.length >= 2) {
      const totalPrice = giftSet.reduce((sum, p) => sum + p.price, 0);
      const bundlePrice = totalPrice * 0.9; // 10% discount
      bundles.push({
        name: 'Perfect Gift Bundle',
        products: giftSet.slice(0, 3),
        savingPercentage: 10,
        bundlePrice,
      });
    }
  }

  return bundles;
}
