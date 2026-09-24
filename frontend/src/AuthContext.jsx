import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('atithi_user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Corrupted user data found. Clearing memory.");
        localStorage.removeItem('atithi_user');
      }
    }
    setLoading(false); 
  }, []);

  const login = (userData) => {
    const safeData = {
      name: "Guest",
      role: "user", 
      ...userData   // 👉 The JWT token from the backend gets saved right here!
    }; 
    
    setUser(safeData);
    setIsLoggedIn(true);
    localStorage.setItem('atithi_user', JSON.stringify(safeData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('atithi_user');
  };

  // Helper variables 
  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner";
  
  // 👉 THE NEW LINE: Grab the token so other components can use it
  const token = user?.token; 

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "20px" }}>Loading...</div>; 
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      login, 
      logout,
      isAdmin, 
      isOwner,
      token // 👉 Exported here!
    }}>
      {children}
    </AuthContext.Provider>
  );
};