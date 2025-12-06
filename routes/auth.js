const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const passport = require("passport");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ---------- Ensure uploads folder exists (Render NEEDS THIS) ----------
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------- Multer Storage ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.session?.user?.id || "guest";
    cb(null, `${userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  }
});

// Helper to store user session data
function setSessionUser(req, user) {
  req.session.user = {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic || ""
  };
}
