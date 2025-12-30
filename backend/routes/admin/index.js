const systemConfig = require("../../config/system");

const authMiddleware = require("../../middlewares/admin/auth.middleware");
const uploadMiddleware = require("../../middlewares/admin/upload.middleware")

const authRoutes = require("./auth.route")
const dashboardRoutes = require("./dashboard.route")
const flightRouteRoutes = require("./flight-route.route")
const flightRoutes = require("./flight.route")
const bookingRoutes = require("./booking.route")
const userRoutes = require("./user.route");

module.exports = (app) => {
    const PATH_ADMIN = "/" + systemConfig.prefixAdmin;

    app.use (
        PATH_ADMIN + '/auth',
        authRoutes
    )
    
    app.use (
        PATH_ADMIN + '/dashboard',
        authMiddleware.authenticateToken,
        dashboardRoutes
    );

    app.use(
      PATH_ADMIN + "/flight-routes",
      authMiddleware.authenticateToken,
      flightRouteRoutes
    );

    app.use(
      PATH_ADMIN + "/flights",
      authMiddleware.authenticateToken,
      flightRoutes
    );

    app.use(
      PATH_ADMIN + "/bookings",
      authMiddleware.authenticateToken,
      bookingRoutes
    );

    app.use(
      PATH_ADMIN + "/users",
      authMiddleware.authenticateToken,
      userRoutes
    );
}