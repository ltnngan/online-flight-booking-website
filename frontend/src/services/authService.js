// // src/services/authService.js
// import axios from "axios";

// const API_URL = "http://localhost:3000";

// axios.defaults.withCredentials = true;

// const authService = {
//   // Register a new user
//   async register(userData) {
//     try {
//       const response = await axios.post(`${API_URL}/auth/register`, userData);
//       return response.data;
//     } catch (error) {
//       throw error.response ? error.response.data : error;
//     }
//   },

//   // Login user
//   async login(credentials) {
//     try {
//       const response = await axios.post(`${API_URL}/auth/login`, credentials);

//       if (response.data.data.accessToken) {
//         localStorage.setItem("user", JSON.stringify(response.data.data));
//       }

//       return response.data;
//     } catch (error) {
//       throw error.response ? error.response.data : error;
//     }
//   },

//   // Logout user
//   async logout() {
//     try {
//       const response = await axios.post(
//         `${API_URL}/auth/logout`,
//         {},
//         {
//           withCredentials: true, // Important for sending cookies
//         }
//       );

//       // Clear user from local storage
//       localStorage.removeItem("user");

//       return response.data;
//     } catch (error) {
//       throw error.response ? error.response.data : error;
//     }
//   },

//   // Get current user from local storage
//   getCurrentUser() {
//     const userStr = localStorage.getItem("user");
//     return userStr ? JSON.parse(userStr) : null;
//   },

//   // Check if user is logged in
//   isLoggedIn() {
//     return !!this.getCurrentUser();
//   },

//   // Get auth header
//   getAuthHeader() {
//     const user = this.getCurrentUser();
//     return user && user.accessToken
//       ? { Authorization: `Bearer ${user.accessToken}` }
//       : {};
//   },
//   // Lấy accessToken mới từ refreshToken (gửi qua cookie)
//   async refreshAccessToken() {
//     try {
//       const response = await axios.post(
//         `${API_URL}/auth/refreshtoken`,
//         {},
//         {
//           withCredentials: true, // để gửi cookie refreshToken
//         }
//       );

//       // Nếu response có accessToken mới, lưu nó vào localStorage
//       const newAccessToken = response.data.newAccessToken;

//       // Cập nhật lại accessToken trong localStorage nếu có người dùng
//       const currentUser = this.getCurrentUser();
//       if (currentUser && newAccessToken) {
//         currentUser.accessToken = newAccessToken;
//         localStorage.setItem("user", JSON.stringify(currentUser));
//       }

//       return newAccessToken;
//     } catch (error) {
//       console.error("Lấy accessToken mới thất bại:", error);
//       throw error.response ? error.response.data : error;
//     }
//   },
// };

// export default authService;
