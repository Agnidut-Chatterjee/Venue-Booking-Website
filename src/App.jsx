import React, { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

// 1. Import your Context
import { AuthProvider, AuthContext } from "./AuthContext";

// Import your Pages
import Home from "./pages/Public/Home";
import About from "./pages/Public/About";
import Login from "./pages/Public/Login";
import Register from "./pages/Public/Register";
import ForgotPassword from "./pages/Public/ForgotPassword";
import Contact from "./pages/Public/Contact";
import BookingPage from "./pages/Public/BookingPage"
import Transaction from "./pages/Public/Transaction"; // 👈 NEW: Imported Booking Page

// Import Admin Pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminRegister from "./pages/Admin/AdminRegister";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminPanelProperty from './pages/Admin/AdminPanelProperty';
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import AdminBookingManagement from "./pages/Admin/AdminBookingManagement";

// Import your security guard component
import AdminRoute from "./components/AdminRoute"; 

function Navbar() {
  const { isLoggedIn, logout, user, isAdmin, isOwner } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false); 
    navigate('/'); 
  };

  return (
    <>
      <nav style={{ 
        padding: "10px 20px", 
        background: "#eee", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        
        {/* Logo Section - Clickable to Home */}
        <Link 
          to="/" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            textDecoration: "none" 
          }}
        >
          <img 
            src="/images/logo.jpeg" 
            alt="Atithi Appyan Logo"
            style={{ height: "60px", width: "auto", marginRight: "10px", borderRadius: "8px" }}
          />
          <span style={{ fontWeight: "900", color: "#F97316", fontSize: "24px", letterSpacing: "1px" }}>
            ATITHI APPAYAN
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: "flex", alignItems: "center" }}>
          
          {!isLoggedIn ? (
            // --- GUEST VIEW (Not logged in) ---
            <>
              <Link to="/" className="nav-btn">Home</Link>
              <Link to="/about" className="nav-btn">About</Link>
              <Link to="/login" className="nav-btn nav-btn-primary">Login</Link>
              <Link to="/register" className="nav-btn">Register</Link>
              <Link to="/AdminLogin" className="nav-btn nav-btn-admin">Admin</Link>
            </>
          ) : isOwner ? (
            // --- OWNER VIEW ---
            <>
              <span style={{ fontWeight: "bold", marginRight: "15px", color: "#333" }}>
                Hello, Owner
              </span>
              <Link to="/AdminDashboard" className="nav-btn">Owner Panel</Link>
              <button onClick={handleLogout} className="nav-btn nav-btn-logout">
                Logout
              </button>
            </>
          ) : isAdmin ? (
            // --- ADMIN VIEW ---
            <>
              <span style={{ fontWeight: "bold", marginRight: "15px", color: "#333" }}>
                Hello, {user?.name || "Admin"}
              </span>
              <Link to="/AdminDashboard" className="nav-btn">Dashboard</Link>
              <button onClick={handleLogout} className="nav-btn nav-btn-logout">
                Admin Logout
              </button>
            </>
          ) : (
            // --- REGULAR USER VIEW (Logged in) ---
            <>
              {/* Hamburger Button */}
              <button 
                onClick={() => setIsOpen(true)} 
                style={{ margin: "10px", cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center" }}
              >
                <svg style={{ pointerEvents: "none" }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* --- THE SLIDING SIDE PANEL (Only for regular users) --- */}
      
      {/* Dark Overlay */}
      <div 
        className={`atithi-panel-overlay ${isOpen ? 'atithi-show' : ''}`} 
        onClick={() => setIsOpen(false)}
      ></div>

      {/* The Actual Panel */}
      <div className={`atithi-side-panel ${isOpen ? 'atithi-open' : ''}`}>
        
        {/* Close Button */}
        <button className="atithi-close-btn" onClick={() => setIsOpen(false)}>
          &times;
        </button>

        {/* Profile Info */}
        <div className="atithi-profile-section">
          
          <h3 className="atithi-welcome-text">
            Welcome back, {user?.name || user?.username || "Guest"}
          </h3>
        </div>

        <hr className="atithi-golden-line" />

        {/* Panel Links */}
        <ul className="atithi-panel-links">
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <hr className="atithi-menu-divider" />
          
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
          <hr className="atithi-menu-divider" />
          
         
          
          <li><Link to="/transactions" onClick={() => setIsOpen(false)}>Transaction History</Link></li>
          <hr className="atithi-menu-divider" />
          
          <li><Link to="/Contact" onClick={() => setIsOpen(false)}>Contact Us / Support</Link></li>
          <hr className="atithi-menu-divider" />
          
          <li>
            <button className="atithi-sidebar-logout" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* 🟢 PUBLIC ROUTES (Anyone can access) */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/Contact" element={<Contact />} />
          <Route path="/transactions" element={<Transaction />} />
          <Route path="/book/:venueId" element={<BookingPage />} /> {/* 👈 NEW ROUTE */}
          
          {/* Admin Login MUST be public so they can log in! */}
          <Route path="/AdminLogin" element={<AdminLogin />} />

          {/* 🔴 PROTECTED ADMIN ROUTES (Only Admins/Owners) */}
          <Route element={<AdminRoute />}>
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/AdminPanelProperty" element={<AdminPanelProperty />} />
            <Route path="/AdminUserManagement" element={<AdminUserManagement />} />
            <Route path="/AdminBookingManagement" element={<AdminBookingManagement />} />
            
            <Route path="/AdminRegister" element={<AdminRegister />} />
          </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;