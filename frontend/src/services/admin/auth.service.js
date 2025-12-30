// src/services/admin/auth.service.js
import axiosAdmin from "./api.service";

const authService = {
  // Đăng nhập admin
  login: async (email, password) => {
    try {
      const response = await axiosAdmin.post("/auth/login", {
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Đăng xuất admin
  logout: async () => {
    try {
      const response = await axiosAdmin.post("/auth/logout");
      // Xóa thông tin admin từ localStorage
      localStorage.removeItem("admin");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn: () => {
    return localStorage.getItem("admin") !== null;
  },

  // Lấy thông tin admin hiện tại
  getCurrentAdmin: () => {
    const adminData = localStorage.getItem("admin");
    return adminData ? JSON.parse(adminData) : null;
  },

  // Làm mới access token
  refreshAccessToken: async () => {
    try {
      const response = await axiosAdmin.post("/auth/refresh-token");
      // Trả về token mới từ response
      return response.data.newAccessToken;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
