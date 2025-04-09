const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendWelcomeEmail = async (email, name) => {
  try {
    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: "Welcome to Simpple :)",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">Welcome to Simpple.Tax</h2>
          <p>Hello there 👋,</p>
          <p>Thank you for joining us, we're pumped to have you on this journey with us. Let's build 🚀 something awesome together!</p>
          <p>If you have any questions or need a hand, just reply to this email or swing by our Website chat. We're always here to help you out.</p>
          <p>What would you like to do next?</p>
          <ul>
            <li>Personal return</li>
            <li>Business return</li>
            <li>Tax planning</li>
            <li>Tax check-up</li>
            <li>Discuss a tax notice</li>
            <li>Discuss an audit</li>
          </ul>
          <p><a href="https://simpple.tax">Start free</a></p>
          <p>Thanks,</p>
          <p>The Simpple :) Team</p>
          <p><a href="https://simpple.tax">simpple.tax</a></p>
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

module.exports = sendWelcomeEmail;
