import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  timeout: 15000,
});

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

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    const url = error.config?.url || "";

    const isAuthRequest =
      url.includes("/auth/login") ||
      url.includes("/auth/register");

    const currentToken =
      localStorage.getItem(
        "careerlens_token"
      );

    const requestAuthorization =
      error.config?.headers?.Authorization;

    if (
      status === 401 &&
      currentToken &&
      !isAuthRequest &&
      requestAuthorization ===
        `Bearer ${currentToken}`
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