import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/login";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import WhatsAppFloat from "./components/WhatsappFloat"; // optional floating icon
import Register from "./pages/register";
import ProfilePage from "./pages/profile";
import CheckoutPage from "./pages/checkOutpage";
import OrderSuccess from "./pages/order-success";
import AllOrders from "./pages/orders";
import "./styles/style.css";
import React from "react";

// ✅ ErrorBoundary definition
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1 style={{ textAlign: "center", marginTop: "50px" }}>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

function Layout() {
  const location = useLocation();

  // Hide Navbar, Footer, and WhatsApp icon only on login/register/order-success pages
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/order-success";

  return (
    <div className="App">
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<AllOrders />} />
      </Routes>

      {!hideLayout && <Footer />}
      {!hideLayout && <WhatsAppFloat />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      {/* ✅ Wrap Layout with ErrorBoundary */}
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    </Router>
  );
}
