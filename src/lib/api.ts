import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // Crucial for receiving/sending cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for the refresh endpoint itself to avoid infinite loops
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint && localStorage.getItem('access_token')) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — just clear the token.
        // Route guards on protected pages will redirect to /login.
        localStorage.removeItem('access_token');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
