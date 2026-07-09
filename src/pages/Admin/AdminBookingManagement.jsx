import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Search & Filter State ---
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Mode State
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    guestCount: 0,
    charges: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/bookings');
      
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
        setError("Received unexpected data format from backend.");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching bookings');
      setLoading(false);
    }
  };

  // --- STATUS UPDATE (Confirm / Cancel) ---
  const handleStatusChange = async (id, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      try {
        await axios.put(`http://localhost:5000/api/admin/bookings/${id}/status`, { status: newStatus });
        fetchBookings(); // Refresh the list
      } catch (err) {
        console.error('Error updating status:', err);
        alert('Failed to update booking status.');
      }
    }
  };

  // --- EDIT DETAILS (Guests & Charges) ---
  const handleEditClick = (booking) => {
    setEditingBookingId(booking._id);
    setEditFormData({
      guestCount: booking.guestCount || 0,
      charges: booking.charges || ''
    });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const saveEditHandler = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, editFormData);
      setEditingBookingId(null);
      fetchBookings();
    } catch (err) {
      console.error('Error updating booking details:', err);
      alert('Failed to save booking details.');
    }
  };

  // --- UPDATED FILTERING LOGIC (Status + Search) ---
  const filteredBookings = bookings.filter((booking) => {
    // 1. Check Status Filter
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
    
    // 2. Check Search Query (Looking at User ID)
    const matchesSearch = searchQuery === '' || 
      (booking.user && booking.user._id.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-booking-management">
      <h2>Admin Booking Management</h2>
      
      {/* --- FILTER & SEARCH CONTROLS --- */}
      <div className="filter-controls" style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        {/* Status Dropdown */}
        <div>
          <label htmlFor="status-filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Filter by Status:
          </label>
          <select 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px' }}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* User ID Search Bar */}
        <div>
          <label htmlFor="search-user" style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Search by User ID:
          </label>
          <input 
            type="text"
            id="search-user"
            placeholder="Paste User ID here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', width: '250px' }}
          />
        </div>
        
      </div>
      
      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p className="error" style={{color: 'red'}}>{error}</p>
      ) : (
        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '10px' }}>BOOKING ID</th>
              <th style={{ padding: '10px' }}>USER INFO</th>
              <th style={{ padding: '10px' }}>VENUE & DATE</th>
              <th style={{ padding: '10px' }}>GUESTS</th>
              <th style={{ padding: '10px' }}>LISTED CHARGE</th>
              <th style={{ padding: '10px' }}>STATUS</th>
              <th style={{ padding: '10px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings?.map((booking) => (
              <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                
                {/* BOOKING ID (Click to copy) */}
                <td 
                  style={{ fontFamily: 'monospace', fontSize: '0.9em', cursor: 'pointer', padding: '10px' }}
                  onClick={() => {
                    navigator.clipboard.writeText(booking._id);
                    alert('Booking ID copied!');
                  }}
                  title="Click to copy Booking ID"
                >
                  {booking._id.substring(0, 5)}... 📋
                </td>
                
                {/* USER INFO (Shows Name, Phone, and User ID) */}
                <td style={{ padding: '10px' }}>
                  <strong>{booking.user?.first_name} {booking.user?.last_name}</strong><br/>
                  <span style={{ fontSize: '0.85em', color: '#555' }}>📞 {booking.phoneNumber}</span><br/>
                  <span style={{ fontSize: '0.75em', color: '#888', fontFamily: 'monospace' }}>
                    ID: {booking.user?._id}
                  </span>
                </td>
                
                {/* VENUE INFO */}
                <td style={{ padding: '10px' }}>
                  <strong>{booking.venue?.venueName}</strong><br/>
                  <span style={{ fontSize: '0.9em', color: '#555' }}>
                    📅 {new Date(booking.eventDate).toLocaleDateString()}
                  </span>
                </td>
                
                {/* EDITING MODE vs VIEW MODE */}
                {editingBookingId === booking._id ? (
                  <>
                    <td style={{ padding: '10px' }}>
                      <input 
                        type="number" 
                        name="guestCount" 
                        value={editFormData.guestCount} 
                        onChange={handleEditFormChange}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <input 
                        type="text" 
                        name="charges" 
                        value={editFormData.charges} 
                        onChange={handleEditFormChange}
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{booking.status}</td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => saveEditHandler(booking._id)} style={{ color: 'white', backgroundColor: 'green', marginRight: '5px', padding: '5px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingBookingId(null)} style={{ padding: '5px', cursor: 'pointer' }}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '10px' }}>{booking.guestCount || 'Not set'}</td>
                    
                    {/* LISTED CHARGE DISPLAY */}
                    <td style={{ padding: '10px', fontWeight: '500' }}>₹{booking.charges}</td>
                    
                    <td style={{ 
                      padding: '10px', 
                      fontWeight: 'bold',
                      color: booking.status === 'Confirmed' ? 'green' : booking.status === 'Canceled' ? 'red' : 'orange'
                    }}>
                      {booking.status}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {/* STATUS CONTROLS */}
                      {booking.status === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusChange(booking._id, 'Confirmed')} style={{ backgroundColor: 'lightgreen', marginRight: '5px', padding: '5px', cursor: 'pointer', border: 'none', borderRadius: '3px' }}>Confirm</button>
                          <button onClick={() => handleStatusChange(booking._id, 'Canceled')} style={{ backgroundColor: 'lightcoral', marginRight: '5px', padding: '5px', cursor: 'pointer', border: 'none', borderRadius: '3px' }}>Cancel</button>
                        </>
                      )}
                      
                      {/* EDIT DETAILS */}
                      <button onClick={() => handleEditClick(booking)} style={{ backgroundColor: '#f0ad4e', color: 'white', padding: '5px', cursor: 'pointer', border: 'none', borderRadius: '3px', marginTop: booking.status === 'Pending' ? '5px' : '0' }}>
                        Edit Details
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  {searchQuery ? 'No bookings found for this User ID.' : 'No bookings found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminBookingManagement;