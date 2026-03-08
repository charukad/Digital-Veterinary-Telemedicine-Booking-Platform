import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory cache implementation
 * TODO: Replace with Redis in production
 */
@Injectable()
export class InMemoryCacheService implements CacheService {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = options.ttl || 300; // Default 5 minutes
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }
}

/**
 * Cache decorator for methods
 */
export function Cacheable(ttl: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      const cacheService = this.cacheService as InMemoryCacheService;

      if (cacheService) {
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
      }

      const result = await originalMethod.apply(this, args);

      if (cacheService && result !== undefined) {
        await cacheService.set(cacheKey, result, { ttl });
      }

      return result;
    };

    return descriptor;
  };
}
