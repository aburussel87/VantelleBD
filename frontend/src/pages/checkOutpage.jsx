import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "./config";
import "bootstrap/dist/css/bootstrap.min.css";

// ---------------- Helper Functions ----------------

const calculateFinalPrice = (item) => {
    const basePrice = Number(item.unit_price);
    const discount = Number(item.discount || 0);
    let discountAmount = 0;

    if (item.discount_type === "Flat") {
        discountAmount = discount;
    } else if (item.discount_type === "Percentage") {
        discountAmount = (Math.min(discount, 100) / 100) * basePrice;
    }

    return Math.max(0, basePrice - discountAmount);
};

const getShippingFee = (district) => {
    const normalizedDistrict = district?.toLowerCase() || "";
    if (normalizedDistrict === "dhaka") return 60.0;
    if (normalizedDistrict) return 120.0;
    return 0.0;
};

// ---------------- Component ----------------

export default function CheckoutPage() {
    const navigate = useNavigate();

    const [checkoutData, setCheckoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        division: "",
        district: "",
        upazila: "",
        address_line1: "",
        address_line2: "",
        payment_method: "COD",
        notes: "",
    });

    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);

    // ---------------- Estimated Delivery ----------------
    const estimatedDelivery = useMemo(() => {
        if (!formData.district) return "";
        const today = new Date();
        const days = formData.district.toLowerCase() === "dhaka" ? 2 : 5;
        today.setDate(today.getDate() + days);

        return today.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }, [formData.district]);

    // ---------------- Fetch Divisions ----------------
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/bd-locations/divisions`)
            .then((res) => {
                setDivisions(res.data.data || []);
            })
            .catch((err) => console.error("Division fetch failed", err));
    }, []);

    // ---------------- Fetch Districts ----------------
    const loadDistricts = async (divisionName) => {
        try {
            if (!divisionName) {
                setDistricts([]);
                return;
            }

            const res = await axios.get(
                `${API_BASE_URL}/bd-locations/districts/${encodeURIComponent(
                    divisionName.toLowerCase()
                )}`
            );

            setDistricts(res.data.data || []);
        } catch (err) {
            console.error("District fetch failed", err);
            setDistricts([]);
        }
    };

    // ---------------- Fetch Upazilas ----------------
    const loadUpazilas = async (divisionName, districtName) => {
        try {
            if (!districtName) {
                setUpazilas([]);
                return;
            }

            // Dhaka manual upazilas
            if (districtName.toLowerCase() === "dhaka") {
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
                    "Jatrabari",
                    "Keraniganj",
                ]);
                return;
            }

            const res = await axios.get(
                `${API_BASE_URL}/bd-locations/upazilas/${encodeURIComponent(
                    divisionName.toLowerCase()
                )}`
            );

            const allData = res.data.data || [];

            const districtObj = allData.find(
                (d) => d.district.toLowerCase() === districtName.toLowerCase()
            );

            setUpazilas(districtObj?.upazilla || []);
        } catch (err) {
            console.error("Upazila fetch failed", err);
            setUpazilas([]);
        }
    };

    // ---------------- Load Checkout Data ----------------
    useEffect(() => {
        const loadCheckout = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return navigate("/login");

                const res = await axios.get(`${API_BASE_URL}/checkout`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const { user, address, cart } = res.data;

                if (!cart?.length) {
                    alert("Your cart is empty");
                    navigate("/");
                    return;
                }

                setCheckoutData({ user, address, cart });

                const initial = {
                    full_name: user.full_name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    division: address?.division || "",
                    district: address?.city || "",
                    upazila: address?.state || "",
                    address_line1: address?.address_line1 || "",
                    address_line2: address?.address_line2 || "",
                    payment_method: "COD",
                    notes: "",
                };

                setFormData(initial);

                // preload if available
                if (initial.division) await loadDistricts(initial.division);
                if (initial.division && initial.district)
                    await loadUpazilas(initial.division, initial.district);
            } catch (err) {
                console.error("Checkout load failed", err);
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };

        loadCheckout();
    }, [navigate]);

    // ---------------- Watch Division Change ----------------
    useEffect(() => {
        if (!formData.division) {
            setDistricts([]);
            setUpazilas([]);
            setFormData((prev) => ({ ...prev, district: "", upazila: "" }));
            return;
        }
        loadDistricts(formData.division);
    }, [formData.division]);

    // ---------------- Watch District Change ----------------
    useEffect(() => {
        if (!formData.district) {
            setUpazilas([]);
            setFormData((p) => ({ ...p, upazila: "" }));
            return;
        }
        loadUpazilas(formData.division, formData.district);
    }, [formData.district]);

    // ---------------- Form Handlers ----------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    // ---------------- Validation ----------------
    const validateForm = () => {
        const err = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[0-9]{10,14}$/;

        if (!formData.full_name.trim()) err.full_name = "Required";
        if (!emailRegex.test(formData.email)) err.email = "Invalid email";
        if (!phoneRegex.test(formData.phone)) err.phone = "Invalid phone";
        if (!formData.division) err.division = "Required";
        if (!formData.district) err.district = "Required";
        if (!formData.address_line1.trim()) err.address_line1 = "Required";

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // ---------------- Place Order ----------------
    const placeOrder = async () => {
        if (!validateForm()) return;

        setIsPlacingOrder(true);

        const newTab = window.open("", "_blank");

        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                `${API_BASE_URL}/orders/place`,
                {
                    ...formData,
                    shipping_fee: getShippingFee(formData.district),
                    notes: formData.notes,
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            if (!res.data.success) throw new Error("Order failed");

            const orderId = res.data.order_id;

            navigate("/cart");
            newTab.location.href = `/order-success?order_id=${orderId}`;
        } catch (err) {
            alert("Order failed");
            newTab.close();
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // ---------------- Price Calculations ----------------
    const subtotal = useMemo(() => {
        if (!checkoutData?.cart) return 0;
        return checkoutData.cart.reduce(
            (sum, item) => sum + calculateFinalPrice(item) * item.quantity,
            0
        );
    }, [checkoutData]);

    const shippingFee = getShippingFee(formData.district);
    const grandTotal = subtotal + shippingFee;

    // ---------------- Render ----------------

    if (isLoading)
        return <div className="text-center py-5">Loading checkout...</div>;

    return (
        <div className="checkout-container py-5 container">
            <h2 className="fw-bold mb-4 border-bottom pb-2">📦 Secure Checkout</h2>

            <div className="row g-4">
                {/* LEFT SECTION */}
                <div className="col-md-7">
                    <div className="p-4 border rounded shadow-sm bg-white">
                        <h4 className="mb-4">Shipping Information</h4>

                        {/* Name */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                Full Name <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${
                                    errors.full_name ? "is-invalid" : ""
                                }`}
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                            {errors.full_name && (
                                <div className="invalid-feedback">
                                    {errors.full_name}
                                </div>
                            )}
                        </div>

                        {/* Email + Phone */}
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className={`form-control ${
                                        errors.email ? "is-invalid" : ""
                                    }`}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    Phone <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className={`form-control ${
                                        errors.phone ? "is-invalid" : ""
                                    }`}
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && (
                                    <div className="invalid-feedback">
                                        {errors.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Division / District / Upazila */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">
                                    Division <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${
                                        errors.division ? "is-invalid" : ""
                                    }`}
                                    name="division"
                                    value={formData.division}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Division</option>
                                    {divisions.map((d, i) => (
                                        <option key={i} value={d.division}>
                                            {d.division}
                                        </option>
                                    ))}
                                </select>
                                {errors.division && (
                                    <div className="invalid-feedback">
                                        {errors.division}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold">
                                    District <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${
                                        errors.district ? "is-invalid" : ""
                                    }`}
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    disabled={!formData.division}
                                >
                                    <option value="">Select District</option>
                                    {districts.map((d, i) => (
                                        <option key={i} value={d.district}>
                                            {d.district}
                                        </option>
                                    ))}
                                </select>
                                {errors.district && (
                                    <div className="invalid-feedback">
                                        {errors.district}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-bold">Upazila</label>
                                <select
                                    className="form-select"
                                    name="upazila"
                                    value={formData.upazila}
                                    onChange={handleChange}
                                    disabled={!formData.district}
                                >
                                    <option value="">Select Upazila</option>
                                    {upazilas.map((u, i) => (
                                        <option key={i} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Address Line 1 */}
                            <div className="col-md-12 mt-2">
                                <label className="form-label fw-bold">
                                    Address Line 1 <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${
                                        errors.address_line1 ? "is-invalid" : ""
                                    }`}
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleChange}
                                />
                                {errors.address_line1 && (
                                    <div className="invalid-feedback">
                                        {errors.address_line1}
                                    </div>
                                )}
                            </div>

                            {/* Address Line 2 */}
                            <div className="col-md-12 mt-2">
                                <label className="form-label fw-bold">
                                    Address Line 2 (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Notes */}
                            <div className="col-md-12 mt-3">
                                <label className="form-label fw-bold">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    className="form-control"
                                    name="notes"
                                    maxLength="150"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="2"
                                />
                                <small className="text-muted">
                                    {formData.notes.length}/150
                                </small>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <h4 className="mt-4 mb-3 pt-3 border-top">
                            Payment Method
                        </h4>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            className="form-select mb-3"
                        >
                            <option value="COD">Cash on Delivery</option>
                        </select>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="col-md-5">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">🛒 Order Summary</h5>
                        </div>
                        <div className="card-body">
                            {checkoutData.cart.map((item) => {
                                const price = calculateFinalPrice(item);

                                return (
                                    <div
                                        key={item.id}
                                        className="d-flex justify-content-between py-2 border-bottom"
                                    >
                                        <div>
                                            <p className="mb-0 fw-bold">
                                                {item.title} × {item.quantity}
                                            </p>
                                        </div>
                                        <span>
                                            ৳{(price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Subtotal</span>
                                <span className="fw-bold">
                                    ৳{subtotal.toFixed(2)}
                                </span>
                            </li>

                            <li className="list-group-item d-flex justify-content-between bg-light">
                                <span className="fw-bold">Shipping Fee</span>
                                <span className="fw-bold">
                                    {shippingFee > 0
                                        ? `৳${shippingFee.toFixed(2)}`
                                        : "Select District"}
                                </span>
                            </li>

                            <li className="list-group-item d-flex justify-content-between border-top border-2 border-primary">
                                <h5 className="mb-0 fw-bold">Grand Total</h5>
                                <h5 className="mb-0 fw-bold text-primary">
                                    ৳{grandTotal.toFixed(2)}
                                </h5>
                            </li>
                        </ul>

                        <div className="card-footer bg-light border-0">
                            <div className="alert alert-info text-center">
                                {formData.district ? (
                                    <strong>
                                        Estimated Delivery: {estimatedDelivery}
                                    </strong>
                                ) : (
                                    "Select district to see delivery time"
                                )}
                            </div>

                            <button
                                className="btn btn-primary w-100 py-2 fw-bold"
                                onClick={placeOrder}
                                disabled={isPlacingOrder || shippingFee === 0}
                            >
                                {isPlacingOrder
                                    ? "Placing Order..."
                                    : `Place Order (৳${grandTotal.toFixed(2)})`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
