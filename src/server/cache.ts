// src/server/cache.ts
type CacheEntry<T> = {
    value: T;
    expiresAt: number;
  };
  
  class MemoryCache {
    private cache: Map<string, CacheEntry<any>>;
    private cleanupInterval: NodeJS.Timeout;
  
    constructor() {
      this.cache = new Map();
      
      // Run cleanup every 5 minutes
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  
    set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.cache.set(key, { value, expiresAt });
    }
  
    get<T>(key: string): T | null {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }
  
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }
  
      return entry.value;
    }
  
    delete(key: string): void {
      this.cache.delete(key);
    }
  
    clear(): void {
      this.cache.clear();
    }
  
    private cleanup(): void {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }
  
    // Ensure we clear the interval when the server restarts
    destroy(): void {
      clearInterval(this.cleanupInterval);
      this.cache.clear();
    }
  }
  
  // Create a singleton instance
  export const memoryCache = new MemoryCache();