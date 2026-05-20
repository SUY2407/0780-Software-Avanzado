#!/bin/bash

# Iniciar SQL Server en segundo plano
/opt/mssql/bin/sqlservr &

echo "========================================"
echo "Esperando a que SQL Server inicie..."
echo "========================================"
sleep 30s

# Ejecutar scripts de inicialización en orden
echo "========================================"
echo "1. Creando base de datos principal (EconoMarketDB)..."
echo "========================================"
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -C -i /usr/src/app/init-db.sql

echo "========================================"
echo "Todas las bases de datos inicializadas correctamente"
echo "========================================"

# Mantener SQL Server corriendo
wait