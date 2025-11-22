import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";
import axios from "axios";
import API_BASE_URL from "./config";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // --------------------------
  // Total calculation factoring discount
  // --------------------------
  const total = items.reduce((acc, item) => {
    const discountAmount = item.discount_type === "Flat"
      ? item.discount || 0
      : ((item.discount || 0) / 100) * item.price;

    return acc + (item.price - discountAmount) * item.qty;
  }, 0);


  useEffect(() => {
    document.title = "Cart - Vantelle BD";

    const fetchCart = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (userData && userData.user_id) {
        try {
          const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const backendCart = response.data.data.map((item) => ({
            id: item.cart_id,
            product_id: item.product_id,
            name: item.product_name,
            price: parseFloat(item.unit_price),
            qty: item.quantity,
            discount: parseFloat(item.discount) || 0,
            discount_type: item.discount_type || "None",
            imageUrl:
              item.image_data && item.image_data.data
                ? `data:image/jpeg;base64,${btoa(
                  new Uint8Array(item.image_data.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                  )
                )}`
                : "https://via.placeholder.com/60x60?text=No+Image",
            details: `Size: ${item.size || "N/A"}, Color: ${item.color || "N/A"}`,
            size: item.size,
            color: item.color,
          }));

          setItems(backendCart);
        } catch (err) {
          console.error("Error fetching cart:", err);
          setItems([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest cart
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        setItems(localCart.map(i => ({
          ...i,
          discount: Number(i.discount) || 0,
          discount_type: i.discount_type || "None"
        })));

        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // --------------------------
  // Optimistic update helper
  // --------------------------
  const optimisticUpdate = async (newItems, apiCall) => {
    const previous = [...items];
    setItems(newItems);

    try {
      await apiCall();
    } catch (err) {
      setItems(previous);
      alert("Requested quantity exceeds available stock")
    }

  };

  // --------------------------
  // Quantity increase/decrease
  // --------------------------
  const handleQuantityChange = (item, change, isGuest = false) => {
    let updatedItems;
    if (isGuest) {
      updatedItems = items.map((i) => {
        if (
          i.product_id === item.product_id &&
          i.size === item.size &&
          i.color === item.color
        ) {
          return { ...i, qty: Math.max(1, i.qty + change) };
        }
        return i;
      });
    } else {
      updatedItems = items.map((i) =>
        i.id === item.id ? { ...i, qty: Math.max(1, i.qty + change) } : i
      );
    }

    optimisticUpdate(updatedItems, async () => {
      if (isGuest) {
        localStorage.setItem("cart", JSON.stringify(updatedItems));
      } else {
        const token = localStorage.getItem("token");

        const response = await axios.patch(
          `${API_BASE_URL}/cart/update`,
          { cart_id: item.id, quantity: item.qty + change },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // If backend returns success = false or 400 response
        if (response.data?.success === false) {
          alert(response.data.message);
          throw new Error(response.data.message || "Update failed");
        }

      }
    });
  };

  // --------------------------
  // Remove item
  // --------------------------
  const handleRemoveItem = (item, isGuest = false) => {
    const newItems = items.filter((i) => {
      if (isGuest) {
        return !(
          i.product_id === item.product_id &&
          i.size === item.size &&
          i.color === item.color
        );
      } else {
        return i.id !== item.id;
      }
    });

    optimisticUpdate(newItems, async () => {
      if (isGuest) {
        localStorage.setItem("cart", JSON.stringify(newItems));
      } else {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/cart/${item.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    });
  };

  // --------------------------
  // Deduct or remove if qty=1
  // --------------------------
  const handleDeductOrRemove = (item, isGuest = false) => {
    if (item.qty > 1) {
      handleQuantityChange(item, -1, isGuest);
    } else {
      handleRemoveItem(item, isGuest);
    }
  };

  // --------------------------
  // Render
  // --------------------------
  const userData = JSON.parse(localStorage.getItem("user"));

  if (loading) return <div className="cart">Loading your cart...</div>;

  if (items.length === 0)
    return (
      <div className="cart empty-cart">
        <h2>🛍️ Shopping Cart</h2>
        <p>Your cart is currently empty.</p>
        <button className="back-to-shop-btn" onClick={() => navigate("/shop")}>
          Continue Shopping
        </button>
      </div>
    );

  return (
    <div className="cart">
      <h2>🛍️ Shopping Cart</h2>

      <div className="cart-items-container">
        {items.map((item, idx) => {
          const discountAmount = item.discount || 0;

          return (
            <div className="cart-item" key={idx}>
              <div className="item-main-info">
                <img src={item.imageUrl} alt={item.name} className="item-image" />
                <div className="item-text-info">
                  <span className="item-name">{item.name}</span>
                  <div className="item-details-small">{item.details}</div>
                  <span className="item-price-per-unit">
                    Price: ৳{item.price.toFixed(2)} tk
                    {discountAmount > 0 && (
                      <span style={{ color: "red", marginLeft: "4px", fontWeight: "bold" }}>
                        (-{discountAmount.toFixed(2)} {item.discount_type === 'Flat' ? 'Flat' : '%'})
                      </span>
                    )}
                  </span>
                </div>
              </div>


              <div className="item-quantity-controls">
                <button
                  className="qty-btn reduce-btn"
                  onClick={() =>
                    userData
                      ? handleDeductOrRemove(item)
                      : handleDeductOrRemove(item, true)
                  }
                >
                  {item.qty > 1 ? "—" : "🗑️"}
                </button>

                <span className="item-qty">{item.qty}</span>

                <button
                  className="qty-btn increase-btn"
                  onClick={() =>
                    userData
                      ? handleQuantityChange(item, 1)
                      : handleQuantityChange(item, 1, true)
                  }
                >
                  +
                </button>
              </div>

              <div className="item-subtotal">
                ৳{(
                  (item.price - (item.discount_type === "Flat"
                    ? item.discount || 0
                    : ((item.discount || 0) / 100) * item.price)) * item.qty
                ).toFixed(2)}
              </div>


              <button
                className="remove-btn"
                onClick={() =>
                  userData
                    ? handleRemoveItem(item)
                    : handleRemoveItem(item, true)
                }
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <div className="cart-summary-container">
        <div className="cart-summary">
          <h3 className="total-label">Total:</h3>
          <span className="total-amount">৳{total.toFixed(2)}</span>
        </div>
        <button
          className="checkout-btn"
          onClick={() => {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (userData && userData.user_id) {
              // User logged in → proceed to checkout
              navigate("/checkout", { state: { items, total } });
            } else {
              // User not logged in → alert and redirect
              alert("Please login first to order your items!");
              navigate("/home");
            }
          }}
        >
          Proceed to Checkout
        </button>


      </div>
    </div>
  );
}
