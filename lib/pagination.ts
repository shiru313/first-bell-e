// Pagination utility for cost-efficient product querying

export const PRODUCTS_PER_PAGE = 16; // Mobile-optimized grid size

interface PaginationState {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Calculate pagination info for a given page number
 */
export function getPaginationInfo(
  currentPage: number,
  totalProducts: number,
): PaginationState {
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (validPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;

  return {
    page: validPage,
    totalPages,
    startIndex,
    endIndex,
  };
}

/**
 * Slice products array for current page
 */
export function paginateProducts<T>(
  products: T[],
  currentPage: number,
): { items: T[]; pagination: PaginationState } {
  const pagination = getPaginationInfo(currentPage, products.length);
  const items = products.slice(pagination.startIndex, pagination.endIndex);

  return { items, pagination };
}

/**
 * Get pagination page numbers to display
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  visiblePages: number = 5,
): (number | string)[] {
  const pages: (number | string)[] = [];
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages, startPage + visiblePages - 1);

  if (endPage - startPage < visiblePages - 1) {
    startPage = Math.max(1, endPage - visiblePages + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}
