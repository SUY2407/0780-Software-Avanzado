# Arquitectura del Sistema – EconoMarket

## Visión General
EconoMarket está construido bajo una arquitectura 100% microservicios, donde cada servicio
es independiente, desacoplado y responsable de una única función del dominio.

La arquitectura permite:
- Escalabilidad independiente
- Despliegue modular
- Aislamiento de fallos
- Evolución tecnológica por servicio

## Componentes Principales

### Microservicios
- Users/Auth Service
- Catalog Service
- Cart & Checkout Service
- Orders Service
- Payments & Wallet Service
- Notifications Service
- Integrations Service
- FX Service
- (Opcional) API Gateway / BFF

### Comunicación
- gRPC para comunicación interna
- REST para consumo desde frontend
- Swagger/OpenAPI para contratos

## Persistencia
- MS SQL Server como base de datos principal
- Persistencia real por servicio (no en memoria)

## Caché y Resiliencia
- Redis usado únicamente como caché y fallback
- Aplicado en:
  - Integrations Service
  - FX Service

## Seguridad
- JWT para autenticación
- Roles a nivel de usuario
- Servicios internos protegidos

## Principios Aplicados
- Single Responsibility Principle
- Database per Service (lógico)
- Fail Fast + Degradación elegante
