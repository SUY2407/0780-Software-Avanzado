# Despliegue en Google Cloud – EconoMarket

## Objetivo
Desplegar el sistema completo de microservicios en Google Cloud garantizando
reproducibilidad, seguridad y facilidad de validación.

## Infraestructura
- Google Compute Engine (VM)
- Docker
- Docker Compose

## Pasos de Despliegue

1. Crear una VM en Google Cloud
2. Conectarse vía SSH
3. Instalar Docker
4. Instalar Docker Compose
5. Clonar el repositorio del proyecto
6. Ejecutar el stack completo

```bash
docker-compose build
docker-compose up -d
