const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
    {
        flightCode: {
            type: String,
            unique: true,
            required: true,
        },
        image: { 
            type: String, 
            default: '' 
        },
        fromCity: {
            type: String,
            required: true,
        },
        toCity: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        aircraft: {
            type: String,
            required: true,
        },
        basePrice: {
            type: Number,
            required: true,
        },
        seats: [{
            category: { 
                type: String, 
                required: true 
            }, 
            available: { 
                type: Number, 
                required: true, 
                min: 0 
            }, 
            total: { 
                type: Number, 
                required: true,
                min: 0 
            },
            priceMultiplier: { 
                type: Number, 
                required: true 
            }
        }],
        status: { 
            type: String, 
            enum: ['Scheduled', 'Completed', 'Cancelled'], 
            default: 'Scheduled' 
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date, 
    },
    { timestamps: true }
)

const Flight = mongoose.model("Flight", flightSchema, "flights");

module.exports = Flight;