import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  timeout: 15000,
});

// Attach JWT to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "careerlens_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// Handle authentication failures
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    const requestUrl =
      error.config?.url || "";

    const authenticationRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    const storedToken =
      localStorage.getItem(
        "careerlens_token"
      );

    if (
      status === 401 &&
      storedToken &&
      !authenticationRequest
    ) {
      localStorage.removeItem(
        "careerlens_token"
      );

      window.dispatchEvent(
        new Event("careerlens:unauthorized")
      );
    }

    return Promise.reject(error);
  }
);

export default api;