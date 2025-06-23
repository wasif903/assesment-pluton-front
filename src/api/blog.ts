import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { withTokenRefresh } from "./auth";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface BlogPayload {
  title: string;
  description: string;
  featuredImage: string;
  tags: string[];
}

export const createBlog = async (userID: string, payload: FormData) => {
  return withTokenRefresh(async () => {
    const accessToken = Cookies.get("accessToken");
    const response = await axios.post(`${baseUrl}/api/blog/${userID}/create-blog`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    return response.data;
  });
};

export const getBlogs = async (params?: { page?: number; limit?: number; search?: Record<string, string> }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) {
    Object.entries(params.search).forEach(([key, value]) => {
      query.append(`search[${key}]`, value);
    });
  }
  const response = await axios.get(`${baseUrl}/api/blog/get-blogs?${query.toString()}`);
  return response.data;
};

export const updateBlog = async (blogId: string, userID: string, payload: FormData) => {
  return withTokenRefresh(async () => {
    const accessToken = Cookies.get("accessToken");
    const response = await axios.patch(`${baseUrl}/api/blog/${userID}/edit-blog/${blogId}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    return response.data;
  });
};

export const deleteBlog = async (blogId: string, userID: string) => {
  return withTokenRefresh(async () => {
    const accessToken = Cookies.get("accessToken");
    const response = await axios.delete(`${baseUrl}/api/blog/${userID}/delete-blog/${blogId}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    return response.data;
  });
}; 