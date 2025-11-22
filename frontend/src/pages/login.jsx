import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/login_log.png"; // Local logo
import bgImage from "../assets/sample.jpeg"; // Local background image
import "../styles/login.css";
import API_BASE_URL from "./config";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login - Vantelle BD";
    const favicon = document.getElementById("favicon");
    if (favicon) favicon.href = "/login.png";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) return setError("All fields are required");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save token and user info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home"); // redirect after login
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT SECTION */}
        <div className="login-left">
          <div className="login-box glass">
            <img src={logo} alt="Vantelle Logo" className="login-logo" />
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Please login to continue</p>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>Email or Mobile</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="Enter email or mobile number"
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="register-text">
              Don't have an account? <Link to="/register" style={{ color: "blue", textDecoration: "underline" }}>Register here</Link>
            </p>
            <p className="guest-text">
             Or <Link to="/home" style = {{color: "blue",textDecoration: "underline"}}>Visit as Guest</Link>
            </p>

          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className="login-right"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="overlay glass">
            <h1 className="overlay-heading">Empowering Your Workflow</h1>
            <p className="overlay-text">
              Discover elegant simplicity with Vantelle BD’s platform.
            </p>
            <blockquote className="overlay-quote">
              “Innovation meets elegance — redefine your management experience.”
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
