// Simple in-memory cache utility for performance optimization
// This provides basic caching functionality for frequently accessed data

class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time to live for each key
    }

    // Set a value in cache with optional TTL (time to live in milliseconds)
    set(key, value, ttlMs = 300000) { // Default 5 minutes
        this.cache.set(key, value);
        this.ttl.set(key, Date.now() + ttlMs);
        console.log(`📦 Cached: ${key} (TTL: ${ttlMs}ms)`);
    }

    // Get a value from cache
    get(key) {
        // Check if key exists and hasn't expired
        if (this.cache.has(key)) {
            const expiryTime = this.ttl.get(key);
            if (Date.now() < expiryTime) {
                console.log(`🎯 Cache hit: ${key}`);
                return this.cache.get(key);
            } else {
                // Key has expired, remove it
                this.delete(key);
                console.log(`⏰ Cache expired: ${key}`);
            }
        }
        console.log(`❌ Cache miss: ${key}`);
        return null;
    }

    // Delete a key from cache
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
        console.log(`🗑️ Cache deleted: ${key}`);
    }

    // Clear all cache
    clear() {
        this.cache.clear();
        this.ttl.clear();
        console.log('🧹 Cache cleared');
    }

    // Get cache statistics
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, expiryTime] of this.ttl.entries()) {
            if (now >= expiryTime) {
                this.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
        }
        
        return cleanedCount;
    }
}

// Create a global cache instance
const cache = new SimpleCache();

// Set up periodic cleanup (every 10 minutes)
setInterval(() => {
    cache.cleanup();
}, 10 * 60 * 1000);

module.exports = cache;
