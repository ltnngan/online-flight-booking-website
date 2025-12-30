const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const accountController = require("../../controllers/client/account.controller");
const uploadMiddleware = require("../../middlewares/client/upload.middleware")

router.get("/", accountController.getAccountInfo);

// Route cập nhật người dùng (có thể có ảnh)
router.put("/:id/edit",uploadMiddleware, accountController.updateAccount);

// Route xóa mềm người dùng
router.delete("/:id/delete", accountController.deleteAccount);

router.get("/my-flights", accountController.getMyFlightsAuthenticated);

// Route cho lịch sử chuyến bay
router.get("/flight-history", accountController.getFlightHistory);

module.exports = router;
