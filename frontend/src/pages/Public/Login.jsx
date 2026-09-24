import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../AuthContext'; // Adjust path if needed
import '../../App.css'; // Make sure this path points to your App.css file

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // State variables to store what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      console.log("DATA FROM BACKEND:", data); 

      if (response.ok) {
        // Feed the user object into the Context
        login({
          name: data.user.name, 
          email: data.user.email,
          id: data.user.id,
          photo: data.user.photo || null 
        });

        navigate('/'); // Go to homepage
      } else {
        setErrorMessage(data.message); 
      }
    } catch (error) {
      console.error("Login failed", error);
      setErrorMessage("Cannot connect to server. Please try again later.");
    }
  };

  return (
    <div className="Login-Register-page-wrapper">
      <div className="Login-Register-card">
        <h2>Login to Atithi Appayan</h2>
        
        {/* Error Message Display */}
        {errorMessage && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center", fontSize: "14px" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <label style={{ fontWeight: "bold", fontSize: "14px", color: "#374151", marginBottom: "5px", display: "block" }}>
            Email:
          </label>
          <input 
            type="email" 
            className="Login-Register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="Enter your email"
          />

          <label style={{ fontWeight: "bold", fontSize: "14px", color: "#374151", marginBottom: "5px", display: "block" }}>
            Password:
          </label>
          <input 
            type="password" 
            className="Login-Register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder="Enter your password"
          />

          <button type="submit" className="Login-Register-btn">
            Login
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#4b5563" }}>
          <span>Don't have an account? </span>
          <Link to="/register" style={{ color: "#ea580c", textDecoration: "none", fontWeight: "bold" }}>
            Register here
          </Link>
          <span> | </span>
          <Link to="/forgot-password" style={{ color: "#ea580c", textDecoration: "none", fontWeight: "bold" }}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;