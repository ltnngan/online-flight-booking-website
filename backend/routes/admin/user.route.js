const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/user.controller");

// Lấy danh sách người dùng
router.get("/", userController.getAllUser);

// Lấy chi tiết người dùng
router.get("/:id", userController.getOneUser);

// Xóa mềm người dùng
router.delete("/:id/delete", userController.deleteUser);

router.patch("/:id/block", userController.blockUser);

router.patch("/:id/unblock", userController.unblockUser);

module.exports = router;
