import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole?: "Admin" | "User";
  forbiddenRole?: "Admin" | "User";
  userRole: "Admin" | "User" | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, forbiddenRole, userRole, children }) => {
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  if (forbiddenRole && userRole === forbiddenRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 