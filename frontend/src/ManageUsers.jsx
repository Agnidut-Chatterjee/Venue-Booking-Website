import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const ManageUsers = () => {
    const { token } = useContext(AuthContext); 
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Example route you would have protected with authMiddleware
                const response = await fetch('http://localhost:5000/api/users', { 
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // The vault key!
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setAllUsers(data);
                } else {
                    console.error("Failed to fetch:", data.message);
                }
            } catch (error) {
                console.error("API error", error);
            }
        };

        if(token) fetchUsers(); // Only fetch if token exists
    }, [token]);

    return (
        <div>
            <h2>User Management Data Array Found: {allUsers.length}</h2>
        </div>
    );
};

export default ManageUsers;