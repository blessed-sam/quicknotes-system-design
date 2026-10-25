"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const submitButton = document.getElementById("submit-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const notesList = document.getElementById("notes-list");
const statusMessage = document.getElementById("status");

let notes = [];

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {
      data: null,
      status: response.status,
    };
  }

  const data = await response.json();

  return {
    data,
    status: response.status,
  };
}

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");

    emptyItem.className = "empty-message";
    emptyItem.textContent = "No notes to display. Load or create a note.";

    notesList.appendChild(emptyItem);
    return;
  }

  for (const note of notes) {
    const item = document.createElement("li");
    item.className = "note-item";

    const title = document.createElement("h3");
    title.textContent = note.title || "Untitled note";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.dataset.noteId = String(note.id);

    item.append(title, body, deleteButton);
    notesList.appendChild(item);
  }
}

async function loadNotes() {
  loadButton.disabled = true;

  showStatus("Loading notes...", "loading");

  try {
    const result = await request(`${API_URL}?_limit=10`);

    notes = result.data;

    renderNotes();

    if (notes.length === 0) {
      showStatus("No notes were found.", "success");
    } else {
      showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    console.error("Unable to load notes:", error);

    showStatus(
      "Unable to load notes. Please check your connection and try again.",
      "error",
    );
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title for your note.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must not exceed 100 characters.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;

  showStatus("Creating note...", "loading");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1,
      }),
    });

    const newNote = result.data;

    notes.unshift(newNote);

    renderNotes();

    noteForm.reset();

    showStatus(
      `Note created (status ${result.status}, id ${newNote.id}).`,
      "success",
    );
  } catch (error) {
    console.error("Unable to create note:", error);

    showStatus("Unable to create the note. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(noteId, button) {
  button.disabled = true;

  showStatus("Deleting note...", "loading");

  try {
    await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
      method: "DELETE",
    });

    notes = notes.filter((note) => String(note.id) !== String(noteId));

    renderNotes();

    showStatus("Note deleted successfully.", "success");
  } catch (error) {
    console.error("Unable to delete note:", error);

    showStatus("Unable to delete the note. Please try again.", "error");

    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);

noteForm.addEventListener("submit", createNote);

notesList.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");

  if (!button || !notesList.contains(button)) {
    return;
  }

  deleteNote(button.dataset.noteId, button);
});
