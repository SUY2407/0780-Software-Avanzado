import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { FrankfurterProvider } from './providers/frankfurter.provider';
import { ExchangeRateProvider } from './providers/exchangerate.provider';
import { CircuitBreaker } from './resilience/circuit-breaker';
import { ExchangeRateResult } from './providers/provider.interface';

interface CachedRate extends ExchangeRateResult {
  cachedAt: string;
}

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private readonly providerACircuit: CircuitBreaker;
  private readonly providerBCircuit: CircuitBreaker;
  private readonly cacheTTL: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly providerA: FrankfurterProvider,
    private readonly providerB: ExchangeRateProvider,
  ) {
    this.cacheTTL = this.configService.get('redis.ttl') ?? 3600;
    
    const cbThreshold = this.configService.get('resilience.circuitBreakerThreshold') ?? 5;
    const cbTimeout = this.configService.get('resilience.circuitBreakerTimeout') ?? 60000;
    
    this.providerACircuit = new CircuitBreaker(cbThreshold, cbTimeout);
    this.providerBCircuit = new CircuitBreaker(cbThreshold, cbTimeout);
  }

  /**
   * Lógica de fallback: A → B → Redis (stale) → error
   */
  async getExchangeRate(
    base: string,
    quote: string,
  ): Promise<{
    base: string;
    quote: string;
    rate: number;
    timestamp: string;
    fromCache: boolean;
    isStale: boolean;
  }> {
    const cacheKey = `fx:${base}:${quote}`;

    // 1. Intentar Provider A (Frankfurter) con circuit breaker
    try {
      const result = await this.providerACircuit.execute(
        () => this.providerA.getExchangeRate(base, quote),
      );
      
      this.logger.log(`Rate fetched from Provider A (${this.providerA.getName()})`);
      
      // Guardar en caché
      await this.cacheRate(cacheKey, result);
      
      return {
        ...result,
        fromCache: false,
        isStale: false,
      };
    } catch (errorA) {
      this.logger.warn(`Provider A failed: ${errorA.message}`);
      
      // 2. Intentar Provider B (ExchangeRate-API) con circuit breaker
      try {
        const result = await this.providerBCircuit.execute(
          () => this.providerB.getExchangeRate(base, quote),
        );
        
        this.logger.log(`Rate fetched from Provider B (${this.providerB.getName()})`);
        
        // Guardar en caché
        await this.cacheRate(cacheKey, result);
        
        return {
          ...result,
          fromCache: false,
          isStale: false,
        };
      } catch (errorB) {
        this.logger.error(`Provider B also failed: ${errorB.message}`);
        
        // 3. Intentar caché stale de Redis
        const cachedRate = await this.getCachedRate(cacheKey);
        
        if (cachedRate) {
          this.logger.warn('Using stale rate from Redis cache');
          return {
            ...cachedRate,
            fromCache: true,
            isStale: true,
          };
        }
        
        // 4. Error controlado - todos los fallbacks fallaron
        this.logger.error('All fallback mechanisms failed');
        throw new Error(
          `Failed to get exchange rate for ${base}/${quote}. All providers and cache unavailable.`,
        );
      }
    }
  }

  /**
   * Convertir monto usando el tipo de cambio
   */
  async convertAmount(
    from: string,
    to: string,
    amount: number,
  ): Promise<{
    from: string;
    to: string;
    originalAmount: number;
    convertedAmount: number;
    rate: number;
    fromCache: boolean;
  }> {
    const rateData = await this.getExchangeRate(from, to);
    
    return {
      from,
      to,
      originalAmount: amount,
      convertedAmount: amount * rateData.rate,
      rate: rateData.rate,
      fromCache: rateData.fromCache,
    };
  }

  /**
   * Guardar tasa en Redis con TTL
   */
  private async cacheRate(key: string, rate: ExchangeRateResult): Promise<void> {
    try {
      const cached: CachedRate = {
        ...rate,
        cachedAt: new Date().toISOString(),
      };
      
      await this.redisService.set(
        key,
        JSON.stringify(cached),
        this.cacheTTL,
      );
      
      this.logger.log(`Rate cached in Redis with TTL ${this.cacheTTL}s`);
    } catch (error) {
      this.logger.error(`Failed to cache rate: ${error.message}`);
    }
  }

  /**
   * Obtener tasa del caché (incluso si está expirada/stale)
   */
  private async getCachedRate(key: string): Promise<CachedRate | null> {
    try {
      const cached = await this.redisService.get(key);
      
      if (!cached) {
        return null;
      }
      
      return JSON.parse(cached) as CachedRate;
    } catch (error) {
      this.logger.error(`Failed to get cached rate: ${error.message}`);
      return null;
    }
  }
}
