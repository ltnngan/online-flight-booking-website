const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        bookingCode: { 
            type: String, 
            unique: true, 
            required: true 
        }, 
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: false 
        },
        contactInfo: {
            name: {
                type: String, 
                required: true
            },
            email: { 
                type: String, 
                required: false 
            },
            phoneNumber: { 
                type: String, 
                required: false 
            },
        },
        flight: [
            {
                flightId: {
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'Flight', 
                    required: true 
                },
                ticketType: { 
                    type: String, 
                    enum: ['Economy', 'Deluxe', 'SkyBoss'], 
                    required: true 
                },
                price: {  
                    type: Number,
                    required: true
                }
            }
        ],
        passengers: [
            {
                name: {
                    type: String, 
                    required: true
                },
                dob: {
                    type: Date,
                    required: true
                },
                gender: {
                    type: String,
                    // enum: ["Male", "Female", "Other"],
                    required: true
                },
                // ageGroup: {
                //     type: String, 
                //     enum: ["Adult", "Child"], 
                //     required: true 
                // },
            }
        ],
        totalPrice: { 
            type: Number, 
            required: true 
        },
        payment: {
            method: {
                type: String,
                enum: ['MoMo'],
                required: false
            },
            orderId: String,
            requestId: String,
            payUrl: String,
            status: {
                type: String,
                enum: ['Pending', 'Completed', 'Failed'],
                default: 'Pending'
            },
            momo: {
                partnerCode: String,
                transId: String,
                amount: Number,
                signature: String,
                responseTime: Date,
                expiresAt: { 
                    type: Date,
                    default: null
                }
            },
        },
        status: { 
            type: String, 
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending' 
        },
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema, "bookings");

module.exports = Booking;