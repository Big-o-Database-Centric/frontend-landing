# Contrato de endpoints — MongoDB sobre AWS

## 1. Crear una base de datos

- Method: POST
- Path: /databases
- Content-Type: application/json
- Body:

```json
{
  "databaseName": "empresa-abc"
}
```

### Respuesta exitosa (201 Created)

```json
{
  "id": "db_83fd9ab2",
  "database": "db_83fd9ab2",
  "username": "owner_db_83fd9ab2",
  "password": "aS9#21$PQ",
  "host": "cluster.mongodb.net",
  "port": 27017,
  "connectionString": "mongodb+srv://owner_db_83fd9ab2:aS9#21$PQ@cluster.mongodb.net/db_83fd9ab2",
  "createdAt": "2026-08-03T18:30:00Z"
}
```

## 2. Eliminar una base de datos

- Method: DELETE
- Path: /databases/{id}
- Respuesta: 204 No Content

## 3. Reset / regeneración de credenciales

- Method: POST
- Path: /databases/{id}/credentials/reset
- Respuesta exitosa (200 OK):

```json
{
  "database": "db_83fd9ab2",
  "username": "owner_db_83fd9ab2",
  "password": "nUeVa$Pass9",
  "connectionString": "mongodb+srv://owner_db_83fd9ab2:nUeVa$Pass9@cluster.mongodb.net/db_83fd9ab2",
  "rotatedAt": "2026-08-03T19:10:00Z"
}
```

## 4. Health check

- Method: GET
- Path: /health
- Respuesta:

```json
{
  "status": "ok"
}
```

## 5. Formato estándar de errores

Todas las respuestas de error siguen este formato:

```json
{
  "error": {
    "code": "CODE_AQUI",
    "message": "Mensaje descriptivo"
  }
}
```

### Códigos esperados

- 400: INVALID_REQUEST
- 401: UNAUTHORIZED
- 403: FORBIDDEN
- 404: DATABASE_NOT_FOUND
- 409: DATABASE_EXISTS o ROTATION_IN_PROGRESS
- 429: RATE_LIMIT
- 500: INTERNAL_ERROR
