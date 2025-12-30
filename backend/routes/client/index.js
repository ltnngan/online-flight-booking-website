const authMiddleware = require("../../middlewares/client/auth.middleware");
const bookingMiddleware = require("../../middlewares/client/booking.middleware");

const authRoutes = require("./auth.route");
const flightRoutes = require("./flight.route");
const bookingRoutes = require("./booking.route");
const accountRoute = require("./account.route");

module.exports = (app) => {
  app.use("/auth", authRoutes);

  app.use("/flights", flightRoutes);

  app.use("/bookings", authMiddleware.authenticateToken, bookingRoutes);

  app.use("/account", authMiddleware.authenticateToken, accountRoute);
};
