const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const DB = require("./db");

// Routers
const notesRouter = require("../routes/notes");
const authRouter = require("../routes/auth");

const app = express();

// ------------
// Middleware
// ------------
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

// Session middleware
app.use(session({
    secret: "studynotes_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// ----------
// MongoDB
// ----------
mongoose.connect(DB.URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log("MongoDB connection error:", err));

// ----------
// API Routes (REGISTER THESE FIRST)
// ----------
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

// ----------
// Static files (SERVE THESE LAST)
// ----------
app.use(express.static(path.join(__dirname, "../")));

// Default route
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

module.exports = app;
