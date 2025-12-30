const express = require("express");
const router = express.Router();
const authController = require("../../controllers/admin/auth.controller");

// (async () => {
//     await authController.createDefaultAdmin();
// })();

// Định tuyến đăng nhập
router.post("/login", authController.login);

// Định tuyến đăng xuất
router.post("/logout", authController.logout);

router.post("/refresh-token", authController.refreshAccessToken);

module.exports = router;