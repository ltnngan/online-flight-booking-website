import axios from "axios";
import authService from "./auth.service";

// Tạo instance axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
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
    console.error("Token không hợp lệ:", error);
    return true; // Coi như token đã hết hạn nếu không decode được
  }
};

// Interceptor xử lý token trước khi gửi yêu cầu
axiosClient.interceptors.request.use(
  async (config) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.accessToken) {
      const token = user.accessToken;
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
          const currentUser = authService.getCurrentUser();
          if (currentUser && newAccessToken) {
            currentUser.accessToken = newAccessToken;
            localStorage.setItem("user", JSON.stringify(currentUser));
          }
          config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
        } catch (error) {
          processQueue(error, null);
          localStorage.removeItem("user");
          // Chỉ chuyển hướng nếu ở phía client
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw error;
        } finally {
          isRefreshing = false;
        }
      } else {
        // Nếu token còn hạn, sử dụng token hiện tại
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
