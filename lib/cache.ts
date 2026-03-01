

const CACHE_VERSION = "v2"; // 🔥 Change this when major update
const CACHE_PREFIX = `firstbell_${CACHE_VERSION}_`;
const CACHE_EXPIRY_HOURS = 6; // shorter expiry

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/* ================= GET CACHE ================= */

export function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const cached: CacheItem<T> = JSON.parse(item);

    const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
    const isExpired = Date.now() - cached.timestamp > expiryTime;

    if (isExpired) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error("Cache retrieval error:", error);
    return null;
  }
}

/* ================= SAVE CACHE ================= */

export function saveToCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify(cacheItem)
    );
  } catch (error) {
    console.error("Cache save error:", error);
  }
}

/* ================= CLEAR CACHE ================= */

export function clearAllCache(): void {
  if (typeof window === "undefined") return;

  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("firstbell_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

/* ================= FORCE INVALIDATE ================= */

export function invalidateCache(key: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CACHE_PREFIX + key);
}

/* ================= COOKIE TRACK ================= */

export function setVisitCookie(): void {
  if (typeof window === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();

  document.cookie = `firstbell_visited=true;${expires};path=/;SameSite=Lax`;
}

export function hasVisitedBefore(): boolean {
  if (typeof window === "undefined") return false;

  return document.cookie.includes("firstbell_visited=true");
}