import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 NEW: Added useNavigate
import "../../App.css"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 

function Home() {
  const navigate = useNavigate(); // 👈 NEW: Initialize navigation

  // 1. Data States
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Modal States
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  const [bookingDate, setBookingDate] = useState(null);

  // 3. Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVenues, setFilteredVenues] = useState([]); 

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/venues");
        const data = await response.json();
        
        setVenues(data);
        setFilteredVenues(data); 
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // --- Real-Time Search Logic ---
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredVenues(venues);
    } else {
      const filtered = venues.filter((venue) => 
        venue.address.toLowerCase().includes(query) || 
        venue.venueName.toLowerCase().includes(query)
      );
      setFilteredVenues(filtered);
    }
  };

  // --- Modal & Image Gallery Logic ---
  const openModal = (venue) => {
    setSelectedVenue(venue);
    setActiveImageIndex(0); 
    setBookingDate(null); // Reset calendar when opening a new property
  };

  const closeModal = () => setSelectedVenue(null);

  const handleNextImage = (e) => {
    e.stopPropagation(); 
    if (activeImageIndex < selectedVenue.images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation(); 
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleThumbnailClick = (e, index) => {
    e.stopPropagation();
    setActiveImageIndex(index);
  };

  // --- NEW: Routing to Booking Page ---
  const handleBooking = () => {
    if (!bookingDate) {
      alert("Please select a date first!");
      return;
    }

    // Extract the exact local date the user clicked, ignoring time zones
const year = bookingDate.getFullYear();
const month = String(bookingDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JS!
const day = String(bookingDate.getDate()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

    // Close the modal and route to the booking page, passing the date and price
    closeModal();
    navigate(`/book/${selectedVenue._id}`, { 
      state: { 
        selectedDate: formattedDate,
        charges: selectedVenue.charges 
      } 
    });
  };

  return (
    <div className="home-container">
      <header className="hero-header">
        <p>Search Your Venue</p>
      </header>

      {/* Search Bar */}
      <div className="search-wrapper">
        <input 
          type="text" 
          placeholder="Enter location or venue name..." 
          className="search-input" 
          value={searchQuery} 
          onChange={handleSearchChange} 
        />
        <button className="search-btn">Search</button>
      </div>

      <div className="venue-grid">
        {loading ? (
          <p>Loading beautifully crafted venues...</p>
        ) : filteredVenues.length === 0 ? (  
          <p>No venues found for "{searchQuery}". Try a different location!</p>
        ) : (
          filteredVenues.map((venue) => (
            <div 
              key={venue._id} 
              className="venue-card" 
              onClick={() => openModal(venue)} 
              style={{ cursor: "pointer" }}
            >
              <img
                src={venue.images && venue.images.length > 0 ? `http://localhost:5000${venue.images[0]}` : ""}
                alt={venue.venueName}
                className="venue-image"
              />
              <div className="venue-info">
                <h3>{venue.venueName}</h3>
                <p className="location">{venue.address}</p>
                <p className="price">{venue.charges}</p>
                
                <button 
                  className="book-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(venue); // Opens the modal instead of an alert
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- POPUP MODAL --- */}
      {selectedVenue && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>✖</button>
            
            <div className="modal-layout">
              <div className="modal-gallery-container" style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column" }}>
                
                {/* Main Interactive Image */}
                <div style={{ position: "relative", width: "100%", height: "300px", backgroundColor: "#f0f0f0", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {activeImageIndex > 0 && (
                    <button onClick={handlePrevImage} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer", fontSize: "1.2rem", zIndex: 10 }}>❮</button>
                  )}
                  <img src={`http://localhost:5000${selectedVenue.images[activeImageIndex]}`} alt={selectedVenue.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.2s ease-in-out" }} />
                  {activeImageIndex < selectedVenue.images.length - 1 && (
                    <button onClick={handleNextImage} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer", fontSize: "1.2rem", zIndex: 10 }}>❯</button>
                  )}
                </div>
                
                {/* Thumbnails */}
                <div style={{ display: "flex", gap: "10px", marginTop: "15px", overflowX: "auto", paddingBottom: "5px" }}>
                  {selectedVenue.images.map((imgUrl, index) => (
                    <img key={index} src={`http://localhost:5000${imgUrl}`} alt={`${selectedVenue.venueName} thumbnail ${index + 1}`} onClick={(e) => handleThumbnailClick(e, index)} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: activeImageIndex === index ? "3px solid #ff5722" : "2px solid transparent", opacity: activeImageIndex === index ? 1 : 0.5, transition: "all 0.2s" }} />
                  ))}
                </div>
              </div>
              
              <div className="modal-details">
                <h2 style={{ marginTop: 0 }}>{selectedVenue.venueName}</h2>
                <span className="modal-type-badge">{selectedVenue.venueType}</span>
                <p className="modal-address">📍 {selectedVenue.address}</p>
                <h3 className="modal-price">{selectedVenue.charges}</h3>
                
                <hr style={{ margin: "15px 0", borderColor: "#eee" }} />
                
                <h4>Property Details</h4>
                <ul className="modal-amenities">
                  <li><strong>Capacity:</strong> {selectedVenue.description?.capacity || "N/A"} people</li>
                  <li><strong>Catering:</strong> {selectedVenue.description?.cateringFacilities ? "Available ✅" : "External ❌"}</li>
                  <li><strong>Parking/WiFi:</strong> {selectedVenue.description?.parkingWifi ? "Available ✅" : "Not Available ❌"}</li>
                  <li><strong>Bride Room:</strong> {selectedVenue.description?.brideRoom ? "Included ✅" : "Not Included ❌"}</li>
                </ul>

                <div className="modal-contact">
                  <h4>Contact Info</h4>
                  <p>📞 {selectedVenue.contactNo}</p>
                  {selectedVenue.landlineNumber && <p>☎️ {selectedVenue.landlineNumber}</p>}
                </div>
                
                {/* --- Interactive Booking Calendar --- */}
                <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f8ff", borderRadius: "8px", border: "1px solid #bce8f1" }}>
                  <h4 style={{ marginTop: 0, color: "#31708f" }}>Check Availability</h4>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    
                    <DatePicker
                      selected={bookingDate}
                      onChange={(date) => setBookingDate(date)}
                      minDate={new Date()} 
                      placeholderText="Select your event date"
                      className="search-input" 
                      excludeDates={selectedVenue.bookedDates?.map(dateStr => new Date(dateStr)) || []}
                    />

                    <button 
                      className="book-btn-large" 
                      onClick={handleBooking}
                      style={{ margin: 0, opacity: bookingDate ? 1 : 0.6, cursor: bookingDate ? "pointer" : "not-allowed" }}
                      disabled={!bookingDate}
                    >
                      Confirm Booking
                    </button>
                    
                  </div>
                  {!bookingDate && <p style={{ fontSize: "0.85rem", color: "#666", margin: "5px 0 0 0" }}>* Grey dates are already booked.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="home-footer">
        © 2026 ATITHI APPYAN (অতিথি আপ্যায়ন) — Crafted with care for your celebrations
      </footer>
    </div>
  );
}

export default Home;