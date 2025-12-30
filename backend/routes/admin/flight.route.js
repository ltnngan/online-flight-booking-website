const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const flightController = require("../../controllers/admin/flight.controller");

// Lấy danh sách chuyến bay
router.get("/", flightController.getAllFlight);

// Lấy chi tiết chuyến bay
router.get("/:id", flightController.getOneFlight);

// Tạo chuyến bay (có hỗ trợ upload ảnh)
router.post("/create", upload.single("image"), flightController.createFlight);

// Cập nhật chuyến bay (có hỗ trợ upload ảnh)
router.put("/:id/edit", upload.single("image"), flightController.editFlight);

// Xóa mềm chuyến bay
router.delete("/:id/delete", flightController.deleteFlight);

module.exports = router;
