import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

export default function ProductCard({ product }) {
  // Ensure price is a number for calculation
  const price = parseFloat(product.price);
  
  // Calculate final discounted price for visual emphasis (if applicable)
  let finalPrice = price;
  
  if (product.discount && product.discount_type === "Percentage") {
    const discountAmount = price * (parseFloat(product.discount) / 100);
    finalPrice = price - discountAmount;
  } else if (product.discount && product.discount_type === "Flat") {
    finalPrice = price - parseFloat(product.discount);
  }
  
  // Ensure final price doesn't go below zero
  finalPrice = Math.max(0, finalPrice);

  const hasDiscount = product.discount && parseFloat(product.discount) > 0;

  return (
    // The Link component wraps the card for easy navigation
    <Link to={`/product/${product.id}`} className="product-card">
      
      {/* 1. Product Image */}
      <img src={product.image} alt={product.name} />
      
      {/* 2. Info Block */}
      <div className="info">
        {/* Product Title */}
        <h4>{product.name}</h4>
        
        {/* Pricing Block */}
        <div className="pricing-container">
          
          {hasDiscount ? (
            // Show original and final price when discounted
            <>
            {/* Final Price (Prominent) - Uses the class p.price defined in your CSS */}
              <p className="price" style={{
                fontSize: '1rem'
              }}>
                ৳{finalPrice.toFixed(2)}
              </p>
              {/* Original Price (Strikethrough) */}
              <p className="original-price" style={{
                textDecoration: 'line-through',
                color: '#999',
                fontSize: '0.9rem',
                marginRight: '10px',
                fontWeight: '400'
              }}>
                ৳{price.toFixed(2)}
              </p>
              
              
            </>
          ) : (
            // Show regular price
            <p className="price" style={{ fontSize: '1rem' }}>
              ৳{price.toFixed(2)}
            </p>
          )}
          {hasDiscount && (
          <p className="discount-tag" style={{
            color: '#27ae60',
            fontWeight: '600',
            fontSize: '0.9rem',
            marginTop: '0px'
          }}>
            {product.discount_type === "Flat" 
              ? `Save ৳${product.discount}` 
              : `${product.discount}% OFF`}
          </p>
        )}
        </div>
        
        {/* Discount Tag (Optional: to show discount text clearly) */}
        
      </div>
    </Link>
  );
}