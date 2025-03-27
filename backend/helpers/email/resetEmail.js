const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendResetEmail = async (email, resetUrl) => {
  try {
    const subject = resetUrl.includes("/set-password")
      ? "Set Your Password on Simpple :)"
      : "Reset Your Password on Simpple :)";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
        <h2 style="text-align: center; color: #333;">${
          resetUrl.includes("/set-password")
            ? "Set Your Password"
            : "Reset Your Password"
        } on Simpple :)</h2>
        <p>Hello there 👋,</p>
        <p>You requested a password reset. Please click the link below to ${
          resetUrl.includes("/set-password") ? "set" : "reset"
        } your password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; margin: 10px auto; padding: 10px 20px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">${
      resetUrl.includes("/set-password") ? "Set Password" : "Reset Password"
    }</a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Thanks,</p>
        <p>The Simpple :) team</p>
        <p><a href="https://simpple.tax">simpple.tax</a></p>
      </div>
    `;

    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset email to ${email}:`, error.message);
    throw new Error("Failed to send reset email.");
  }
};

module.exports = sendResetEmail;
