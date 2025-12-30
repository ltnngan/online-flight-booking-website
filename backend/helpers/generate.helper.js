const jwt = require('jsonwebtoken');
const crypto = require("crypto");


const generateAccessToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const generateUniqueBookingCode = () => {
    return "SA" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

const generateUniqueFlightCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateUniqueBookingCode,
    generateUniqueFlightCode
};