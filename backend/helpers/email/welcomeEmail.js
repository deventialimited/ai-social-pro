const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendWelcomeEmail = async (email, name) => {
  try {
    // Email content
    const mailOptions = {
      from: `"One Year Social Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: "Welcome to One Year Social 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">Welcome to One Year Social</h2>
          <p>Hello ${name} 👋,</p>
          <p>We’re excited to have you on board! One Year Social helps you streamline content, build consistency, and grow your brand across social platforms.</p>
          <p>Ready to get started? Here's what you can do next:</p>
          <ul>
            <li>Create your first social media post</li>
            <li>Connect your platforms</li>
            <li>Explore content analytics</li>
            <li>Try out AI-assisted writing</li>
          </ul>
          <p><a href="https://dev.oneyearsocial.com" style="color: #007bff;">Launch Dashboard</a></p>
          <p>Need help? Just reply to this email or use the chat support on the website. We’ve got your back 💪</p>
          <br />
          <p>Cheers,</p>
          <p>The One Year Social Team</p>
          <p><a href="https://dev.oneyearsocial.com" style="color: #007bff;">dev.oneyearsocial.com</a></p>
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
