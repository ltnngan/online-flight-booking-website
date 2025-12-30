const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");

// [GET] /admin/dashboard/monthly - Thống kê theo tháng
router.get("/", dashboardController.getMonthlyStatistics)

module.exports = router;
