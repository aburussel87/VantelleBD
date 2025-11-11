import React from "react";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";

export default function ChatFloat() {
  const waNumber = "8801786918515";
  const waMessage = "Hello, I would like to know more about your products!";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const messengerUsername = "VantelleBD"; // replace with your page username
  const messengerUrl = `https://m.me/${messengerUsername}`;

  const buttonStyle = {
    position: "fixed",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s ease-in-out",
    zIndex: 1000,
    textDecoration: "none",
  };

  return (
    <>
      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...buttonStyle, backgroundColor: "#25D366", bottom: "20px" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={34} />
      </a>

      {/* Messenger Button */}
      <a
        href={messengerUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...buttonStyle, backgroundColor: "#0084FF", bottom: "90px" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Chat on Messenger"
      >
        <FaFacebookMessenger size={34} />
      </a>
    </>
  );
}
