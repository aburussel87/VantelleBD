import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import ProductList from "../components/ProductList";
import  API_BASE_URL  from "./config";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "HOME - Vantelle BD";

    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/home`);
        const data = await response.json();

        if (data.success) {
          const formatted = data.data.map((product) => ({
            id: product.id,
            name: product.title,
            price: parseFloat(product.price),
            image:
              product.images && product.images.length > 0
                ? `data:image/png;base64,${product.images[0].image}`
                : "https://via.placeholder.com/400",
          }));

          setFeatured(formatted);
        } else {
          console.error("Failed to load featured products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading featured products...</p>;

  return (
    <div>
      <HeroSection />
      <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Featured Products</h2>
      <ProductList products={featured} />
    </div>
  );
}
