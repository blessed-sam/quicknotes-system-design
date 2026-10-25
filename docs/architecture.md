# QuickNotes System Architecture

## 1. Overview

QuickNotes is evolving from a browser-based application into an
online note-taking service designed to support one million registered
users.

The proposed architecture separates the frontend, API application
servers, cache, database, and asynchronous processing.

The initial design prioritizes reliability, data integrity, and
horizontal scalability.

## 2. Functional Requirements

1. Users can register and authenticate.
2. Users can create notes with a required title and optional body.
3. Users can list and retrieve their notes.
4. Users can update and delete their notes.
5. Users can create tags and associate tags with notes.
6. Users can access only resources they are authorized to use.
7. Users receive meaningful validation and error messages.

## 3. Non-functional Requirements

### Availability

The service should target 99.9% monthly availability.

### Performance

Under normal load, the API should aim for a p95 response time below
300 ms for common note reads, excluding slow client networks.

### Scalability

Application servers should scale horizontally as traffic grows.

### Security

All external traffic uses HTTPS. Access tokens authenticate users,
and server-side authorization prevents access to other users' notes.

### Data integrity

PostgreSQL transactions, foreign keys, and backups protect stored data.

### Observability

Centralized logs, metrics, traces, and health checks help identify
and diagnose failures.

### Recovery

Automated backups and tested restoration procedures reduce data-loss
risk. Recovery objectives must be agreed upon with the business.

## 4. Load Estimates for One Million Users

The following estimates are planning assumptions, not measured
production statistics.

### Assumptions

- Registered users: 1,000,000.
- Daily active users: 20%, or 200,000.
- Each daily active user views 100 notes per day.
- Each daily active user creates 5 notes per day.
- Each note averages 2 KB of stored content and metadata.
- The service runs continuously for 365 days per year.
- Initial storage estimates exclude indexes, replicas, backups,
  logs, and temporary files.
- Traffic is averaged over 24 hours; peak traffic may be higher.

### Reads per second

Daily reads:

200,000 active users × 100 reads
= 20,000,000 reads per day.

Average reads per second:

20,000,000 / 86,400
≈ 231 reads per second.

### Writes per second

Daily writes:

200,000 active users × 5 notes
= 1,000,000 note creations per day.

Average writes per second:

1,000,000 / 86,400
≈ 11.6 writes per second.

This estimate counts note creations only. Updates, deletes, tag changes,
and other writes would increase the total.

### Storage per year

Daily new note storage:

1,000,000 notes × 2 KB
= 2,000,000 KB per day.

Approximate yearly storage:

2,000,000 KB × 365
= 730,000,000 KB per year.

Using decimal units, this is approximately 730 GB per year.

This is raw new-note storage before indexes, replicas, backups, and
operational overhead.

If all notes are retained, storage will accumulate over time.

### Peak traffic planning

Average traffic is not enough to size production infrastructure.

If peak traffic is five times the average, initial planning should
allow for approximately:

- 1,155 reads per second.
- 58 note creations per second.

Load tests and real production metrics should refine these assumptions.

## 5. Architecture Diagram

```text
                     Users / Browsers
                            |
                            v
                           DNS
                            |
                            v
                           CDN
                            |
                            v
                      Load Balancer
                            |
                 +----------+----------+
                 |                     |
                 v                     v
          Application Server A   Application Server B
                 |                     |
                 +----------+----------+
                            |
               +------------+------------+
               |                         |
               v                         v
             Cache                 Primary Database
                                       PostgreSQL
                                            |
                                            v
                                      Read Replica

Application Servers
       |
       v
      Queue
       |
       v
     Worker
       |
       +----> Notifications / Background Tasks