const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; text-align: left;">
      <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">Verification code, simpple :)</h2>
      <p style="font-size: 16px; margin: 0;">Hello there <span style="font-size: 20px;">👋</span>,</p>
      <p style="font-size: 18px; font-weight: bold; margin-top: 10px;">Verification code</p>
      <p style="font-size: 16px; margin-bottom: 30px;">Enter the below one-time password to verify your account:</p>
      <h2 style="font-size: 28px; font-weight: bold; color: #000; margin: 10px 0;">${otp}</h2>
      <p style="font-size: 14px; color: #555; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      <br/>
      <p style="font-size: 16px;">Thanks,</p>
      <p style="font-size: 16px;">The Simpple :) team</p>
      <p style="font-size: 14px; margin-top: 20px;"><a href="https://simpple.tax" style="color: #00aaff; text-decoration: none;">simpple.tax</a></p>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
