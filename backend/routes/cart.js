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

router.patch('/update', authenticate, async (req, res) => {
  try {
    const { cart_id, quantity } = req.body;
    const cart_id_str = String(cart_id);

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    // Get product_id of cart row
    const productID = await db.query(
      `SELECT product_id FROM cart WHERE cart_id = $1 AND user_id = $2`,
      [cart_id_str, req.user.user_id]
    );

    if (productID.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    const product_id = productID.rows[0].product_id;

    // Get inventory
    const inventoryRes = await db.query(
      `SELECT inventory FROM products WHERE id = $1`,
      [product_id]
    );

    if (inventoryRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    const inventory = inventoryRes.rows[0].inventory;

    // Get total quantity in cart excluding this row
    const totalOtherQtyRes = await db.query(
      `
      SELECT COALESCE(SUM(quantity), 0) AS total_quantity
      FROM cart
      WHERE user_id = $1 AND product_id = $2 AND cart_id != $3
      `,
      [String(req.user.user_id), product_id, cart_id_str]
    );
    const totalOtherQuantity = parseInt(totalOtherQtyRes.rows[0].total_quantity, 10);

    if (quantity + totalOtherQuantity > inventory) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock"
      });
    }

    // Update cart
    await db.query(
      `UPDATE cart SET quantity = $1 WHERE cart_id = $2 AND user_id = $3`,
      [quantity, cart_id_str, String(req.user.user_id)]
    );

    res.json({ success: true, message: "Quantity updated successfully" });
    console.log("Qty updated:", req.user.user_id, quantity);

  } catch (error) {
    console.error("Qty update error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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

router.post('/add', authenticate, async (req, res) => {
  const { product_id, quantity = 1, size, color } = req.body;
  const product_id_str = String(product_id);
  if (!product_id) {
    return res.status(400).json({ success: false, message: "Product ID is required" });
  }

  try {
    // Get product details from products table, including discount info
    const productResult = await db.query(
      'SELECT price, inventory, status, discount, discount_type FROM products WHERE id = $1',
      [product_id_str]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = productResult.rows[0];

    // Check status and inventory
    if (product.status !== 'Active') {
      return res.status(400).json({ success: false, message: "Product is not available right now" });
    }


    const currentCartResult = await db.query(
      `
      SELECT COALESCE(SUM(quantity), 0) AS total_quantity
      FROM cart
      WHERE user_id = $1 AND product_id = $2
      `,
      [String(req.user.user_id), product_id_str]
    );
    const currentCartQuantity = parseInt(currentCartResult.rows[0].total_quantity, 10);
    if (product.inventory <= 0 || (quantity + currentCartQuantity) > product.inventory) {
      if (product.inventory <= 0) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    const unit_price = product.price;
    const discount = product.discount || 0;
    const discount_type = product.discount_type || 'None';
    const cartId = generateCartId(req.user.user_id);
    // Insert or update quantity if same variant exists
    await db.query(
      `
      INSERT INTO cart (user_id, product_id, quantity, unit_price, size, color, discount, discount_type,cart_id,added_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (user_id, product_id, size, color)
      DO UPDATE 
        SET quantity = cart.quantity + EXCLUDED.quantity,
            discount = EXCLUDED.discount,
            discount_type = EXCLUDED.discount_type
      `,
      [req.user.user_id, product_id, quantity, unit_price, size || null, color || null, discount, discount_type, cartId]
    );

    res.json({ success: true, message: "Item added to cart successfully!" });
    console.log("Item added to cart:", req.user.user_id, product_id);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});




module.exports = router;
