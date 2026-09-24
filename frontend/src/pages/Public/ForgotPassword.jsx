import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../App.css'; // Make sure this path points to your CSS file

function ForgotPassword() {
  // We use 'step' to track which screen to show (1 = Email, 2 = OTP & New Password)
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate(); 

  // --- HANDLER FOR STEP 1: SEND OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault(); 

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Remember we mapped this to e_mail on your backend!
        body: JSON.stringify({ e_mail: email }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP sent to your email!");
        setStep(2); // Instantly switch the screen to Step 2
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Cannot connect to server. Is your Express backend running?");
    }
  };

  // --- HANDLER FOR STEP 2: RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault(); 

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return; 
    }

    try {
      // NOTE: We will build this route on the backend next!
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ e_mail: email, otp: otp, newPassword: password }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password reset successful! You can now log in.");
        navigate("/login"); 
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Cannot connect to server.");
    }
  };

  return (
    <div className="Login-Register-page-wrapper">
      
      {/* =========================================
          STEP 1: EMAIL SCREEN
          ========================================= */}
      {step === 1 && (
        <form className="Login-Register-card" onSubmit={handleSendOtp}>
          <h2>Forgot Password</h2>
          <p style={{ marginBottom: "15px", color: "#555" }}>
            Enter your registered email to receive an OTP.
          </p>
          
          <input 
            className="Login-Register-input" 
            placeholder="Enter your Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button type="submit" className="Login-Register-btn">Send OTP</button>
          
          <p style={{ marginTop: "15px", cursor: "pointer", color: "#007bff", textDecoration: "underline" }} onClick={() => navigate("/login")}>
            Back to Login
          </p>
        </form>
      )}

      {/* =========================================
          STEP 2: OTP & NEW PASSWORD SCREEN
          ========================================= */}
      {step === 2 && (
        <form className="Login-Register-card" onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <p style={{ marginBottom: "15px", color: "#555" }}>
            OTP sent to <strong>{email}</strong>
          </p>
          
          <input 
            className="Login-Register-input" 
            placeholder="Enter 6-digit OTP" 
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          
          <input 
            className="Login-Register-input" 
            placeholder="New Password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input 
            className="Login-Register-input" 
            placeholder="Confirm New Password" 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="Login-Register-btn">Reset Password</button>
        </form>
      )}

    </div>
  );
}

export default ForgotPassword;