import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/login_log.png"; // Local logo
import bgImage from "../assets/sample.jpeg"; // Local background image
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login-Vantelle BD";
    const favicon = document.getElementById("favicon");
    if (favicon) {
      favicon.href = "/login.png"; // Path to your page-specific favicon
    }
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "admin@gmail.com" && password === "123") {
      localStorage.setItem("token", "fake-jwt-token");
      navigate("/home");
    } else {
      setError("Invalid email or password");
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
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
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
              <button type="submit" className="login-button">
                Login
              </button>
            </form>
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
