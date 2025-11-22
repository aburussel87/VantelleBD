import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "./config";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [notification, setNotification] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);
  
  useEffect(() => {
    document.title = "Details - Vantelle BD";

    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/details/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          setSelectedSize(data.data.size_options?.[0] || "");
          setSelectedColor(data.data.color?.split(",")[0] || "");
        } else {
          console.error("Failed to load product:", data.message);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading product details...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found.</p>;

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const productImage =
    images.length > 0
      ? `data:image/png;base64,${images[currentImageIndex].image_base64}`
      : "https://via.placeholder.com/400";

  // -------------------------
  // Add to Cart Handler
  // -------------------------
  const handleAddToCart = async () => {
    const cartItem = {
      product_id: product.id,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    };

    const userData = JSON.parse(localStorage.getItem("user"));

    try {
      if (userData?.user_id) {
        // Logged-in: call backend
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cartItem),
        });

        const data = await res.json();
        if (data.success) {
          showNotification("Item added to cart successfully!", "success");
        } else {
          showNotification(data.message || "Failed to add to cart", "error");
        }
      } else {
        // Guest: save to localStorage
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];

        // Prepare cart item
        const cartItem = {
          product_id: product.id,
          name: product.title,
          price: parseFloat(product.price), // numeric price
          qty: 1,                      // default quantity
          size: selectedSize,
          color: selectedColor,
          imageUrl:
            product.images?.[0]
              ? `data:image/png;base64,${product.images[0].image_base64}`
              : "https://via.placeholder.com/60x60?text=No+Image",
          details: `Size: ${selectedSize || "N/A"}, Color: ${selectedColor || "N/A"}`,
          discount: product.discount,
          discount_type : product.discount_type
        };

        // Check if same variant exists (ignore price)
        const existingIndex = localCart.findIndex(
          (i) =>
            i.product_id === cartItem.product_id &&
            i.size === cartItem.size &&
            i.color === cartItem.color
        );

        if (existingIndex >= 0) {
          localCart[existingIndex].qty += 1; // increment quantity
        } else {
          localCart.push(cartItem); // add new item
        }
        
        localStorage.setItem("cart", JSON.stringify(localCart));
        showNotification("Item added to cart successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error adding item to cart", "error");
    }
  };

  // -------------------------
  // Notification helper with animation
  // -------------------------
  const showNotification = (message, type) => {
    // Reset notification to re-trigger animation
    setNotification(null);
    setTimeout(() => {
      setNotification({ message, type });
    }, 50);

    // Auto-hide after 3s
    setTimeout(() => setNotification(null), 3050);
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: notification.type === "success" ? "#4caf50" : "#f44336",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            opacity: 0.9,
            transform: "translateX(100%)",
            animation: "slideIn 0.5s forwards",
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Left: Product Image */}
      <div style={{ flex: "1 1 300px", textAlign: "center", position: "relative" }}>
        <img
          src={productImage}
          alt={product.title}
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400";
          }}
        />

        {hasMultipleImages && (
          <>
            <button onClick={handlePrev} style={carouselBtnStyleLeft}>
              &#8592;
            </button>
            <button onClick={handleNext} style={carouselBtnStyleRight}>
              &#8594;
            </button>
          </>
        )}
      </div>

      {/* Right: Product Info */}
      <div style={{ flex: "1 1 300px", maxWidth: "500px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{product.title}</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          ৳{parseFloat(product.price).toFixed(2)}
        </p>
        <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>{product.description}</p>

        {/* Product details (not selectable) */}
        <ul style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
          <li>
            <strong>Category:</strong> {product.category}
          </li>
          <li>
            <strong>Status:</strong> {product.status}
          </li>
          <li>
            <strong>Inventory:</strong> {product.inventory}
          </li>
          <li>
            <strong>Discount:</strong> ৳{product.discount || 0}
          </li>
          <li>
            <strong>Discount Type:</strong> {product.discount_type || "None"}
          </li>
          <li>
            <strong>Gender:</strong> {product.gender}
          </li>
          <li>
            <strong>Season:</strong> {product.season}
          </li>
        </ul>

        {/* Selectable Size & Color */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Size:{" "}
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {product.size_options?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label>
            Color:{" "}
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {product.color?.split(",").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={handleAddToCart}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
          style={{
            background: buttonHover ? "#333" : "#1a1a1a",
            color: "white",
            padding: "0.8rem 1.5rem",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            fontSize: "1rem",
            transition: "all 0.2s ease",
            transform: buttonHover ? "scale(1.05)" : "scale(1)",
          }}
        >
          Add to Cart
        </button>
      </div>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 0.9; }
          }
        `}
      </style>
    </div>
  );
}

// Carousel button styles
const carouselBtnStyleLeft = {
  position: "absolute",
  top: "50%",
  left: "10px",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.5)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "35px",
  height: "35px",
  cursor: "pointer",
};

const carouselBtnStyleRight = {
  ...carouselBtnStyleLeft,
  left: "auto",
  right: "10px",
};
