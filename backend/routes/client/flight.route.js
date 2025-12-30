const express = require("express");
const router = express.Router();
const flightController = require("../../controllers/client/flight.controller");

// Route tìm kiếm chuyến bay
router.get("/search", flightController.searchFlights);

router.post("/my-flights", flightController.getMyFlightsGuest);

router.get("/cheap-flights", flightController.getCheapFlights);

module.exports = router;
