require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- API ROUTES MUST COME FIRST ---
const notesRouter = require("./routes/notes");
app.use("/api/notes", notesRouter); 
// API will now be at /api/notes (NOT /notes)

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname)));

// --- FALLBACK ROUTE ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- MongoDB CONNECT ---
mongoose
  .connect(process.env.MONGO_URI, { dbName: "studynotes" })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
