import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole: "Admin" | "User";
  userRole: "Admin" | "User" | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, userRole, children }) => {
  if (userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 