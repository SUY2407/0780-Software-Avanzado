# FX Service

Servicio encargado de la conversión de moneda para EconoMarket.

## Proveedor externo
Se utiliza una API pública alternativa para tasas de cambio:
https://open.er-api.com/v6/latest/USD

## Estrategia de resiliencia
1. LIVE: consulta a API externa
2. CACHE: uso de Redis con TTL de 5 minutos
3. UNAVAILABLE: error controlado

## Redis
Redis se usa únicamente como caché y fallback, nunca como fuente principal.

## Endpoint
GET /fx/v1/rate?to=MXN

# FX Service – Conversión de Moneda

## Descripción
El **FX Service** es el microservicio responsable de la conversión de precios entre monedas
dentro del sistema EconoMarket. Internamente, todos los precios se manejan en **quetzales**,
pero el servicio permite mostrar valores en monedas alternativas como USD, MXN o EUR.

Este servicio consume una **API pública alternativa de tipo de cambio** y aplica mecanismos
de **caché, resiliencia y fallback**, cumpliendo las restricciones del proyecto.

---

## API Externa Consumida

Proveedor principal:

https://open.er-api.com/v6/latest/USD

Cambio de moneda base (configurable):


La URL se define mediante variables de entorno, permitiendo flexibilidad y pruebas locales.

---

## Endpoints del Servicio

### GET /fx/v1/convert

Convierte un monto desde la moneda base hacia la moneda destino.

**Parámetros:**
- amount: monto a convertir
- from: moneda origen
- to: moneda destino

**Respuesta:**
- monto convertido
- tasa aplicada
- origen de datos (LIVE | CACHED | FALLBACK)

---

## Caché y Fallback

El servicio utiliza **Redis** como mecanismo de caché temporal.

### Estrategia:
1. Si la API externa responde correctamente:
   - Se actualiza Redis con TTL
   - Se responde con estado `LIVE`
2. Si la API falla:
   - Se consulta Redis
   - Si existe información cacheada → `CACHED FALLBACK`
   - Si no existe → se responde con moneda base y advertencia

⚠️ Redis **no es** fuente de verdad del dominio.

---

## Resiliencia

El FX Service implementa:
- Timeout configurado
- Reintento simple
- Manejo de errores controlado
- Degradación elegante

Esto garantiza continuidad del sistema ante fallas del proveedor externo.

---

## Configuración

Variables de entorno principales:

FX_API_URL
REDIS_HOST
REDIS_PORT
FX_CACHE_TTL

---

## Justificación Técnica

- Evita dependencias fuertes con proveedores externos
- Reduce llamadas repetidas mediante caché
- Mejora experiencia de usuario mostrando precios aún con fallos externos
- Cumple con las restricciones del curso

---

## Consideraciones Finales

- El FX Service es completamente independiente
- Puede escalarse de forma horizontal
- No almacena estado persistente del dominio


---

