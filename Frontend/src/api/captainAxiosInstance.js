import axios from "axios";

const captainAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// ── Request interceptor: attach captain access token ────────────────────────
captainAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("captain-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ───────────────────────────────
captainAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use a plain axios call (not the instance) to avoid interceptor loops
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/auth/captains/refresh-token`,
          { withCredentials: true },
        );

        const newToken = response.data.token;
        localStorage.setItem("captain-token", newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return captainAxiosInstance(originalRequest);

      } catch (_err) {
        // Refresh failed — clear token and redirect to captain login
        localStorage.removeItem("captain-token");
        window.location.href = "/captain-login";
      }
    }

    return Promise.reject(error);
  },
);

export default captainAxiosInstance;
