import { useEffect, useState } from "react";
import API_BASE_URL from "./config";
import html2pdf from "html2pdf.js";

export default function AllOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setLoading(false); // Stop loading if not logged in
            return;
        }

        async function fetchOrders() {
            try {
                const res = await fetch(`${API_BASE_URL}/orders/allOrders`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const body = await res.json();
                if (!body.success) throw new Error(body.message || "Failed to fetch orders");
                setOrders(body.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [token]);

    if (!token) {
        return (
            <div style={{ padding: "50px", textAlign: "center", fontSize: "1.2rem", color: "#dc3545" }}>
                Please <a href="/login" style={{ color: "#007bff", textDecoration: "underline" }}>login</a> to see and track your orders.
            </div>
        );
    }

    if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>;

    // Categorize orders
    const categories = ["Pending", "Confirmed", "Processing", "Delivered", "Cancelled"];
    const categorized = categories.reduce((acc, cat) => {
        acc[cat] = orders.filter(o => o.status === cat);
        return acc;
    }, {});

    // Generate PDF for a specific order
    const generatePDF = (order) => {
        if (!order) return;

        const subtotal = (order.total_amount || 0).toFixed(2);
        const shippingFee = (order.shipping_fee || 0).toFixed(2);
        const grandTotal = (Number(order.total_amount) + Number(order.shipping_fee)).toFixed(2);

        const div = document.createElement("div");
        div.innerHTML = `
          <div style="padding:20px; background-color:#fff; font-family:'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height:1.4; color:#343a40;">
            <div style="background-color:#F8F9FA; padding:15px; border-radius:6px; display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
              <div>
                <h1 style="color:#007bff; font-size:1.5rem; margin:0">TAX INVOICE</h1>
                <img src="/login_log.png" alt="Vantelle BD Logo" style="width:100px; height:auto; margin-top:5px" />
              </div>
              <div style="text-align:right; font-size:0.85rem; color:#495057;">
                <p style="margin:3px 0"><strong>Invoice ID:</strong> <span style="font-weight:600">${order.order_id}</span></p>
                <p style="margin:3px 0"><strong>Date:</strong> ${order.order_date}</p>
                <p style="margin:3px 0"><strong>Status:</strong> <span style="color:#28a745; font-weight:700">${order.status}</span></p>
              </div>
            </div>
            <hr style="border-top:1px solid #dee2e6; margin-bottom:20px" />
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; margin-bottom:20px;">
              <div style="width:48%; padding:12px; border-left:3px solid #007bff; border-radius:4px; background-color:#f9f9f9; margin-bottom:10px;">
                <h3 style="margin:0 0 5px 0; color:#007bff; font-size:1rem; border-bottom:1px solid #ddd; padding-bottom:3px;">Customer Details</h3>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Name:</strong> ${order.shipping_address.full_name}</p>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Phone:</strong> ${order.shipping_address.phone}</p>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Email:</strong> ${order.shipping_address.email}</p>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Payment:</strong> ${order.payment_method}</p>
              </div>
              <div style="width:48%; padding:12px; border-left:3px solid #28a745; border-radius:4px; background-color:#f9f9f9; margin-bottom:10px;">
                <h3 style="margin:0 0 5px 0; color:#28a745; font-size:1rem; border-bottom:1px solid #ddd; padding-bottom:3px;">Shipping To</h3>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Address:</strong> ${order.shipping_address.full_address}</p>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Upazila:</strong> ${order.shipping_address.upazila}</p>
                <p style="margin:3px 0; font-size:0.85rem"><strong>District:</strong> ${order.shipping_address.district}</p>
                <p style="margin:3px 0; font-size:0.85rem"><strong>Division:</strong> ${order.shipping_address.division}</p>
              </div>
              ${order.notes ? `<div style="width:100%; margin-top:10px; padding:8px; background-color:#fffbe0; border:1px solid #ffeeba; border-radius:4px;">
                <p style="margin:0; font-weight:600; color:#856404; font-size:0.8rem;">Notes: <span style="font-weight:400; color:#333">${order.notes}</span></p>
              </div>` : ''}
            </div>
            <h3 style="margin-bottom:10px; color:#007bff; font-size:1.1rem;">Order Items</h3>
            <table style="width:100%; border-collapse:collapse; margin-bottom:25px; font-size:0.8rem; border:1px solid #ddd;">
              <thead>
                <tr style="background-color:#007bff; color:#fff;">
                  <th style="padding:8px; text-align:left;">Product</th>
                  <th style="padding:8px; text-align:center;">Qty</th>
                  <th style="padding:8px; text-align:center;">Size/Color</th>
                  <th style="padding:8px; text-align:right;">Unit Price</th>
                  <th style="padding:8px; text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item, i) => `
                  <tr style="border-bottom:1px solid #eee; background-color:${i % 2 === 0 ? '#f7f7f7' : '#fff'}">
                    <td style="padding:6px 8px; text-align:left;">${item.product_name}</td>
                    <td style="padding:6px 8px; text-align:center;">${item.quantity}</td>
                    <td style="padding:6px 8px; text-align:center;">${item.product_size || '-'}${item.product_color ? ` (${item.product_color})` : ''}</td>
                    <td style="padding:6px 8px; text-align:right;">৳${item.unit_price.toFixed(2)}</td>
                    <td style="padding:6px 8px; text-align:right;">৳${item.total_price.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="display:flex; justify-content:flex-end;">
              <div style="width:250px;">
                <p style="display:flex; justify-content:space-between; margin:5px 0; font-size:0.9rem;">Subtotal (Goods): <span style="font-weight:500;">৳${subtotal}</span></p>
                <p style="display:flex; justify-content:space-between; margin:5px 0; font-size:0.9rem;">Shipping Fee: <span style="font-weight:500;">৳${shippingFee}</span></p>
                <div style="border-top:2px solid #007bff; padding-top:10px; margin-top:10px; background-color:#d1ecf1; padding:10px; border-radius:5px; border:1px solid #bee5eb;">
                  <h2 style="display:flex; justify-content:space-between; color:#0c5460; font-size:1.2rem; margin:0;">Grand Total: <span style="font-weight:700;">৳${grandTotal}</span></h2>
                </div>
              </div>
            </div>
            <p style="text-align:center; margin-top:30px; color:#888; font-style:italic; font-size:0.8rem; border-top:1px solid #eee; padding-top:15px;">
              Thank you for shopping with Vantelle BD! For support, contact <a href="mailto:support@vantellebd.com" style="color:#007bff; text-decoration:none;">support@vantellebd.com</a>
            </p>
          </div>
        `;

        document.body.appendChild(div);

        html2pdf().set({
            margin: [10, 10, 10, 10],
            filename: `Invoice_${order.order_id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(div).save().then(() => div.remove());
    };

    return (
        <div className="page-container" style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "'Roboto', sans-serif", minHeight: '70vh', padding: '0 15px' }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "1.8rem" }}>My Orders</h1>
            {categories.map(cat => (
                <div key={cat} style={{ marginBottom: "15px", border: "1px solid #ddd", borderRadius: "6px", overflow: 'hidden' }}>
                    <div
                        style={{
                            cursor: "pointer",
                            padding: "10px 15px",
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: 600,
                            fontSize: "1rem"
                        }}
                        onClick={() => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))}
                    >
                        <span>{cat} Orders</span>
                        <span>{categorized[cat]?.length || 0} orders {expanded[cat] ? "▲" : "▼"}</span>
                    </div>

                    {expanded[cat] && categorized[cat]?.length > 0 && (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#e9ecef" }}>
                                    <th style={{ padding: "8px", border: "1px solid #ddd" }}>#</th>
                                    <th style={{ padding: "8px", border: "1px solid #ddd" }}>Order ID</th>
                                    <th style={{ padding: "8px", border: "1px solid #ddd" }}>Date</th>
                                    <th style={{ padding: "8px", border: "1px solid #ddd" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorized[cat].map((order, i) => (
                                    <tr key={order.order_id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: "6px 8px", border: "1px solid #ddd" }}>{i + 1}</td>
                                        <td style={{ padding: "6px 8px", border: "1px solid #ddd" }}>{order.order_id}</td>
                                        <td style={{ padding: "6px 8px", border: "1px solid #ddd" }}>{order.order_date}</td>
                                        <td style={{ padding: "6px 8px", border: "1px solid #ddd", display: "flex", gap: "5px", flexWrap: 'wrap', justifyContent: 'center' }}>
                                            <button
                                                style={{ padding: "4px 8px", backgroundColor: "#343a40", color: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", border: 'none' }}
                                                onClick={() => generatePDF(order)}
                                            >
                                                Download PDF
                                            </button>
                                            {cat !== "Delivered" && cat !== "Cancelled" && (
                                                <button
                                                    style={{ padding: "4px 8px", backgroundColor: "#007bff", color: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", border: 'none' }}
                                                    onClick={() => window.location.href = `/track-order?order_id=${order.order_id}&tracking=${order.tracking_number}`}
                                                >
                                                    Track Order
                                                </button>
                                            )}
                                            {cat === "Pending" && (
                                                <button
                                                    style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "#fff", borderRadius: "4px", cursor: "pointer" }}
                                                    onClick={async () => {
                                                        if (!window.confirm("Are you sure you want to cancel this order?")) return;

                                                        try {
                                                            const res = await fetch(`${API_BASE_URL}/orders/cancel/${order.order_id}`, {
                                                                method: "PATCH",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                                                                },
                                                            });
                                                            const body = await res.json();
                                                            if (body.success) {
                                                                alert("Order cancelled successfully!");
                                                                setOrders(prevOrders => prevOrders.map(o => o.order_id === order.order_id ? { ...o, status: "Cancelled" } : o));
                                                            } else {
                                                                alert(body.message || "Failed to cancel order");
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert("Something went wrong. Please try again.");
                                                        }
                                                    }}
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}
        </div>
    );
}
