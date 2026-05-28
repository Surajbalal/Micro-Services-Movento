import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

export default axiosInstance;

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track in-flight refresh to prevent parallel loops
let isRefreshing = false;
let pendingQueue = []; // callbacks waiting for new token

const processQueue = (error, token = null) => {
  pendingQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔑 KEY FIX: if the refresh-token request itself fails, don't retry — log out immediately
    if (originalRequest.url?.includes("/auth/users/refresh-token")) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axiosInstance.post(`/auth/users/refresh-token`);
        const newToken = response.data.token;

        localStorage.setItem("token", newToken);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Forward non-401 errors to caller (with optional global toast)
    if (!error.config?.skipGlobalError) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
