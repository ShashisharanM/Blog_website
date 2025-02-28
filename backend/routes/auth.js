const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        res.status(200).json(savedUser);
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        console.log("Login request received:", req.body);

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Wrong credentials!" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,  // FIXED: Using correct .env key
            { expiresIn: "3d" }
        );

        // Send token in cookie
        const { password, ...info } = user._doc;
        res.cookie("token", token, { httpOnly: true, sameSite: "strict" })
            .status(200).json(info);

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
});

// Logout user
router.get("/logout", (req, res) => {
    try {
        res.clearCookie("token", { sameSite: "strict", httpOnly: true })
            .status(200).json({ message: "User logged out successfully!" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
});

// Refetch user session
router.get("/refetch", (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, data) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token", error: err });
        }
        res.status(200).json(data);
    });
});

module.exports = router;
