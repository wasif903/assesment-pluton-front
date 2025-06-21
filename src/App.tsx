import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateBlog from "./pages/CreateBlog";
import UpdateBlog from "./pages/UpdateBlog";
import BlogDetails from "./pages/BlogDetails";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

function App() {
  const [userRole, setUserRole] = useState<"Admin" | "User" | null>(null);

  // Function to get current user role
  const getCurrentUserRole = (): "Admin" | "User" | null => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (Array.isArray(user?.role)) {
          return user.role.includes("Admin") ? "Admin" : (user.role.includes("User") ? "User" : null);
        } else {
          return user?.role || null;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Update user role when component mounts and when localStorage changes
  useEffect(() => {
    const updateUserRole = () => {
      setUserRole(getCurrentUserRole());
    };

    // Set initial role
    updateUserRole();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      updateUserRole();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events if you trigger them on login/logout
    window.addEventListener('userLogin', updateUserRole);
    window.addEventListener('userLogout', updateUserRole);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', updateUserRole);
      window.removeEventListener('userLogout', updateUserRole);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog/:id" element={<BlogDetails />} />
            <Route
              path="/create-blog"
              element={
                <ProtectedRoute forbiddenRole="Admin" userRole={userRole}>
                  <CreateBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-blog/:id"
              element={
                <ProtectedRoute forbiddenRole="Admin" userRole={userRole}>
                  <UpdateBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="Admin" userRole={userRole}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
