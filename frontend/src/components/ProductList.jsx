// import ProductCard from "./ProductCard";

// export default function ProductList({ products }) {
//   return (
//     <div className="product-grid">
//       {products.map((p) => (
//         <ProductCard key={p.id} product={p} />
//       ))}
//     </div>
//   );
// }


import React, { useRef, useEffect } from 'react';
import ProductCard from "./ProductCard";
import "../styles/ProductList.css";

export default function ProductList({ products }) {
  // 1. Create a ref array to hold references to each ProductCard element's DOM node
  const productRefs = useRef([]);
  
  // Reset refs when component unmounts
  useEffect(() => () => (productRefs.current = []), []); 

  useEffect(() => {
    if (!products.length) return;

    // Intersection Observer options
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible'); // fade in
  } else {
    entry.target.classList.remove('visible'); // fade out
  }
});

    }, options);

    // Observe each product card wrapper
    productRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [products]);

  return (
    <div className="product-list-container">
      {products.map((p, index) => (
        <div 
          key={p.id}
          ref={el => productRefs.current[index] = el}
          className="product-card-wrapper"
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
