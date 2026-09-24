import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css'; 

// 👉 1. Import AuthContext so we can tell the Navbar you logged in!
// (Adjust the path if your AuthContext.jsx is in a different folder)
import { AuthContext } from '../../AuthContext'; 

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  
  const [step, setStep] = useState(1); 
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); 
  
  const navigate = useNavigate(); 
  
  // 👉 2. Pull the login function out of your Context
  const { login } = useContext(AuthContext); 

  // ==========================================
  // STEP 1: Verify Credentials & Send OTP
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault(); 
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify credentials');
      }

      setMessage("OTP sent to your email! Please check your inbox.");
      setStep(2); 

    } catch (err) {
      setError(err.message);
    }
  };

  // ==========================================
  // STEP 2: Verify OTP & Final Login
  // ==========================================
  const handleVerifyLogin = async (e) => {
    e.preventDefault(); 
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid Security Code');
      }

      console.log('Logged in successfully:', data);
      
      // Save your backend token
      localStorage.setItem('adminToken', data.token); 

      // 👉 3. THE FIX: Tell the global Context that an Admin just logged in!
      login({
        email: email,
        name: data.name || "Admin", // Fallback to "Admin" if your backend doesn't send a name
        role: "admin" // <--- This tells the Navbar to show the Admin buttons!
      });

      // 👉 4. Now redirect to dashboard
      navigate('/AdminDashboard'); 

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="Login-Register-page-wrapper">
      <div className="Login-Register-card"> 
        <h2>Admin Portal</h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
        {message && <p style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>{message}</p>}

        {/* STEP 1: EMAIL & PASSWORD */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column' }}>
            <input 
              className="Login-Register-input" 
              placeholder="Admin Email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              className="Login-Register-input" 
              placeholder="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="Login-Register-btn">Send Security Code</button>
          </form>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyLogin} style={{ display: 'flex', flexDirection: 'column' }}>
             <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
               Logging in as: <strong>{email}</strong>
             </p>
             <input 
              className="Login-Register-input" 
              placeholder="Enter 6-Digit OTP" 
              type="text" 
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              required 
            />
            <button type="submit" className="Login-Register-btn">Verify & Login</button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              style={{ background: 'none', border: 'none', color: 'blue', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel / Go Back
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default AdminLogin;