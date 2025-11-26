const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.json({ message: "Registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.json({ message: "Login successful", user: req.session.user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

// CHECK LOGIN STATUS
router.get("/status", (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    res.json({ loggedIn: false });
});

module.exports = router;
