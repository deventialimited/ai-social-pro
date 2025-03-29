// const Twilio = require("twilio");

// // Load environment variables
// const accountSid = process.env.TWILLO_ACCOUNT_SID;
// const authToken = process.env.TWILLO_AUTH_TOKEN;
// const twilioPhone = process.env.TWILLO_PHONE_NO;

// // Initialize Twilio client
// const client = new Twilio(accountSid, authToken);

// /**
//  * Sends an SMS using Twilio.
//  * @param {string} to - Recipient's phone number.
//  * @param {string} message - The message to be sent.
//  * @returns {Promise<object>} - Returns success or error details.
//  */
// const sendSms = async (to, message) => {
//   try {
//     const response = await client.messages.create({
//       body: `From simpple.tax: ${message}`,
//       from: twilioPhone,
//       to,
//     });
//     return { success: true, response };
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     return { success: false, error: error.message };
//   }
// };

// const sendTriggerSms = async (to, automatedMessage) => {
//   try {
//     const response = await client.messages.create({
//       body: `From simpple.tax: ${automatedMessage?.message}`,
//       from: twilioPhone,
//       to,
//     });
//     return { success: true, response };
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     return { success: false, error: error.message };
//   }
// };

// module.exports = { sendSms, sendTriggerSms };
