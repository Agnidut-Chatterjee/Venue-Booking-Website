import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../App.css'; 

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault(); 

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return; 
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ==========================================
        // 👉 THIS IS THE PART THAT CHANGED!
        // Notice how the left side matches your database exactly!
        // ==========================================
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          e_mail: email,       
          mobile: phone,       
          address: address, 
          password: password 
        }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! You can now log in.");
        navigate("/login"); 
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Cannot connect to server. Is your Express backend running?");
    }
  };

  return (
    <div className="Login-Register-page-wrapper">
      <form className="Login-Register-card" onSubmit={handleRegister}>
        <h2>Register</h2>
        
        <input 
          className="Login-Register-input" 
          placeholder="Firstname" 
          type="text" 
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        
        <input
          className="Login-Register-input" 
          placeholder="Lastname" 
          type="text" 
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        
        <input 
          className="Login-Register-input" 
          placeholder="Email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input 
          className="Login-Register-input" 
          placeholder="Mobile Number" 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input 
          className="Login-Register-input" 
          placeholder="Full Address" 
          type="text" 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
        
        <input 
          className="Login-Register-input" 
          placeholder="Confirm Password" 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="Login-Register-btn">Register</button>
      </form>
    </div>
  );
}

export default Register;