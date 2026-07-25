const RECENT_SEARCHES_KEY = "storefront-recent-searches";
const MAX_RECENT = 6;

export function readRecentSearches() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function writeRecentSearch(term: string) {
  const normalized = term.trim();
  if (!normalized || typeof window === "undefined") {
    return;
  }

  const next = [normalized, ...readRecentSearches().filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(
    0,
    MAX_RECENT
  );

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RECENT_SEARCHES_KEY);
}
