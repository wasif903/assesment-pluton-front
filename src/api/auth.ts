import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

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
      const response = await axios.post(`${baseUrl}/api/register`, {
        username,
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (result: AuthResponse) => {
      alert("Registered successfully!");
      if (result.accessToken) Cookies.set("accessToken", result.accessToken);
      if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);
      navigate("/notes");
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
      alert(error?.response?.data?.message || "Registration failed. Try again.");
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
      navigate("/notes");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      alert(error?.response?.data?.message || "Login failed. Try again.");
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
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
    },
  });
}; 