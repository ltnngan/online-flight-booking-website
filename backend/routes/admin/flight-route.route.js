const express = require("express");
const router = express.Router();
const flightRouteController = require("../../controllers/admin/flight-route.controller");

// Lấy danh sách tuyến bay
router.get("/", flightRouteController.getAllFlightRoute);

// Thêm tuyến bay
router.post("/create", flightRouteController.createFlightRoute);

// Xóa thành phố đến khỏi tuyến bay
router.put("/:id/delete-to-city", flightRouteController.deleteToCity);

// Xóa mềm tuyến bay
router.delete("/:id/delete", flightRouteController.deleteFlightRoute);

module.exports = router;
