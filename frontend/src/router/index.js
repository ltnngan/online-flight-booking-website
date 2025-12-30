import { createRouter, createWebHistory } from "vue-router";

import clientRoutes from "@/router/client.routes.js";
import adminRoutes from "@/router/admin.routes.js";

import checkTokenOnStartupAdmin from "../utils/checkTokenOnStartupAdmin";

import authService from "../services/client/auth.service"

const routes = [...clientRoutes, ...adminRoutes];

const router = createRouter ({
    history: createWebHistory(),
    routes
})

// Kiểm tra xác thực trước khi điều hướng
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isLoggedIn();
  
  // Danh sách các trang yêu cầu xác thực
  const requiresAuth = [
    '/account',
  ];
  
  if (requiresAuth.includes(to.path) && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

router.beforeEach(async (to, from, next) => {
  // Skip token check for the login page to avoid unnecessary checks
  if (to.path !== "/admin/login") {
    await checkTokenOnStartupAdmin();
  }
  next();
});

export default router