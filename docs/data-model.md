# QuickNotes Data Model

## 1. Overview

QuickNotes uses PostgreSQL as its primary relational database.

The database contains four entities:

1. users
2. notes
3. tags
4. note_tags

The model supports users owning multiple notes and notes having
multiple tags.

## 2. Entity Definitions

### users

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| id | BIGINT | Primary key | Unique user ID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email |
| password_hash | VARCHAR(255) | NOT NULL | Secure password hash |
| created_at | TIMESTAMPTZ | NOT NULL | Account creation time |

### notes

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| id | BIGINT | Primary key | Unique note ID |
| user_id | BIGINT | Foreign key, NOT NULL | Note owner |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | NOT NULL | Note body |
| created_at | TIMESTAMPTZ | NOT NULL | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update time |

### tags

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| id | BIGINT | Primary key | Unique tag ID |
| user_id | BIGINT | Foreign key, NOT NULL | Tag owner |
| name | VARCHAR(50) | NOT NULL | Tag name |
| created_at | TIMESTAMPTZ | NOT NULL | Creation time |

A user cannot create two tags with the same name.

### note_tags

| Column | Type | Key / Constraint | Description |
|---|---|---|---|
| note_id | BIGINT | Composite primary key, foreign key | Associated note |
| tag_id | BIGINT | Composite primary key, foreign key | Associated tag |
| created_at | TIMESTAMPTZ | NOT NULL | Association creation time |

## 3. Relationships

### One-to-many

One user can own many notes.

The relationship is represented by `notes.user_id`, which references
`users.id`.

One user can also own many tags. This relationship is represented
by `tags.user_id`, which references `users.id`.

### Many-to-many

A note can have many tags, and a tag can belong to many notes.

The `note_tags` junction table implements this relationship.

Its composite primary key `(note_id, tag_id)` prevents the same
tag from being attached to the same note more than once.

## 4. CREATE TABLE Statements

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_note_title
        CHECK (LENGTH(BTRIM(title)) BETWEEN 1 AND 100)
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_tags_user_name
        UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (note_id, tag_id),

    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_note_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);