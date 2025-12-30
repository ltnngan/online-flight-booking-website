import axiosClient from "./api.service"; // Sử dụng axiosClient thay vì axios

const authService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await axiosClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await axiosClient.post("/auth/login", credentials);

      if (response.data.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await axiosClient.post("/auth/logout", {});

      // Clear user from local storage
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get current user from local storage
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  // Get auth header
  getAuthHeader() {
    const user = this.getCurrentUser();
    return user && user.accessToken
      ? { Authorization: `Bearer ${user.accessToken}` }
      : {};
  },

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await axiosClient.post("/auth/refreshtoken", {});

      // Update access token in localStorage
      const newAccessToken = response.data.newAccessToken;
      const currentUser = this.getCurrentUser();
      if (currentUser && newAccessToken) {
        currentUser.accessToken = newAccessToken;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      return newAccessToken;
    } catch (error) {
      console.error("Lấy accessToken mới thất bại:", error);
      throw error.response ? error.response.data : error;
    }
  },
};

export default authService;
