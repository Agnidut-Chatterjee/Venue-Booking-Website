import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; 

const AdminRoute = () => {
  const { isLoggedIn, isAdmin, isOwner } = useContext(AuthContext);

  if (isLoggedIn && (isAdmin || isOwner)) {
    return <Outlet />; 
  }

  return <Navigate to="/login" replace />;
};

export default AdminRoute;