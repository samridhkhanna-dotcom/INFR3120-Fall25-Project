const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }

},
{
    collection:"notes",
}
);
module.exports = mongoose.model("Note", NoteSchema);
