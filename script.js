// -----------------------------
// CHECK LOGIN STATUS FOR NAVBAR
// -----------------------------
async function checkLoginStatus() {
    try {
        const res = await fetch("/api/auth/status", {
            credentials: "include"
        });

        const data = await res.json();

        const loginLink = document.getElementById("loginLink");
        const registerLink = document.getElementById("registerLink");
        const logoutLink = document.getElementById("logoutLink");

        if (data.loggedIn) {
            // Hide login/register
            if (loginLink) loginLink.style.display = "none";
            if (registerLink) registerLink.style.display = "none";

            // Show logout
            if (logoutLink) logoutLink.style.display = "inline-block";

            logoutLink.onclick = async () => {
                await fetch("/api/auth/logout", {
                    credentials: "include"
                });
                window.location.reload();
            };

        } else {
            // User is not logged in
            if (loginLink) loginLink.style.display = "inline-block";
            if (registerLink) registerLink.style.display = "inline-block";
            if (logoutLink) logoutLink.style.display = "none";
        }

    } catch (err) {
        console.error("Error checking login status:", err);
    }
}

checkLoginStatus();

class NotesManager {
    constructor() {
        // API base (same origin as server.js)
        this.apiBase = "/api/notes";
        this.init();
    }

    // Decide which page we are on
    init() {
        const page = window.location.pathname.split("/").pop();

        if (page === "" || page === "index.html") {
            this.loadNotes();
        } else if (page === "create.html") {
            this.handleCreateForm();
        } else if (page === "edit.html") {
            this.handleEditForm();
        }
    }

    // Clean text for HTML
    clean(text) {
        const div = document.createElement("div");
        div.textContent = text ?? "";
        return div.innerHTML;
    }

    // -------------------------
    // LOAD NOTES (GET /notes)
    // -------------------------
    async loadNotes() {
        const body = document.getElementById("notesTableBody");
        const empty = document.getElementById("emptyMessage");

        if (!body || !empty) return;

        try {
            const res = await fetch(this.apiBase);
            const notes = await res.json();

            if (!notes || notes.length === 0) {
                empty.style.display = "block";
                body.innerHTML = "";
                return;
            }

            empty.style.display = "none";

            body.innerHTML = notes.map(n => `
                <tr>
                    <td>${this.clean(n.title)}</td>
                    <td>${this.clean(n.course)}</td>
                    <td>${this.clean((n.content || "").substring(0, 50))}${(n.content || "").length > 50 ? "..." : ""}</td>
                    <td>${n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</td>
                    <td>
                        <a href="edit.html?id=${n._id}" class="btn-edit">Edit</a>
                        <button class="btn-delete" onclick="notesManager.deleteNote('${n._id}')">Delete</button>
                    </td>
                </tr>
            `).join("");

        } catch (err) {
            console.error("Error loading notes:", err);
        }
    }

    // -------------------------
    // CREATE NOTE (POST /notes)
    // -------------------------
    handleCreateForm() {
        const form = document.getElementById("noteForm");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("noteTitle").value.trim();
            const course = document.getElementById("noteCourse").value.trim();
            const content = document.getElementById("noteContent").value.trim();

            if (!title || !course || !content) return;

            try {
                await fetch(this.apiBase, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, course, content })
                });

                // Go back to dashboard
                window.location.href = "index.html";
            } catch (err) {
                console.error("Error creating note:", err);
            }
        });
    }

    // -------------------------
    // EDIT NOTE (GET + PUT /notes/:id)
    // -------------------------
    async handleEditForm() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        if (!id) {
            window.location.href = "index.html";
            return;
        }

        try {
            // Load existing note
            const res = await fetch(`${this.apiBase}/${id}`);
            const note = await res.json();

            // Fill form
            document.getElementById("editNoteTitle").value = note.title || "";
            document.getElementById("editNoteCourse").value = note.course || "";
            document.getElementById("editNoteContent").value = note.content || "";

            const form = document.getElementById("editNoteForm");
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const title = document.getElementById("editNoteTitle").value.trim();
                const course = document.getElementById("editNoteCourse").value.trim();
                const content = document.getElementById("editNoteContent").value.trim();

                if (!title || !course || !content) return;

                await fetch(`${this.apiBase}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, course, content })
                });

                window.location.href = "index.html";
            });

        } catch (err) {
            console.error("Error loading note for edit:", err);
            window.location.href = "index.html";
        }
    }

    // -------------------------
    // DELETE NOTE (DELETE /notes/:id)
    // -------------------------
    async deleteNote(id) {
        try {
            await fetch(`${this.apiBase}/${id}`, { method: "DELETE" });
            this.loadNotes();
        } catch (err) {
            console.error("Error deleting note:", err);
        }
    }
}

// Global instance used by HTML onclick
const notesManager = new NotesManager();
