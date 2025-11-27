# API Reference

## Overview

Base URL: `http://localhost:3000`

All endpoints return JSON responses.

## Authentication

> Add authentication details here if applicable

## Endpoints

### Health Check

Check if the server is running.

**Request:**

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3000/health
```

---

### Example Resource

#### List Resources

**Request:**

```http
GET /api/resources
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `limit` | number | Max items to return | 10 |
| `offset` | number | Items to skip | 0 |

**Response:**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Resource 1"
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

**cURL Example:**

```bash
curl "http://localhost:3000/api/resources?limit=10&offset=0"
```

---

#### Get Resource by ID

**Request:**

```http
GET /api/resources/:id
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Resource ID |

**Response:**

```json
{
  "id": "1",
  "name": "Resource 1",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3000/api/resources/1
```

---

#### Create Resource

**Request:**

```http
POST /api/resources
Content-Type: application/json
```

**Body:**

```json
{
  "name": "New Resource"
}
```

**Response:**

```json
{
  "id": "2",
  "name": "New Resource",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "New Resource"}'
```

---

#### Update Resource

**Request:**

```http
PUT /api/resources/:id
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Updated Resource"
}
```

**Response:**

```json
{
  "id": "1",
  "name": "Updated Resource",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Resource"}'
```

---

#### Delete Resource

**Request:**

```http
DELETE /api/resources/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Resource deleted"
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

| Code                   | HTTP Status | Description          |
| ---------------------- | ----------- | -------------------- |
| `VALIDATION_ERROR`     | 400         | Invalid request data |
| `AUTHENTICATION_ERROR` | 401         | Not authenticated    |
| `AUTHORIZATION_ERROR`  | 403         | Not authorized       |
| `NOT_FOUND`            | 404         | Resource not found   |
| `CONFLICT_ERROR`       | 409         | Resource conflict    |
| `RATE_LIMIT_ERROR`     | 429         | Too many requests    |
| `INTERNAL_ERROR`       | 500         | Server error         |

### Error Examples

**Validation Error:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required"
  }
}
```

**Not Found:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

## Rate Limiting

> Add rate limiting details here if applicable

## Pagination

List endpoints support pagination:

```http
GET /api/resources?limit=10&offset=20
```

Response includes pagination info:

```json
{
  "data": [...],
  "total": 100,
  "limit": 10,
  "offset": 20
}
```

## Next Steps

- [Troubleshooting](04-TROUBLESHOOTING.md)
