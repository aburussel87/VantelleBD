import { useState, useEffect } from "react";
import ProductList from "../components/ProductList";

export default function Shop() {
  // Dynamically change browser tab title
  useEffect(() => {
    document.title = "Shop - Vantelle BD";
  }, []);

  // Example product data with category & subcategory
  const products = [
    { id: 1, name: "Classic White Shirt", price: 29.99, category: "Men", subcategory: "Shirt", image: "https://via.placeholder.com/400" },
    { id: 2, name: "Black Hoodie", price: 39.99, category: "Men", subcategory: "Winter", image: "https://via.placeholder.com/400" },
    { id: 3, name: "Blue Jeans", price: 45.99, category: "Men", subcategory: "Pant", image: "https://via.placeholder.com/400" },
    { id: 4, name: "Leather Jacket", price: 89.99, category: "Men", subcategory: "Winter", image: "https://via.placeholder.com/400" },
    { id: 5, name: "Summer Dress", price: 49.99, category: "Women", subcategory: "Summer", image: "https://via.placeholder.com/400" },
    { id: 6, name: "Kids T-Shirt", price: 19.99, category: "Child", subcategory: "Shirt", image: "https://via.placeholder.com/400" },
    { id: 7, name: "Classic White Shirt", price: 29.99, category: "Men", subcategory: "Shirt", image: "https://via.placeholder.com/400" },
    { id: 8, name: "Black Hoodie", price: 39.99, category: "Men", subcategory: "Winter", image: "https://via.placeholder.com/400" },
    { id: 9, name: "Blue Jeans", price: 45.99, category: "Men", subcategory: "Pant", image: "https://via.placeholder.com/400" },
    { id: 10, name: "Leather Jacket", price: 89.99, category: "Men", subcategory: "Winter", image: "https://via.placeholder.com/400" },
    { id: 11, name: "Summer Dress", price: 49.99, category: "Women", subcategory: "Summer", image: "https://via.placeholder.com/400" },
    { id: 12, name: "Kids T-Shirt", price: 19.99, category: "Child", subcategory: "Shirt", image: "https://via.placeholder.com/400" },
  ];

  // Dropdown states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");

  // Generate categories dynamically
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // Generate subcategories dynamically based on selected category
  const subcategories =
    selectedCategory === "All"
      ? ["All"]
      : ["All", ...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory))];

  // Filter products based on dropdowns
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const subcategoryMatch = selectedSubcategory === "All" || product.subcategory === selectedSubcategory;
    return categoryMatch && subcategoryMatch;
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Shop All</h2>

      {/* Category Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        {/* Main Category */}
        <select
          value={selectedCategory}
          onChange={e => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("All"); // reset subcategory on main category change
          }}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Subcategory */}
        <select
          value={selectedSubcategory}
          onChange={e => setSelectedSubcategory(e.target.value)}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {subcategories.map((sub, i) => (
            <option key={i} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Product List */}
      <ProductList products={filteredProducts} />
    </div>
  );
}
