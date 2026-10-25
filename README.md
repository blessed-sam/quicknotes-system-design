# QuickNotes System Design

## Description

QuickNotes is a note-taking application designed to demonstrate
frontend-to-API communication and document a scalable backend
architecture for one million registered users.

The frontend uses HTML, CSS, and JavaScript.

The API client uses JSONPlaceholder as a practice service to demonstrate
GET, POST, and DELETE requests.

The design documents describe the real API, relational database,
and scalable architecture proposed for a production QuickNotes service.

## Features

- Retrieve the first 10 notes from the API.
- Create notes with title validation.
- Delete notes from the displayed list.
- Display loading, success, error, and empty states.
- Disable relevant buttons while requests are running.
- Safely render note text using `textContent`.
- Document REST endpoints, database design, and system architecture.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md