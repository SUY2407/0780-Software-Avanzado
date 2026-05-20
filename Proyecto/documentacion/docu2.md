# Proyecto 2

## 📌 Descripción
Proyecto 2 es una aplicación desarrollada como parte del proyecto académico, enfocada en resolver [describir brevemente el objetivo del proyecto].  
El sistema está diseñado bajo una arquitectura modular, escalable y fácil de mantener.

---

## 🏗️ Arquitectura del Proyecto

La aplicación sigue una arquitectura **cliente-servidor** con separación de responsabilidades:

### 🔹 Frontend
- Encargado de la interfaz de usuario.
- Consume la API del backend mediante HTTP/REST.
- Maneja la experiencia del usuario y validaciones básicas.

### 🔹 Backend
- Expone una API REST.
- Maneja la lógica de negocio.
- Se conecta a la base de datos.
- Gestiona autenticación, autorización y validaciones.

### 🔹 Base de Datos
- Almacena la información del sistema.
- Gestiona relaciones y persistencia de datos.

### 🔹 Flujo General
1. El usuario interactúa con el Frontend.
2. El Frontend envía peticiones al Backend.
3. El Backend procesa la lógica y consulta la base de datos.
4. El Backend responde al Frontend con los resultados.

---

## 🔐 Variables de Entorno

El proyecto utiliza variables de entorno para manejar configuraciones sensibles.  
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

# Puerto del servidor
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto2_db
DB_USER=usuario_db
DB_PASSWORD=password_db

# Autenticación
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1d

# URL del frontend
FRONTEND_URL=http://localhost:5173

## 👥 Distribución del Trabajo (5 personas)

Para asegurar una distribución equitativa de commits y responsabilidades (según **Git Fame**), el trabajo del **Proyecto 2** se organiza de la siguiente manera:

### 👤 Persona 1 – Dilan
- Users-Auth-Service (**TypeScript / NestJS**)
- API Gateway / BFF
- Documentación de contratos **Swagger / OpenAPI**

---

### 👤 Persona 2 – Isa
- Catalog-Service (**Go**)
- FX-Service (**Go**)
- Configuración de **Docker Compose**

---

### 👤 Persona 3 – Erick
- Cart-Checkout-Service (**Python**)
- Notifications-Service (**Python**)
- Pipeline de **CI con GitHub Actions**

---

### 👤 Persona 4 – Melvin
- Orders-Service (**TypeScript / NestJS**)
- Integrations-Service (**TypeScript / NestJS**)
- Configuración de **MS SQL Server** y manejo de **migraciones**

---

### 👤 Persona 5 – Sebas
- Frontend (**React + Vite**)
- Payments-Wallet-Service (**Go / Python**)
- Deployment en **Google Cloud** (VM + Docker Compose)

## 📌 Reglas de Negocio Críticas (Fase 1)

Las siguientes reglas son **obligatorias** para la primera fase del proyecto:

- **Markup invisible**  
  El precio visible al usuario es:  
  `precio base + 10%`  
  (El markup no debe mostrarse explícitamente al usuario).

- **Carrito persistente**  
  Si el usuario no ingresa por más de **1 día**, se debe enviar un **email recordatorio**.  
  ⚠️ No se permite el uso de schedulers; la validación debe realizarse en **login o navegación**.

- **Checkout**  
  El sistema debe permitir:
  - Pago con tarjeta
  - Pago con cartera
  - Pago mixto (tarjeta + cartera)

- **Notificaciones**
  - Email al proveedor cuando el stock sea **≤ 10**
  - Email al cliente después de una compra exitosa


## 🏗️ Arquitectura y Comunicación

- **Comunicación interna:**  
  gRPC entre microservicios

- **Frontend → Backend:**  
  REST expuesto a través del **API Gateway**

- **Base de Datos:**  
  **MS SQL Server** (obligatorio)

- **Cache:**  
  **Redis** utilizado únicamente por:
  - Integrations-Service
  - FX-Service

## ⚙️ Comandos Utilizados en el Proyecto

A continuación se detallan los principales comandos usados durante el desarrollo, ejecución y despliegue del **Proyecto 2**, organizados por tecnología.


## 🧱 Comandos Generales

```bash
# Clonar repositorio
git clone <url-repositorio>

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Ver estado del repositorio
git status

# Agregar cambios
git add .

# Commit
git commit -m "feat: descripción del cambio"

# Enviar cambios
git push origin feature/nueva-funcionalidad

# Construir y levantar todos los servicios
docker-compose up --build

# Levantar servicios en segundo plano
docker-compose up -d

# Detener servicios
docker-compose down

# Ver contenedores activos
docker ps

# Ver logs de un servicio
docker-compose logs nombre-servicio

# Crear proyecto NestJS
nest new users-auth-service

# Ejecutar en modo desarrollo
npm run start:dev

# Instalar dependencias
npm install

# Generar módulo
nest g module users

# Generar controlador
nest g controller auth

# Generar servicio
nest g service auth

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servicio
python main.py

# Inicializar módulo Go
go mod init catalog-service

# Ejecutar servicio
go run main.go

# Descargar dependencias
go mod tidy

# Compilar proyecto
go build

# Crear proyecto con Vite
npm create vite@latest frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Conectarse a SQL Server (ejemplo)
sqlcmd -S localhost -U sa -P <password>

# Ejecutar migraciones
npm run migration:run

# Ejecutar Redis (Docker)
docker run -d -p 6379:6379 redis

# Verificar conexión
redis-cli ping

```
