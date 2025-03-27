const transporter = require("./emailConfig"); // Centralized transporter configuration

const sendPaymentEmail = async (toEmail, subject, paymentDetails) => {
  try {
    // Determine the display details based on the presence of business name
    const details = paymentDetails?.businessName
      ? `<strong>Business Name(s):</strong> ${paymentDetails.businessName}<br/>`
      : `
            <strong>Taxpayer(s):</strong> ${
              paymentDetails.taxpayerFullName
            }<br/>
            ${
              paymentDetails.spouseFullName
                ? `<strong>Spouse(s):</strong> ${paymentDetails.spouseFullName}<br/>`
                : ""
            }
          `;
    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
            <h2 style="text-align: center; color: #333;">Payment Details</h2>
            <p><strong>Payer's Name:</strong> ${paymentDetails.payerName}</p>
            <p><strong>Address:</strong> ${paymentDetails.payerAddress}</p>
            <h3>Paid for:</h3>
            <ul>
            <li>${details}</li>
              <li><strong>Form:</strong> ${paymentDetails.formType}</li>
              <li><strong>Year:</strong> ${paymentDetails.year}</li>
              <li><strong>Federal Amount:</strong> ${paymentDetails.federalAmount} USD</li>
              <li><strong>States:</strong> ${paymentDetails.stateQty} states (${paymentDetails.stateAmount} USD)</li>
              <li><strong>Total Paid:</strong> ${paymentDetails.totalPaid} USD</li>
            </ul>
            <p><a href="${paymentDetails.billingPageUrl}">View your billing information</a></p>
            <p>🙏<br>simpple.tax</p>
          </div>
        `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`Payment email sent to ${toEmail}`);
  } catch (error) {
    console.log(`Failed to send payment email to ${toEmail}:`, error.message);
  }
};

module.exports = sendPaymentEmail;
