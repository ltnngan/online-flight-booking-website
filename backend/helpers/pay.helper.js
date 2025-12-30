const { momoConfig } = require("../config/momo.config")
const crypto = require("crypto");
const https = require("https");

const createMomoPayment = (booking) => {
    return new Promise ((resolve, reject) => {
        const orderId = `${momoConfig.partnerCode}${new Date().getTime()}`;
        const requestId = orderId
        const amount = booking.totalPrice.toString()
        const orderInfo = `Thanh toán cho đặc vé ${booking.bookingCode}`;
        const extraData = Buffer.from(JSON.stringify({ bookingId: booking._id })).toString("base64");

        const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;

        const signature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex");

        const requestBody = JSON.stringify({
            partnerCode: momoConfig.partnerCode,
            partnerName: "Đặt Vé Máy Bay",
            storeId: "FlightBookingStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: momoConfig.redirectUrl,
            ipnUrl: momoConfig.ipnUrl,
            lang: momoConfig.lang,
            requestType: momoConfig.requestType,
            autoCapture: true,
            extraData: extraData,
            signature: signature,
        });

        const options = {
            hostname: momoConfig.hostname,
            port: 443,
            path: momoConfig.path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestBody),
            },
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                const response = JSON.parse(data);
                resolve(response);
                } catch (error) {
                reject(error);
                }
            });
        });

        req.on("error", (error) => reject(error));
        req.write(requestBody);
        req.end();
    })
}

module.exports = { 
    createMomoPayment, 
};