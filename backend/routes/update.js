const express = require("express");  
const bcrypt = require("bcrypt");
const multer = require("multer");
const pool = require("../database/db.js");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authenticate.js");

const router = express.Router();

// --- Multer setup for profile image upload ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- UPDATE PROFILE ---
router.put("/", verifyToken, upload.single("profile_image"), async (req, res) => {
  const user_id = req.user.user_id;
  const {
    full_name,
    email,
    phone,
    gender,
    division,
    district,
    upazila,
    address_line1,
    address_line2,
    postal_code,
    old_password,
    new_password,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Fetch existing user
    const userRes = await client.query("SELECT * FROM vantelle.users WHERE user_id = $1", [user_id]);
    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRes.rows[0];

    // 2️⃣ Handle password update if requested
    if (old_password && new_password) {
      const isMatch = await bcrypt.compare(old_password, user.password_hash);
      if (!isMatch) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Old password didn't match" });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await client.query("UPDATE vantelle.users SET password_hash = $1 WHERE user_id = $2", [
        hashedPassword,
        user_id,
      ]);
    }

    // 3️⃣ Update general info
    let profileImageBuffer = req.file ? req.file.buffer : user.profile_image;

    await client.query(
      `UPDATE vantelle.users 
       SET full_name = $1, email = $2, phone = $3, gender = $4, profile_image = $5
       WHERE user_id = $6`,
      [full_name, email, phone, gender, profileImageBuffer, user_id]
    );

    // 4️⃣ Update address info (assuming addresses table)
    const existingAddress = await client.query(
      "SELECT * FROM vantelle.addresses WHERE user_id = $1",
      [user_id]
    );

    if (existingAddress.rows.length > 0) {
      await client.query(
        `UPDATE vantelle.addresses
         SET division = $1, city = $2, state = $3, address_line1 = $4, address_line2 = $5, postal_code = $6
         WHERE user_id = $7`,
        [division, district, upazila, address_line1, address_line2, postal_code, user_id]
      );
    } else {
      await client.query(
        `INSERT INTO vantelle.addresses (user_id, division, city, state, address_line1, address_line2, postal_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [user_id, division, district, upazila, address_line1, address_line2, postal_code]
      );
    }

    await client.query("COMMIT");

    // 5️⃣ Fetch updated user with address
    const updatedUserRes = await client.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.gender, u.profile_image,
              jsonb_build_object(
                'division', a.division,
                'city', a.city,
                'state', a.state,
                'address_line1', a.address_line1,
                'address_line2', a.address_line2,
                'postal_code', a.postal_code
              ) AS addresses
       FROM vantelle.users u
       LEFT JOIN vantelle.addresses a ON u.user_id = a.user_id
       WHERE u.user_id = $1`,
      [user_id]
    );

    res.status(200).json({
      message:
        old_password && new_password
          ? "Password updated successfully! Redirecting..."
          : "Profile updated successfully!",
      updatedUser: updatedUserRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

module.exports = router;
