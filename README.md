# Software Avanzado — USAC
 
> **Facultad de Ingeniería · Escuela de Ciencias y Sistemas**
> Lic. Marco Tulio Aldana Prillwitz · Auxiliar: Xhunik Nikol Miguel Mutzutz
 
Este repositorio contiene la totalidad de entregas del curso **Software Avanzado**: tres prácticas individuales sobre el sistema **QuetzalShip** y tres fases del proyecto grupal **EconoMarket**. Cada entrega amplía la complejidad técnica de la anterior, cubriendo desde un microservicio gRPC básico hasta un sistema distribuido completo en Kubernetes con observabilidad, IaC y pruebas de carga.
 
---
 
## Badges de tecnologías
 
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=for-the-badge&logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GCP-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![MSSQL](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![Ansible](https://img.shields.io/badge/Ansible-EE0000?style=for-the-badge&logo=ansible&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Golang](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
 
---
 
## Índice
 
- [Estructura del repositorio](#estructura-del-repositorio)
- [Prácticas — QuetzalShip](#prácticas--quetzalship)
  - [Práctica 1 — gRPC Monolito SOLID](#práctica-1--grpc-monolito-solid)
  - [Práctica 2 — Microservicios + Gateway + Docker Compose](#práctica-2--microservicios--gateway--docker-compose)
  - [Práctica 3 — Kubernetes en GKE + Observabilidad + Locust](#práctica-3--kubernetes-en-gke--observabilidad--locust)
- [Proyecto — EconoMarket](#proyecto--economarket)
  - [Fase 1 — Base de microservicios + Docker Compose](#fase-1--base-de-microservicios--docker-compose)
  - [Fase 2 — Kubernetes + JWT + CI/CD](#fase-2--kubernetes--jwt--cicd)
  - [Fase 3 — Observabilidad + IaC + Panel Admin](#fase-3--observabilidad--iac--panel-admin)
- [Reglas de tagging Git](#reglas-de-tagging-git)
- [Cálculo de nota individual](#cálculo-de-nota-individual)
---
 
## Estructura del repositorio
 
```
.
├── practicas/
│   ├── practica1/          # QuetzalShip — gRPC NestJS puro
│   ├── practica2/          # QuetzalShip — Microservicios + Gateway + Docker Compose
│   └── practica3/          # QuetzalShip — GKE + ELK + Locust + FX
│
├── proyecto/
│   ├── fase1/              # EconoMarket — Base microservicios + Docker Compose + GCP VM
│   ├── fase2/              # EconoMarket — Kubernetes + JWT + CI/CD
│   └── fase3/              # EconoMarket — IaC (Terraform + Ansible) + Observabilidad
│
└── README.md
```
 
---
 
## Prácticas — QuetzalShip
 
El dominio de las tres prácticas es **QuetzalShip**: un sistema de gestión de órdenes de envío con cálculo tarifario determinista. Cada práctica reutiliza el mismo dominio y agrega capas de complejidad técnica.
 
### Dominio compartido (Prácticas 1, 2 y 3)
 
| Concepto | Valores |
|---|---|
| **Zona** | `METRO`, `INTERIOR`, `FRONTERA` |
| **Tipo de servicio** | `STANDARD`, `EXPRESS`, `SAME_DAY` |
| **Estado** | `ACTIVE`, `CANCELLED` |
| **Descuento** | `NONE`, `PERCENT` (máx. 35%), `FIXED` |
 
**Reglas de cálculo (obligatorias y exactas):**
 
```
volumetricKg         = (heightCm * widthCm * lengthCm) / 5000
billableKg           = max(weightKg, volumetricKg)
orderBillableKg      = Σ(billableKg)
rate(METRO)          = 8 Q/kg  |  rate(INTERIOR) = 12 Q/kg  |  rate(FRONTERA) = 16 Q/kg
baseSubtotal         = orderBillableKg * rate(destinationZone)
serviceSubtotal      = baseSubtotal * multiplier(serviceType)   // 1.00 | 1.35 | 1.80
fragileSurcharge     = 7 Q * cantidad_paquetes_frágiles
insuranceSurcharge   = 0.025 * Σ(declaredValueQ)  (si insuranceEnabled)
subtotalWithSurcharges = serviceSubtotal + fragileSurcharge + insuranceSurcharge
total                = round(subtotalWithSurcharges - descuento, 2)   // mín. 0.00
```
 
---
 
### Práctica 1 — gRPC Monolito SOLID
 
**Tags:** `P1-LEGACY` (versión funcional) · `P1-REFACTOR` (versión final con SOLID + tests)
 
**Stack:**
 
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=flat)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)
 
**Ubicación:** `practicas/practica1/`
 
**Descripción:** Microservicio gRPC puro con persistencia en memoria. El enfoque es la correcta aplicación de principios SOLID (SRP, OCP, ISP, DIP) y cobertura de unit tests con Jest.
 
**Operaciones gRPC expuestas:**
 
| RPC | Descripción |
|---|---|
| `CreateOrder` | Crea una orden, valida entradas y calcula desglose |
| `ListOrders` | Lista todas las órdenes (ACTIVE + CANCELLED) |
| `GetOrder` | Retorna detalle completo + desglose |
| `CancelOrder` | Cancela una orden (congela total, no elimina datos) |
| `GetReceipt` | Genera recibo estable con detalle + desglose |
 
**Estructura del proyecto:**
 
```
practicas/practica1/
├── src/
│   ├── orders/             # Módulo de órdenes (use cases, repositorio)
│   ├── pricing/            # Lógica de cálculo tarifario (aislada y testable)
│   ├── receipt/            # Generador de recibos
│   └── grpc/               # Capa de transporte gRPC (solo routing)
├── proto/
│   └── quetzalship.proto   # Contrato gRPC completo
├── test/                   # Unit tests con Jest
├── docs/
│   └── postman/
│       └── QuetzalShip.postman_collection.json
└── README.md
```
 
**Instalación y ejecución:**
 
```bash
cd practicas/practica1
npm install
npm run start          # Levanta el servidor gRPC (por defecto :5000)
npm test               # Ejecuta todos los unit tests
```
 
**Códigos gRPC manejados:**
 
| Escenario | Código |
|---|---|
| Validación fallida (dimensiones, seguro, descuento > 35) | `INVALID_ARGUMENT` |
| `orderId` inexistente | `NOT_FOUND` |
| Cancelar orden ya cancelada | `FAILED_PRECONDITION` |
 
**Contrato proto:** Ver `proto/quetzalship.proto`
**Colección Postman:** Ver `docs/postman/QuetzalShip.postman_collection.json`
 
---
 
### Práctica 2 — Microservicios + Gateway + Docker Compose
 
**Tag de entrega:** `P2-DELIVERY`
 
**Stack:**
 
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=flat)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)
 
**Ubicación:** `practicas/practica2/`
 
**Descripción:** El mismo dominio QuetzalShip se reimplementa como arquitectura de microservicios reales (separados por responsabilidad de negocio), orquestados por un API Gateway REST y consumidos desde un frontend Vite + TypeScript.
 
**Arquitectura de componentes:**
 
```
                          ┌──────────────────────────────────────┐
                          │           Docker Compose             │
                          │                                      │
  Browser ──► :5173 ──►  │  Frontend (Vite+TS)                  │
                          │       │ REST                         │
                          │       ▼                              │
              :3000 ──►  │  API Gateway (NestJS REST)           │
                          │       │ gRPC interno                 │
                          │  ┌────┼─────────┐                   │
                          │  ▼    ▼         ▼                   │
                          │ Orders  Pricing  Receipt             │
                          │ (NestJS gRPC — red interna)         │
                          └──────────────────────────────────────┘
```
 
**Reglas de frontera:**
- Frontend → **solo** Gateway (REST)
- Gateway → microservicios internos por **gRPC**
- No se permite consumo REST entre microservicios
**Estructura del proyecto:**
 
```
practicas/practica2/
├── services/
│   ├── frontend/           # Vite + TypeScript SPA
│   ├── gateway/            # NestJS REST + OpenAPI
│   ├── orders/             # NestJS gRPC — ciclo de vida de órdenes
│   ├── pricing/            # NestJS gRPC — cálculo tarifario
│   └── receipt/            # NestJS gRPC — generación de recibos
├── contracts/
│   ├── openapi/
│   │   └── quetzalship-gateway.yaml
│   └── proto/
│       ├── orders.proto
│       ├── pricing.proto
│       └── receipt.proto
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
└── README.md
```
 
**Ejecución local (un solo comando):**
 
```bash
cd practicas/practica2
docker compose up --build
# Frontend:  http://localhost:5173
# Gateway:   http://localhost:3000
# OpenAPI:   http://localhost:3000/api
```
 
**Endpoints REST del Gateway:**
 
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/v1/orders` | Crear orden (soporta `Idempotency-Key`) |
| `GET` | `/v1/orders` | Listar órdenes |
| `GET` | `/v1/orders/:orderId` | Detalle completo |
| `POST` | `/v1/orders/:orderId/cancel` | Cancelar orden |
| `GET` | `/v1/orders/:orderId/receipt` | Recibo estable |
 
**Pipeline CI (GitHub Actions):**
 
| Job | Trigger | Descripción |
|---|---|---|
| `quality` | PR + push | lint, unit tests, build frontend |
| `contracts` | PR + push | valida OpenAPI, compila `.proto` |
| `docker-build` | PR + push | build de las 5 imágenes |
| `docker-push` | push `main` / `release/**` | push al registry con tags |
 
**Reglas de tagging de imágenes:**
 
```
push a main:           main-<SHORT_SHA>   (+ opcional: main-latest)
push a release/vX.Y.Z: vX.Y.Z
pull request:          pr-<PR_NUMBER>-<SHORT_SHA>  (solo build, no push)
```
 
**Resiliencia e idempotencia:**
- Timeout gRPC configurable por env var (default 2s)
- Retries máx. 2 solo en errores transitorios (`UNAVAILABLE` / `DEADLINE_EXCEEDED`)
- Backoff simple: 100ms → 200ms
- Idempotencia en `POST /v1/orders` via `Idempotency-Key` header
---
 
### Práctica 3 — Kubernetes en GKE + Observabilidad + Locust
 
**Tag de entrega:** en repositorio `<NUM_GRUPO>_SoftwareAvanzado_Practica3`
 
**Stack adicional:**
 
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GKE-4285F4?style=flat&logo=googlecloud&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![MSSQL](https://img.shields.io/badge/SQL_Server-CC2927?style=flat&logo=microsoftsqlserver&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/ELK-005571?style=flat&logo=elasticsearch&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat&logo=grafana&logoColor=white)
 
**Ubicación:** `practicas/practica3/`
 
**Descripción:** El sistema QuetzalShip se despliega **completamente en GKE**. Se agrega un FX Service con caché Redis, persistencia real en MSSQL con PVC, observabilidad con ELK + Grafana, y pruebas de carga con Locust ejecutado desde dentro del cluster.
 
**Arquitectura en GKE:**
 
```
Internet
   │
   ▼
 Ingress (GKE)
   │
   ▼
API Gateway (NestJS) ──gRPC──► Orders Service ──► MSSQL (PVC)
   │                  ──gRPC──► Pricing Service
   │                  ──gRPC──► Receipt Service
   │                  ──gRPC──► FX Service ──► Redis (caché TTL)
   │                                       ──► API Externa A / B
   │
   ▼
Frontend (Vite+TS)
 
Observabilidad:
  Agente (Fluent Bit/Fluentd/Filebeat)
    │
    ▼
  Logstash ──► Elasticsearch ──► Kibana
                                ──► Grafana (datasource: Elasticsearch)
 
Pruebas de carga:
  Locust (Job/Deployment en GKE) ──► Ingress ──► API Gateway
```
 
**Estructura del proyecto:**
 
```
practicas/practica3/
├── services/
│   ├── frontend/
│   ├── gateway/
│   ├── orders/
│   ├── pricing/
│   ├── receipt/
│   └── fx/                 # FX Service: proveedor A + B + Redis fallback
├── k8s/
│   ├── app/                # Deployments, Services, Ingress de la app
│   ├── infra/              # MSSQL + PVC, Redis
│   ├── observability/      # ELK, agente de logs, Grafana
│   └── loadtest/           # Locust Job/Deployment
├── contracts/
│   ├── openapi/
│   └── proto/
├── .github/
│   └── workflows/
│       └── ci.yml          # Build → Test → Post-Build → Release → Deploy → Post-Deploy
├── docker-compose.yml      # Entorno de desarrollo local
└── docs/
    └── evidence/           # Capturas obligatorias (GKE, CI, ELK, Locust)
```
 
**Pipeline CI/CD completo:**
 
```
1. Build          ─ compila backend + frontend
2. Test           ─ unit tests + validación contratos (OpenAPI + .proto)
3. Post-Build     ─ build de imágenes Docker
4. Release        ─ push al registry con tags deterministas
5. Deploy         ─ kubectl apply → GKE
6. Post-Deploy    ─ smoke test (HTTP al Ingress) + trigger Locust
```
 
**FX Service — degradación elegante:**
 
```
Proveedor A disponible  ──► Usar A, actualizar Redis
Proveedor A falla       ──► Intentar Proveedor B
Ambos fallan + cache    ──► Usar última tasa de Redis (stale=true)
Ambos fallan, sin cache ──► Error controlado 503 (sin colapsar el sistema)
```
 
**Resiliencia en FX:**
- Timeout configurable por env var
- Retries limitados solo en errores transitorios
- Backoff exponencial
- Circuit breaker con umbrales documentados
**Dashboard Grafana (mínimo):**
- Filtro por servicio
- Filtro por nivel (`info` / `warn` / `error`)
- Búsqueda por `correlationId` / `requestId`
- Vista de errores agregada por intervalo de tiempo
**Ejecución local (desarrollo):**
 
```bash
cd practicas/practica3
docker compose up --build
```
 
**Despliegue en GKE:**
 
```bash
# Autenticar con el cluster
gcloud container clusters get-credentials <CLUSTER_NAME> --region <REGION>
 
# Aplicar manifiestos
kubectl apply -f k8s/infra/
kubectl apply -f k8s/app/
kubectl apply -f k8s/observability/
kubectl apply -f k8s/loadtest/
 
# Verificar estado
kubectl get pods,svc,ingress -n <namespace>
 
# Rollback en caso de error
kubectl rollout undo deployment/<nombre-deployment> -n <namespace>
```
 
---
 
## Proyecto — EconoMarket
 
**EconoMarket** es una plataforma e-commerce modular construida como arquitectura 100% de microservicios. El proyecto evoluciona en tres fases: base funcional, despliegue en Kubernetes con seguridad JWT, y sistema completamente operable con observabilidad e IaC.
 
### Stack base del proyecto
 
| Capa | Tecnologías |
|---|---|
| **Backend** | TypeScript, Golang, Python (mínimo 3 lenguajes) |
| **Frontend** | Vite (Vue / React) |
| **Comunicación interna** | gRPC |
| **Comunicación externa** | REST (via Gateway/BFF) |
| **Base de datos** | MS SQL Server |
| **Caché/Fallback** | Redis (solo para Proveedor Externo y FX) |
| **Seguridad** | JWT |
| **Nube** | Google Cloud Platform |
 
### Microservicios requeridos (≥ 6)
 
| Servicio | Responsabilidad |
|---|---|
| `users-auth-service` | Login, registro, emisión y validación JWT, roles |
| `catalog-service` | Productos, categorías, stock, proveedor dueño |
| `cart-checkout-service` | Carrito persistente, checkout, markup 10% |
| `orders-service` | Registro y estado de órdenes en MSSQL |
| `payments-wallet-service` | Pago con tarjeta/cartera/mixto, saldo wallet |
| `notifications-service` | Correos: stock bajo, post-compra, recordatorio carrito |
| `integrations-service` | Catálogos externos entre grupos + Redis caché/fallback |
| `fx-service` | Tipo de cambio (open.er-api.com) + caché TTL + degradación |
| `api-gateway` *(opcional)* | BFF centralizado para el frontend |
 
**Reglas de negocio clave:**
- Precio visible al cliente = precio base proveedor + 10% (markup invisible)
- Carrito inactivo > 24h con ítems → correo recordatorio
- Stock ≤ 10 → notificación al proveedor (anti-spam por producto)
- Seguro de catálogo externo: `LIVE` | `CACHED FALLBACK` | `UNAVAILABLE`
---
 
### Fase 1 — Base de microservicios + Docker Compose
 
**Tag de entrega:** en repositorio `<NUM_GRUPO>_SoftwareAvanzado_ProyectoFases`
 
**Stack:**
 
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![Golang](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![MSSQL](https://img.shields.io/badge/SQL_Server-CC2927?style=flat&logo=microsoftsqlserver&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
 
**Ubicación:** `proyecto/fase1/`
 
**Descripción:** Primera entrega del proyecto. Se construye la base funcional con todos los microservicios, persistencia real en MSSQL, caché Redis, integración entre grupos (Proveedor Externo) y conversión de moneda (FX). El sistema debe correr en local con Docker Compose y en una VM en Google Cloud.
 
**Estructura del proyecto:**
 
```
proyecto/fase1/
├── services/
│   ├── users-auth/
│   ├── catalog/
│   ├── cart-checkout/
│   ├── orders/
│   ├── payments-wallet/
│   ├── notifications/
│   ├── integrations/
│   └── fx/
├── frontend/
├── contracts/              # OpenAPI por servicio
├── docs/
│   ├── architecture/       # Vistas lógica, proceso, despliegue
│   ├── adr/                # Architecture Decision Records
│   └── requirements.pdf    # Documento de requerimientos
├── docker-compose.yml
├── .env.example
└── README.md
```
 
**Ejecución local:**
 
```bash
cd proyecto/fase1
 
# Copiar variables de entorno
cp .env.example .env
# Editar .env con credenciales reales
 
# Levantar todo el stack
docker compose up --build
 
# Verificar health de servicios
curl http://localhost:<GATEWAY_PORT>/health
```
 
**Endpoint de Proveedor Externo (homologado, sin JWT):**
 
```
GET /external-catalog/v1/products
```
 
Respuesta mínima por producto: `sku`, `name`, `price`, `stock`, `category`, `externalLabel: "Proveedor Externo"`, `groupNumber`.
 
**FX Service — proveedor homologado:**
 
```
https://open.er-api.com/v6/latest/USD
https://open.er-api.com/v6/latest/EUR
```
 
**Pipeline CI:**
- Stage `build`: imagen Docker por microservicio (multi-stage recomendado)
- Stage `test`: unit tests automáticos — falla el pipeline si alguno falla
- Rama `release/<vX>`: tag `[nombre-servicio]:<vX>` por imagen
**Exposición de puertos (regla de seguridad):**
 
```
✅ Públicos:  Frontend (HTTP/HTTPS) + Gateway/BFF
❌ Privados:  Redis, MSSQL (solo red interna de contenedores)
```
 
---
 
### Fase 2 — Kubernetes + JWT + CI/CD
 
**Stack adicional:**
 
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)
 
**Ubicación:** `proyecto/fase2/`
 
**Descripción:** EconoMarket se despliega en un cluster GKE real. El foco es el ciclo completo CI/CD, la seguridad JWT de extremo a extremo (Frontend → Gateway → microservicios) y la documentación técnica de arquitectura y operación.
 
**Estructura adicional (sobre Fase 1):**
 
```
proyecto/fase2/
├── k8s/
│   ├── deployments/        # Un Deployment por componente
│   ├── services/           # Un Service por Deployment
│   ├── ingress/            # Ingress: frontend + API pública
│   ├── configmaps/         # Config no sensible
│   └── secrets/            # JWT secret, credenciales DB, registry
├── .github/
│   └── workflows/
│       └── ci-cd.yml
└── docs/
    ├── architecture.md
    ├── jwt-flow.md
    ├── deployment-guide.md
    └── rollback.md
```
 
**Flujo JWT (extremo a extremo):**
 
```
1. POST /auth/login  ──► auth-service emite JWT (userId + roles + exp)
2. Frontend guarda el token y lo incluye en: Authorization: Bearer <token>
3. Gateway / microservicios verifican firma, expiración y claims mínimos
4. Sin token válido → 401 Unauthorized
5. Sin rol suficiente → 403 Forbidden
```
 
**Manifiestos Kubernetes mínimos:**
 
```bash
# Desplegar
kubectl apply -f k8s/
 
# Verificar rollout
kubectl rollout status deployment/<nombre> -n <namespace>
 
# Rollback
kubectl rollout undo deployment/<nombre> -n <namespace>
```
 
**Pipeline CI/CD:**
 
```
1. Build          ─ imágenes Docker con tag SHA + rama
2. Test           ─ unit tests + validación contratos OpenAPI
3. Publish        ─ push al registry (credenciales en secrets CI/CD)
4. Deploy         ─ kubectl apply -f k8s/  → cluster GKE
```
 
**Probes configuradas por Deployment:**
- `readinessProbe`: saber cuándo el pod está listo para tráfico
- `livenessProbe`: detectar contenedores en estado no recuperable
- `resources.requests/limits`: configurados en Gateway, auth-service y servicio de negocio principal
---
 
### Fase 3 — Observabilidad + IaC + Panel Admin
 
**Stack adicional:**
 
![Elasticsearch](https://img.shields.io/badge/ELK-005571?style=flat&logo=elasticsearch&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat&logo=grafana&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=flat&logo=terraform&logoColor=white)
![Ansible](https://img.shields.io/badge/Ansible-EE0000?style=flat&logo=ansible&logoColor=white)
 
**Ubicación:** `proyecto/fase3/`
 
**Descripción:** Versión final operable de EconoMarket. Se agrega panel administrativo (cupones y devoluciones), procesos cron con notificaciones, observabilidad completa (ELK + Prometheus + Grafana), hardening de seguridad y toda la infraestructura como código con Terraform y Ansible.
 
**Estructura adicional:**
 
```
proyecto/fase3/
├── services/
│   └── admin/              # Panel administrativo (cupones + devoluciones)
├── k8s/
│   ├── app/
│   ├── observability/      # ELK + Prometheus + Grafana + Fluentd
│   └── cronjobs/           # CronJob: recordatorio de carrito
├── iac/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── network/        # VPC + subredes + firewall + IAM
│   │   │   ├── gke/            # Cluster GKE + node pool
│   │   │   ├── database/       # Cloud SQL (MSSQL) fuera del cluster
│   │   │   ├── cloudrun_frontend/  # Frontend en Cloud Run
│   │   │   ├── registry/       # Container registry
│   │   │   └── loadtest_vm/    # VM para Locust
│   │   └── environments/
│   │       └── prod/
│   └── ansible/
│       ├── inventory/
│       └── roles/
│           ├── base_tools/     # Python, pip, dependencias
│           ├── locust/         # Instalación y configuración
│           └── test_runner/    # Scripts de carga + reportes
├── docs/
│   ├── runbook.md          # Operación: deploy, rollback, dashboards, cronjobs
│   ├── iac.md              # Terraform y Ansible: comandos, variables, outputs
│   └── backup.md           # Backup/restore MSSQL
└── INTEGRANTES.md
```
 
**Panel administrativo:**
 
| Funcionalidad | Detalle |
|---|---|
| **Cupones** | Crear/editar cupones (code, percent 1–100, expiresAt, maxUsesGlobal, maxUsesPerCustomer) |
| **Devoluciones** | Aprobar/rechazar solicitudes; wallet se acredita al aprobar |
| **Seguridad** | Solo rol `admin`: sin token → 401, sin rol → 403 |
| **Trazabilidad** | Log estructurado por acción: `adminId`, acción, entidad, timestamp |
 
**Cron jobs (Kubernetes CronJob):**
 
| Job | Frecuencia | Descripción |
|---|---|---|
| `cart-reminder` | Configurable | Carritos inactivos > 24h → email (anti-spam: `lastReminderAt`) |
| `stock-alert` | Configurable | Stock ≤ 10 → email al proveedor (anti-spam por producto) |
 
**Infraestructura con Terraform:**
 
```bash
cd proyecto/fase3/iac/terraform/environments/prod
 
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```
 
**Outputs mínimos de Terraform:**
- URL del frontend en Cloud Run
- Endpoint público del Ingress/API
- Nombre y ubicación del cluster GKE
- Referencia de conexión a la DB (sin contraseñas)
**Configuración de Ansible:**
 
```bash
cd proyecto/fase3/iac/ansible
 
# Verificar sintaxis
ansible-playbook playbook.yml --syntax-check
 
# Lint
ansible-lint
 
# Ejecutar (configura VM de pruebas de carga)
ansible-playbook playbook.yml -i inventory/
```
 
**Observabilidad:**
 
| Herramienta | Rol |
|---|---|
| **Fluentd** | Captura logs de contenedores y los envía a Logstash |
| **Logstash** | Transforma e indexa en Elasticsearch (índice por microservicio) |
| **Elasticsearch** | Almacena y permite búsqueda de logs |
| **Kibana** | Dashboards: errores por servicio, tiempo de respuesta por endpoint |
| **Prometheus** | Recolecta métricas de `/metrics` por microservicio |
| **Node Exporter** | Métricas de sistema: CPU, memoria, red |
| **Grafana** | Conectado a Prometheus + Elasticsearch; alertas visuales |
 
**Hardening mínimo:**
- `resources.requests/limits` en todos los Deployments críticos
- `ServiceAccounts` + `Role/RoleBinding` con permisos mínimos (no cluster-admin)
- Credenciales en `Secrets` de Kubernetes y variables seguras en CI/CD
- Credenciales **nunca** versionadas en el repositorio
---
 
## Reglas de tagging Git
 
| Tag | Proyecto | Descripción |
|---|---|---|
| `P1-LEGACY` | Práctica 1 | Versión funcional mínima (gRPC operativo) |
| `P1-REFACTOR` | Práctica 1 | Versión final con SOLID + unit tests |
| `P2-DELIVERY` | Práctica 2 | Commit final de entrega |
| *(ver ci.yml)* | Práctica 3 | Tags de imágenes deterministas por SHA / release |
 
---
 
## Cálculo de nota individual
 
La nota individual se calcula a partir de la nota grupal y el aporte medido con **Git Fame** (LOC, commits y archivos modificados).
 
| Campo | Fórmula |
|---|---|
| **ÍNDICE** | `0.5 * LOC + 0.2 * COMMITS + 0.3 * FILES` *(P2/P3)* |
| **FACTOR** | `MIN(ÍNDICE / 20, 1)` |
| **NOTA INDIVIDUAL** | `NOTA GRUPAL * (0.6 + 0.4 * FACTOR)` |
 
> El aporte esperado por integrante (equipos de 5) es **20 puntos** en escala de 0 a 100.
 
---
 
*Universidad de San Carlos de Guatemala — Facultad de Ingeniería — ECYS — 2024*
 
