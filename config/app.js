const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const DB = require("./db");

const notesRouter = require("../routes/notes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static HTML/CSS/JS files
app.use(express.static(path.join(__dirname, "../")));

// Connect to MongoDB
mongoose.connect(DB.URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("MongoDB connection error:", err));

// API routes
app.use("/api/notes", notesRouter);

// Default route → serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

module.exports = app;
