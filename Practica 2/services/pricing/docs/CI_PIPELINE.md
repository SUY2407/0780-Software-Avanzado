# Pipeline de Integración Continua – QuetzalShip

## Objetivo
El pipeline de CI asegura la calidad, consistencia y reproducibilidad del sistema
QuetzalShip antes de cualquier entrega o despliegue.

Se ejecuta automáticamente en eventos clave del repositorio.

## Triggers
El pipeline se ejecuta en los siguientes eventos:
- Pull Request hacia main
- Push a main
- Push a ramas release/**

## Jobs del Pipeline

### 1. Quality
Este job valida la calidad del código y la correcta compilación del sistema.

Incluye:
- Instalación de dependencias usando lockfile (npm ci).
- Ejecución de lint (si aplica).
- Ejecución de pruebas unitarias de backend.
- Build del frontend con Vite.

El pipeline falla si el frontend no compila correctamente.

### 2. Contracts
Este job valida la correcta definición de contratos entre servicios.

Incluye:
- Validación del contrato OpenAPI del Gateway.
- Compilación de los archivos proto de gRPC.
- Verificación de compatibilidad entre contratos y servicios.

### 3. Docker Build
Este job construye las imágenes Docker de todos los componentes:
- frontend
- gateway
- orders
- pricing
- receipt

Las imágenes se construyen sin ser publicadas en Pull Requests.

### 4. Docker Push
Este job se ejecuta únicamente en push a main o release/**.

Incluye:
- Autenticación contra el registry configurado.
- Publicación de imágenes Docker.

## Estrategia de Tagging
Las imágenes Docker utilizan tags deterministas:

- Push a main:
  - main-<short_sha>
  - main-latest
- Push a release/<versión>:
  - <versión> (ej. v2.0.0)

Esta estrategia permite trazabilidad completa entre código e imágenes desplegadas.
