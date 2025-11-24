import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import "../styles/HomeProductList.css";

export default function ProductList({ products }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef(null);

  // 1. Check Mobile/Resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Scroll Boundary Check
  const updateScrollButtons = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    // A small tolerance (1 or 2px) is often needed due to floating point math
    const isAtStart = slider.scrollLeft <= 5; 
    const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      updateScrollButtons();
      slider.addEventListener('scroll', updateScrollButtons);
      // Run once on load to set initial state
      window.addEventListener('load', updateScrollButtons); 
    }
    return () => {
      if (slider) {
        slider.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('load', updateScrollButtons);
      }
    };
  }, [isMobile, products]);


  // 3. Auto-slide for desktop (Paused on Hover)
  useEffect(() => {
    if (isMobile || isHovered) return;

    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = 300;
    const interval = setInterval(() => {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
        // Jump to the start (without smooth behavior for seamless loop)
        slider.scrollTo({ left: 0, behavior: "auto" }); 
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isMobile, isHovered]);

  const handleManualSlide = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    // Determine the scroll width (e.g., width of two cards)
    const cardWidth = 250; 
    const gap = 20;
    const scrollAmount = cardWidth * 2 + gap;

    slider.scrollBy({ 
      left: direction === 'left' ? -scrollAmount : scrollAmount, 
      behavior: "smooth" 
    });
  };

  return (
    <div 
      className="product-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isMobile && (
        <>
          <button 
            className={`arrow left ${!canScrollLeft ? 'hidden' : ''}`} 
            onClick={() => handleManualSlide('left')}
            aria-label="Scroll products left"
            disabled={!canScrollLeft}
          >
            ❮
          </button>
          <button 
            className={`arrow right ${!canScrollRight ? 'hidden' : ''}`} 
            onClick={() => handleManualSlide('right')}
            aria-label="Scroll products right"
            disabled={!canScrollRight}
          >
            ❯
          </button>
        </>
      )}

      <div
        ref={sliderRef}
        className={`product-list ${isMobile ? "mobile-list" : "desktop-slider"}`}
        role={isMobile ? "list" : "region"} 
        aria-label={isMobile ? "Product list" : "Product carousel"}
        tabIndex={isMobile ? null : 0} // Make slider focusable for keyboard users
      >
        {products.map((p) => (
          <div key={p.id} className={`product-card ${isMobile ? "fade-in" : ""}`} role="listitem">
            <ProductCard key={p.id} product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}