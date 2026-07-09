import React, { useState } from "react";
import "../../App.css"; 

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      // Assuming your backend is running on the same localhost:5000 setup
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again later.");
      }

      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: "", email: "", subject: "", message: "" }); // Clear form

      // Hide success message after 5 seconds
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);

    } catch (error) {
      console.error("Contact form error:", error);
      setStatus({ loading: false, success: false, error: error.message });
    }
  };

  return (
    <div className="home-container">
      <header className="hero-header">
        <p>Contact Administration</p>
      </header>

      <div style={{ 
        maxWidth: "600px", 
        margin: "40px auto", 
        padding: "30px", 
        backgroundColor: "white", 
        borderRadius: "12px", 
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)" 
      }}>
        <h2 style={{ textAlign: "center", color: "#31708f", marginTop: 0, marginBottom: "20px" }}>
          Get in Touch
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
          Have a question about a venue or a booking? Send us a message and our team will get back to you shortly.
        </p>

        {status.success && (
          <div style={{ padding: "12px", backgroundColor: "#d4edda", color: "#155724", borderRadius: "6px", marginBottom: "20px", textAlign: "center" }}>
            ✅ Your message has been sent successfully!
          </div>
        )}

        {status.error && (
          <div style={{ padding: "12px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "6px", marginBottom: "20px", textAlign: "center" }}>
            ❌ {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="search-input" 
              placeholder="Enter your full name" 
              required 
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="search-input" 
              placeholder="Enter your email" 
              required 
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>Subject</label>
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              className="search-input" 
              placeholder="What is this regarding?" 
              required 
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>Message</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              className="search-input" 
              placeholder="Write your message here..." 
              required 
              rows="5"
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: "120px", padding: "12px" }}
            />
          </div>

          <button 
            type="submit" 
            className="book-btn-large" 
            disabled={status.loading}
            style={{ 
              marginTop: "10px", 
              width: "100%", 
              opacity: status.loading ? 0.7 : 1, 
              cursor: status.loading ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {status.loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <footer className="home-footer">
        © 2026 ATITHI APPYAN (অতিথি আপ্যায়ন) — Crafted with care for your celebrations
      </footer>
    </div>
  );
}

export default Contact;