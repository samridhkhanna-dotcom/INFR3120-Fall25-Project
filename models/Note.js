const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: String, required: true },
    content: { type: String, required: true },

    // Connect note → user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    createdAt: { type: Date, default: Date.now }
},
{
    collection: "notes"
});

module.exports = mongoose.model("Note", NoteSchema);
