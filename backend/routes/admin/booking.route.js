const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/admin/booking.controller");

// Lấy danh sách đơn vé
router.get("/", bookingController.getAllBooking);

module.exports = router;