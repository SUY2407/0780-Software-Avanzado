# Implementación de Autenticación JWT en Orders Service

## Resumen

Este servicio ahora requiere autenticación JWT válida para todas las operaciones. La autenticación se realiza mediante comunicación gRPC con el servicio `users-auth`.

## Características Implementadas

### 1. Validación de JWT
- Todos los endpoints REST requieren un token JWT válido en el header `Authorization`
- El token se valida mediante gRPC con el servicio de autenticación
- Tokens inválidos o expirados reciben código **401 (Unauthorized)**

### 2. Extracción de Información del Usuario
- El token JWT se decodifica para extraer:
  - `userId`: Identificador del usuario
  - `email`: Email del usuario
  - `role`: Rol del usuario (ej. "admin", "customer")

### 3. Control de Acceso por Roles
- Endpoints protegidos con verificación de roles
- Usuarios sin el rol requerido reciben código **403 (Forbidden)**

## Endpoints y Permisos

### Endpoints para Todos los Usuarios Autenticados

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/v1/orders` | Crear orden | JWT requerido |
| POST | `/api/v1/orders/from-cart` | Crear orden desde carrito | JWT requerido |
| GET | `/api/v1/orders/:id` | Obtener orden por ID | JWT requerido |
| GET | `/api/v1/orders/user/me` | Obtener órdenes del usuario actual | JWT requerido |

### Endpoints Solo para Administradores

| Método | Endpoint | Descripción | Roles Requeridos |
|--------|----------|-------------|------------------|
| GET | `/api/v1/orders` | Obtener todas las órdenes | admin |
| GET | `/api/v1/orders/user/:userId` | Obtener órdenes de un usuario específico | admin |
| PUT | `/api/v1/orders/:id/status` | Actualizar estado de orden | admin |

## Uso

### Autenticación

Todas las peticiones deben incluir el token JWT en el header:

```bash
Authorization: Bearer <token>
```

### Ejemplo con cURL

```bash
# Crear una orden
curl -X POST http://localhost:8084/api/v1/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "123",
        "productName": "Product Name",
        "quantity": 2,
        "unitPrice": 29.99
      }
    ]
  }'

# Obtener mis órdenes
curl -X GET http://localhost:8084/api/v1/orders/user/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Admin: Obtener todas las órdenes
curl -X GET http://localhost:8084/api/v1/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Códigos de Respuesta HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Orden creada exitosamente
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: Token no proporcionado, inválido o expirado
- **403 Forbidden**: Usuario no tiene permisos (rol incorrecto)
- **404 Not Found**: Recurso no encontrado

## Arquitectura

### Componentes Creados

1. **Guards**
   - `JwtAuthGuard`: Valida el token JWT con el servicio de autenticación
   - `RolesGuard`: Verifica que el usuario tenga los roles requeridos

2. **Decoradores**
   - `@CurrentUser()`: Extrae la información del usuario autenticado
   - `@Roles(...roles)`: Define los roles requeridos para un endpoint

3. **Cliente gRPC**
   - `AuthGrpcClient`: Cliente para comunicarse con el servicio de autenticación
   - Método `validateToken()`: Valida el token y retorna información del usuario

### Flujo de Autenticación

```
Cliente → Orders Service → Auth Service (gRPC)
                ↓
        Validación del Token
                ↓
        Extracción de Usuario
                ↓
        Verificación de Roles
                ↓
        Ejecución del Endpoint
```

## Configuración Kubernetes

### Variables de Entorno

La conexión con el servicio de autenticación se configura mediante:

```yaml
- name: AUTH_SERVICE_URL
  valueFrom:
    configMapKeyRef:
      name: orders-config
      key: AUTH_SERVICE_URL
```

Valor en ConfigMap: `users-auth:50051`

### Despliegue

Los archivos de configuración K8s están en `/k8s`:
- `configmap.yaml`: Incluye `AUTH_SERVICE_URL`
- `deployment.yaml`: Configuración del despliegue con variables de entorno
- `service.yaml`: Exposición del servicio
- `secret.yaml`: Credenciales sensibles

## Cambios Importantes en la API

### Antes vs Después

**Antes:**
```json
POST /api/v1/orders
{
  "userId": 123,
  "items": [...]
}
```

**Después:**
```json
POST /api/v1/orders
Authorization: Bearer <token>
{
  "items": [...]
}
```

El `userId` ahora se extrae automáticamente del token JWT, eliminando la posibilidad de que un usuario cree órdenes en nombre de otros.

### Nuevos Endpoints

- `GET /api/v1/orders/user/me`: Permite al usuario obtener sus propias órdenes sin conocer su userId

## Seguridad

### Mejoras Implementadas

1. **Autenticación Obligatoria**: Ningún endpoint es público
2. **Validación de Token**: Cada petición valida el token con el servicio de autenticación
3. **Autorización por Roles**: Operaciones administrativas requieren rol admin
4. **Extracción Segura de Usuario**: El userId se obtiene del token, no del request body
5. **Códigos HTTP Apropiados**: 401 para autenticación, 403 para autorización

### Recomendaciones

- Los tokens JWT deben tener un tiempo de expiración razonable
- Implementar rate limiting en el API Gateway
- Monitorear intentos de acceso no autorizados
- Rotar secretos regularmente en Kubernetes

## Documentación Swagger

La documentación OpenAPI/Swagger incluye:
- Esquema de autenticación Bearer
- Indicadores de seguridad en cada endpoint
- Códigos de respuesta 401/403 documentados

Acceso: `http://localhost:8084/api/docs` (cuando el servicio esté en ejecución)
