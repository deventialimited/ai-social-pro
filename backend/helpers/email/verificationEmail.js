const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: `"One Year Social Team" <${process.env.DOMAIN_EMAIL}>`,
    to: email,
    subject: "Verify Your Email - One Year Social",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; text-align: left;">
      <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">Welcome to One Year Social 🎉</h2>
      <p style="font-size: 16px;">Hey there 👋,</p>
      <p style="font-size: 16px; margin-top: 10px;">Use the following verification code to continue:</p>
      <h2 style="font-size: 28px; font-weight: bold; color: #000; margin: 20px 0;">${otp}</h2>
      <p style="font-size: 14px; color: #555;">This code is valid for a short time. Please don’t share it with anyone.</p>
      <p style="font-size: 14px; color: #555; margin-top: 10px;">If you didn’t request this, feel free to ignore this email.</p>
      <br/>
      <p style="font-size: 16px;">Cheers,</p>
      <p style="font-size: 16px;">The One Year Social Team</p>
      <p style="font-size: 14px; margin-top: 20px;">
        <a href="https://dev.oneyearsocial.com" style="color: #007bff; text-decoration: none;">dev.oneyearsocial.com</a>
      </p>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
