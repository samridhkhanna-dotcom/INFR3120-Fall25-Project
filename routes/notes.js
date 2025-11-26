const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const auth = require("../middleware/auth");

// GET all notes for logged in user
router.get("/", auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.session.user.id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single note
router.get("/:id", auth, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.session.user.id });
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE note
router.post("/", auth, async (req, res) => {
    try {
        const newNote = new Note({
            title: req.body.title,
            course: req.body.course,
            content: req.body.content,
            user: req.session.user.id
        });

        await newNote.save();
        res.json(newNote);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE note
router.put("/:id", auth, async (req, res) => {
    try {
        const updated = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.session.user.id },
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE note
router.delete("/:id", auth, async (req, res) => {
    try {
        await Note.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
