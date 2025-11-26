const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const requireAuth = require("../middleware/auth");

// --- GET ALL NOTES (LOGIN REQUIRED) ---
router.get("/", requireAuth, async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GET ONE NOTE ---
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CREATE NOTE ---
router.post("/", requireAuth, async (req, res) => {
    try {
        const newNote = await Note.create(req.body);
        res.json(newNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UPDATE NOTE ---
router.put("/:id", requireAuth, async (req, res) => {
    try {
        const updated = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE NOTE ---
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
