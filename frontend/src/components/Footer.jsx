import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import "../styles/Footer.css";

// Helper component for structured columns
const FooterColumn = ({ title, children }) => (
    <div className="footer-column">
        <h3>{title}</h3>
        {children}
    </div>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      {/* --- Main Content Grid --- */}
      <div className="footer-content-grid">
        
        {/* 1. Quick Links */}
        <FooterColumn title="Quick Links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop All</Link>
          <Link to="/about">About Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/blog">Blog</Link>
        </FooterColumn>

        {/* 2. Customer Service & Legal */}
        <FooterColumn title="Customer Service">
          <Link to="/contact">Contact Us</Link>
          <Link to="/returns">Returns & Exchanges</Link>
          <Link to="/shipping">Shipping Policy</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </FooterColumn>

        {/* 3. Contact Information */}
        <FooterColumn title="Contact Us">
            <div className="contact-item">
                <MapPin size={18} className="icon" />
                <p>Bangladesh University of Engineering and Technology, Dhaka</p>
            </div>
            <div className="contact-item">
                <Phone size={18} className="icon" />
                <p>+880 17XX XXX XXX</p>
            </div>
            <div className="contact-item">
                <Mail size={18} className="icon" />
                <p>support@vantellebd.com</p>
            </div>
            <p className="working-hours">Mon - Fri: 9:00 AM - 6:00 PM</p>
        </FooterColumn>

        {/* 4. Social Media & Newsletter Placeholder */}
        <FooterColumn title="Connect">
            <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook size={24} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram size={24} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <Twitter size={24} />
                </a>
            </div>
            <div className="newsletter-placeholder">
                <p>Stay up to date with our latest collections.</p>
            </div>
        </FooterColumn>
      </div>

      {/* --- Copyright Bar --- */}
      <div className="footer-copyright-bar">
        <p>© {currentYear} Vantelle BD | All Rights Reserved. Built for Bangladesh.</p>
      </div>
    </footer>
  );
}