import axios from "axios";
import { BACKEND_URL } from "./url"; // Import backend URL

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Allows cookies for authentication
});

// Login API Function
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    console.log("Login successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response ? error.response.data : error);
    throw error.response?.data || "Login failed!";
  }
};

// Fetch Posts API Function
export const getPosts = async () => {
  try {
    const response = await api.get("/api/posts");
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};
