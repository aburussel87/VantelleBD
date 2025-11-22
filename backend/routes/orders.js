const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const db = require("../database/db");
const path = require("path");


function generateOrderId(userId) {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 12); // YYYYMMDDHHMM
  const rand = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `ORD-${userId}-${datePart}-${rand}`; // e.g., ORD-12345678-202511221045-4829
}

function generateTrackingNumber(orderId) {
  const rand = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  const timestamp = Date.now().toString().slice(-6);     // last 6 digits of timestamp
  return `TRK-${orderId.slice(-4)}-${timestamp}-${rand}`; // e.g., TRK-4829-543210-3847
}

function generateOrderItemId(orderId, productId) {
  const rand = Math.floor(100 + Math.random() * 900); // 3 random digits
  return `${orderId.slice(-4)}-${productId}-${rand}`; // e.g., 4829-5678-384
}

router.post("/place", authenticate, async (req, res) => {
    const { 
        full_name, email, phone, division, district, upazila, 
        address_line1, address_line2, payment_method, shipping_fee,notes
    } = req.body;

    const user_id = String(req.user.user_id);

    const structured_address = JSON.stringify({
        full_name,
        phone,
        email,
        address_line1,
        address_line2,
        upazila: upazila || "",
        district,
        division
    });

    try {
        // Get cart items
        const cartRes = await db.query(
            `SELECT * FROM cart WHERE user_id = $1`,
            [user_id]
        );

        if (cartRes.rows.length === 0)
            return res.status(400).json({ success: false, message: "Cart is empty" });

        let total_amount = 0;

        cartRes.rows.forEach(item => {
            const discountAmount =
                item.discount_type === "Percentage"
                    ? item.unit_price * (item.discount / 100)
                    : item.discount;

            const finalUnit = item.unit_price - discountAmount;
            total_amount += finalUnit * item.quantity;
        });

        // Calculate estimated delivery
        const now = new Date();
        let estimated_delivery = new Date(now);

        if (district?.toLowerCase() === "dhaka") {
            estimated_delivery.setDate(now.getDate() + 2);
        } else {
            estimated_delivery.setDate(now.getDate() + 5);
        }

        // Format delivery date (e.g., "02 November, Thursday")
        const formatted_delivery = estimated_delivery.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            weekday: "long"
        });

        // Insert order
        const orderId = generateOrderId(user_id);
        const trackingNumber = generateTrackingNumber(orderId);
        const orderRes = await db.query(`
            INSERT INTO orders 
            (order_id, user_id, total_amount, payment_method, shipping_address, shipping_fee, estimated_delivery,notes, tracking_number,created_at,updated_at,status,payment_status,order_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), 'Pending', 'Pending', NOW())
            RETURNING order_id
        `, [
            orderId, user_id, total_amount, payment_method, structured_address,
            shipping_fee, formatted_delivery, notes, trackingNumber
        ]);

        
        // Insert order items
        for (let item of cartRes.rows) {
            const discountAmount =
                item.discount_type === "Percentage"
                    ? item.unit_price * (item.discount / 100)
                    : item.discount;

            const finalUnit = item.unit_price - discountAmount;
            const totalPrice = finalUnit * item.quantity;
            const orderItemId = generateOrderItemId(orderId, item.product_id);
            await db.query(`
                INSERT INTO order_items (
                    id, order_id, product_id, quantity, unit_price,
                    discount, discount_type, size, color, total_price
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            `, [
                orderItemId, orderId, item.product_id, item.quantity, item.unit_price,
                item.discount, item.discount_type, item.size, item.color, totalPrice
            ]);

            // Reduce inventory
            await db.query(`
                UPDATE products 
                SET inventory = inventory - $1 
                WHERE id = $2
            `, [item.quantity, item.product_id]);
        }

        // Clear cart
        await db.query(`DELETE FROM cart WHERE user_id = $1`, [user_id]);

        res.json({
            success: true,
            message: "Order placed!",
            order_id: orderId,
            tracking_number: trackingNumber,
            estimated_delivery: formatted_delivery
        });

        console.log("Order placed:", {
            user_id,
            order_id: orderId,
            tracking_number: trackingNumber,
            estimated_delivery: formatted_delivery
        });

    } catch (err) {
        console.error("Order place error:", err);
        res.status(500).json({ success: false, message: "Order failed" });
    }
});



router.get("/details/:order_id", authenticate, async (req, res) => {
  const order_id = String(req.params.order_id);
  console.log("Fetching order details for order_id:", order_id);

  try {
    const orderQ = await db.query(
      `SELECT o.*, to_char(o.order_date, 'YYYY-MM-DD HH24:MI') as order_date_fmt
       FROM orders o
       WHERE o.order_id = $1`,
      [order_id]
    );

    if (orderQ.rows.length === 0)
      return res.status(404).json({ success: false, message: "Order not found" });

    const order = orderQ.rows[0];
    const rawAddress = order.shipping_address;

    const itemsQ = await db.query(
      `SELECT oi.*, p.title as product_name
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [order_id]
    );

    // Handle shipping address (FIXED: Robust parsing logic)
    let shipping = {
      full_name: "N/A", phone: "N/A", email: "N/A", upazila: "N/A", district: "N/A", division: "N/A",
      address_line1: "", address_line2: "", full_address: "Address not available"
    };

    try {
      // 1. Try to parse as JSON (New orders)
      const parsedJson = JSON.parse(rawAddress);
      
      shipping.full_name = parsedJson.full_name || "N/A";
      shipping.phone = parsedJson.phone || "N/A";
      shipping.email = parsedJson.email || "N/A";
      shipping.address_line1 = parsedJson.address_line1 || "";
      shipping.address_line2 = parsedJson.address_line2 || "";
      shipping.upazila = parsedJson.upazila || "N/A";
      shipping.district = parsedJson.district || "N/A";
      shipping.division = parsedJson.division || "N/A";
      
      // Construct combined full address string
      shipping.full_address = (shipping.address_line1 || '') + (shipping.address_line2 ? `, ${shipping.address_line2}` : '');

    } catch (e) {
      // 2. If parsing fails, it's the old plain text format. Manually extract details.
      const parts = rawAddress
        .split(/Name:|Phone:|Email:|Address:|Upazila:|District:|Division:/)
        .map(s => s.trim())
        .filter(Boolean);

      // If parsing worked with the regex, fill fields
      if (parts.length >= 7) {
        shipping.full_name = parts[0];
        shipping.phone = parts[1];
        shipping.email = parts[2];
        shipping.full_address = parts[3];
        shipping.upazila = parts[4];
        shipping.district = parts[5];
        shipping.division = parts[6];
      } else {
        // Final fallback for the address line
        shipping.full_address = rawAddress;
      }
    }
    
    // Ensure full_address isn't empty after parsing
    shipping.full_address = shipping.full_address || "Address details incomplete";


    res.json({
      success: true,
      data: {
        order_id: order.order_id,
        user_id: order.user_id,
        order_date: order.order_date_fmt,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        total_amount: Number(order.total_amount),
        shipping_fee: Number(order.shipping_fee || 0),
        shipping_address: shipping, // <-- Sending the fully structured object
        notes: order.notes || null,
        tracking_number: order.tracking_number,
        estimated_delivery: order.estimated_delivery,
        items: itemsQ.rows.map(r => ({
          product_id: r.product_id,
          product_name: r.product_name || `Product #${r.product_id}`,
          product_size: r.size,
          product_color: r.color,
          quantity: r.quantity,
          unit_price: Number(r.unit_price),
          discount: Number(r.discount || 0),
          discount_type: r.discount_type,
          total_price: Number(r.total_price)
        }))
      }
    });
  } catch (err) {
    console.error("Order details error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// GET /allOrders - fetch all orders of the authenticated user
router.get("/allOrders", authenticate, async (req, res) => {
  const user_id = String(req.user.user_id);

  try {
    // Fetch all orders for this user
    const ordersQ = await db.query(
      `SELECT o.*, to_char(o.order_date, 'YYYY-MM-DD HH24:MI') as order_date_fmt
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.order_date DESC`,
      [user_id]
    );

    if (ordersQ.rows.length === 0) {
      return res.json({ success: true, data: [] }); // no orders found
    }

    const orders = [];

    for (let order of ordersQ.rows) {
      const rawAddress = order.shipping_address;

      // Parse shipping address
      let shipping = {
        full_name: "N/A", phone: "N/A", email: "N/A", upazila: "N/A", district: "N/A", division: "N/A",
        address_line1: "", address_line2: "", full_address: "Address not available"
      };

      try {
        const parsedJson = JSON.parse(rawAddress);
        shipping.full_name = parsedJson.full_name || "N/A";
        shipping.phone = parsedJson.phone || "N/A";
        shipping.email = parsedJson.email || "N/A";
        shipping.address_line1 = parsedJson.address_line1 || "";
        shipping.address_line2 = parsedJson.address_line2 || "";
        shipping.upazila = parsedJson.upazila || "N/A";
        shipping.district = parsedJson.district || "N/A";
        shipping.division = parsedJson.division || "N/A";
        shipping.full_address = (shipping.address_line1 || '') + (shipping.address_line2 ? `, ${shipping.address_line2}` : '');
      } catch (e) {
        shipping.full_address = rawAddress;
      }

      // Fetch order items summary (optional: just basic info)
      const itemsQ = await db.query(
        `SELECT oi.*, p.title as product_name
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [order.order_id]
      );

      const items = itemsQ.rows.map(r => ({
        product_id: r.product_id,
        product_name: r.product_name || `Product #${r.product_id}`,
        product_size: r.size,
        product_color: r.color,
        quantity: r.quantity,
        unit_price: Number(r.unit_price),
        discount: Number(r.discount || 0),
        discount_type: r.discount_type,
        total_price: Number(r.total_price)
      }));

      orders.push({
        order_id: order.order_id,
        order_date: order.order_date_fmt,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        total_amount: Number(order.total_amount),
        shipping_fee: Number(order.shipping_fee || 0),
        shipping_address: shipping,
        notes: order.notes || null,
        tracking_number: order.tracking_number,
        estimated_delivery: order.estimated_delivery,
        items
      });
    }

    res.json({ success: true, data: orders });

  } catch (err) {
    console.error("Fetch all orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.patch("/cancel/:order_id", authenticate, async (req, res) => {
  const order_id = String(req.params.order_id);
  const user_id = String(req.user.user_id);

  try {
    const result = await db.query(
      `UPDATE orders
       SET status = 'Cancelled'
       WHERE order_id = $1 AND user_id = $2 AND status = 'Pending'
       RETURNING *`,
      [order_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Order not found or cannot be cancelled" });
    }

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;