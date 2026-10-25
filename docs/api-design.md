# API Design — Notes Application

## 1. Overview

This document defines the REST API contract for a notes application.

The API allows users to create, retrieve, update, delete, and organize notes using tags.

### Base URL

For local development:

```text
http://localhost:3000/api/v1
```

Production example:

```text
https://api.example.com/api/v1
```

The production domain is illustrative and must be replaced with the actual deployed domain.

### Data format

- Request format: JSON
- Response format: JSON, except where a response has no body
- Character encoding: UTF-8
- Authentication: Bearer token for protected endpoints
- API version: v1

Example authentication header:

```http
Authorization: Bearer <access_token>
```

---

## 2. Endpoint Summary

| Method | Endpoint           | Description                                        | Success status |
| ------ | ------------------ | -------------------------------------------------- | -------------- |
| GET    | `/notes`           | Retrieve notes belonging to the authenticated user | 200 OK         |
| GET    | `/notes/{id}`      | Retrieve one note by ID                            | 200 OK         |
| POST   | `/notes`           | Create a new note                                  | 201 Created    |
| PUT    | `/notes/{id}`      | Replace an existing note                           | 200 OK         |
| PATCH  | `/notes/{id}`      | Update selected note fields                        | 200 OK         |
| DELETE | `/notes/{id}`      | Delete a note                                      | 204 No Content |
| GET    | `/tags`            | Retrieve available tags for the authenticated user | 200 OK         |
| POST   | `/notes/{id}/tags` | Attach a tag to a note                             | 201 Created    |

All endpoints that access private notes require authentication.

The API must verify that the authenticated user owns the requested note. A user must not be able to read, update, or delete another user's private notes.

---

## 3. Common Response Conventions

### Successful response

Successful responses that return data use JSON.

Example:

```json
{
  "data": {
    "id": 101,
    "title": "Database revision",
    "body": "Review primary keys and foreign keys.",
    "created_at": "2026-10-26T08:00:00Z",
    "updated_at": "2026-10-26T08:00:00Z"
  }
}
```

### Error response

All API errors use a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      {
        "field": "title",
        "message": "The title is required."
      }
    ],
    "request_id": "req-123456"
  }
}
```

Fields:

| Field              | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `error.code`       | Machine-readable error identifier                         |
| `error.message`    | Human-readable explanation                                |
| `error.details`    | Optional information about individual validation failures |
| `error.request_id` | Identifier used to trace the request in server logs       |

The `details` field may be an empty array when there are no field-specific errors.

The server must never expose passwords, access tokens, database credentials, stack traces, or other sensitive internal information in an error response.

---

## 4. Retrieve All Notes

### Request

```http
GET /api/v1/notes?page=1&limit=20
Authorization: Bearer <access_token>
```

Optional query parameters:

| Parameter | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| `page`    | Integer | Page number, starting at 1       |
| `limit`   | Integer | Maximum number of notes per page |
| `q`       | String  | Search notes by title or body    |
| `tag`     | String  | Filter notes by tag              |

The server should enforce a reasonable maximum page size, such as 100 notes.

### Success response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "user_id": 12,
      "title": "Database revision",
      "body": "Review primary keys and foreign keys.",
      "created_at": "2026-10-26T08:00:00Z",
      "updated_at": "2026-10-26T08:00:00Z"
    },
    {
      "id": 102,
      "user_id": 12,
      "title": "API revision",
      "body": "Review REST methods and HTTP status codes.",
      "created_at": "2026-10-25T10:00:00Z",
      "updated_at": "2026-10-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 2,
    "total_pages": 1
  }
}
```

An empty collection should return `200 OK` with an empty `data` array.

---

## 5. Retrieve One Note

### Request

```http
GET /api/v1/notes/101
Authorization: Bearer <access_token>
```

### Success response

Status: `200 OK`

```json
{
  "data": {
    "id": 101,
    "user_id": 12,
    "title": "Database revision",
    "body": "Review primary keys and foreign keys.",
    "created_at": "2026-10-26T08:00:00Z",
    "updated_at": "2026-10-26T08:00:00Z"
  }
}
```

If the note does not exist, the server returns `404 Not Found`.

The server must also prevent users from retrieving notes they are not authorized to access.

---

## 6. Create a Note

### Request

```http
POST /api/v1/notes
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request body

```json
{
  "title": "Database revision",
  "body": "Review primary keys, foreign keys, and database indexes."
}
```

### Request schema

| Field   | Type   | Required | Rules                                                                   |
| ------- | ------ | -------- | ----------------------------------------------------------------------- |
| `title` | String | Yes      | Must contain non-whitespace characters; maximum 100 characters          |
| `body`  | String | No       | Text content; may be empty; enforce a documented server-side size limit |

The server obtains `user_id` from the authenticated user's identity. Clients must not be allowed to assign notes to arbitrary users by submitting a `user_id`.

Unknown fields should be rejected or handled according to a documented validation policy.

### Success response

Status: `201 Created`

```json
{
  "data": {
    "id": 103,
    "user_id": 12,
    "title": "Database revision",
    "body": "Review primary keys, foreign keys, and database indexes.",
    "created_at": "2026-10-26T09:30:00Z",
    "updated_at": "2026-10-26T09:30:00Z"
  }
}
```

The server generates the new note ID and timestamps.

The response should include a `Location` header identifying the new resource, for example:

```http
Location: /api/v1/notes/103
```

### Validation failure example

If the title is missing or contains only whitespace, return `400 Bad Request`.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      {
        "field": "title",
        "message": "The title is required and cannot be blank."
      }
    ],
    "request_id": "req-123456"
  }
}
```

---

## 7. Replace an Existing Note

### Request

```http
PUT /api/v1/notes/101
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request body

```json
{
  "title": "Updated database revision",
  "body": "Review indexes, joins, and foreign keys."
}
```

### Success response

Status: `200 OK`

```json
{
  "data": {
    "id": 101,
    "user_id": 12,
    "title": "Updated database revision",
    "body": "Review indexes, joins, and foreign keys.",
    "created_at": "2026-10-26T08:00:00Z",
    "updated_at": "2026-10-26T10:00:00Z"
  }
}
```

`PUT` replaces the editable representation of the note. The server preserves the note ID, owner, and original creation timestamp.

---

## 8. Partially Update a Note

### Request

```http
PATCH /api/v1/notes/101
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request body

```json
{
  "title": "Updated database notes"
}
```

Only supplied editable fields are changed.

### Success response

Status: `200 OK`

```json
{
  "data": {
    "id": 101,
    "user_id": 12,
    "title": "Updated database notes",
    "body": "Review indexes, joins, and foreign keys.",
    "created_at": "2026-10-26T08:00:00Z",
    "updated_at": "2026-10-26T10:15:00Z"
  }
}
```

---

## 9. Delete a Note

### Request

```http
DELETE /api/v1/notes/101
Authorization: Bearer <access_token>
```

### Success response

Status: `204 No Content`

The server deletes the note and returns no response body.

The server must verify that the authenticated user owns the note before deleting it.

---

## 10. Retrieve Tags

### Request

```http
GET /api/v1/tags
Authorization: Bearer <access_token>
```

### Success response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "study"
    },
    {
      "id": 2,
      "name": "work"
    }
  ]
}
```

---

## 11. Attach a Tag to a Note

### Request

```http
POST /api/v1/notes/101/tags
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request body

```json
{
  "tag_id": 1
}
```

### Success response

Status: `201 Created`

```json
{
  "data": {
    "note_id": 101,
    "tag_id": 1
  }
}
```

The server must confirm that the user is authorized to modify the note and use the specified tag.

---

## 12. Error Status Codes

| HTTP status                 | Error code         | Meaning                                                                    |
| --------------------------- | ------------------ | -------------------------------------------------------------------------- |
| `400 Bad Request`           | `VALIDATION_ERROR` | The request body or parameters are invalid                                 |
| `401 Unauthorized`          | `UNAUTHENTICATED`  | Authentication is missing or invalid                                       |
| `403 Forbidden`             | `FORBIDDEN`        | The user is authenticated but lacks permission                             |
| `404 Not Found`             | `NOT_FOUND`        | The requested resource does not exist or is not available to the requester |
| `500 Internal Server Error` | `INTERNAL_ERROR`   | An unexpected server-side failure occurred                                 |

### 400 — Bad Request

Example: the title is missing.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      {
        "field": "title",
        "message": "The title is required."
      }
    ],
    "request_id": "req-400001"
  }
}
```

### 401 — Unauthorized

Example: the request has no valid access token.

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Valid authentication credentials are required.",
    "details": [],
    "request_id": "req-401001"
  }
}
```

### 403 — Forbidden

Example: an authenticated user attempts an action they are not permitted to perform.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": [],
    "request_id": "req-403001"
  }
}
```

### 404 — Not Found

Example: the requested note cannot be found.

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": [],
    "request_id": "req-404001"
  }
}
```

For private resources, the API may return the same `404` response when a resource belongs to another user. This helps prevent disclosure of another user's data.

### 500 — Internal Server Error

Example: an unexpected failure occurs while processing a request.

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "details": [],
    "request_id": "req-500001"
  }
}
```

The server should record technical details in protected logs associated with the request ID, without exposing sensitive implementation details to the client.

---

## 13. Client and Server Responsibilities

### Client responsibilities

- Send valid JSON with the correct content type.
- Include authentication credentials when required.
- Validate required fields before submission.
- Handle successful responses and HTTP errors.
- Display appropriate loading, success, and error messages.
- Avoid inserting untrusted API data into the page as HTML.

### Server responsibilities

- Validate all input, even if the client already validates it.
- Authenticate requests and enforce resource ownership.
- Generate IDs and timestamps.
- Return consistent JSON error responses.
- Use parameterized database queries.
- Apply appropriate rate limits and request-size limits.
- Log unexpected failures without exposing sensitive information.
- Return the documented HTTP status codes.

---

## 14. Development Note: JSONPlaceholder

The frontend prototype uses JSONPlaceholder:

```text
https://jsonplaceholder.typicode.com/posts
```

JSONPlaceholder is a mock REST API. Its create, update, and delete operations simulate successful responses but do not permanently modify the hosted dataset.

Therefore, a newly created note may appear in the current browser interface but will not become a permanently stored server record. After reloading the application, the original mock data may appear again.

The production API described in this document would need a real backend and persistent database to store notes permanently.
