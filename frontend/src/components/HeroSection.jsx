import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <div className="hero">
      <div className="hero-constent">
        <h1>Discover your own style </h1>
        <p>Trendy clothes at affordable prices</p>
        <Link to="/shop" className="btn">
          <button style={{
            background: "white",
            color: "black",
            border: "none",
            padding: "0.7rem 1.5rem",
            marginTop: "1rem",
            cursor: "pointer",
            borderRadius: "5px",
            fontWeight: "bold"
          }}>Shop Now</button>
        </Link>
      </div>
    </div>
  );
}
