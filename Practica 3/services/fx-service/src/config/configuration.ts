export default () => ({
  port: parseInt(process.env.PORT || '50054', 10), // Cambio aquí
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hora
  },
  providers: {
    frankfurter: {
      url: process.env.FRANKFURTER_URL || 'https://api.frankfurter.app',
      timeout: parseInt(process.env.PROVIDER_TIMEOUT || '5000', 10),
    },
    exchangerate: {
      url: process.env.EXCHANGERATE_URL || 'https://open.er-api.com/v6',
      timeout: parseInt(process.env.PROVIDER_TIMEOUT || '5000', 10),
    },
  },
  resilience: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000', 10),
    circuitBreakerThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5', 10),
    circuitBreakerTimeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000', 10),
  },
});
