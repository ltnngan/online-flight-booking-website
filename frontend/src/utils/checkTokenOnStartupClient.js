// src/utils/checkTokenOnStartup.js
import authService from "../services/client/auth.service";

const isAccessTokenExpired = (token) => {
  if (!token) return true;
  const decoded = JSON.parse(atob(token.split(".")[1]));
  return decoded.exp < Date.now() / 1000;
};

export default async function checkTokenOnStartup() {
  const user = authService.getCurrentUser();

  if (user && isAccessTokenExpired(user.accessToken)) {
    try {
      // Gọi logout để xóa refreshToken ở server và dọn dẹp localStorage
      await authService.logout();
    } catch (error) {
      console.error("Lỗi khi logout do token hết hạn:", error);
      // Nếu có lỗi vẫn đảm bảo xóa localStorage
      localStorage.removeItem("user");
    }

    // Chuyển về trang login
    window.location.href = "/home";
  }
}
