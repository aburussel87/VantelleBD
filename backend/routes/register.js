const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const pool = require("../database/db.js");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function generateUserId(phone) {
  const last4 = phone.slice(-4);               // last 4 digits of phone number
  const rand = Math.floor(1000 + Math.random() * 9000); // random 4 digits
  return Number(`${last4}${rand}`);            // 8-digit number
}

function generateAddressId(userId) {
  const rand = Math.floor(1000 + Math.random() * 9000); // random 4 digits
  return `${userId}-${rand}`; // e.g., 12345678-4829
}


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
    const user_id = generateUserId(phone);
    const address_id = generateAddressId(user_id);

    const userResult = await pool.query(
      `INSERT INTO users (user_id, full_name, username, email, phone, password_hash, gender, profile_image,status,role,created_at,updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING user_id`,
      [
        user_id,
        full_name,
        username,
        email,
        phone,
        hashedPassword,
        gender,
        req.file ? req.file.buffer : null,
        "active",
        "customer",
      ]
    );

    await pool.query(
      `INSERT INTO addresses (address_id, user_id, address_line1, address_line2, division, city, state, postal_code, country, is_default,created_at,updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Bangladesh', true, NOW(), NOW())`,
      [address_id, user_id, address_line1, address_line2, division, district, upazila, postal_code]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;
