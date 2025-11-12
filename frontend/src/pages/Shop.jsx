import { useState, useEffect } from "react";
import ProductList from "../components/ProductList";
import API_BASE_URL from "./config";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Dropdown states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");

  useEffect(() => {
    document.title = "Shop - Vantelle BD";
    
    const favicon = document.getElementById("favicon");
    if (favicon) {
      favicon.href = "/login_log.png"; // path to your local image in public folder
    } else {
      const link = document.createElement("link");
      link.id = "favicon";
      link.rel = "icon";
      link.href = "/login_log.png";
      document.head.appendChild(link);
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shop`);
        const data = await response.json();
        if (data.success) {
          const mappedProducts = data.data.map((p) => ({
            id: p.id,
            name: p.title,
            price: parseFloat(p.price),
            category: p.gender || "All",
            subcategory: p.category || "Other",
            image:
              p.images && p.images.length > 0
                ? `data:image/png;base64,${p.images[0].image}`
                : "https://via.placeholder.com/400",
          }));
          setProducts(mappedProducts);
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading products...</p>;

  // Generate categories dynamically
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Generate subcategories dynamically based on selected category
  const subcategories =
    selectedCategory === "All"
      ? ["All"]
      : ["All", ...new Set(products.filter((p) => p.category === selectedCategory).map((p) => p.subcategory))];

  // Filter products based on dropdowns
  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const subcategoryMatch = selectedSubcategory === "All" || product.subcategory === selectedSubcategory;
    return categoryMatch && subcategoryMatch;
  });

  // Pagination calculation
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Shop All</h2>

      {/* Category Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("All");
            setCurrentPage(1); // Reset page on filter change
          }}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={selectedSubcategory}
          onChange={(e) => {
            setSelectedSubcategory(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {subcategories.map((sub, i) => (
            <option key={i} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <ProductList products={currentProducts} />

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
        <button onClick={handlePrev} disabled={currentPage === 1} style={buttonStyle}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages} style={buttonStyle}>
          Next
        </button>
      </div>
    </div>
  );
}

// Simple button style
const buttonStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
};
