const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        email: { 
            type: String, 
            unique: true, 
            required: true 
        },
        password: { 
            type: String, 
            required: true },
        fullName: { 
            type: String, 
            required: true 
        },
        refreshToken: {
            type: String
        },
    },
    { timestamps: true }
);
const Admin = mongoose.model("Admin", adminSchema, "admin");

module.exports = Admin;