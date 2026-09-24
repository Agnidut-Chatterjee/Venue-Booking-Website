import React, { useState } from "react";

function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin", // Default role
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    // Here you would normally send the data to your backend/database
    console.log("New Admin Registered:", formData);

    // Show success message and clear form
    setMessage({ type: "success", text: "New Admin registered successfully!" });
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Admin",
    });

    // Clear the success message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div style={{ padding: "40px 20px", fontFamily: "sans-serif", display: "flex", justifyContent: "center" }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "500px", 
        background: "#fff", 
        padding: "30px", 
        borderRadius: "8px", 
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
      }}>
        <h2 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>Register New Admin</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>Create credentials for a new dashboard administrator.</p>

        {/* Status Message */}
        {message.text && (
          <div style={{ 
            padding: "10px", 
            marginBottom: "20px", 
            borderRadius: "4px", 
            textAlign: "center",
            backgroundColor: message.type === "error" ? "#f8d7da" : "#d4edda",
            color: message.type === "error" ? "#721c24" : "#155724"
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="e.g. Rahul Sharma"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="admin@example.com"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Create a strong password"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Type password again"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: "10px", 
              padding: "12px", 
              backgroundColor: "#F97316", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer" 
            }}
          >
            Register Admin
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegister;