``` bash
cd services
docker-compose down
docker-compose up --build -d
docker-compose logs -f users-auth
```

### 1. Health Check

**Request**

- Método: GET  
- URL: `http://localhost:8080/health`

**Respuesta esperada**

- Código: `200 OK`  
- Body (ejemplo):


```json
{
"status": "healthy",
"service": "users-auth-service"
}
```

### 2. Registro de usuario (Register)

**Request**

- Método: POST  
- URL: `http://localhost:8080/api/v1/auth/register`  
- Headers:
  - `Content-Type: application/json`  
- Body:

```json
{
"email": "dilan@economarket.gt",
"password": "123456",
"first_name": "Dilan",
"last_name": "Garcia",
"nit": "1758456789123",
"phone": "+50253001234",
"role": "cliente"
}
```


**Respuesta esperada**

- Código: `201 Created`  
- Body (ejemplo):

### 3. Login de usuario

**Request**

- Método: POST  
- URL: `http://localhost:8080/api/v1/auth/login`  
- Headers:
  - `Content-Type: application/json`  
- Body:

```json
{
"email": "dilan@economarket.gt",
"password": "123456"
}
```

### 4. Perfil del usuario (Me)

**Request**

- Método: GET  
- URL: `http://localhost:8080/api/v1/auth/me`  
- Headers:
  - `Authorization: Bearer JWT_AQUI`

**Respuesta esperada**

- Código: `200 OK`  
- Body (ejemplo):

```json
{
"id": 1,
"email": "dilan@economarket.gt",
"first_name": "Dilan",
"last_name": "Garcia",
"nit": "1758456789123",
"phone": "+50253001234",
"role": "cliente",
"created_at": "2025-12-12T08:00:00Z",
"updated_at": "2025-12-12T08:00:00Z"
}
```


### 5. ValidateToken (gRPC)

**Precondición**

- Tener un JWT válido obtenido del endpoint `/api/v1/auth/login`.


**Comando grpcurl**
- localhost:50051 auth.AuthService/ValidateToken

```json
{
    "token":asdfasfasfasafsasd
}
```

- localhost:50051 auth.AuthService/GetUserById

```json
{
    "user_id":1
}
```