/**
 * Hook para cacheo inteligente y lazy loading de datos
 * Optimización de rendimiento con paginación y cacheo de consultas frecuentes
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface QueryCache {
  [key: string]: CacheEntry<unknown>;
}

const CACHE_CONFIG = {
  maxSize: 100,
  ttl: 5 * 60 * 1000,
  maxAccessCount: 1000
};

const queryCache: QueryCache = {};

let cacheStats = {
  hits: 0,
  misses: 0,
  evictions: 0
};

function evictOldEntries() {
  const now = Date.now();
  const entries = Object.entries(queryCache) as [string, CacheEntry<unknown>][];
  
  entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
  
  while (entries.length > CACHE_CONFIG.maxSize) {
    const [key] = entries.shift()!;
    delete queryCache[key];
    cacheStats.evictions++;
  }
}

export function useLazyData<T>(
  initialData: T[],
  options: {
    pageSize?: number;
    cacheKey?: string;
    enableCache?: boolean;
    sortBy?: keyof T;
    sortDirection?: 'asc' | 'desc';
  } = {}
) {
  const {
    pageSize = 20,
    cacheKey = 'default',
    enableCache = true,
    sortBy,
    sortDirection = 'asc'
  } = options;

  const [state, setState] = useState({
    data: [] as T[],
    isLoading: false,
    error: null as string | null,
    page: 0,
    pageSize,
    hasMore: false,
    totalCount: 0
  });

  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const cacheKeyRef = useRef(`${cacheKey}_${JSON.stringify(filters)}`);

  useEffect(() => {
    cacheKeyRef.current = `${cacheKey}_${JSON.stringify(filters)}`;
  }, [cacheKey, filters]);

  const fetchData = useCallback(async (page: number, append: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const cacheEntry = queryCache[cacheKeyRef.current];
      if (enableCache && cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_CONFIG.ttl) {
        cacheEntry.accessCount++;
        cacheEntry.lastAccessed = Date.now();
        cacheStats.hits++;
        
        const cachedData = cacheEntry.data as T[];
        const start = page * pageSize;
        const end = start + pageSize;
        const pageData = cachedData.slice(start, end);
        
        setState(prev => ({
          ...prev,
          data: append ? [...prev.data, ...pageData] : pageData,
          isLoading: false,
          page,
          hasMore: end < cachedData.length,
          totalCount: cachedData.length
        }));
        return;
      }

      cacheStats.misses++;

      const sortedData = sortBy 
        ? [...initialData].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          })
        : initialData;

      if (enableCache) {
        queryCache[cacheKeyRef.current] = {
          data: sortedData,
          timestamp: Date.now(),
          accessCount: 1,
          lastAccessed: Date.now()
        };
        evictOldEntries();
      }

      const start = page * pageSize;
      const end = start + pageSize;
      const pageData = sortedData.slice(start, end);

      setState(prev => ({
        ...prev,
        data: append ? [...prev.data, ...pageData] : pageData,
        isLoading: false,
        page,
        hasMore: end < sortedData.length,
        totalCount: sortedData.length
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    }
  }, [initialData, pageSize, sortBy, sortDirection, enableCache]);

  useEffect(() => {
    fetchData(0, false);
  }, [fetchData]);

  const loadPage = useCallback((page: number) => {
    fetchData(page, false);
  }, [fetchData]);

  const loadNextPage = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      fetchData(state.page + 1, true);
    }
  }, [fetchData, state.hasMore, state.isLoading, state.page]);

  const loadPreviousPage = useCallback(() => {
    if (state.page > 0) {
      fetchData(state.page - 1, false);
    }
  }, [fetchData, state.page]);

  const applyFilters = useCallback((newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setState(prev => ({ ...prev, page: 0, data: [] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setState(prev => ({ ...prev, page: 0, data: [] }));
  }, []);

  const invalidateCache = useCallback(() => {
    Object.keys(queryCache)
      .filter(key => key.startsWith(cacheKey))
      .forEach(key => delete queryCache[key]);
  }, [cacheKey]);

  const getCacheStats = useCallback(() => {
    const total = cacheStats.hits + cacheStats.misses;
    const hitRate = total > 0 ? (cacheStats.hits / total * 100).toFixed(2) : '0';
    
    return {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      evictions: cacheStats.evictions,
      hitRate: `${hitRate}%`,
      cacheSize: Object.keys(queryCache).length,
      maxCacheSize: CACHE_CONFIG.maxSize
    };
  }, []);

  const memoizedData = useMemo(() => state.data, [state.data]);

  return {
    data: memoizedData,
    isLoading: state.isLoading,
    error: state.error,
    page: state.page,
    pageSize: state.pageSize,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loadPage,
    loadNextPage,
    loadPreviousPage,
    applyFilters,
    clearFilters,
    invalidateCache,
    getCacheStats,
    refresh: () => fetchData(0, false)
  };
}

export function useQueryCache<T>(
  query: string,
  data: T,
  options: { ttl?: number } = {}
) {
  const { ttl = CACHE_CONFIG.ttl } = options;

  useEffect(() => {
    queryCache[query] = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };
  }, [query, data]);

  const getCached = useCallback(() => {
    const entry = queryCache[query];
    if (entry && Date.now() - entry.timestamp < ttl) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      return entry.data as T;
    }
    return null;
  }, [query, ttl]);

  return { getCached, cacheKey: query };
}

export default useLazyData;
