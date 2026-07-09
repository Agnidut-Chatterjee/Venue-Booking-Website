import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the role filter
  const [roleFilter, setRoleFilter] = useState('all');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    role: '', 
    first_name: '',
    last_name: '',
    e_mail: '',
    mobile: ''
  });

  // State for Booking History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/users');
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
        setError("Received unexpected data format from backend. Check console.");
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching users');
      setLoading(false);
    }
  };

  // --- EDIT FUNCTIONS ---
  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditFormData({
      role: user.role || 'user', 
      first_name: user.first_name,
      last_name: user.last_name,
      e_mail: user.e_mail,
      mobile: user.mobile
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
      await axios.put(`http://localhost:5000/api/users/${id}`, editFormData);
      setEditingUserId(null); 
      fetchUsers(); 
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user.');
    }
  };

  // --- DELETE FUNCTION ---
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchUsers(); 
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user.');
      }
    }
  };

  // --- HISTORY FUNCTION (Shows Bookings Modal) ---
  const viewHistoryHandler = async (user) => {
    setSelectedUserName(`${user.first_name} ${user.last_name}`);
    setShowHistoryModal(true);
    setLoadingBookings(true);

    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/bookings');
      
      if (data.success && data.bookings) {
        const filteredBookings = data.bookings.filter(
          (booking) => booking.user && booking.user._id === user._id
        );
        setUserBookings(filteredBookings);
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      alert('Failed to load booking history.');
    }
    setLoadingBookings(false);
  };

  // --- FILTERING LOGIC ---
  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter((user) => {
        const userRole = user.role ? user.role.toLowerCase() : 'user';
        return userRole === roleFilter;
      });

  return (
    <div className="admin-user-management" style={{ position: 'relative' }}>
      <h2>Admin Account Management</h2>
      
      {/* FILTER BUTTON / DROPDOWN */}
      <div className="filter-controls" style={{ marginBottom: '15px' }}>
        <label htmlFor="role-filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Filter by Role:
        </label>
        <select 
          id="role-filter"
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="all">All</option>
          <option value="user">Users only</option>
          <option value="owner">Owner Only</option>
          <option value="admin">Admin Only</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error" style={{color: 'red'}}>{error}</p>
      ) : (
        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>ID</th>
              <th>ROLE</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>MOBILE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                
                {/* --- NEW CLICK-TO-COPY ID CELL --- */}
                <td 
                  style={{ fontFamily: 'monospace', fontSize: '0.9em', cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(user._id);
                    alert('ID copied to clipboard!');
                  }}
                  title="Click to copy full ID"
                >
                  {user._id} 📋
                </td>
                
                {editingUserId === user._id ? (
                  <>
                    <td>
                      <select 
                        name="role" 
                        value={editFormData.role} 
                        onChange={handleEditFormChange}
                      >
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        name="first_name" 
                        value={editFormData.first_name} 
                        onChange={handleEditFormChange} 
                        placeholder="First Name" 
                        style={{ width: '45%', marginRight: '5%' }}
                      />
                      <input 
                        type="text" 
                        name="last_name" 
                        value={editFormData.last_name} 
                        onChange={handleEditFormChange} 
                        placeholder="Last Name"
                        style={{ width: '45%' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="email" 
                        name="e_mail" 
                        value={editFormData.e_mail} 
                        onChange={handleEditFormChange} 
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        name="mobile" 
                        value={editFormData.mobile} 
                        onChange={handleEditFormChange} 
                      />
                    </td>
                    <td>
                      <button onClick={() => saveEditHandler(user._id)} style={{ color: 'green', marginRight: '5px' }}>Save</button>
                      <button onClick={() => setEditingUserId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ textTransform: 'capitalize' }}>{user.role || 'User'}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.e_mail}</td>
                    <td>{user.mobile}</td>
                    <td>
                      <button onClick={() => viewHistoryHandler(user)} style={{ marginRight: '5px' }}>History</button>
                      <button onClick={() => handleEditClick(user)} style={{ marginRight: '5px' }}>Edit</button>
                      <button onClick={() => deleteHandler(user._id)} style={{ color: 'red' }}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>
                  No users found for this role.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* --- BOOKING HISTORY MODAL --- */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '20px', borderRadius: '8px',
            width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Booking History: {selectedUserName}</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ cursor: 'pointer', padding: '5px 10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>Close</button>
            </div>

            {loadingBookings ? (
              <p>Loading bookings...</p>
            ) : userBookings.length > 0 ? (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '8px' }}>Venue</th>
                    <th style={{ padding: '8px' }}>Event Date</th>
                    <th style={{ padding: '8px' }}>Phone Provided</th>
                    <th style={{ padding: '8px' }}>Charges</th>
                    <th style={{ padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map(booking => (
                    <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{booking.venue?.venueName || 'Unknown Venue'}</td>
                      <td style={{ padding: '8px' }}>{new Date(booking.eventDate).toLocaleDateString()}</td>
                      <td style={{ padding: '8px' }}>{booking.phoneNumber}</td>
                      <td style={{ padding: '8px' }}>₹{booking.charges}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', 
                        color: booking.status === 'Confirmed' ? 'green' : booking.status === 'Canceled' ? 'red' : 'orange' 
                      }}>
                        {booking.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>This user has no booking history.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;