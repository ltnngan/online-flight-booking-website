// src/services/accountService.js
import axiosClient from "./api.service";
import authService from "./auth.service";

const accountService = {
  // Cập nhật thông tin tài khoản người dùng
  updateAccount: async (formData) => {
    try {
      // Lấy ID người dùng từ localStorage thay vì tham số
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const response = await axiosClient.put(
        `/account/${currentUser.userId}/edit`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", error);
      throw error;
    }
  },

  // Xóa tài khoản người dùng
  deleteAccount: async () => {
    try {
      // Lấy ID người dùng từ localStorage thay vì tham số
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const response = await axiosClient.delete(
        `/account/${currentUser.userId}/delete`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      throw error;
    }
  },

  // Lấy danh sách chuyến bay hiện tại của người dùng
  getMyFlights: async () => {
    try {
      const response = await axiosClient.get("/account/my-flights");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyến bay:", error);
      throw error;
    }
  },

  // Lấy lịch sử chuyến bay của người dùng
  getFlightHistory: async () => {
    try {
      const response = await axiosClient.get("/account/flight-history");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử chuyến bay:", error);
      throw error;
    }
  },
  getAccountInfo: async () => {
    try {
      const response = await axiosClient.get("/account");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
      throw error;
    }
  },
};

export default accountService;
