import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // 👈 NEW: Added useLocation
import axios from "axios";
import { AuthContext } from "../../AuthContext"; // Adjust this path if your AuthContext is located elsewhere

const BookingPage = () => {
  const { venueId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); // 👈 NEW: To catch data from Home page
  
  // Pull user data and login status from your AuthContext
  const { user, isLoggedIn } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  
  // 👈 NEW: Automatically fill in the date and price that was selected on Home!
  const [formData, setFormData] = useState({
    phoneNumber: '',
    eventDate: location.state?.selectedDate || '', 
    guestCount: '',
    description: '',
    charges: location.state?.charges || 'Contact for Pricing' 
  });

  // THE SECURITY GUARD: Redirect to login if they try to access this without being logged in
  useEffect(() => {
    if (!isLoggedIn) {
      alert("You need to log in to book a property!");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SUBMIT TO BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Packaging the exact data your backend Booking schema expects
      const bookingData = {
        user: user.id, // Comes securely from AuthContext
        venue: venueId, // Comes from the URL parameter
        phoneNumber: formData.phoneNumber,
        eventDate: formData.eventDate,
        guestCount: Number(formData.guestCount), 
        description: formData.description,
        charges: formData.charges
      };

      const { data } = await axios.post("http://localhost:5000/api/bookings", bookingData);

      if (data.success) {
        alert("Booking request sent successfully! An admin will review it shortly.");
        // Redirect the user back to their profile or home after a successful booking
        navigate('/'); 
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering the form briefly if the redirect hasn't happened yet
  if (!isLoggedIn) return null; 

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#F97316', marginTop: '0' }}>Complete Your Booking</h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>Please fill out the details below to request this venue. Our admins will review your request and confirm shortly.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contact Phone Number *</label>
          <input 
            type="text" 
            name="phoneNumber" 
            required 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            placeholder="e.g., +91 9876543210"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Event Date *</label>
          <input 
            type="date" 
            name="eventDate" 
            required 
            value={formData.eventDate} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Estimated Guest Count *</label>
          <input 
            type="number" 
            name="guestCount" 
            required 
            min="1"
            value={formData.guestCount} 
            onChange={handleChange} 
            placeholder="How many guests are expected?"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Special Requests / Description</label>
          <textarea 
            name="description" 
            rows="4" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Any catering preferences, decoration requests, or specific needs?"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit' }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '15px', 
            backgroundColor: loading ? '#ccc' : '#F97316', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold', 
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? "Submitting Request..." : "Submit Booking Request"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;