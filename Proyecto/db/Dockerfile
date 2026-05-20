FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

# Copiar script de inicialización principal
COPY init-db.sql /usr/src/app/init-db.sql
COPY entrypoint.sh /usr/src/app/entrypoint.sh

# ---------------------------------------------------------
# CORRECCIÓN AGREGADA: Eliminar caracteres \r (Windows)
# ---------------------------------------------------------
RUN sed -i 's/\r$//' /usr/src/app/entrypoint.sh

# Dar permisos de ejecución
RUN chmod +x /usr/src/app/entrypoint.sh

USER mssql

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]