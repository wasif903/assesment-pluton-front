import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
}

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ username, email, password }: RegisterPayload) => {
      const response = await axios.post(`${baseUrl}/api/user/register-user`, {
        username,
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      toast.success("Registered successfully!");
      if (result.accessToken) Cookies.set("accessToken", result.accessToken);
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);
      if (result.user) localStorage.setItem("user", JSON.stringify(result.user));
      
      // Dispatch custom event for login (after registration)
      window.dispatchEvent(new Event('userLogin'));
      
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
      toast.error(error?.response?.data?.message || "Registration failed. Try again.");
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ identifier, password }: LoginPayload) => {
      const response = await axios.post(`${baseUrl}/api/login`, {
        identifier,
        password,
      });
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      if (result.accessToken) Cookies.set("accessToken", result.accessToken);
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);
      if (result.user) localStorage.setItem("user", JSON.stringify(result.user));
      
      // Dispatch custom event for login
      window.dispatchEvent(new Event('userLogin'));
      
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      toast.error(error?.response?.data?.message || "Login failed. Try again.");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post(
        `${baseUrl}/api/logout`,
        { token: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      Cookies.remove("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Dispatch custom event for logout
      window.dispatchEvent(new Event('userLogout'));
      
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
    },
  });
};

const user = JSON.parse(localStorage.getItem("user") || "null");
if (user?.role === "Admin") { /* ... */ } 