// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const { get_user_with_addresses } = require("../database/query");
const router = express.Router();

// SECRET for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// --- Login Route ---
router.post("/login", async (req, res) => {
  try {
    let { identifier, password } = req.body; // identifier = email or phone
    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Mobile and password are required." });
    }

    // Ensure identifier is always a string (TEXT comparison in PostgreSQL)
    identifier = String(identifier);

    console.log("Login attempt for identifier:", identifier);

    // Query user by email OR phone
    const queryText = `
      SELECT * FROM users 
      WHERE email = $1 OR phone = $1
      ORDER BY user_id ASC
      LIMIT 1
    `;

    const result = await pool.query(queryText, [identifier]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found." });
    }

    const user = result.rows[0];

    // Fetch user addresses
    const userInfo = await get_user_with_addresses(String(user.user_id));

    console.log("User found:", user.email);

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: String(user.user_id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send token and user info
    res.json({
      token,
      user: {
        user_id: String(user.user_id),
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        profile_image: user.profile_image,
        addresses: userInfo.addresses || []
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
