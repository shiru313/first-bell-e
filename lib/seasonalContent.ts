// Utility for managing seasonal collections and dynamic content

export interface SeasonalCollection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  startMonth: number;
  endMonth: number;
  tags: string[];
  targetCategories: string[];
}

export interface FlashDeal {
  id: string;
  productId: string;
  discountPercentage: number;
  originalPrice: number;
  dealPrice: number;
  startsAt: Date;
  endsAt: Date;
  quantity: number;
  sold: number;
}

export const SEASONAL_COLLECTIONS: SeasonalCollection[] = [
  {
    id: 'back-to-school',
    title: 'Back to School',
    subtitle: 'Complete School Supplies',
    description:
      'Everything you need for a successful school year - books, pens, bags, and more!',
    emoji: '📚',
    color: '#FF6B6B',
    bgColor: '#FFE5E5',
    isActive: false,
    startMonth: 6, // July
    endMonth: 8, // August
    tags: ['back-to-school', 'school-supplies', 'notebooks', 'bags'],
    targetCategories: [
      'school_supplies',
      'notebooks',
      'pens',
      'bags',
      'backpacks',
    ],
  },
  {
    id: 'festival-gifts',
    title: 'Festival Gift Ideas',
    subtitle: 'Perfect Gifts for Every Occasion',
    description:
      'Celebrate with thoughtful gifts - toys, gadgets, books, and more for your loved ones!',
    emoji: '🎁',
    color: '#4ECDC4',
    bgColor: '#E0F8F6',
    isActive: false,
    startMonth: 8, // September
    endMonth: 11, // November (Diwali season)
    tags: ['gifts', 'festival', 'diwali', 'celebrations'],
    targetCategories: ['gifts', 'toys', 'games', 'gadgets'],
  },
  {
    id: 'christmas-holiday',
    title: 'Christmas & Holiday Special',
    subtitle: 'Spread Joy This Season',
    description:
      'Christmas comes but once a year - find the perfect gifts and decorations!',
    emoji: '🎄',
    color: '#FF1744',
    bgColor: '#FFE0E6',
    isActive: false,
    startMonth: 10, // November
    endMonth: 11, // December
    tags: ['christmas', 'holidays', 'gifts', 'celebrations'],
    targetCategories: ['gifts', 'toys', 'decorations', 'games'],
  },
  {
    id: 'new-year',
    title: 'New Year New You',
    subtitle: 'Start Fresh with Our Collection',
    description:
      'New goals, new hobbies - explore new products to inspire your year ahead!',
    emoji: '✨',
    color: '#FFE66D',
    bgColor: '#FFFBF0',
    isActive: false,
    startMonth: 11, // December
    endMonth: 0, // January
    tags: ['new-year', 'new-goals', 'fresh-start'],
    targetCategories: ['books', 'stationery', 'gifts', 'games'],
  },
  {
    id: 'summer-fun',
    title: 'Summer Fun & Adventure',
    subtitle: 'Make Memories This Summer',
    description:
      'Outdoor games, adventure gear, and activities to make your summer unforgettable!',
    emoji: '☀️',
    color: '#FF9E64',
    bgColor: '#FFE4D6',
    isActive: false,
    startMonth: 3, // April
    endMonth: 5, // May
    tags: ['summer', 'outdoor', 'adventure', 'games'],
    targetCategories: ['toys', 'games', 'outdoor-gear', 'sports'],
  },
  {
    id: 'birthday-bash',
    title: 'Birthday Bash Picks',
    subtitle: 'Celebrate Every Birthday',
    description:
      'Party supplies, gifts, and games to make every birthday special and memorable!',
    emoji: '🎉',
    color: '#A78BFA',
    bgColor: '#F3E8FF',
    isActive: true, // Always available
    startMonth: -1, // All year
    endMonth: -1,
    tags: ['birthday', 'celebration', 'gifts', 'party'],
    targetCategories: ['gifts', 'toys', 'games', 'party-supplies'],
  },
  {
    id: 'trending-toys',
    title: 'Trending Toys',
    subtitle: 'Most Loved Toys Right Now',
    description:
      'The hottest toys and gadgets that kids are absolutely loving - check out what is trending!',
    emoji: '🚀',
    color: '#00D084',
    bgColor: '#D4F8E8',
    isActive: true,
    startMonth: -1, // All year
    endMonth: -1,
    tags: ['trending', 'toys', 'popular'],
    targetCategories: ['toys', 'gadgets', 'games'],
  },
];

export function getActiveCollections(): SeasonalCollection[] {
  const currentMonth = new Date().getMonth();

  return SEASONAL_COLLECTIONS.filter((collection) => {
    if (collection.isActive && collection.startMonth === -1) {
      return true; // All year collections
    }

    if (collection.startMonth <= collection.endMonth) {
      // Normal range (e.g., 6-8 for July-Aug)
      return currentMonth >= collection.startMonth && currentMonth <= collection.endMonth;
    } else {
      // Wrapping range (e.g., 11-0 for Dec-Jan)
      return currentMonth >= collection.startMonth || currentMonth <= collection.endMonth;
    }
  });
}

export function getCollectionBanner(collection: SeasonalCollection) {
  return {
    title: collection.title,
    subtitle: collection.subtitle,
    description: collection.description,
    emoji: collection.emoji,
    color: collection.color,
    bgColor: collection.bgColor,
  };
}

export function filterProductsByCollection(
  collection: SeasonalCollection,
  products: any[],
): any[] {
  return products.filter((product) => {
    const categoryMatch = collection.targetCategories.includes(
      product.mainCategory?.categoryId,
    );
    const tagMatch =
      product.tags &&
      product.tags.some((tag: string) => collection.tags.includes(tag));

    return categoryMatch || tagMatch;
  });
}

export function getHeroBannerContent() {
  const collections = getActiveCollections();
  const featured = collections[0];

  if (!featured) {
    return {
      title: 'Welcome to FirstBell',
      subtitle: 'Discover Amazing School Items, Gifts & Toys',
      emoji: '👋',
      color: '#4ECDC4',
      bgColor: '#E0F8F6',
    };
  }

  return getCollectionBanner(featured);
}

export function getSeasonalOccasion(): string {
  const month = new Date().getMonth();

  if (month === 6 || month === 7) return 'back-to-school';
  if (month === 9 || month === 10) return 'diwali';
  if (month === 11) return 'christmas';
  if (month === 0) return 'new-year';
  if (month === 3 || month === 4) return 'summer';

  return 'general';
}

export const CATEGORY_ICONS: Record<string, { emoji: string; color: string }> = {
  school_supplies: { emoji: '✏️', color: '#FF6B6B' },
  notebooks: { emoji: '📓', color: '#FFE66D' },
  pens: { emoji: '🖊️', color: '#4ECDC4' },
  pencils: { emoji: '✏️', color: '#FFB3A7' },
  bags: { emoji: '🎒', color: '#95E1D3' },
  backpacks: { emoji: '🎒', color: '#95E1D3' },
  gifts: { emoji: '🎁', color: '#FF1744' },
  toys: { emoji: '🧸', color: '#A78BFA' },
  games: { emoji: '🎮', color: '#00D084' },
  puzzles: { emoji: '🧩', color: '#FFD700' },
  art_supplies: { emoji: '🎨', color: '#FF6B9D' },
  markers: { emoji: '🖍️', color: '#FF6B9D' },
  paints: { emoji: '🎨', color: '#FF6B9D' },
  books: { emoji: '📚', color: '#8E44AD' },
  stationery: { emoji: '📎', color: '#3498DB' },
  gadgets: { emoji: '⚡', color: '#F39C12' },
  outdoor_gear: { emoji: '⛺', color: '#16A085' },
  sports: { emoji: '⚽', color: '#E74C3C' },
  party_supplies: { emoji: '🎉', color: '#C0392B' },
  decorations: { emoji: '✨', color: '#9B59B6' },
};

export function getCategoryIcon(categoryId: string) {
  return (
    CATEGORY_ICONS[categoryId] || {
      emoji: '📦',
      color: '#95A5A6',
    }
  );
}
