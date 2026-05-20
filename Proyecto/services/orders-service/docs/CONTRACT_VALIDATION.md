# Validación de Contratos OpenAPI - Orders Service

Este documento describe el proceso de validación de contratos OpenAPI para el servicio de órdenes (orders-service) de EconoMarket.

## Ubicación de los Contratos

Los contratos OpenAPI del servicio están almacenados en las siguientes ubicaciones:

- **Contrato de desarrollo**: `services/orders-service/docs/openapi.yaml`
- **Contrato versionado**: `contracts/orders-service/openapi-v1.yaml`

### Estructura de Directorios

```
12_SoftwareAvanzado_ProyectoFases/
├── contracts/
│   └── orders-service/
│       └── openapi-v1.yaml          # Contrato versionado (v1)
└── services/
    └── orders-service/
        └── docs/
            └── openapi.yaml          # Contrato de trabajo
```

## Versionamiento de Contratos

El contrato OpenAPI sigue el versionamiento semántico:

- **Versión actual**: `1.0.0`
- **Versión en rutas**: `/api/v1/orders`
- **Versión en archivo**: `openapi-v1.yaml`

Cuando se realicen cambios incompatibles en el contrato, se debe:

1. Incrementar la versión en `info.version`
2. Crear un nuevo archivo de contrato (ej: `openapi-v2.yaml`)
3. Documentar los cambios en un ADR (Architecture Decision Record)

## Herramientas de Validación

### Redocly CLI

El servicio utiliza **Redocly CLI** como herramienta principal de validación de contratos OpenAPI.

**Instalación:**
```bash
npm install --save-dev @redocly/cli
```

**Características:**
- Validación de sintaxis OpenAPI 3.0.3
- Linting de mejores prácticas
- Detección de errores de estructura
- Advertencias sobre posibles problemas

## Validación Automática en Pipeline

### CI/CD Pipeline

El pipeline de GitHub Actions (`/.github/workflows/ci.yml`) incluye validación automática del contrato OpenAPI.

**Ubicación en el pipeline:**
```yaml
orders-service:
  name: Orders Service (NestJS)
  steps:
    - name: Install dependencies
      run: npm ci

    - name: Validate OpenAPI Contract
      run: npm run validate:openapi

    - name: Run tests
      run: npm test
```

**Comportamiento:**
- Se ejecuta en cada push a `main`
- Se ejecuta en cada pull request
- **Falla la pipeline** si el contrato es inválido
- Muestra advertencias sin fallar el build

### Criterios de Validación

El pipeline verifica:

1. **Sintaxis válida**: El archivo YAML debe ser sintácticamente correcto
2. **Estructura OpenAPI**: Debe cumplir con la especificación OpenAPI 3.0.3
3. **Seguridad definida**: Todos los endpoints deben tener seguridad definida
4. **Respuestas completas**: Los endpoints deben incluir respuestas 4XX apropiadas
5. **Schemas válidos**: Todos los schemas deben estar correctamente definidos

## Validación Local

### Scripts Disponibles

El `package.json` del servicio incluye los siguientes scripts de validación:

#### 1. Validar Contrato de Desarrollo

```bash
npm run validate:openapi
```

Valida el archivo `docs/openapi.yaml` (contrato de trabajo).

#### 2. Validar Contrato Versionado

```bash
npm run validate:contract
```

Valida el archivo `contracts/orders-service/openapi-v1.yaml` (contrato oficial).

### Ejecución Manual

También puedes ejecutar la validación directamente con Redocly:

```bash
# Desde el directorio del servicio
npx redocly lint docs/openapi.yaml

# Con opciones adicionales
npx redocly lint docs/openapi.yaml --format stylish
npx redocly lint docs/openapi.yaml --skip-rule no-server-example.com
```

### Interpretación de Resultados

**Ejemplo de salida exitosa:**
```
✓ docs\openapi.yaml: validated in 30ms

Woohoo! Your API description is valid. 🎉
You have 1 warning.
```

**Ejemplo de salida con errores:**
```
❌ Validation failed with 6 errors and 5 warnings.

Error: Every operation should have security defined
  at #/paths/~1api~1v1~1orders/post
```

## Mejores Prácticas

### 1. Ejecutar Validación Antes de Commit

Siempre valida el contrato antes de hacer commit:

```bash
cd services/orders-service
npm run validate:openapi
```

### 2. Sincronizar Contratos

Después de actualizar `docs/openapi.yaml`, copia los cambios al contrato versionado:

```bash
cp services/orders-service/docs/openapi.yaml contracts/orders-service/openapi-v1.yaml
```

### 3. Documentar Cambios Importantes

Para cambios significativos en el contrato:

1. Crear un ADR (Architecture Decision Record)
2. Documentar la razón del cambio
3. Describir el impacto en consumidores
4. Incluir plan de migración si es necesario

### 4. Revisión de Contratos en PRs

Todos los cambios en contratos deben ser revisados:

- Verificar compatibilidad hacia atrás
- Validar que los cambios sean necesarios
- Asegurar que la documentación esté actualizada

## Configuración de Redocly

El servicio usa la configuración `recommended` por defecto de Redocly. Para personalizar las reglas, crear un archivo `.redocly.yaml`:

```yaml
# services/orders-service/.redocly.yaml
extends:
  - recommended

rules:
  no-server-example.com: warning  # Permite localhost en warnings
  security-defined: error         # Requiere seguridad en todos los endpoints
  operation-4xx-response: warning # Recomienda respuestas 4XX
```

## Seguridad en el Contrato

Todos los endpoints del servicio requieren autenticación mediante JWT:

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from the authentication service

security:
  - BearerAuth: []
```

## Troubleshooting

### Error: "Validation failed with X errors"

**Solución:**
1. Revisar los errores específicos en la salida
2. Corregir el archivo `docs/openapi.yaml`
3. Ejecutar `npm run validate:openapi` nuevamente

### Warning: "Server url should not point to localhost"

**Solución:**
- Este warning es aceptable para entornos de desarrollo
- Se puede suprimir añadiendo reglas en `.redocly.yaml`

### Pipeline falla en validación

**Solución:**
1. Ejecutar validación localmente: `npm run validate:openapi`
2. Corregir todos los errores encontrados
3. Hacer commit y push de los cambios
4. La pipeline debe pasar en el siguiente intento

## Recursos Adicionales

- [OpenAPI Specification 3.0.3](https://spec.openapis.org/oas/v3.0.3)
- [Redocly CLI Documentation](https://redocly.com/docs/cli/)
- [Redocly Linting Rules](https://redocly.com/docs/cli/rules/)

## Contacto

Para preguntas o problemas relacionados con la validación de contratos:
- Equipo: EconoMarket Development Team
- Documentación del proyecto: `/documentacion/`
