const express = require('express');
const router = express.Router();
const { get_user_cart } = require('../database/query');
const authenticate = require('../middleware/authenticate');
const db = require('../database/db');


function generateCartId(userId) {
  const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
  const rand = Math.floor(100 + Math.random() * 900); // 3 random digits
  return `CART-${userId}-${timestamp}-${rand}`; // e.g., CART-12345678-543210-482
}

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  try {
    const userCart = await get_user_cart(req.user.user_id);
    res.json({
      success: true,
      data: userCart
    });
    console.log('User cart fetched:', req.user.user_id);
  } catch (error) {
    console.error('Error fetching user cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});


router.delete('/:cart_id', authenticate, async (req, res) => {
  try {
    await db.query(`
      DELETE FROM cart
      WHERE cart_id = $1 AND user_id = $2
    `, [String(req.params.cart_id), req.user.user_id]);

    res.json({ success: true });
    console.log("Item deleted from cart:", req.user.user_id, req.params.cart_id);
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false });
  }
});


// ---------------------- ADD TO CART ----------------------
router.post('/add', authenticate, async (req, res) => {
  const { product_id, quantity = 1, size, color } = req.body;
  if (!product_id) return res.status(400).json({ success: false, message: "Product ID is required" });
  if (!size || !color) return res.status(400).json({ success: false, message: "Size and Color are required" });

  try {
    // Fetch product info (price, status, discount)
    const productResult = await db.query(
      'SELECT price, status, discount, discount_type FROM products WHERE id = $1',
      [String(product_id)]
    );
    if (productResult.rows.length === 0)
      return res.status(404).json({ success: false, message: "Product not found" });

    const product = productResult.rows[0];

    if (product.status !== 'Active')
      return res.status(400).json({ success: false, message: "Product is not available right now" });

    // Fetch variant inventory
    const variantRes = await db.query(
      `SELECT inventory FROM inventory WHERE product_id = $1 AND size = $2 AND color = $3`,
      [String(product_id), size, color]
    );
    if (variantRes.rows.length === 0)
      return res.status(404).json({ success: false, message: "Selected variant not found" });

    const inventory = variantRes.rows[0].inventory;
    if (inventory <= 0 || quantity > inventory)
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });

    // Check current quantity in cart for this variant
    const currentCartRes = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_quantity
       FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3 AND color = $4`,
      [req.user.user_id, String(product_id), size, color]
    );
    const currentCartQty = parseInt(currentCartRes.rows[0].total_quantity, 10);
    if (currentCartQty + quantity > inventory)
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });

    // Insert or update cart
    const cartId = generateCartId(req.user.user_id);
    await db.query(
      `INSERT INTO cart (user_id, product_id, quantity, unit_price, size, color, discount, discount_type, cart_id, added_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (user_id, product_id, size, color)
       DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity,
                     discount = EXCLUDED.discount,
                     discount_type = EXCLUDED.discount_type`,
      [req.user.user_id, String(product_id), quantity, product.price, size, color, product.discount || 0, product.discount_type || 'None', cartId]
    );

    res.json({ success: true, message: "Item added to cart successfully!" });
    console.log("Item added to cart:", req.user.user_id, product_id, size, color);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ---------------------- UPDATE CART QUANTITY ----------------------
router.patch('/update', authenticate, async (req, res) => {
  const { cart_id, quantity } = req.body;
  if (!cart_id) return res.status(400).json({ success: false, message: "Cart ID is required" });
  if (quantity < 1) return res.status(400).json({ success: false, message: "Invalid quantity" });

  try {
    const cartRes = await db.query(
      `SELECT product_id, size, color FROM cart WHERE cart_id = $1 AND user_id = $2`,
      [cart_id, req.user.user_id]
    );
    if (cartRes.rows.length === 0) return res.status(404).json({ success: false, message: "Cart item not found" });

    const { product_id, size, color } = cartRes.rows[0];

    // Fetch inventory for this variant
    const variantRes = await db.query(
      `SELECT inventory FROM inventory WHERE product_id = $1 AND size = $2 AND color = $3`,
      [String(product_id), size, color]
    );
    if (variantRes.rows.length === 0)
      return res.status(404).json({ success: false, message: "Variant inventory not found" });

    const inventory = variantRes.rows[0].inventory;

    // Check total quantity in cart for this variant excluding current row
    const totalOtherQtyRes = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_quantity
       FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3 AND color = $4 AND cart_id != $5`,
      [req.user.user_id, String(product_id), size, color, cart_id]
    );
    const totalOtherQty = parseInt(totalOtherQtyRes.rows[0].total_quantity, 10);

    if (quantity + totalOtherQty > inventory)
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });

    // Update quantity
    await db.query(
      `UPDATE cart SET quantity = $1 WHERE cart_id = $2 AND user_id = $3`,
      [quantity, cart_id, req.user.user_id]
    );

    res.json({ success: true, message: "Quantity updated successfully" });
    console.log("Cart quantity updated:", req.user.user_id, cart_id, quantity);
  } catch (err) {
    console.error("Cart update error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});





module.exports = router;
