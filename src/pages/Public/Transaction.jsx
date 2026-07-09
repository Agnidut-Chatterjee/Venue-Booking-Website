import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext'; // Adjust path if AuthContext is in a different folder

const Transaction = () => {
  // 1. Pull user directly from your global Context
  const { user, isLoggedIn } = useContext(AuthContext);
  
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 2. Safety Guard: Check if the user object has fully loaded
    // We check user?._id or user?.id depending on how your backend names it
    const userId = user?._id || user?.id;

    if (!isLoggedIn || !userId) {
      setIsLoading(true);
      return;
    }

    // 3. Fetch data from your backend
    const fetchTransactionHistory = async () => {
      try {
        setError(null);
        // Note: Change to http://localhost:5000/api... if your backend is on a different port locally
       // Replace 5000 with whatever port your Express server actually uses (e.g., 4000, 8000)
        const response = await fetch(`http://localhost:5000/api/bookings/user/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setTransactions(data.bookings);
        } else {
          setError(data.message || "Failed to load bookings.");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Could not connect to server. Check if your backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [user, isLoggedIn]); // Re-run if user context changes

  // 4. Format string charges into real currency (INR)
  const formatCurrency = (amountString) => {
    const numericAmount = parseFloat(String(amountString).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericAmount)) return amountString || '₹0';

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numericAmount);
  };

  // 5. Format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 6. UI Rendering
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Your Booking History</h2>
      
      {/* State 1: Not Logged In / Waiting for Context */}
      {!isLoggedIn && (
        <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
          Please log in to view your transaction history.
        </p>
      )}

      {/* State 2: Fetching Data */}
      {isLoggedIn && isLoading && (
        <p style={{ fontWeight: '500', color: '#555' }}>Loading your transactions...</p>
      )}

      {/* State 3: Error */}
      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fde8e8', color: '#e53e3e', borderRadius: '6px', marginBottom: '15px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* State 4: No Bookings Found */}
      {!isLoading && !error && transactions.length === 0 && isLoggedIn && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>No booking records found for this account.</p>
          <p style={{ color: '#888', marginTop: '10px' }}>When you book a venue, it will appear here.</p>
        </div>
      )}

      {/* State 5: Success! Show the Table */}
      {!isLoading && !error && transactions.length > 0 && (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '15px' }}>Event Date</th>
                <th style={{ padding: '15px' }}>Venue Name</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Guests</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Charges</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{formatDate(txn.eventDate)}</td>
                  <td style={{ padding: '15px', fontWeight: '500' }}>
                    {txn.venue?.venueName || 'Venue TBD'}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>{txn.guestCount || 0}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      backgroundColor: txn.status === 'Confirmed' ? '#e6f4ea' : txn.status === 'Canceled' ? '#fce8e6' : '#fef7e0',
                      color: txn.status === 'Confirmed' ? '#137333' : txn.status === 'Canceled' ? '#c5221f' : '#b06000'
                    }}>
                      {txn.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
                    {formatCurrency(txn.charges)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transaction;