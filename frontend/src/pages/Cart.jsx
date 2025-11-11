import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css"; 

// --- UPDATED Initial mock data for the cart items with image and details ---
const initialItems = [
  { 
    id: 1, 
    name: "White Shirt", 
    price: 29.99, 
    qty: 1, 
    imageUrl: "https://via.placeholder.com/60x60/f0f0f0?text=Shirt", // Placeholder
    details: "Size: M, Color: White, Item #101" 
  },
  { 
    id: 2, 
    name: "Denim Jacket", 
    price: 59.99, 
    qty: 2, 
    imageUrl: "https://via.placeholder.com/60x60/c9d6de?text=Jacket", // Placeholder
    details: "Size: L, Color: Blue, Item #205" 
  },
  { 
    id: 3, 
    name: "Black Sneakers", 
    price: 79.50, 
    qty: 1, 
    imageUrl: "https://via.placeholder.com/60x60/1a1a1a?text=Shoe", // Placeholder
    details: "Size: US 10, Color: Black, Item #302" 
  },
];

export default function Cart() {
  const [items, setItems] = useState(initialItems);
  const navigate= useNavigate();
  // Calculate the total whenever the items change
  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  useEffect(() => {
    document.title = "Cart - Vantelle BD";
  }, []);

  // --- Handlers (Kept the same for functionality) ---

  const handleRemoveItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, change) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + change;
            return { ...item, qty: Math.max(1, newQty) };
          }
          return item;
        })
    );
  };
  
  const handleDeductOrRemove = (id) => {
    const itemToUpdate = items.find(item => item.id === id);
    if (!itemToUpdate) return;

    if (itemToUpdate.qty > 1) {
      handleQuantityChange(id, -1);
    } else {
      handleRemoveItem(id);
    }
  };


  // --- Render Logic ---

  if (items.length === 0) {
    return (
      <div className="cart empty-cart">
        <h2>🛍️ Shopping Cart</h2>
        <p>Your cart is currently empty.</p>
        <button className="back-to-shop-btn" onClick={()=> navigate("/shop")}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>🛍️ Shopping Cart</h2>

      {/* Cart Items List */}
      <div className="cart-items-container">
        {items.map((item) => (
          // Use flexbox on cart-item for main alignment
          <div className="cart-item" key={item.id}>
            
            {/* 1. Image and Main Details (Grouped) */}
            <div className="item-main-info">
                <img src={item.imageUrl} alt={item.name} className="item-image" />
                
                <div className="item-text-info">
                    <span className="item-name">{item.name}</span>
                    
                    {/* NEW: Small Details Section */}
                    <div className="item-details-small">
                        {item.details}
                    </div>
                    
                    <span className="item-price-per-unit">Price: ${item.price.toFixed(2)} ea.</span>
                </div>
            </div>

            {/* 2. Quantity Controls (Centered) */}
            <div className="item-quantity-controls">
              <button 
                className="qty-btn reduce-btn" 
                onClick={() => handleDeductOrRemove(item.id)}
                aria-label={item.qty > 1 ? "Reduce quantity by one" : "Remove item"}
              >
                {item.qty > 1 ? '—' : '🗑️'} 
              </button>

              <span className="item-qty">{item.qty}</span>

              <button 
                className="qty-btn increase-btn" 
                onClick={() => handleQuantityChange(item.id, 1)}
                aria-label="Increase quantity by one"
              >
                +
              </button>
            </div>

            {/* 3. Subtotal */}
            <div className="item-subtotal">
              ${(item.price * item.qty).toFixed(2)}
            </div>
            
            {/* 4. Direct Discard Option */}
            <button 
              className="remove-btn" 
              onClick={() => handleRemoveItem(item.id)}
              aria-label="Discard item"
              title="Discard item"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {/* Summary and Checkout */}
      <div className="cart-summary-container">
        <div className="cart-summary">
          <h3 className="total-label">Total:</h3>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>

        <button className="checkout-btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}