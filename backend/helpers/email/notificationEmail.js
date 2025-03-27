const { sendSms } = require("../sms/sendSms");
const transporter = require("./emailConfig"); // Centralized transporter configuration

exports.sendTaxStatusUpdateEmail = async (
  user,
  taxReturnInfo,
  taxReturnId,
  statusObj
) => {
  try {
    const phoneNumber = user?.phoneVerified ? user?.phone : null;
    const email = user?.email;
    const username = user?.username;
    const name = taxReturnInfo?.businessName
      ? taxReturnInfo?.businessName
      : taxReturnInfo?.taxpayerFullName;
    // Determine the display details based on the presence of business name
    const details = taxReturnInfo?.businessName
      ? `<strong>Business Name(s):</strong> ${taxReturnInfo.businessName}<br/>`
      : `
          <strong>Taxpayer(s):</strong> ${taxReturnInfo.taxpayerFullName}<br/>
          ${
            taxReturnInfo.spouseFullName
              ? `<strong>Spouse(s):</strong> ${taxReturnInfo.spouseFullName}<br/>`
              : ""
          }
        `;

    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: `${name} tax return status has been changed to ${statusObj?.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">Tax Return Status Update</h2>
          <p>Hi ${username},</p>
          <p>The status of your tax return listed below has changed to: ${statusObj?.status?.toLowerCase()}</p>
          <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
          ${details}
            <strong>Form:</strong> ${taxReturnInfo.formType}<br/>
            <strong>Year:</strong> ${taxReturnInfo.year}
          </div>
          <p style="margin-top: 15px; font-style: italic;">${
            statusObj?.message
          }</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href=${`${process.env.Base_User_Url}/tax-return-view/${taxReturnId}?userId=${user?._id}`} style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Go to Co-Pilot</a>
          </div>
          <p style="margin-top: 20px;">Thanks,</p>
          <p>The Simpple :) Team</p>
          <p><a href=${process.env.Base_User_Url}>simpple.tax</a></p>
        </div>
      `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`Tax status update email sent to ${email}`);
    if (phoneNumber) {
      const statusMessage = `Your tax return status has changed to: ${statusObj?.status?.toLowerCase()}.`;
      const smsMessage = `Hi ${username}, ${statusMessage} Taxpayer: ${
        taxReturnInfo?.taxpayerFullName || taxReturnInfo?.businessName
      }${
        taxReturnInfo?.spouseFullName ? `&` + taxReturnInfo?.spouseFullName : ""
      }, Form: ${taxReturnInfo.formType}, Year: ${
        taxReturnInfo.year
      }. View details: ${
        process.env.Base_User_Url
      }/tax-return-view/${taxReturnId}?userId=${user?._id}`;
      const smsResponse = await sendSms(phoneNumber, smsMessage);

      if (smsResponse.success) {
        console.log(`Tax status update SMS sent to ${phoneNumber}`);
      } else {
        console.error(
          `Failed to send SMS to ${phoneNumber}:`,
          smsResponse.error
        );
      }
    }
  } catch (error) {
    console.log(
      `Failed to send tax status update email or sms to ${email}:`,
      error.message
    );
  }
};
exports.sendRefundAmountUpdateEmail = async (user, message, smsmessage) => {
  try {
    const phoneNumber = user?.phoneVerified ? user?.phone : null;
    const email = user?.email;
    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: `Tax return refund has been changed`,
      html: message,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`Tax status update email sent to ${email}`);
    if (phoneNumber) {
      const smsResponse = await sendSms(phoneNumber, smsmessage);
      if (smsResponse.success) {
        console.log(`Tax status update SMS sent to ${phoneNumber}`);
      } else {
        console.error(
          `Failed to send SMS to ${phoneNumber}:`,
          smsResponse.error
        );
      }
    }
  } catch (error) {
    console.log(
      `Failed to send tax status update email or sms to ${email}:`,
      error.message
    );
  }
};
exports.sendStatusUpdateEmailToAdmin = async (
  email,
  username,
  taxReturnInfo,
  taxReturnId,
  statusObj
) => {
  try {
    const name = taxReturnInfo?.businessName
      ? taxReturnInfo?.businessName
      : taxReturnInfo?.taxpayerFullName;
    // Determine the display details based on the presence of business name
    const details = taxReturnInfo?.businessName
      ? `<strong>Business Name(s):</strong> ${taxReturnInfo.businessName}<br/>`
      : `
          <strong>Taxpayer(s):</strong> ${taxReturnInfo.taxpayerFullName}<br/>
          ${
            taxReturnInfo.spouseFullName
              ? `<strong>Spouse(s):</strong> ${taxReturnInfo.spouseFullName}<br/>`
              : ""
          }
        `;

    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: `${name} status has been changed to ${statusObj?.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">Tax Return Status Update</h2>
          <p>Hi ${username},</p>
          <p>The status of ${name}'s tax return listed below has changed to: ${statusObj?.status?.toLowerCase()}</p>
          <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
          ${details}
            <strong>Form:</strong> ${taxReturnInfo.formType}<br/>
            <strong>Year:</strong> ${taxReturnInfo.year}
          </div>
          <p style="margin-top: 15px; font-style: italic;">${
            statusObj?.message
          }</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href=${`https://admin.simpple.tax/tax-return-view/${taxReturnId}`} style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Go to Co-Pilot</a>
          </div>
          <p style="margin-top: 20px;">Thanks,</p>
          <p>The Simpple :) Team</p>
          <p><a href=${process.env.APP_URL}>simpple.tax</a></p>
        </div>
      `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`Tax status update email sent to ${email}`);
  } catch (error) {
    console.log(
      `Failed to send tax status update email to ${email}:`,
      error.message
    );
  }
};

exports.sendNewUserCreatedEmailToAdmin = async (
  adminEmail,
  adminName,
  userInfo
) => {
  try {
    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: adminEmail,
      subject: `New User Created: ${userInfo?.username || userInfo?.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
          <h2 style="text-align: center; color: #333;">New User Created</h2>
          <p>Hi ${adminName},</p>
          <p>A new user has been created on Simpple:</p>
          <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff;">
          ${
            userInfo.username
              ? `<strong>Username:</strong> ${userInfo.username}<br/>`
              : ""
          }
            <strong>Email:</strong> ${userInfo.email}<br/>
            <strong>Account Created At:</strong> ${new Date(
              userInfo.createdAt
            ).toLocaleString()}<br/>
            <strong>User ID:</strong> ${userInfo.userId}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${
              process.env.Base_Admin_Url
            }/users" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">View User Details</a>
          </div>
          <p style="margin-top: 20px;">Thanks,</p>
          <p>The Simpple :) Team</p>
          <p><a href=${process.env.APP_URL}>simpple.tax</a></p>
        </div>
      `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`New user created email sent to admin: ${adminEmail}`);
  } catch (error) {
    console.log(
      `Failed to send new user created email to admin (${adminEmail}):`,
      error.message
    );
  }
};

exports.sendTriggerEmail = async (email, automatedMessage) => {
  try {
    // Email content
    const mailOptions = {
      from: `"Simpple :) Team" <${process.env.DOMAIN_EMAIL}>`,
      to: email,
      subject: `${automatedMessage?.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background-color: #f7f7f7;">
        <h2 style="text-align: center; color: #333;">${automatedMessage?.subject}</h2>
          <p style="margin-top: 15px; font-style: italic;">${automatedMessage?.message}</p>
          <p style="margin-top: 20px;">Thanks,</p>
          <p>The Simpple :) Team</p>
          <p><a href=${process.env.Base_User_Url}>simpple.tax</a></p>
        </div>
      `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(
      `Failed to send trigger notification email to ${email}:`,
      error.message
    );
  }
};
