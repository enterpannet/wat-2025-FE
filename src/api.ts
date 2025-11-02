import axios, { AxiosError } from "axios";

// Determine API base URL based on environment
const getAPIBaseURL = (): string => {
  // Production: Use apiwat.mostdata.site
  if (window.location.hostname === "mostdata.site" || 
      window.location.hostname === "www.mostdata.site") {
    return "https://apiwat.mostdata.site";
  }
  
  // Development: Use localhost backend
  if (window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }
  
  // Fallback: Use relative path (for same domain)
  return "";
};

// Create axios instance with configuration
const api = axios.create({
  baseURL: getAPIBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { AxiosError };

