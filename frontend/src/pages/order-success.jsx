import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API_BASE_URL from "./config";
import html2pdf from "html2pdf.js";
import "../styles/OrderSuccess.css";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // State for additional order details
  const [notes, setnotes] = useState(null);
  const [tracking_number, setTrackingNO] = useState(null);
  const [estimated_delivery, setEstimatedDelivery] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(null); // New state for copy confirmation

  const invoiceRef = useRef();

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/details/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!res.ok) throw new Error("Failed to fetch order");
        const body = await res.json();
        if (!body.success) throw new Error(body.message || "Error");

        const data = body.data;

        // FIX: Calculate subtotal as Total Amount minus Shipping Fee.
        const subtotal = (data.total_amount || 0);

        setnotes(data.notes);
        setTrackingNO(data.tracking_number);
        setEstimatedDelivery(data.estimated_delivery);
        setOrder({ ...data, subtotal });
      } catch (err) {
        console.error("Fetch order failed:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) fetchOrder();
  }, [orderId, token]);

  const generatePDF = () => {
    if (!invoiceRef.current) return;

    // Configuration for A4 PDF output
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Invoice_${orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(invoiceRef.current).save();
  };

  // Tracking number copy function with confirmation message
  const copyTrackingNumber = () => {
    if (tracking_number) {
      navigator.clipboard.writeText(tracking_number).then(() => {
        setCopiedMessage("Copied successfully!");
        setTimeout(() => setCopiedMessage(null), 2000); // Clear message after 2 seconds
      }).catch(err => {
        console.error("Failed to copy text: ", err);
        setCopiedMessage("Copy failed.");
        setTimeout(() => setCopiedMessage(null), 2000);
      });
    }
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center", fontSize: "1.2rem" }}>Loading...</div>;
  if (!order) return <div style={{ padding: "50px", textAlign: "center", color: "#dc3545", fontSize: "1.2rem" }}>Order not found.</div>;

  // Destructure the structured shipping object safely
  const shipping = order.shipping_address || {};
  const {
    full_name, phone, email,
    upazila, district, division
  } = shipping;
  // Construct the full address string
  const fullAddress = (shipping.address_line1 || shipping.full_address || '-') + (shipping.address_line2 ? `, ${shipping.address_line2}` : '');

  // Safety checks for numerical formatting
  const subtotalDisplay = (order.subtotal?.toFixed(2) || '0.00');
  const shippingFeeDisplay = ((order.shipping_fee || 0).toFixed(2) || '0.00');
  const totalAmountDisplay = (Number(order.total_amount) + Number(order.shipping_fee)).toFixed(2);

  return (
    // Professional Font and Responsive Wrapper
    <div style={{
      maxWidth: "960px",
      width: "95%",
      margin: "40px auto",
      fontFamily: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
      lineHeight: 1.6,
      color: "#343a40",
      padding: "10px"
    }}>

      {/* Success Message Header - Enhanced Style */}
      <div style={{ textAlign: "center", marginBottom: "30px", padding: "25px", borderRadius: "12px", backgroundColor: "#e8f7ee", border: '1px solid #d4edda', boxShadow: "0 6px 20px rgba(0, 123, 255, 0.1)" }}>
        <h1 style={{ color: "#155724", fontSize: "2.2rem", marginBottom: "15px", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>✔ Order Placed Successfully!</h1>
        <p style={{ fontSize: "1rem", color: "#333" }}>Your order is confirmed and will be processed shortly.</p>
        
        <p style={{ fontSize: "1rem", marginTop: "15px" }}>
          <strong style={{ color: "#007bff", backgroundColor: "#fff", padding: "8px 15px", borderRadius: "8px", fontWeight: 600, border: '1px solid #007bff' }}>Order ID: {orderId}</strong>
        </p>
        
        <div style={{ textAlign: "center", marginTop: "10px", minHeight: "20px" }}>
          {tracking_number && (
            <p style={{ fontSize: "0.95rem", margin: "5px 0" }}>
              <strong>Tracking Number:</strong>{" "}
              <span
                style={{
                  backgroundColor: "#fff",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  userSelect: "all",
                  border: '1px solid #ced4da',
                  fontWeight: 500,
                  display: 'inline-block',
                }}
                onClick={copyTrackingNumber}
                title="Click to copy"
              >
                {tracking_number}
              </span>
              {copiedMessage && (
                <span style={{ marginLeft: '10px', color: copiedMessage.includes('successfully') ? '#28a745' : '#dc3545', fontWeight: 600, transition: 'opacity 0.3s' }}>
                  {copiedMessage}
                </span>
              )}
            </p>
          )}
          {estimated_delivery && (
            <p style={{ fontSize: "0.95rem", margin: "5px 0", color: "#555" }}>
              <strong>Estimated Delivery:</strong> <span style={{ fontWeight: 600, color: '#333' }}>{estimated_delivery}</span>
            </p>
          )}
        </div>

        <button
          onClick={generatePDF}
          style={{
            marginTop: "25px",
            padding: "12px 30px",
            background: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1rem",
            transition: "background-color 0.3s ease, transform 0.1s ease",
            boxShadow: "0 4px 6px rgba(0, 123, 255, 0.2)"
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0056b3'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#007bff'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Generate PDF Invoice
        </button>
      </div>

      {/* Invoice Content for PDF - TIGHT/COMPACT STYLING */}
      <div
        ref={invoiceRef}
        style={{
          padding: "20px", // Reduced padding
          backgroundColor: "#fff",
          border: "1px solid #eee",
          borderRadius: "8px", // Slightly smaller border radius
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.08)",
          lineHeight: 1.4, // Reduced line height for density
          fontSize: '0.9rem' // Base font reduced slightly
        }}
      >

        {/* HEADER - INVOICE META (Tighter) */}
        <div style={{
          backgroundColor: "#F8F9FA",
          padding: "15px", // Reduced padding
          borderRadius: "6px",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px", // Reduced margin
          alignItems: "center"
        }}>

          {/* LEFT SIDE: Logo and Invoice Title */}
          <div>
            <h1 style={{ color: "#007bff", fontSize: "1.5rem", margin: 0 }}>TAX INVOICE</h1> {/* Smaller header font */}
            <img src="/login_log.png" alt="Vantelle BD Logo" style={{ width: "100px", height: "auto", marginTop: "5px" }} /> {/* Smaller logo width */}
          </div>

          {/* RIGHT SIDE: Invoice Details */}
          <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#495057" }}> {/* Smaller font size */}
            <p style={{ margin: "3px 0" }}><strong>Invoice ID:</strong> <span style={{ fontWeight: 600 }}>{order.order_id}</span></p>
            <p style={{ margin: "3px 0" }}><strong>Date:</strong> {order.order_date}</p>
            <p style={{ margin: "3px 0" }}><strong>Status:</strong> <span style={{ color: "#28a745", fontWeight: 700 }}>{order.status || 'Confirmed'}</span></p>
          </div>
        </div>

        <hr style={{ borderTop: "1px solid #dee2e6", marginBottom: "20px" }} /> {/* Reduced margin */}

        {/* ADDRESSES & CONTACTS (Tighter Spacing) */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "20px" }}> {/* Reduced margin */}

          {/* Customer Details */}
          <div style={{ width: "100%", maxWidth: "48%", minWidth: "250px", padding: "10px", borderLeft: "3px solid #007bff", borderRadius: "4px", backgroundColor: '#f9f9f9', marginBottom: "10px" }}> {/* Reduced padding/margin/border */}
            <h3 style={{ margin: "0 0 5px 0", color: "#007bff", fontSize: "1rem", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Customer Details</h3> {/* Smaller header/tighter spacing */}
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Name:</strong> {full_name || 'N/A'}</p> {/* Smaller font */}
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Phone:</strong> {phone || 'N/A'}</p>
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Email:</strong> {email || 'N/A'}</p>
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Payment:</strong> {order.payment_method}</p>
          </div>

          {/* Shipping Address */}
          <div style={{ width: "100%", maxWidth: "48%", minWidth: "250px", padding: "10px", borderLeft: "3px solid #28a745", borderRadius: "4px", backgroundColor: '#f9f9f9', marginBottom: "10px" }}> {/* Reduced padding/margin/border */}
            <h3 style={{ margin: "0 0 5px 0", color: "#28a745", fontSize: "1rem", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Shipping To</h3> {/* Smaller header/tighter spacing */}
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Address:</strong> {fullAddress || '-'}</p> {/* Smaller font */}
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Upazila:</strong> {upazila || '-'}</p>
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>District:</strong> {district || '-'}</p>
            <p style={{ margin: "3px 0", fontSize: '0.85rem' }}><strong>Division:</strong> {division || '-'}</p>
          </div>
          
          {/* Order Notes */}
          {notes && (
            <div style={{ width: "100%", marginTop: "10px", padding: "8px", backgroundColor: '#fffbe0', border: '1px solid #ffeeba', borderRadius: '4px' }}> {/* Reduced padding/margin */}
                <p style={{ margin: "0", fontWeight: 600, color: '#856404', fontSize: '0.8rem' }}>Notes: <span style={{ fontWeight: 400, color: '#333' }}>{notes}</span></p> {/* Smaller font */}
            </div>
          )}
        </div>

        {/* ITEMS TABLE (Most Compact) */}
        <h3 style={{ marginBottom: "10px", color: "#007bff", fontSize: "1.1rem" }}>Order Items</h3> {/* Smaller header/reduced margin */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px", fontSize: "0.8rem", border: '1px solid #ddd' }}> {/* Smallest font size for items */}
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: '#fff', borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>Product</th> {/* Reduced padding */}
              <th style={{ padding: "8px", textAlign: "center" }}>Qty</th>
              <th style={{ padding: "8px", textAlign: "center" }}>Size/Color</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Unit Price</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee", backgroundColor: i % 2 === 0 ? '#f7f7f7' : '#fff' }}>
                <td style={{ padding: "6px 8px", textAlign: "left", color: "#343a40" }}> {/* Reduced padding */}
                  {item.product_name}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center" }}>{item.quantity}</td>
                <td style={{ padding: "6px 8px", textAlign: "center", color: "#6c757d" }}>
                  {(item.product_size || '-')}{item.product_color ? ` (${item.product_color})` : ''}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>৳{item.unit_price?.toFixed(2) || '0.00'}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600, color: '#343a40' }}>৳{item.total_price?.toFixed(2) || '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS (Smaller) */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", minWidth: "200px", maxWidth: "300px" }}>

            {/* Subtotal (Cost of goods after item discounts) */}
            <p style={{ display: "flex", justifyContent: "space-between", margin: "5px 0", fontSize: '0.85rem' }}> {/* Smaller font/margin */}
              <span>Subtotal (Goods):</span>
              <span style={{ fontWeight: 500 }}>৳{subtotalDisplay}</span>
            </p>

            {/* Shipping Fee */}
            <p style={{ display: "flex", justifyContent: "space-between", margin: "5px 0", fontSize: '0.85rem' }}> {/* Smaller font/margin */}
              <span>Shipping Fee:</span>
              <span style={{ fontWeight: 500 }}>৳{shippingFeeDisplay}</span>
            </p>

            {/* Grand Total */}
            <div style={{
              borderTop: "2px solid #007bff",
              paddingTop: "10px", // Reduced padding
              marginTop: "10px", // Reduced margin
              backgroundColor: "#d1ecf1",
              padding: "10px", // Reduced padding
              borderRadius: "5px",
              border: '1px solid #bee5eb'
            }}>
              <h2 style={{ display: "flex", justifyContent: "space-between", color: "#0c5460", fontSize: "1.1rem", margin: 0 }}> {/* Smaller font */}
                <span>Grand Total:</span>
                <span style={{ fontWeight: 700 }}>৳{totalAmountDisplay}</span>
              </h2>
            </div>
          </div>
        </div>

        {/* FOOTER (Smallest) */}
        <p style={{ textAlign: "center", marginTop: "30px", color: "#888", fontStyle: "italic", fontSize: "0.75rem", borderTop: "1px solid #eee", paddingTop: "10px" }}> {/* Reduced margin/font/padding */}
          Thank you for shopping with Vantelle BD! For support, contact <a href="mailto:support@vantellebd.com" style={{ color: '#007bff', textDecoration: 'none' }}>support@vantellebd.com</a>
        </p>
      </div>
    </div>
  );
}