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

## 6. IA administrada por Big O

Estas rutas se solicitan al mismo origen con `credentials: 'include'`. Requieren la cookie
httpOnly `session_token`; el navegador no envía ni recibe la credencial de PolyService y no
hace peticiones directas al proveedor.

### Capacidades y cuota visible

- Method: `GET`
- Path: `/api/ai/capabilities`
- Body: ninguno
- Respuesta exitosa (`200`):

```json
{
  "models": ["llama-8b-nvidia"],
  "defaultModel": "llama-8b-nvidia",
  "maxTokens": 512,
  "defaultMaxTokens": 256,
  "perUser": { "perMinute": 3, "perDay": 10 },
  "remaining": { "today": 9 }
}
```

`remaining.today` puede disminuir tras cada reserva. No garantiza capacidad global o por
minuto en la próxima llamada. Una sesión ausente o expirada devuelve `401` y la interfaz
redirige a `/views/login.html`.

### Chat

- Method: `POST`
- Path: `/api/ai/chat`
- Content-Type: `application/json`
- Body:

```json
{
  "messages": [
    { "role": "user", "content": "Explica un índice compuesto." }
  ],
  "maxTokens": 256
}
```

`messages` admite de 1 a 10 elementos, roles `system`, `user` o `assistant`, y hasta 4.000
caracteres por mensaje (12.000 agregados). `maxTokens` es opcional, entero de 1 a 512 y usa
`256` por defecto.

Respuesta exitosa (`200`):

```json
{
  "model": "llama-8b-nvidia",
  "message": { "role": "assistant", "content": "<assistant-content>" },
  "usage": {
    "promptTokens": 18,
    "completionTokens": 42,
    "totalTokens": 60
  },
  "remaining": { "today": 8 }
}
```

La interfaz conserva como máximo los últimos 10 mensajes en memoria para la siguiente
petición. **Nueva conversación** borra transcript y contexto; recargar hace lo mismo. No se
persisten prompts ni respuestas en el navegador ni en Big O. El backend conserva solo
metadatos de cuota, estado, latencia y conteos de tokens.

### Estados de error de IA

| HTTP | Comportamiento de la interfaz |
|---:|---|
| `400` | Muestra `Revisa el contenido del mensaje.` |
| `401` | Redirige al login. |
| `429` | Muestra `Alcanzaste el límite de uso de IA.` |
| `502` o `503` | Muestra `El servicio de IA no está disponible.` |
| `504` | Muestra `El servicio de IA tardó demasiado.` |
| Otro | Muestra un error genérico y seguro. |

La interfaz no muestra el body interno del error. El contenido del usuario y del modelo se
renderiza como texto, no como HTML.
