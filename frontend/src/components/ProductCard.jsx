import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="info">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    </Link>
  );
}
