# Notes Application — System Design

## 1. Project Description

This project demonstrates the design and development of a notes application. Users can create, view, and delete notes through a simple web interface.

The project combines a client-side application with API design, database modelling, and system architecture documentation.

The frontend prototype uses HTML, CSS, and JavaScript to communicate with the JSONPlaceholder mock REST API. The accompanying documentation describes how a production-ready backend could support authentication, persistent storage, and growth to one million users.

### Project Objectives

- Build a functional client-side interface for managing notes.
- Learn how frontend applications communicate with REST APIs.
- Design API endpoints and consistent error responses.
- Model relational data and relationships using SQL.
- Understand how application infrastructure can scale to support many users.
- Practise documenting technical decisions for collaboration between frontend and backend engineers.

---

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structures the application interface |
| CSS3 | Styles the interface and supports responsive layouts |
| JavaScript | Handles user interactions and API requests |
| Fetch API | Sends HTTP requests to the API |
| JSONPlaceholder | Provides mock REST API responses for the frontend prototype |
| PostgreSQL | Proposed relational database for the production design |
| SQL | Defines the data model and retrieves related information |
| Git | Tracks changes to the project |
| GitHub | Hosts the repository and supports collaboration |

**Important:** PostgreSQL is part of the proposed production architecture. The current frontend prototype does not connect directly to a PostgreSQL database.

---

## 3. Project Structure

```text
quicknotes-system-design/
│
├── index.html
├── style.css
├── api.js
├── README.md
│
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

### File responsibilities

- `index.html` — Provides the page structure, note form, status message, and notes list.
- `style.css` — Controls the appearance of the application, including success and error messages.
- `api.js` — Handles API requests, form validation, loading states, and note operations.
- `docs/api-design.md` — Defines REST endpoints, request and response formats, and error handling.
- `docs/data-model.md` — Describes the database entities, relationships, SQL schema, and queries.
- `docs/architecture.md` — Explains the proposed system architecture, load estimates, request flows, and scaling decisions.

---

## 4. How to Run the Application

### Prerequisites

You need:

- A computer with a modern web browser.
- The project files downloaded or cloned to your computer.
- An internet connection to access JSONPlaceholder.

No backend server or database setup is required for the current frontend prototype.

### Option A: Open the HTML file directly

1. Open the project folder.
2. Locate `index.html`.
3. Double-click the file to open it in your browser.
4. Use the form to create notes and the interface controls to load or delete notes.

Some browser configurations may behave differently when files are opened directly. If the application does not work correctly, use Option B.

### Option B: Run with Visual Studio Code Live Server

1. Open the project folder in Visual Studio Code.
2. Open the Extensions panel.
3. Search for **Live Server** and install an appropriate Live Server extension if you do not already have one.
4. Open `index.html`.
5. Right-click inside the editor.
6. Select **Open with Live Server**.
7. Your browser should open the application at a local address similar to:

   `http://127.0.0.1:5500/index.html`

The exact port may differ.

### Testing the application

1. Click the button that loads notes.
2. Wait for the API response.
3. Confirm that the notes appear in the list.
4. Enter a title and, optionally, a note body.
5. Submit the form.
6. Try submitting the form without a title to test validation.
7. Try deleting a note.
8. Observe the status messages when requests succeed or fail.

Open your browser's developer tools and inspect the **Console** and **Network** tabs if you encounter errors.

### Important limitation of JSONPlaceholder

The frontend uses this mock API:

`https://jsonplaceholder.typicode.com/posts`

JSONPlaceholder simulates operations such as creating and deleting posts but does not permanently save those changes to its hosted dataset.

Consequently, a note created during a session may appear in the current interface without becoming a permanent server record. Reloading the application may restore the original mock data.

Permanent storage would require connecting the application to a real backend API and database.

---

## 5. API Overview

The production API is designed around REST principles and JSON request and response bodies.

The principal note operations are:

| HTTP method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/notes` | Retrieve a user's notes |
| GET | `/api/v1/notes/{id}` | Retrieve a specific note |
| POST | `/api/v1/notes` | Create a note |
| PUT | `/api/v1/notes/{id}` | Replace a note |
| PATCH | `/api/v1/notes/{id}` | Update selected note fields |
| DELETE | `/api/v1/notes/{id}` | Delete a note |

The proposed production API also defines tag-related endpoints and a consistent error response format.

For the full endpoint specifications, see [API Design](docs/api-design.md).

---

## 6. Database Overview

The proposed production data model contains four main entities:

- **Users:** Stores information about application users.
- **Notes:** Stores notes and associates each note with its owner.
- **Tags:** Stores labels that can be used to organize notes.
- **Note Tags:** Connects notes and tags through a many-to-many relationship.

PostgreSQL is proposed because the application needs structured relationships, foreign-key constraints, transactions, and reliable data integrity.

The database schema, SQL queries, indexes, and SQL-versus-NoSQL discussion are documented in [Data Model](docs/data-model.md).

---

## 7. System Architecture Overview

The proposed production architecture includes:

- DNS for domain-name resolution.
- A content delivery network (CDN) for distributing suitable static assets.
- A load balancer for distributing incoming requests.
- Multiple application servers for handling API requests.
- A cache for frequently accessed data.
- A primary PostgreSQL database for writes.
- A read replica for eligible read operations.
- A queue and background worker for asynchronous tasks.
- Monitoring, backups, and recovery procedures to improve reliability.

This architecture is a design proposal. The current frontend prototype does not implement or deploy these infrastructure components.

The detailed architecture, capacity estimates, request lifecycles, trade-offs, and failure-mitigation strategies are described in [Architecture](docs/architecture.md).

---

## 8. Security and Reliability Considerations

A production implementation should:

- Authenticate users before allowing access to private notes.
- Check resource ownership before reading, updating, or deleting notes.
- Validate user input on both the client and server.
- Use parameterized SQL queries to reduce SQL injection risk.
- Use HTTPS to protect data in transit.
- Avoid exposing credentials and sensitive information in client-side code.
- Return consistent HTTP status codes and error payloads.
- Use backups and test database recovery procedures.
- Monitor application errors, response times, and resource utilization.
- Protect against excessive request rates and oversized payloads.

Client-side validation improves usability, but server-side validation and authorization are essential because clients cannot be trusted to enforce security rules.

---

## 9. Git and Version Control

Git is used to track the development of the project, while GitHub hosts the repository.

Meaningful commits make it easier to review changes and understand how the project developed.

Examples of suitable commit messages include:

```text
Add API client with GET
Add create note with POST
Add delete with DELETE
Complete API design and error contract
Expand data model documentation
Complete architecture documentation
Document project setup in README
```

Each commit should represent a meaningful change rather than an empty commit or a repeated upload without a clear purpose.

To inspect the current state of the repository, run:

```bash
git status
```

To review recent commits, run:

```bash
git log --oneline
```

---

## 10. What I Learned

Through this project, I learned the following:

1. **REST API design:** I learned how HTTP methods, endpoints, status codes, and JSON payloads define a contract between frontend and backend applications.

2. **Asynchronous JavaScript:** I practised using `async` and `await`, handling failed requests, and managing loading, success, and error states.

3. **Secure DOM manipulation:** I learned to use `textContent` instead of inserting untrusted user input through `innerHTML`, reducing the risk of cross-site scripting vulnerabilities.

4. **Relational database design:** I learned how primary keys, foreign keys, and relationships connect users, notes, and tags in a relational database.

5. **SQL queries:** I practised retrieving, filtering, counting, and joining related data using SQL.

6. **System scalability:** I learned how to estimate requests per second and annual storage requirements, and how caches, load balancers, read replicas, and background workers can help a system handle increased demand.

7. **Reliability and trade-offs:** I learned that scaling requires more than adding servers. It also involves identifying single points of failure, planning backups, monitoring services, and deciding how to handle stale cached data.

8. **Technical documentation:** I learned how clear API contracts, database documentation, architecture diagrams, and setup instructions help different engineers collaborate effectively.

---

## 11. Future Improvements

Possible improvements include:

- Build and deploy a real backend API.
- Connect the backend to PostgreSQL for persistent note storage.
- Implement user registration, login, and authentication.
- Add note search, filtering, and pagination.
- Implement persistent tags and tag-based filtering.
- Add automated frontend and backend tests.
- Add structured logging, monitoring, and alerting.
- Test performance under simulated concurrent traffic.
- Configure database backups and test recovery procedures.
- Deploy the application using production infrastructure.

---

## 12. Conclusion

This project combines a working frontend prototype with documentation for a proposed production notes service.

The frontend demonstrates API communication and defensive client-side programming. The accompanying design documents describe how a backend, relational database, and scalable infrastructure could support a more complete application.

The next stage would be implementing and testing the real backend, connecting it to persistent storage, and validating the proposed architecture against realistic workloads.