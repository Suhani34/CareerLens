import api from "./api";

const authService = {
  async register(credentials) {
    const response = await api.post(
      "/auth/register",
      credentials
    );

    return response.data.data;
  },

  async login(credentials) {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    return response.data.data;
  },

  async getMe(config = {}) {
    const response = await api.get(
      "/auth/me",
      config
    );

    return response.data.data;
  },
};

export default authService;