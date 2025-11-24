import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "./config";

// Helper function to find the inventory for the selected size and color variant
const getVariantInventory = (variants, size, color) => {
  if (!variants || !size || !color) return 0;
  
  // Find the exact variant match
  const variant = variants.find(
    (v) => v.size === size && v.color === color
  );
  return variant ? variant.inventory : 0;
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [notification, setNotification] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);

  // --- 1. Fetch Product Data and Set Initial State ---
  useEffect(() => {
    document.title = "Details - Vantelle BD";

    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/details/${id}`);
        const data = await response.json();
        if (data.success) {
          const productData = data.data;
          setProduct(productData);

          // Set initial selected size and color based on the first variant
          const firstVariant = productData.variants?.[0];
          if (firstVariant) {
            setSelectedSize(firstVariant.size);
            setSelectedColor(firstVariant.color);
          } else {
            // Fallback to non-variant options if no variants exist
            setSelectedSize(productData.size_options?.[0] || "");
            setSelectedColor(productData.color?.split(",")[0] || "");
          }

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

  // -------------------------------------------------------------------
  // --- 2. UNCONDITIONAL HOOKS (Moved before conditional returns) ---
  // -------------------------------------------------------------------

  // Calculate Current Inventory for the selected variant
  const currentInventory = useMemo(() => 
    getVariantInventory(product?.variants, selectedSize, selectedColor),
    [product, selectedSize, selectedColor]
  );
  
  const isOutOfStock = currentInventory <= 0;

  // Extract unique options from the variants array
  const uniqueSizes = useMemo(() => 
    [...new Set(product?.variants?.map(v => v.size))].sort(),
    [product?.variants]
  );
  const uniqueColors = useMemo(() => 
    [...new Set(product?.variants?.map(v => v.color))].sort(),
    [product?.variants]
  );
  
  // -------------------------------------------------------------------
  // --- 3. CONDITIONAL RETURNS (After all Hooks) ---
  // -------------------------------------------------------------------

  if (loading) return <p style={{ textAlign: "center" }}>Loading product details...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found.</p>;

  // --- 4. Rest of the logic and render ---

  const images = product.images || [];

  const productImage =
    images.length > 0
      ? `data:image/png;base64,${images[currentImageIndex].image_base64}`
      : "https://via.placeholder.com/400";

  // Add to Cart
  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showNotification("Selected variant is out of stock.", "error");
      return;
    }
    
    const cartItem = {
      product_id: product.id,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    };

    const userData = JSON.parse(localStorage.getItem("user"));

    try {
      if (userData?.user_id) {
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
        if (data.success) showNotification("Item added to cart successfully!", "success");
        else showNotification(data.message || "Failed to add to cart", "error");
      } else {
        // Guest cart
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartItemGuest = {
          product_id: product.id,
          name: product.title,
          price: parseFloat(product.price),
          qty: 1,
          size: selectedSize,
          color: selectedColor,
          imageUrl:
            product.images?.[0]
              ? `data:image/png;base64,${product.images[0].image_base64}`
              : "https://via.placeholder.com/60x60?text=No+Image",
          details: `Size: ${selectedSize || "N/A"}, Color: ${selectedColor || "N/A"}`,
          discount: product.discount,
          discount_type: product.discount_type,
        };

        const existingIndex = localCart.findIndex(
          (i) =>
            i.product_id === cartItemGuest.product_id &&
            i.size === cartItemGuest.size &&
            i.color === cartItemGuest.color
        );

        if (existingIndex >= 0) localCart[existingIndex].qty += 1;
        else localCart.push(cartItemGuest);

        localStorage.setItem("cart", JSON.stringify(localCart));
        showNotification("Item added to cart successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error adding item to cart", "error");
    }
  };

  // Notification
  const showNotification = (message, type) => {
    setNotification(null);
    setTimeout(() => {
      setNotification({ message, type });
    }, 50);

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

      {/* Left Section: Large Image + Thumbnails */}
      <div style={{ flex: "1 1 300px", textAlign: "center" }}>
        {/* LARGE IMAGE */}
        <img
          src={productImage}
          alt={product.title}
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        />

        {/* THUMBNAILS BELOW LARGE IMAGE */}
        {images.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "10px",
            }}
          >
            {images.map((img, index) => (
              <img
                key={index}
                src={`data:image/png;base64,${img.image_base64}`}
                alt="thumb"
                onClick={() => setCurrentImageIndex(index)}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border:
                    currentImageIndex === index ? "3px solid black" : "2px solid #ccc",
                  transition: "0.2s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Section: Product Info */}
      <div style={{ flex: "1 1 300px", maxWidth: "500px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{product.title}</h2>
        
        {/* Price and Stock Status */}
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          ৳{parseFloat(product.price).toFixed(2)}
        </p>
        <p style={{ 
            fontSize: "1rem", 
            marginBottom: "1rem", 
            color: isOutOfStock ? "#f44336" : "#4caf50",
            fontWeight: "bold"
        }}>
          Status: {isOutOfStock ? "Out of Stock" : "In Stock"} ({currentInventory} available)
        </p>

        <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>{product.description}</p>

        <ul style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
          <li><strong>Category:</strong> {product.category}</li>
          <li><strong>Discount:</strong> ৳{product.discount || 0} ({product.discount_type || "None"})</li>
          <li><strong>Gender:</strong> {product.gender}</li>
          <li><strong>Season:</strong> {product.season}</li>
        </ul>

        {/* --- SELECTABLE SIZE BUTTONS (Inline Layout) --- */}
        {uniqueSizes.length > 0 && (
            <div 
                style={{ 
                    marginBottom: "1rem", 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px'
                }}
            >
                <strong style={{ margin: 0, whiteSpace: 'nowrap' }}>Size:</strong>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {uniqueSizes.map((s) => (
                      <div
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        style={{
                          padding: '8px 15px',
                          border: s === selectedSize ? '2px solid black' : '1px solid #ccc',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: s === selectedSize ? 'bold' : 'normal',
                          backgroundColor: s === selectedSize ? '#f0f0f0' : 'white',
                          transition: '0.2s',
                        }}
                      >
                        {s}
                      </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- SELECTABLE COLOR SWATCHES (Inline Layout) --- */}
        {uniqueColors.length > 0 && (
            <div 
                style={{ 
                    marginBottom: "1.5rem", 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px'
                }}
            >
                <strong style={{ margin: 0, whiteSpace: 'nowrap' }}>Color:</strong>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {uniqueColors.map((c) => (
                      <div
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        title={c}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: c, // Assumes color string is a valid CSS color
                          cursor: 'pointer',
                          border: c === selectedColor ? '3px solid #333' : '2px solid #ccc',
                          outline: c === selectedColor ? '2px solid white' : 'none',
                          boxShadow: c === selectedColor ? '0 0 0 2px #333' : 'none',
                          transition: '0.2s',
                        }}
                      >
                        {/* Swatch content */}
                      </div>
                    ))}
                </div>
            </div>
        )}

        <button
          onClick={handleAddToCart}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
          disabled={isOutOfStock} // Disable button if out of stock
          style={{
            background: buttonHover && !isOutOfStock ? "#333" : isOutOfStock ? "#ccc" : "#1a1a1a",
            color: "white",
            padding: "0.8rem 1.5rem",
            border: "none",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            borderRadius: "5px",
            fontSize: "1rem",
            transition: "all 0.2s ease",
            transform: buttonHover && !isOutOfStock ? "scale(1.05)" : "scale(1)",
          }}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* Notification animation */}
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