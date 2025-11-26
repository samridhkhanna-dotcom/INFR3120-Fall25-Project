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

        // Nav links for Dashboard / Create
        const dashboardNav = document.querySelector('nav a[href="index.html"]');
        const createNav = document.querySelector('nav a[href="create.html"]');
        const heroCreateBtn = document.querySelector(".dashboard-btn");

        const page = window.location.pathname.split("/").pop();
        const protectedPages = ["", "index.html", "create.html", "edit.html"];

        if (data.loggedIn) {
            // Hide login/register
            if (loginLink) loginLink.style.display = "none";
            if (registerLink) registerLink.style.display = "none";

            // Show logout
            if (logoutLink) logoutLink.style.display = "inline-block";

            // Show dashboard/create links + hero button
            if (dashboardNav) dashboardNav.style.display = "inline-block";
            if (createNav) createNav.style.display = "inline-block";
            if (heroCreateBtn) heroCreateBtn.style.display = "inline-block";

            // Logout click handler
            if (logoutLink) {
                logoutLink.onclick = async (e) => {
                    e.preventDefault();
                    await fetch("/api/auth/logout", {
                        credentials: "include"
                    });
                    window.location.href = "login.html";
                };
            }

        } else {
            // Not logged in: show login/register
            if (loginLink) loginLink.style.display = "inline-block";
            if (registerLink) registerLink.style.display = "inline-block";
            if (logoutLink) logoutLink.style.display = "none";

            // Hide dashboard/create + hero button
            if (dashboardNav) dashboardNav.style.display = "none";
            if (createNav) createNav.style.display = "none";
            if (heroCreateBtn) heroCreateBtn.style.display = "none";

            // If they are on a protected page, send to login
            if (protectedPages.includes(page)) {
                window.location.href = "login.html";
            }
        }

    } catch (err) {
        console.error("Error checking login status:", err);
    }
}

checkLoginStatus();

// -----------------------------
// NOTES MANAGER (USES SESSION)
// -----------------------------
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

    // Helper: if unauthorized, go to login
    async handleAuthFetch(url, options = {}) {
        const res = await fetch(url, {
            credentials: "include",
            ...options
        });

        if (res.status === 401) {
            // session expired / not logged in
            window.location.href = "login.html";
            return null;
        }

        return res;
    }

    // -------------------------
    // LOAD NOTES (GET /notes)
    // -------------------------
    async loadNotes() {
        const body = document.getElementById("notesTableBody");
        const empty = document.getElementById("emptyMessage");

        if (!body || !empty) return;

        try {
            const res = await this.handleAuthFetch(this.apiBase);
            if (!res) return; // redirected

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
                const res = await this.handleAuthFetch(this.apiBase, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, course, content })
                });

                if (!res) return; // maybe redirected

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    console.error("Error creating note:", data);
                    alert("Could not create note.");
                    return;
                }

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
            const res = await this.handleAuthFetch(`${this.apiBase}/${id}`);
            if (!res) return; // redirected

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

                const updateRes = await this.handleAuthFetch(`${this.apiBase}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, course, content })
                });

                if (!updateRes) return;

                if (!updateRes.ok) {
                    const data = await updateRes.json().catch(() => ({}));
                    console.error("Error updating note:", data);
                    alert("Could not update note.");
                    return;
                }

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
            const res = await this.handleAuthFetch(`${this.apiBase}/${id}`, {
                method: "DELETE"
            });

            if (!res) return;

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error("Error deleting note:", data);
                alert("Could not delete note.");
                return;
            }

            this.loadNotes();
        } catch (err) {
            console.error("Error deleting note:", err);
        }
    }
}

// Global instance used by HTML onclick
const notesManager = new NotesManager();
