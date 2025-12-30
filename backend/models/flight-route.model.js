const mongoose = require("mongoose");

const flightRouteSchema = new mongoose.Schema(
    {
        fromCity: {
            type: String,
            required: true,
        },
        toCity: [
            {
                type: String,
                required: true,
            },
        ],
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date, 
    },
    { timestamps: true }
);


const FlightRoute = mongoose.model("FlightRoute", flightRouteSchema, "flight-routes");

module.exports = FlightRoute;
