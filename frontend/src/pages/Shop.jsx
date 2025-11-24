import { useState, useEffect, useMemo } from "react";
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
    
    // Set favicon
    let favicon = document.getElementById("favicon");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = "favicon";
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = "/login_log.png";

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shop`);
        const data = await response.json();
        if (data.success) {
          const mappedProducts = data.data.map((p) => ({
            id: p.id,
            name: p.title,
            price: parseFloat(p.price),
            // Use 'All' if gender is missing, for consistency
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

  // --- Dynamic Filtering & Pagination Logic ---

  // Generate categories dynamically
  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);

  // Generate subcategories dynamically based on selected category
  const subcategories = useMemo(() => {
    if (selectedCategory === "All") {
      // If 'All' is selected, show all unique subcategories across all products
      return ["All", ...new Set(products.map((p) => p.subcategory))].sort();
    }
    // Otherwise, show subcategories only for the selected category
    return ["All", ...new Set(products.filter((p) => p.category === selectedCategory).map((p) => p.subcategory))].sort();
  }, [products, selectedCategory]);

  // Filter products based on dropdowns
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const subcategoryMatch = selectedSubcategory === "All" || product.subcategory === selectedSubcategory;
      return categoryMatch && subcategoryMatch;
    });
  }, [products, selectedCategory, selectedSubcategory]);

  // Pagination calculation
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedSubcategory("All"); // Reset subcategory when primary category changes
    setCurrentPage(1); // Reset page on filter change
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
    setCurrentPage(1); // Reset page on filter change
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // --- Render ---

  if (loading) return <p style={{ textAlign: "center" }}>Loading products...</p>;

  // Simple button style
  const buttonStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
    background: 'white',
    transition: 'background 0.2s',
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>🛍️ Shop All</h2>

      {/* Category Filters */}
      <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "1rem", 
          marginBottom: "2rem",
          flexWrap: 'wrap' // Allows filters to stack on small screens
      }}>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #333", minWidth: '150px' }}
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={selectedSubcategory}
          onChange={handleSubcategoryChange}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #333", minWidth: '150px' }}
        >
          {subcategories.map((sub, i) => (
            <option key={i} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Product List - Now correctly passed the paginated products */}
      {currentProducts.length > 0 ? (
        <ProductList products={currentProducts} />
      ) : (
        <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.2rem', color: '#555' }}>
          No products found matching your filters.
        </p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', gap: "1rem", marginTop: "2rem" }}>
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1} 
            style={{ ...buttonStyle, opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontWeight: 'bold' }}>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages} 
            style={{ ...buttonStyle, opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}