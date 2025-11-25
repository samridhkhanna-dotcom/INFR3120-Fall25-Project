const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// --- TEST ROUTE ---
router.get("/test", (req, res) => {
    res.json({ message: "router works" });
});

// --- GET ALL NOTES ---
router.get("/", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GET ONE NOTE ---
router.get("/:id", async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CREATE NOTE ---
router.post("/", async (req, res) => {
    try {
        const newNote = await Note.create(req.body);
        res.json(newNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UPDATE NOTE ---
router.put("/:id", async (req, res) => {
    try {
        const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE NOTE ---
router.delete("/:id", async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
