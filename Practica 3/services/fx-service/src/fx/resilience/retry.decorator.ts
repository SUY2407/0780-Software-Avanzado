import { Logger } from '@nestjs/common';

export function Retry(maxRetries: number = 3, delay: number = 1000) {
  const logger = new Logger('RetryDecorator');

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error | undefined; // Inicializar como undefined

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          
          if (attempt < maxRetries) {
            const backoffDelay = delay * Math.pow(2, attempt - 1); // Exponential backoff
            logger.warn(
              `Attempt ${attempt}/${maxRetries} failed. Retrying in ${backoffDelay}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          }
        }
      }

      logger.error(`All ${maxRetries} retry attempts failed`);
      throw lastError || new Error('Operation failed after retries'); // Fallback por si acaso
    };

    return descriptor;
  };
}
