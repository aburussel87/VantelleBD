import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    division: "",
    district: "",
    upazila: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    profile_image: null,
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  // Convert Uint8Array profile_image to base64
  const convertProfileImage = (profile_image) => {
    if (!profile_image?.data) return null;
    return `data:image/jpeg;base64,${btoa(
      new Uint8Array(profile_image.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
    )}`;
  };

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const address = parsedUser.addresses || {};
    setFormData({
      full_name: parsedUser.full_name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      gender: parsedUser.gender || "",
      division: address.division || "",
      district: address.city || "",
      upazila: address.state || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      postal_code: address.postal_code || "",
      profile_image: null,
    });

    if (parsedUser.profile_image) {
      setPreview(convertProfileImage(parsedUser.profile_image));
    }
  }, [navigate]);

  // Load divisions
  useEffect(() => {
    fetch("https://bdapis.com/api/v1.1/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data.data || []))
      .catch((err) => console.error("Division load error:", err));
  }, []);

  // Load districts based on division
  useEffect(() => {
    setDistricts([]);
    setUpazilas([]);
    if (formData.division) {
      const divisionName = encodeURIComponent(formData.division.toLowerCase());
      fetch(`https://bdapis.com/api/v1.1/division/${divisionName}`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.data || []))
        .catch((err) => console.error("District load error:", err));
    }
  }, [formData.division]);

  // Load upazilas based on district
  useEffect(() => {
    setUpazilas([]);
    if (!formData.district) return;

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

    const divisionName = encodeURIComponent(formData.division.toLowerCase());
    fetch(`https://bdapis.com/api/v1.2/division/${divisionName}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          const districtObj = data.data.find(
            (d) => d.district.toLowerCase() === formData.district.toLowerCase()
          );
          if (districtObj?.upazilla) setUpazilas(districtObj.upazilla);
        }
      })
      .catch((err) => console.error("Upazila load error:", err));
  }, [formData.district, formData.division]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formToSend.append(key, formData[key]);
        }
      });

      const res = await axios.put(`${API_BASE_URL}/update`, formToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        const updatedUser = res.data.updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Popup message
        alert(res.data.message || "Profile updated successfully!");

        // ✅ Redirect to home/dashboard after success
        navigate("/"); // or navigate("/dashboard");
      }
      else {
        setMessage(res.data.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container my-5">
      <div className="card shadow-lg p-5 mx-auto border-0" style={{ maxWidth: "800px" }}>
        <h2 className="text-center mb-5 text-primary fw-bold">Update Profile</h2>

        {message && <div className="alert alert-success text-center">{message}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* --- Personal Info --- */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <hr />

          {/* --- Address --- */}
          <h5 className="text-secondary mb-3">Address</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Division</label>
              <select name="division" value={formData.division} onChange={handleChange} className="form-select">
                <option value="">Select Division</option>
                {divisions.map((d, i) => (
                  <option key={i} value={d.division}>{d.division}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">District</label>
              <select name="district" value={formData.district} onChange={handleChange} className="form-select" disabled={!formData.division}>
                <option value="">Select District</option>
                {districts.map((dist, i) => (
                  <option key={i} value={dist.district}>{dist.district}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Upazila</label>
              <select name="upazila" value={formData.upazila} onChange={handleChange} className="form-select" disabled={!formData.district}>
                <option value="">Select Upazila</option>
                {upazilas.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="col-md-12">
              <label className="form-label">Address Line 1</label>
              <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-12">
              <label className="form-label">Address Line 2</label>
              <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <hr />

          {/* --- Profile Image --- */}
          <h5 className="text-secondary mb-3">Profile Picture</h5>
          <div className="mb-4 d-flex align-items-center gap-3">
            <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
            {preview && <img src={preview} alt="Profile Preview" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />}
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary w-50" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
