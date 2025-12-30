import axiosClient from "./api.service";

export const bookingAPI = {
  createBooking: async (bookingData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.accessToken;

      const config = {
        headers: {},
      };

      if (token) {
        // Người dùng đã đăng nhập
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Sending request as logged-in user with token:", token);
      } else {
        // Khách vãng lai
        console.log("Sending request as guest (no token)");
      }

      const response = await axiosClient.post(
        "/bookings/create",
        bookingData,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Booking API Error:", error.response?.data || error);
      throw error;
    }
  },

  cancelBooking: async (bookingCode) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.accessToken;

      const config = {
        headers: {},
      };

      if (token) {
        // Người dùng đã đăng nhập
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          "Sending cancel request as logged-in user with token:",
          token
        );
      } else {
        // Khách vãng lai
        console.log("Sending cancel request as guest (no token)");
      }

      const response = await axiosClient.post(
        "/bookings/cancel", // Đường dẫn API hủy booking, phải khớp với route ở backend
        { bookingCode }, // Gửi bookingCode trong body
        config
      );
      return response.data;
    } catch (error) {
      console.error("Cancel Booking API Error:", error.response?.data || error);
      throw error;
    }
  },

  // Add this method to your bookingAPI object

  getBookingPaymentUrl: async (bookingCode) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.accessToken;

      const config = {
        headers: {},
      };

      if (token) {
        // Người dùng đã đăng nhập
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          "Sending payment URL request as logged-in user with token:",
          token
        );
      } else {
        // Khách vãng lai
        console.log("Sending payment URL request as guest (no token)");
      }

      const response = await axiosClient.get(
        `/bookings/payment-url?bookingCode=${bookingCode}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error(
        "Get Payment URL API Error:",
        error.response?.data || error
      );
      throw error;
    }
  },
};