const transporter = require("./emailConfig"); // Centralized transporter configuration

const welcomeEmailToAdmin = async (email, password, name, userType) => {
  try {
    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: "Welcome to Simpple :)",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
        <h2 style="text-align: center; color: #333;">Welcome to Simpple.Tax</h2>
        <p>Dear ${name},</p>
        <p>Welcome to our platform! You have been registered as an <strong>${userType}</strong>.</p>
        <p>Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password} <em>(Please keep this secure)</em></li>
        </ul>
        <p>You can log in at <a href="${process.env.Base_User_Url}/login" style="color: #007bff; text-decoration: none;">${process.env.Base_User_Url}/login</a>.</p>
        <p>If you have any questions or need assistance, just reply to this email or visit our website chat. We're always here to help you out.</p>
        <p>Thanks,</p>
        <p>The Simpple :) Team</p>
        <p><a href="https://simpple.tax" style="color: #007bff; text-decoration: none;">simpple.tax</a></p>
      </div>
    `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.log(`Failed to send welcome email to ${email}:`, error.message);
  }
};

module.exports = welcomeEmailToAdmin;
