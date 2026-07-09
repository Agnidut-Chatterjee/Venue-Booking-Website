import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      
      <nav>
        {/* Fixed the trailing space and updated the labels */}
        <Link to="/AdminPanelProperty" style={{ margin: "10px" }}>Properties</Link>
        <Link to="/AdminUserManagement" style={{ margin: "10px" }}>Accounts</Link>
        <Link to="/AdminRegister" style={{ margin: "10px" }}>Register Admin</Link>
        <Link to="/AdminBookingManagement" style={{ margin: "10px" }}>Bookings</Link>
      </nav>
      
    </div>
  );
}

export default AdminDashboard;