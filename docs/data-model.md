# QuickNotes Data Model

## 1. Introduction

QuickNotes is a note-taking application designed to allow users to
create, retrieve, update, delete, and organize their personal notes.

As the application grows toward one million registered users, it needs
a database design that maintains data integrity, supports efficient
queries, and allows the service to scale.

This document describes the relational data model proposed for the
QuickNotes production system.

The database will use PostgreSQL as its primary relational database
management system (RDBMS).

The model contains four main entities:

1. Users
2. Notes
3. Tags
4. Note_Tags

These entities support user accounts, note storage, note categorization,
and the relationships between notes and tags.

The design uses primary keys, foreign keys, unique constraints,
NOT NULL constraints, check constraints, and indexes to protect
data integrity and improve query performance.

---

## 2. Database Design Objectives

The database design should satisfy the following objectives.

### 2.1 Data integrity

Every note must belong to an existing user.

Every tag must belong to an existing user.

Every note-tag association must reference an existing note and tag.

Primary keys prevent duplicate record identifiers, while foreign
keys prevent references to nonexistent records.

### 2.2 Data security

Users must only access notes and tags they are authorized to use.

The application server must obtain the authenticated user's identity
from a trusted authentication mechanism rather than trusting a user ID
submitted by the client.

Database relationships alone do not enforce every authorization rule.
The application must verify ownership before reading, modifying,
or deleting resources.

### 2.3 Query performance

The database must efficiently retrieve a user's notes, find individual
notes, and retrieve tags associated with notes.

Indexes will be added to support common query patterns.

### 2.4 Scalability

The design should support increasing numbers of users, notes,
and tags without requiring a complete redesign.

PostgreSQL supports transactions, indexes, read replicas, and other
techniques that can help the service grow.

### 2.5 Maintainability

The schema should be understandable to developers and maintainers.

Using clearly defined entities and relationships reduces unnecessary
duplication and makes future changes easier.

---

## 3. Database Entities

### 3.1 Users Entity

The users table stores account information for people using QuickNotes.

Each user has a unique identifier and email address.

A user can own many notes and many tags.

#### Table: users

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary key, identity | Unique identifier for each user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Secure password hash |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Time the account was created |

#### Column explanations

**id**

The id column uniquely identifies each user.

It is the primary key of the users table.

BIGINT provides a large range of integer values, while PostgreSQL's
identity feature generates identifiers automatically.

**email**

The email column stores the user's email address.

The UNIQUE constraint prevents two accounts from using the same
email address.

The application should normalize email addresses consistently
before checking or storing them.

**password_hash**

This column stores a password hash rather than a plaintext password.

Passwords should be hashed using an appropriate password-hashing
algorithm such as Argon2id, with secure parameters.

The application must never store users' plaintext passwords.

**created_at**

This column records when the account was created.

TIMESTAMPTZ stores a timestamp with time-zone-aware semantics.
PostgreSQL normalizes the stored instant, and applications should
use UTC consistently when exchanging timestamps.

---

### 3.2 Notes Entity

The notes table stores the notes created by users.

Each note belongs to exactly one user.

A user may create many notes, but a note cannot exist without
an owner under this data model.

#### Table: notes

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary key, identity | Unique identifier for each note |
| user_id | BIGINT | NOT NULL, foreign key | Identifies the owner of the note |
| title | VARCHAR(100) | NOT NULL, CHECK | Title of the note, maximum 100 characters |
| body | TEXT | NOT NULL, DEFAULT '' | Main content of the note |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Time the note was created |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Time the note was last updated |

#### Column explanations

**id**

The id column uniquely identifies every note.

It is the primary key of the notes table.

**user_id**

The user_id column identifies the user who owns the note.

It references users.id through a foreign key.

The NOT NULL constraint ensures that every note has an owner.

**title**

The title column stores the note's title.

VARCHAR(100) limits the stored title to 100 characters.

A CHECK constraint ensures that the title is not empty or composed
only of whitespace.

The application should also trim and validate titles before inserting
or updating records.

**body**

The body column stores the note's main content.

PostgreSQL's TEXT type allows variable-length text without requiring
an arbitrary short limit.

The DEFAULT '' constraint allows notes to have an empty body.

This supports the application requirement that the title is required
while the body is optional.

**created_at**

The created_at column records when the note was first created.

The value should remain unchanged during ordinary note updates.

**updated_at**

The updated_at column records the most recent modification time.

The application must update this value whenever a note changes.
Alternatively, a database trigger can enforce the update automatically.

---

### 3.3 Tags Entity

The tags table stores labels used to categorize notes.

Examples of tags include:

- Work
- Study
- Personal
- Projects
- Ideas

Each tag belongs to one user.

A user can create many tags, and the same user cannot create two
tags with identical names under this design.

Different users may use the same tag name.

For example, two different users can both create a tag named "Work".

#### Table: tags

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary key, identity | Unique identifier for each tag |
| user_id | BIGINT | NOT NULL, foreign key | Identifies the tag's owner |
| name | VARCHAR(50) | NOT NULL | Name of the tag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Time the tag was created |

#### Column explanations

**id**

The id column uniquely identifies a tag.

It is the primary key of the tags table.

**user_id**

The user_id column identifies the user who owns the tag.

It references users.id.

The NOT NULL constraint ensures that every tag has an owner.

**name**

The name column stores the tag's name.

VARCHAR(50) provides a reasonable maximum length for a tag name.

The UNIQUE constraint on (user_id, name) prevents duplicate tag names
for the same user.

If the application requires case-insensitive uniqueness, it can use
a suitable normalized representation or a case-insensitive index.

**created_at**

This column records when the tag was created.

---

### 3.4 Note_Tags Entity

The note_tags table connects notes and tags.

It is known as a junction table or associative table.

A note can have multiple tags, and a tag can be associated with
multiple notes.

For example:

A note titled "Prepare project presentation" might have the tags
"Work" and "Projects".

Another note titled "Study database concepts" might have the tags
"Study" and "Projects".

The junction table represents these associations without repeating
the note or tag information in every association.

#### Table: note_tags

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| note_id | BIGINT | NOT NULL, foreign key, composite primary key | Identifies the associated note |
| tag_id | BIGINT | NOT NULL, foreign key, composite primary key | Identifies the associated tag |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Time the association was created |

#### Column explanations

**note_id**

The note_id column references notes.id.

It identifies the note receiving the tag.

**tag_id**

The tag_id column references tags.id.

It identifies the tag being associated with the note.

**created_at**

This column records when the association was created.

#### Composite primary key

The primary key consists of both note_id and tag_id.

PRIMARY KEY (note_id, tag_id)

This combination prevents the same tag from being associated with
the same note more than once.

For example, the following duplicate associations are not permitted:

| note_id | tag_id |
|---|---|
| 101 | 1 |
| 101 | 1 |

The pair must be unique.

---

## 4. Relationships Between Entities

The data model contains one-to-many and many-to-many relationships.

### 4.1 Users and Notes: One-to-Many

One user can create many notes.

Each note belongs to one user.

Relationship:

users.id -> notes.user_id

Example:

A user with id 1 may own notes 101, 102, and 103.

| User ID | Note ID | Note Title |
|---|---|---|
| 1 | 101 | Meeting notes |
| 1 | 102 | Study plan |
| 1 | 103 | Project ideas |

The foreign key notes.user_id references users.id.

The ON DELETE CASCADE rule means that deleting a user also deletes
that user's notes.

This behavior should only be used after the service has applied its
account-deletion, retention, and recovery policies.

### 4.2 Users and Tags: One-to-Many

One user can create many tags.

Each tag belongs to one user.

Relationship:

users.id -> tags.user_id

Example:

User 1 might create the tags "Work", "Study", and "Personal".

The tags.user_id foreign key identifies the owner.

The UNIQUE constraint on (user_id, name) prevents that user from
creating duplicate tag names.

### 4.3 Notes and Tags: Many-to-Many

A note can have many tags.

A tag can be associated with many notes.

The relationship is implemented through the note_tags junction table.

Relationships:

notes.id -> note_tags.note_id

tags.id -> note_tags.tag_id

Example:

| Note ID | Note Title | Tag ID | Tag Name |
|---|---|---|---|
| 101 | Meeting notes | 1 | Work |
| 101 | Meeting notes | 3 | Projects |
| 102 | Study plan | 2 | Study |
| 102 | Study plan | 3 | Projects |

Note 101 has two tags.

Tag 3 is associated with both notes 101 and 102.

This is a many-to-many relationship.

The junction table avoids storing a list of tag IDs in a single
notes column and makes associations easier to query and maintain.

### 4.4 Referential Integrity

Foreign keys ensure that references point to existing records.

For example, a note cannot reference a user who does not exist.

The database also uses ON DELETE CASCADE for note-tag associations.

Deleting a note removes its associations from note_tags.

Deleting a tag removes its associations from note_tags.

These rules prevent orphaned association records.

### 4.5 Ownership Integrity Between Notes and Tags

A note and a tag should belong to the same user.

The simple foreign keys in this design ensure that both records exist,
but they do not, by themselves, ensure that their user_id values match.

The application must validate ownership when associating a tag
with a note.

For stronger database-level enforcement, the schema can introduce
composite foreign keys that include user_id in the relevant tables.

That stricter design is discussed in the implementation considerations
section below.

---

## 5. Complete SQL Schema

The following SQL statements create all four tables.

They are intended for PostgreSQL.

The tables must be created in dependency order:

1. users
2. notes
3. tags
4. note_tags

This order ensures that referenced tables exist before their
foreign keys are declared.

### 5.1 Create the Users Table

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);