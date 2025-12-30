const express = require("express");
const router = express.Router();
const authController = require("../../controllers/client/auth.controller");

// Route đăng ký
router.post("/register", authController.register);

// Route đăng nhập
router.post("/login", authController.login);

// Route refreshtoken
router.post("/refreshtoken", authController.refreshAccessToken);

// Route đăng xuất
router.post("/logout", authController.logout);

module.exports = router;
