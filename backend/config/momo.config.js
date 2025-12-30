const momoConfig = {
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  partnerCode: "MOMO",
  redirectUrl: "http://localhost:3001/home",
  ipnUrl: "https://e5f4-183-80-142-168.ngrok-free.app/bookings/momo/ipn",
  hostname: "test-payment.momo.vn",
  path: "/v2/gateway/api/create",
  requestType: "payWithMethod",
  lang: "vi",
};

module.exports = { momoConfig };
