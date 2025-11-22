const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const db = require('../database/db');

// GET /api/checkout
router.get('/', authenticate, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    console.log("Checkout load for user:", user_id);
    // Get user basic info
    const userRes = await db.query(`
      SELECT full_name, email, phone 
      FROM users WHERE user_id = $1
    `, [user_id]);

    // Get default address
    const addrRes = await db.query(`
      SELECT *
      FROM addresses
      WHERE user_id = $1 AND is_default = TRUE
      LIMIT 1
    `, [user_id]);

    // Get cart items
    const cartRes = await db.query(`
      SELECT c.*, p.title, p.inventory
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1
    `, [user_id]);

    res.json({
      success: true,
      user: userRes.rows[0],
      address: addrRes.rows[0] || null,
      cart: cartRes.rows
    });

  } catch (error) {
    console.error("Checkout load error:", error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
