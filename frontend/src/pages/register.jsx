import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
// Optional: Add icons for a better look
// import { FaUserPlus, FaSpinner } from "react-icons/fa";

// --- Validation Regular Expressions (Matching Backend) ---
// Mobile number: Must be exactly 11 digits, no non-digit characters
const mobileRegex = /^\d{11}$/;
// Username: Must be lowercase, no spaces, no special/capital letters (allows dots/underscores)
const usernameRegex = /^[a-z0-9_.]+$/; 
// Email: Basic RFC 5322 standard check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    division: "",
    district: "",
    upazila: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    profile_image: null,
  });

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State to hold validation error messages for specific fields
  const [formErrors, setFormErrors] = useState({});

  // --- API Load Logic (Optimized) ---

  // 1. Load divisions (from BD API)
  useEffect(() => {
    fetch("https://bdapis.com/api/v1.1/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data.data || []))
      .catch((err) => console.error("Division load error:", err));
  }, []);

  // 2. Load districts based on division
  useEffect(() => {
    setDistricts([]); // Clear districts on division change
    setUpazilas([]); // Clear upazilas on division change
    if (formData.division) {
      const divisionName = encodeURIComponent(formData.division.toLowerCase());
      // Use the API endpoint that lists districts by division
      fetch(`https://bdapis.com/api/v1.1/division/${divisionName}`)
        .then((res) => res.json())
        .then((data) => {
            // Data structure might be different, check if it has a list of districts
            setDistricts(data.data || []);
        })
        .catch((err) => console.error("District load error:", err));
    }
  }, [formData.division]);

  // 3. Load upazilas based on district
  useEffect(() => {
    setUpazilas([]); // Clear upazilas on district change
    if (formData.district.toLowerCase() === "dhaka") {
        setUpazilas([
          "Dhanmondi",
          "Mirpur",
          "Tejgaon",
          "Gulshan",
          "Uttara",
          "Mohammadpur",
          "Banani",
          "Badda",
          "Motijheel",
          "Khilgaon",
        ]);
        return;
      }
    if (formData.district) {
      const divisionName = encodeURIComponent(formData.division.toLowerCase());
      // API v1.2 is often better for district/upazila mapping
      fetch(`https://bdapis.com/api/v1.2/division/${divisionName}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            // Find the district object that matches exactly the selected district
            const districtObj = data.data.find(
              (d) => d.district.toLowerCase() === formData.district.toLowerCase()
            );

            if (districtObj && districtObj.upazilla) {
              // Ensure upazilla is an array of strings
              setUpazilas(districtObj.upazilla);
            } else {
              setUpazilas([]);
            }
          }
        })
        .catch((err) => console.error("Upazila load error:", err));
    }
  }, [formData.district, formData.division]);


  // --- Handlers ---

  // Handle input change and perform live validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific error message on change
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData({ ...formData, profile_image: file });
        setPreview(URL.createObjectURL(file));
    } else {
        setFormData({ ...formData, profile_image: null });
        setPreview(null);
    }
  };

  // Perform full frontend validation
  const validate = () => {
    const errors = {};
    let isValid = true;
    
    // Username validation
    if (!formData.username || !usernameRegex.test(formData.username)) {
        errors.username = "Username must be lowercase, without spaces, and contain only letters, numbers, dots, or underscores.";
        isValid = false;
    }
    
    // Email validation
    if (!formData.email || !emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address.";
        isValid = false;
    }

    // Phone validation (11 digits, numbers only)
    if (!formData.phone || !mobileRegex.test(formData.phone)) {
        errors.phone = "Phone number must be exactly 11 digits and contain only numbers.";
        isValid = false;
    }
    
    // Basic required field check (password)
    if (!formData.password) {
        errors.password = "Password is required.";
        isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validate()) {
        setError("Please correct the errors in the form.");
        return;
    }
    
    setLoading(true);

    const formDataToSend = new FormData();
    // Use for...in for cleaner iteration over keys
    for (const key in formData) {
        if (key === 'profile_image' && formData[key]) {
             formDataToSend.append(key, formData[key]);
        } else if (key !== 'profile_image') {
            formDataToSend.append(key, formData[key]);
        }
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        alert("Registration successful! You will be redirected to the home page.");
        navigate("/home");
      } 
      // This part handles 400/409 errors sent from the backend
      else {
        setError(res.data.message || "Registration failed. Please check your details.");
      }
    } catch (err) {
      // Check for specific error message from the backend response
      const backendError = err.response?.data?.message || "Server error. Try again later.";
      console.error("Axios Error:", err);
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg p-5 mx-auto border-0" style={{ maxWidth: "800px" }}>
        <h2 className="text-center mb-5 text-primary fw-bold">
          {/* <FaUserPlus className="me-2"/> */}
          Create Your Vantelle Account
        </h2>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* --- User Details Section --- */}
          <h5 className="mb-3 text-secondary">Personal Information</h5>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your full legal name"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                placeholder="lowercase, no spaces (e.g., john_doe)"
                required
              />
              {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                placeholder="e.g., example@gmail.com"
                required
              />
              {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone (11 Digits) *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                placeholder="e.g., 01XXXXXXXXX"
                maxLength="11"
                required
              />
              {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <hr className="my-4" />

          {/* --- Address Section --- */}
          <h5 className="mb-3 text-secondary">Address Details</h5>
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Division *</label>
              <select
                name="division"
                className="form-select"
                onChange={handleChange}
                value={formData.division}
                required
              >
                <option value="">Select Division</option>
                {divisions.map((d, i) => (
                  <option key={i} value={d.division}>
                    {d.division}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">District (City) *</label>
              <select
                name="district"
                className="form-select"
                onChange={handleChange}
                value={formData.district}
                disabled={!formData.division || districts.length === 0}
                required
              >
                <option value="">Select District</option>
                {districts.map((dist, i) => (
                  <option key={i} value={dist.district}>
                    {dist.district}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Upazila (State) *</label>
              <select
                name="upazila"
                className="form-select"
                onChange={handleChange}
                value={formData.upazila}
                disabled={!formData.district || upazilas.length === 0}
                required
              >
                <option value="">Select Upazila</option>
                {upazilas.map((u, i) => (
                  <option key={i} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold">Address Line 1 *</label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                className="form-control"
                placeholder="House No, Flat No, Road/Street Name"
                required
              />
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                className="form-control"
                placeholder="Direction or Landmark/Building/Structure near you"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Postal Code *</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., 1205"
                required
              />
            </div>
          </div>
          
          <hr className="my-4" />

          {/* --- Profile Image Section --- */}
          <h5 className="mb-3 text-secondary">Profile Picture</h5>
          <div className="row g-4 align-items-center mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              {preview ? (
                <div className="d-flex align-items-center">
                    <img
                        src={preview}
                        alt="Profile Preview"
                        className="img-thumbnail border border-primary p-1"
                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: '50%' }}
                    />
                    <small className="ms-3 text-success">Image ready for upload.</small>
                </div>
              ) : (
                <small className="text-muted">No image selected. Default image will be used.</small>
              )}
            </div>
          </div>
          

          <div className="text-center mt-5">
            <button
              type="submit"
              className="btn btn-primary btn-lg w-75"
              disabled={loading}
            >
              {loading ? (
                <>
                  {/* <FaSpinner className="spin me-2" /> */}
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}