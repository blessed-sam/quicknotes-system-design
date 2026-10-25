# QuickNotes API Design

## 1. Overview

QuickNotes is a note-taking service that allows authenticated users
to create, view, update, delete, and organize their notes.

The API follows REST principles and communicates using JSON over HTTPS.

Base URL:

`https://api.quicknotes.example/v1`

Authentication uses bearer tokens.

Example request header:

`Authorization: Bearer <access_token>`

All timestamps use ISO 8601 format in UTC.

## 2. REST Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{id}` | Retrieve one note | 200 OK |
| POST | `/notes` | Create a note | 201 Created |
| PUT | `/notes/{id}` | Replace an existing note | 200 OK |
| PATCH | `/notes/{id}` | Partially update a note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List the user's tags | 200 OK |
| POST | `/notes/{id}/tags` | Associate a tag with a note | 201 Created |

## 3. List Notes

### Request

`GET /v1/notes?page=1&limit=20`

The server returns notes belonging to the authenticated user.

### Successful Response: 200 OK

```json
{
  "data": [
    {
      "id": 101,
      "title": "Meeting notes",
      "body": "Discuss the project timeline.",
      "created_at": "2026-10-26T08:00:00Z",
      "updated_at": "2026-10-26T08:00:00Z"
    },
    {
      "id": 102,
      "title": "Study plan",
      "body": "Review database concepts.",
      "created_at": "2026-10-26T08:30:00Z",
      "updated_at": "2026-10-26T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}