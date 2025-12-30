import axios from "axios";
import authService from "./auth.service";

// Tạo instance axios với cấu hình mặc định cho admin
const axiosAdmin = axios.create({
  baseURL: "http://localhost:3000/admin",
  withCredentials: true,
});

// Biến kiểm soát trạng thái làm mới token
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý hàng đợi các yêu cầu bị trì hoãn
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm kiểm tra token hết hạn
const isAccessTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const exp = decoded.exp;
    return exp < Date.now() / 1000;
  } catch (error) {
    console.error("Token admin không hợp lệ:", error);
    return true;
  }
};

// Interceptor xử lý token trước khi gửi yêu cầu
axiosAdmin.interceptors.request.use(
  async (config) => {
    const admin = JSON.parse(localStorage.getItem("admin"));

    if (admin && admin.accessToken) {
      const token = admin.accessToken;
      const isTokenExpired = isAccessTokenExpired(token);

      // Nếu token hết hạn và đây không phải yêu cầu retry
      if (isTokenExpired && !config._retry) {
        if (isRefreshing) {
          // Nếu đang làm mới token, đưa yêu cầu vào hàng đợi
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              config.headers["Authorization"] = `Bearer ${newToken}`;
              return config;
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;
        config._retry = true;

        try {
          const newAccessToken = await authService.refreshAccessToken();
          if (newAccessToken) {
            // Cập nhật token trong localStorage
            const adminData = JSON.parse(localStorage.getItem("admin"));
            adminData.accessToken = newAccessToken;
            localStorage.setItem("admin", JSON.stringify(adminData));

            // Cập nhật token trong header
            config.headers["Authorization"] = `Bearer ${newAccessToken}`;

            // Xử lý các request trong hàng đợi
            processQueue(null, newAccessToken);
            return config;
          }
        } catch (error) {
          processQueue(error, null);
          localStorage.removeItem("admin");

          // Chuyển hướng về trang đăng nhập admin
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }

          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Nếu token còn hạn hoặc đã được refresh, sử dụng token
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
axiosAdmin.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Nếu lỗi 401 và không phải từ request refresh token
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/auth/refresh-token")
    ) {
      // Xóa thông tin admin và chuyển hướng về trang đăng nhập
      localStorage.removeItem("admin");
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAdmin;
