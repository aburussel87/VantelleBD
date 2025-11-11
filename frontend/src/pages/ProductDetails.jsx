import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "./config";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    document.title = "Details - Vantelle BD";

    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/details/${id}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
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

        {/* Carousel controls */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrev}
              style={{
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
              }}
            >
              &#8592;
            </button>
            <button
              onClick={handleNext}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                cursor: "pointer",
              }}
            >
              &#8594;
            </button>
          </>
        )}
      </div>

      {/* Right: Product Info */}
      <div style={{ flex: "1 1 300px", maxWidth: "500px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{product.title}</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          ${parseFloat(product.price).toFixed(2)}
        </p>
        <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>{product.description}</p>

        <ul style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
          <li>
            <strong>Category:</strong> {product.category || "N/A"}
          </li>
          <li>
            <strong>Available Sizes:</strong>{" "}
            {product.size_options ? product.size_options.join(", ") : "N/A"}
          </li>
          <li>
            <strong>Color:</strong>{" "}
            {product.color ? product.color.split(",").join(", ") : "N/A"}
          </li>
          <li>
            <strong>Inventory:</strong> {product.inventory}
          </li>
          <li>
            <strong>Season:</strong> {product.season}
          </li>
          <li>
            <strong>Gender:</strong> {product.gender}
          </li>
          <li>
            <strong>Discount:</strong> ${product.discount || 0}
          </li>
        </ul>

        <button
          style={{
            background: "#1a1a1a",
            color: "white",
            padding: "0.8rem 1.5rem",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            fontSize: "1rem",
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
