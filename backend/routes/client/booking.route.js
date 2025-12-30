const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/client/booking.controller");

// Tạo đặt vé
router.post("/create", bookingController.createBooking);

// Xử lý IPN từ MoMo
router.post("/momo/ipn", bookingController.handleMomoIPN);

// Kiểm tra và cập nhật các đặt vé hết hạn (cron job hoặc gọi thủ công)
router.get("/check-expired-bookings", bookingController.checkExpiredBookings);

router.post("/cancel", bookingController.cancelBooking);

router.get("/payment-url", bookingController.getBookingPaymentUrl);

module.exports = router;
