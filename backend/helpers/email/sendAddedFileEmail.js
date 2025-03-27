const transporter = require("./emailConfig"); // Centralized transporter configuration

/**
 * Sends an email based on the type of recipient (user or admin).
 * @param {string} toEmail - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {object} content - Dynamic content for the email.
 * @param {string} recipientType - 'user' or 'admin'.
 */
const sendAddedFileEmail = async (toEmail, subject, content, recipientType) => {
  try {
    // Determine the email body based on the recipient type
    let emailBody;

    if (recipientType === "user") {
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">We Have Received Your ${content.dynamicType}</h2>
          <p>Hi ${content.taxpayerName},</p>
          <p>We have received your <strong>${content.dynamicType}</strong>, and your dedicated tax pro will get back to you after carefully reviewing it.</p>
          <p><a href="${content.viewFileUrl}" style="color: #007bff;">Link to View the File</a></p>
          <p>${content.footer}</p>
        </div>
      `;
    } else if (recipientType === "admin") {
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">New Document Submission</h2>
          <p>${content.taxpayerName} has sent a <strong>${content.dynamicType}</strong>.</p>
          <p><strong>Timestamp:</strong> ${content.timestamp}</p>
          <p><a href="${content.viewFileUrl}" style="color: #007bff;">Link to View the File</a></p>
          <p>${content.footer}</p>
        </div>
      `;
    } else {
      throw new Error("Invalid recipient type specified");
    }

    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: emailBody,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error.message);
  }
};

module.exports = sendAddedFileEmail;
