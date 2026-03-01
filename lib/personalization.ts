// Personalization utilities for tracking user behavior and preferences

interface SearchHistory {
  category: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = 'firstbell_search_history';
const VIEWED_PRODUCTS_KEY = 'firstbell_viewed_products';
const MAX_HISTORY = 20;

/**
 * Track when user searches or filters by category
 */
export function trackCategorySearch(categoryId: string) {
  try {
    const history = getSearchHistory();
    history.unshift({
      category: categoryId,
      timestamp: Date.now(),
    });
    
    // Keep only last 20 searches
    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('  Error tracking search:', error);
  }
}

/**
 * Get user's search history
 */
export function getSearchHistory(): SearchHistory[] {
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get the most frequently searched category for personalization
 */
export function getMostSearchedCategory(): string | null {
  const history = getSearchHistory();
  if (history.length === 0) return null;

  const categoryCount: { [key: string]: number } = {};
  history.forEach((item) => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  return Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

/**
 * Track viewed products for related items and analytics
 */
export function trackProductView(productId: string) {
  try {
    const viewed = getViewedProducts();
    if (!viewed.includes(productId)) {
      viewed.unshift(productId);
      const trimmed = viewed.slice(0, MAX_HISTORY);
      localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(trimmed));
    }
  } catch (error) {
    console.error('  Error tracking product view:', error);
  }
}

/**
 * Get list of recently viewed products
 */
export function getViewedProducts(): string[] {
  try {
    const data = localStorage.getItem(VIEWED_PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all personalization data (for testing or user preferences)
 */
export function clearPersonalizationData() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    localStorage.removeItem(VIEWED_PRODUCTS_KEY);
  } catch (error) {
    console.error('  Error clearing personalization:', error);
  }
}
