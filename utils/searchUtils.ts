/**
 * Search and filtering utilities
 */

/**
 * Simple fuzzy search - checks if search term matches any part of the text
 */
export function fuzzySearch(text: string | null | undefined, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;
  const normalizedText = text.toLowerCase().trim();
  const normalizedSearch = searchTerm.toLowerCase().trim();
  return normalizedText.includes(normalizedSearch);
}

/**
 * Multi-field search - searches across multiple fields
 */
export function multiFieldSearch<T>(
  item: T,
  searchTerm: string,
  fields: (keyof T)[]
): boolean {
  if (!searchTerm) return true;
  return fields.some((field) => {
    const value = item[field];
    if (value === null || value === undefined) return false;
    return fuzzySearch(String(value), searchTerm);
  });
}

/**
 * Debounce function to limit how often a function is called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Filter array by multiple criteria
 */
export function filterByCriteria<T>(
  items: T[],
  criteria: Partial<Record<keyof T, any>>
): T[] {
  return items.filter((item) => {
    return Object.entries(criteria).every(([key, value]) => {
      if (value === null || value === undefined || value === "") return true;
      const itemValue = item[key as keyof T];
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      return itemValue === value;
    });
  });
}

/**
 * Sort array by a field
 */
export function sortByField<T>(
  items: T[],
  field: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
}
