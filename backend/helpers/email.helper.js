const nodemailer = require('nodemailer');

// Cấu hình transporter cho nodemailer (cần thay đổi thông tin SMTP thực tế)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "lengocngan2410vn@gmail.com",
    pass: "ybwfndaqmyralbjx",
  },
});

// Gửi email xác nhận đặt vé với mã đặt chỗ
const sendBookingConfirmationEmail = async (email, bookingCode) => {
    try {
        let subject = 'Xác nhận đặt vé thành công';
        let htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
                <h2 style="color: #1a73e8;">Xác nhận đặt vé thành công</h2>
                <p>Cảm ơn bạn đã sử dụng dịch vụ đặt vé máy bay của chúng tôi.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="margin-top: 0; color: #333;">Thông tin đặt vé</h3>
                    <p><strong>Mã đặt chỗ:</strong> ${bookingCode}</p>
                    <p><strong>Phương thức thanh toán:</strong> MoMo</p>
                    <p style="color: #4CAF50;"><strong>Trạng thái:</strong> Đã thanh toán</p>
                </div>
                    <p>Bạn có thể kiểm tra chi tiết đặt vé và vé điện tử của bạn trong tài khoản của mình.</p>
                    <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hỗ trợ hoặc hotline.</p>
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
        `;

        await transporter.sendMail({
            from: '"Đặt Vé Máy Bay" <your-email@gmail.com>',
            to: email,
            subject: subject,
            html: htmlContent
        });

        // console.log(`Đã gửi email xác nhận đến ${email} cho đặt vé ${bookingCode}`);
        return true;
    } catch (error) {
        // console.error('Lỗi khi gửi email xác nhận:', error);
        return false;
    }
};

// Gửi email thông báo hủy đặt vé
const sendBookingCancellationEmail = async (email, bookingCode) => {
    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
                <h2 style="color: #d93025;">Thông báo hủy đặt vé</h2>
                <p>Đặt vé của bạn đã bị hủy do quá thời hạn thanh toán.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="margin-top: 0; color: #333;">Thông tin đặt vé</h3>
                    <p><strong>Mã đặt chỗ:</strong> ${bookingCode}</p>
                    <p><strong>Trạng thái:</strong> Đã hủy</p>
                    <p><strong>Lý do:</strong> Quá thời hạn thanh toán</p>
                </div>
                <p>Nếu bạn vẫn muốn đặt vé, vui lòng thực hiện đặt vé mới trên hệ thống của chúng tôi.</p>
                <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hỗ trợ hoặc hotline.</p>
                <p style="margin-top: 30px; color: #666; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
        `;

        await transporter.sendMail({
            from: '"Đặt Vé Máy Bay" <your-email@gmail.com>',
            to: email,
            subject: 'Thông báo hủy đặt vé máy bay',
            html: htmlContent
        });

        // console.log(`Đã gửi email thông báo hủy đến ${email} cho đặt vé ${bookingCode}`);
        return true;
    } catch (error) {
        // console.error('Lỗi khi gửi email hủy đặt vé:', error);
        return false;
    }
};

module.exports = {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail
}