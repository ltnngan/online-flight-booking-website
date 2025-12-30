// src/utils/checkTokenOnStartupAdmin.js
import authService from "../services/admin/auth.service";

const isAccessTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Treat as expired if decoding fails
  }
};

export default async function checkTokenOnStartupAdmin() {
  const admin = authService.getCurrentAdmin();

  if (admin && isAccessTokenExpired(admin.accessToken)) {
    try {
      // Call logout to clear refreshToken on server and clean up localStorage
      await authService.logout();
    } catch (error) {
      console.error("Error during logout due to expired token:", error);
      // Ensure localStorage is cleared even if logout fails
      localStorage.removeItem("admin");
    }

    // Redirect to admin login page
    window.location.href = "/admin/login";
  }
}
