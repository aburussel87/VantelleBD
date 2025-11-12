const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const pool = require("../database/db.js");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("profile_image"), async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      phone,
      password,
      gender,
      division,
      district,
      upazila,
      address_line1,
      address_line2,
      postal_code,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO vantelle.users (full_name, username, email, phone, password_hash, gender, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id`,
      [
        full_name,
        username,
        email,
        phone,
        hashedPassword,
        gender,
        req.file ? req.file.buffer : null,
      ]
    );

    const userId = userResult.rows[0].user_id;

    await pool.query(
      `INSERT INTO vantelle.addresses (user_id, address_line1, address_line2, division, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Bangladesh', true)`,
      [userId, address_line1, address_line2, division, district, upazila, postal_code]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
