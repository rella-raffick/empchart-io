/**
 * Cache Manager Utility
 *
 * Purpose: Centralized caching utility with configurable TTL
 * Uses node-cache under the hood
 */

import NodeCache from "node-cache";

interface CacheStats {
  hits: number;
  misses: number;
  lastReset: Date;
}

class CacheManager {
  private caches: Map<string, NodeCache> = new Map();
  private stats: Map<string, CacheStats> = new Map();

  /**
   * Get or create a cache instance with specific TTL
   * @param name - Unique name for this cache instance
   * @param ttlSeconds - Time to live in seconds
   */
  getCache(name: string, ttlSeconds: number): NodeCache {
    if (!this.caches.has(name)) {
      const cache = new NodeCache({ stdTTL: ttlSeconds });
      this.caches.set(name, cache);
      this.stats.set(name, {
        hits: 0,
        misses: 0,
        lastReset: new Date(),
      });
      console.log(`Created cache "${name}" with TTL: ${ttlSeconds}s`);
    }
    return this.caches.get(name)!;
  }

  /**
   * Get data from cache or fetch from source
   */
  async getOrSet<T>(
    cacheName: string,
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<{ data: T; cacheHit: boolean }> {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      throw new Error(`Cache "${cacheName}" not initialized`);
    }

    const stats = this.stats.get(cacheName)!;
    const cachedData = cache.get<T>(key);

    if (cachedData !== undefined) {
      stats.hits++;
      return { data: cachedData, cacheHit: true };
    }

    stats.misses++;
    const data = await fetchFn();
    cache.set(key, data);
    return { data, cacheHit: false };
  }

  /**
   * Clear specific cache
   */
  clearCache(name: string): void {
    const cache = this.caches.get(name);
    if (cache) {
      cache.flushAll();
      console.log(`Cache "${name}" cleared`);
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.caches.forEach((cache, name) => {
      cache.flushAll();
      console.log(`Cache "${name}" cleared`);
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(name: string) {
    const cache = this.caches.get(name);
    const stats = this.stats.get(name);

    if (!cache || !stats) {
      return null;
    }

    return {
      ...stats,
      cacheKeys: cache.keys(),
      cacheSize: cache.keys().length,
      hitRate:
        stats.hits + stats.misses > 0
          ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + "%"
          : "0%",
    };
  }

  /**
   * Get all cache statistics
   */
  getAllCacheStats() {
    const allStats: Record<string, any> = {};
    this.caches.forEach((cache, name) => {
      allStats[name] = this.getCacheStats(name);
    });
    return allStats;
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(name: string): void {
    const stats = this.stats.get(name);
    if (stats) {
      this.stats.set(name, {
        hits: 0,
        misses: 0,
        lastReset: new Date(),
      });
    }
  }

  /**
   * Reset all cache statistics
   */
  resetAllCacheStats(): void {
    this.stats.forEach((_, name) => {
      this.resetCacheStats(name);
    });
  }
}

// Export singleton instance
export default new CacheManager();
