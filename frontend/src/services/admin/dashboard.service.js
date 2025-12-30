import axiosAdmin from "./api.service"; // Import instance axios đã cấu hình

const dashboardService = {
  // Hàm lấy thống kê theo tháng
  getMonthlyStatistics: async () => {
    try {
      const response = await axiosAdmin.get("/dashboard");
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy dữ liệu thống kê"
      );
    }
  },
};

export default dashboardService;
