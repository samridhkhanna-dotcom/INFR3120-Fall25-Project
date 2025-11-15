// Notes System 
class NotesManager {
    constructor() {
        // Load notes or creates empty list
        this.notes = JSON.parse(localStorage.getItem("studynotes")) || [];
        this.init();
    }

    // Decide which page logic to run
    init() {
        const page = window.location.pathname.split("/").pop(); //
        
        if (page === "index.html" || page === "") {
            this.showNotes();      // Dashboard
        } 
        else if (page === "create.html") {
            this.handleCreateForm(); // Create page
        } 
        else if (page === "edit.html") {
            this.handleEditForm();   // Edit page
        }
    }

    // Save notes back to storage
    save() {
        localStorage.setItem("studynotes", JSON.stringify(this.notes));
    }

    // Simple unique ID generator
    makeId() {
        return Date.now().toString(36);
    }

    // Create new note
    addNote(title, course, content) {
        this.notes.unshift({
            id: this.makeId(),
            title,
            course,
            content,
            createdAt: new Date().toISOString()
        });
        this.save();
    }

    // Find one note by ID
    getNote(id) {
        return this.notes.find(n => n.id === id);
    }

    // Update existing note
    updateNote(id, title, course, content) {
        const i = this.notes.findIndex(n => n.id === id);

        if (i !== -1) {
            this.notes[i] = {
                // Replace old content but keep other properties
                ...this.notes[i],
                title,
                course,
                content,
                updatedAt: new Date().toISOString()
            };
            this.save();
        }
    }

    // Delete a note
    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.save();
        this.showNotes(); // Refresh table
    }

    // Show notes on homepage table
    showNotes() {
        const body = document.getElementById("notesTableBody");
        const empty = document.getElementById("emptyMessage");
        if (!body) return;

        // If nothing saved, show empty message
        if (this.notes.length === 0) {
            body.innerHTML = "";
            empty.style.display = "block";
            return;
        }

        empty.style.display = "none";

        // Fill rows with note data
        body.innerHTML = this.notes.map(n => `
            <tr>
                <td>${this.clean(n.title)}</td>
                <td>${this.clean(n.course)}</td>
                <td>${this.clean(n.content.substring(0, 50))}${n.content.length > 50 ? "..." : ""}</td>
                <td>${new Date(n.createdAt).toLocaleDateString()}</td>
                <td>
                    <a href="edit.html?id=${n.id}" class="btn-edit">Edit</a>
                    <button class="btn-delete" onclick="notesManager.deleteNote('${n.id}')">Delete</button>
                </td>
            </tr>
        `).join(""); // Connects notes data in one line with edit and delete buttons 
    }

    // create note form
    handleCreateForm() {
        const form = document.getElementById("noteForm");
        if (!form) return;

        // When user submits form
        form.addEventListener("submit", e => {
            e.preventDefault();

            // User input
            const title = document.getElementById("noteTitle").value.trim();
            const course = document.getElementById("noteCourse").value;
            const content = document.getElementById("noteContent").value.trim();

            if (!title || !course || !content) return; // No empty fields allowed

            this.addNote(title, course, content);
            window.location.href = "index.html"; // Go back
        });
    }

    //  editing form
    handleEditForm() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        const note = this.getNote(id);

        // If note not found, return to homepage
        if (!note) {
            window.location.href = "index.html";
            return;
        }

        // Fill form with existing data
        document.getElementById("editNoteId").value = note.id;
        document.getElementById("editNoteTitle").value = note.title;
        document.getElementById("editNoteCourse").value = note.course;
        document.getElementById("editNoteContent").value = note.content;

        // Save edited note
        const form = document.getElementById("editNoteForm");
        form.addEventListener("submit", e => {
            e.preventDefault();

            const title = document.getElementById("editNoteTitle").value.trim();
            const course = document.getElementById("editNoteCourse").value;
            const content = document.getElementById("editNoteContent").value.trim();

            if (!title || !course || !content) return;

            this.updateNote(id, title, course, content);
            window.location.href = "index.html";
        });
    }

    // displayes new notes 
    clean(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

const notesManager = new NotesManager();
