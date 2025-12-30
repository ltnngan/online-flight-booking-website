// src/services/setupInterceptors.js
import axios from "axios";
import authService from "./auth.service";

const setup = () => {
  // Thêm interceptor cho request
  axios.interceptors.request.use(
    (config) => {
      const user = authService.getCurrentUser();

      if (user && user.accessToken) {
        config.headers["Authorization"] = `Bearer ${user.accessToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Thêm interceptor cho response
  axios.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      // Bỏ qua các route liên quan đến auth
      if (
        originalConfig.url.includes("/auth/") &&
        !originalConfig.url.includes("/auth/refresh-token")
      ) {
        return Promise.reject(err);
      }

      // Nếu lỗi là 401 (Unauthorized), thử refresh token
      if (
        err.response &&
        err.response.status === 401 &&
        !originalConfig._retry
      ) {
        originalConfig._retry = true;

        try {
          // Có thể thêm hàm refresh token ở đây nếu backend hỗ trợ
          // const rs = await authService.refreshToken();
          // const { accessToken } = rs.data;

          // Tạm thời, đăng xuất người dùng nếu token không hợp lệ
          authService.logout();
          window.location.href = "/login";

          return Promise.reject(err);
        } catch (_error) {
          // Nếu refresh token thất bại, đăng xuất người dùng
          authService.logout();
          window.location.href = "/login";
          return Promise.reject(_error);
        }
      }

      return Promise.reject(err);
    }
  );
};

export default setup;
