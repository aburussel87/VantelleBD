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

import "./styles/style.css";

function Layout() {
  const location = useLocation();

  // ✅ Hide Navbar, Footer, and WhatsApp icon only on login page
  const hideLayout = location.pathname === "/login" || location.pathname === "/register";

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
      </Routes>

      {!hideLayout && <Footer />}
      {!hideLayout && <WhatsAppFloat />} {/* Optional floating icon */}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
