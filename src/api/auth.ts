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

/**
 * Refresh the access token using the refresh token stored in localStorage.
 * Calls /api/refresh and updates tokens in storage if successful.
 * Returns the new tokens or throws an error.
 */
export const refreshAccessToken = async (): Promise<AuthResponse> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  try {
    const response = await axios.post(`${baseUrl}/api/refresh`, { token: refreshToken });
    const { accessToken, refreshToken: newRefreshToken, user } = response.data;
    if (accessToken) Cookies.set("accessToken", accessToken);
    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    return response.data;
  } catch (error: any) {
    // Optionally clear tokens if refresh fails
    Cookies.remove("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    throw error;
  }
};

/**
 * Helper to retry an API call after refreshing the access token if a 401 error occurs.
 * @param apiCallFn - A function that returns a Promise (your API call)
 * @returns The result of the API call, possibly after refreshing the token
 */
export async function withTokenRefresh<T>(apiCallFn: () => Promise<T>): Promise<T> {
  try {
    return await apiCallFn();
  } catch (error: any) {
    // Check for 401 Unauthorized
    if (error?.response?.status === 401) {
      try {
        await refreshAccessToken();
        // Retry the API call once after refreshing
        return await apiCallFn();
      } catch (refreshError) {
        throw refreshError;
      }
    }
    throw error;
  }
}

const user = JSON.parse(localStorage.getItem("user") || "null");
if (user?.role === "Admin") { /* ... */ } 