const client = require('../database/db');

async function getAllOrders(user_id) {
  try {
    // Fetch all orders for this user
    const ordersQ = await client.query(
      `SELECT o.*, to_char(o.order_date, 'YYYY-MM-DD HH24:MI') as order_date_fmt
       FROM vantelle.orders o
       WHERE o.user_id = $1
       ORDER BY o.order_date DESC`,
      [user_id]
    );

    if (ordersQ.rows.length === 0) {
      return []; // no orders found
    }

    const orders = [];

    for (let order of ordersQ.rows) {
      const rawAddress = order.shipping_address;

      // Parse shipping address
      let shipping = {
        full_name: "N/A", phone: "N/A", email: "N/A",
        upazila: "N/A", district: "N/A", division: "N/A",
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

      // Fetch order items
      const itemsQ = await client.query(
        `SELECT oi.*, p.title as product_name
         FROM vantelle.order_items oi
         LEFT JOIN vantelle.products p ON p.id = oi.product_id
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

    return orders;

  } catch (err) {
    console.error("Fetch all orders error:", err);
    throw err;
  }
}

// ------------------ Test ------------------
(async () => {
  try {
    const user_id = 8; // replace with your test user_id
    const orders = await getAllOrders(user_id);
    console.log(JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
})();
