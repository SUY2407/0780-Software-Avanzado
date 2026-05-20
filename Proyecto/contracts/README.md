# Contratos de API - EconoMarket

Este directorio contiene todos los contratos OpenAPI para los servicios de EconoMarket. Los contratos definen las interfaces REST que exponen los microservicios hacia el frontend y otros equipos.

## Estructura de Directorios

```
contracts/
├── README.md                          # Este archivo
├── orders-service/
│   └── openapi-v1.yaml               # Contrato de Orders Service v1
└── users-auth/
    ├── swagger.json                  # Contrato de Users Auth Service
    └── swagger.yaml                  # Contrato de Users Auth Service (YAML)
```

## Convenciones de Versionamiento

### Ubicación de Contratos

Cada servicio tiene su propio subdirectorio en `/contracts`:

```
contracts/
└── {nombre-servicio}/
    └── openapi-v{version}.yaml
```

### Versionamiento Semántico

Los contratos siguen versionamiento semántico:

- **Major version (v1, v2)**: Cambios incompatibles en la API
- **Minor/Patch**: Se reflejan en `info.version` dentro del archivo

Ejemplo:
```yaml
info:
  version: 1.2.3  # Major.Minor.Patch
```

### Versionamiento en Rutas

Las rutas de API deben incluir la versión major:

```yaml
paths:
  /api/v1/orders:    # Versión 1
  /api/v2/orders:    # Versión 2 (cuando exista)
```

## Servicios Disponibles

### 1. Orders Service

**Archivo**: `orders-service/openapi-v1.yaml`

**Descripción**: Servicio de gestión de órdenes de compra

**Versión actual**: 1.0.0

**Endpoints principales**:
- `POST /api/v1/orders` - Crear orden
- `GET /api/v1/orders` - Listar órdenes
- `GET /api/v1/orders/{id}` - Obtener orden por ID
- `GET /api/v1/users/{userId}/orders` - Obtener órdenes de un usuario
- `PUT /api/v1/orders/{id}/status` - Actualizar estado de orden

**Documentación**: Ver [services/orders-service/docs/CONTRACT_VALIDATION.md](../services/orders-service/docs/CONTRACT_VALIDATION.md)

### 2. Users Auth Service

**Archivo**: `users-auth/swagger.yaml`

**Descripción**: Servicio de autenticación y gestión de usuarios

**Versión actual**: 1.0

**Endpoints principales**:
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Obtener perfil actual

## Validación de Contratos

### Herramientas Recomendadas

- **Redocly CLI**: Para servicios con OpenAPI 3.x
- **Swagger Tools**: Para servicios con Swagger 2.0

### Validación Automática

Todos los contratos se validan automáticamente en el pipeline de CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Validate OpenAPI Contract
  run: npm run validate:openapi
```

### Validación Local

Cada servicio incluye scripts npm para validar sus contratos:

```bash
# Desde el directorio del servicio
cd services/orders-service
npm run validate:openapi

# O validar el contrato directamente
cd services/orders-service
npm run validate:contract
```

## Gestión de Cambios

### Cambios Compatibles (No Breaking)

Ejemplos de cambios que NO requieren nueva versión major:

- Agregar nuevos endpoints
- Agregar campos opcionales a requests
- Agregar campos a responses
- Agregar nuevos códigos de error
- Mejorar descripciones

**Proceso:**
1. Actualizar el contrato en el servicio
2. Validar localmente
3. Copiar a `/contracts` con el mismo nombre
4. Crear PR para revisión

### Cambios Incompatibles (Breaking)

Ejemplos de cambios que REQUIEREN nueva versión major:

- Eliminar o renombrar endpoints
- Eliminar campos de responses
- Cambiar tipos de datos
- Hacer campos opcionales requeridos
- Cambiar la estructura de responses

**Proceso:**
1. Crear nuevo archivo `openapi-v{N+1}.yaml`
2. Documentar cambios en ADR
3. Planificar periodo de deprecación de versión anterior
4. Comunicar a consumidores de la API
5. Crear PR para revisión

### Architecture Decision Records (ADRs)

Los cambios significativos deben documentarse en ADRs:

```
docs/
└── adr/
    └── 001-cambio-estructura-orders.md
```

## Mejores Prácticas

### 1. Mantener Sincronización

Los contratos deben mantenerse sincronizados entre:
- `/services/{servicio}/docs/openapi.yaml` (desarrollo)
- `/contracts/{servicio}/openapi-v{N}.yaml` (oficial)

### 2. Revisión de Contratos

Todo cambio en contratos debe ser revisado por:
- Equipo de desarrollo del servicio
- Equipos consumidores de la API
- Arquitecto de software (para cambios mayores)

### 3. Documentación Completa

Cada contrato debe incluir:
- Descripciones claras de endpoints
- Ejemplos de requests/responses
- Códigos de error documentados
- Esquemas de seguridad
- Información de contacto

### 4. Validación Continua

- Ejecutar validación antes de cada commit
- Incluir validación en hooks de pre-commit
- Monitorear resultados de CI/CD

## Seguridad

### Autenticación

Todos los servicios utilizan JWT (JSON Web Tokens) para autenticación:

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

### Headers de Seguridad

Los contratos deben especificar headers de seguridad requeridos:

```yaml
parameters:
  - name: Authorization
    in: header
    required: true
    schema:
      type: string
      example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Recursos

### Documentación OpenAPI

- [OpenAPI Specification 3.0.3](https://spec.openapis.org/oas/v3.0.3)
- [Swagger Documentation](https://swagger.io/docs/)
- [Redocly Documentation](https://redocly.com/docs/)

### Herramientas

- [Redocly CLI](https://redocly.com/docs/cli/)
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/) - Para testing de APIs

### Guías del Proyecto

- [Contract Validation Guide](../services/orders-service/docs/CONTRACT_VALIDATION.md)
- [CI/CD Pipeline](../.github/workflows/ci.yml)
- [Project Documentation](../documentacion/)

## Contribuir

Para agregar o modificar contratos:

1. Leer la documentación de validación del servicio
2. Hacer cambios en el servicio primero
3. Validar el contrato localmente
4. Copiar a `/contracts`
5. Crear PR con descripción detallada
6. Esperar revisión del equipo

## Contacto

Para preguntas sobre contratos de API:
- Equipo: EconoMarket Development Team
- Documentación: [/documentacion](../documentacion/)
