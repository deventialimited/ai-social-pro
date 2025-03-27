const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendTwoFactorOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
    to: email,
    subject: "Your 2FA OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendTwoFactorOtpEmail;
