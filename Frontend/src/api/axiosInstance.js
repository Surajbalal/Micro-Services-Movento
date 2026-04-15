import axios from "axios";

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // call api for refresh token
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/users/refresh-token`,
          {},
          { withCredentials: true },
        );
        const newToken = response.data.token;

        localStorage.setItem("token", newToken);

        // retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (error) {
        // if refresh token fails, clear local storage and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    // If not a 401 error or request already retried,
    // forward the error to the caller
    return Promise.reject(error);
  },
);
