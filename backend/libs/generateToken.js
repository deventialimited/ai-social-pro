const { google } = require("googleapis");
const path = require("path");
const keyFile = path.join(
  __dirname,
  "../configs/graphic-linker-434008-b6-f3cff147a662.json"
);

const generateToken = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFile,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const token = await auth.getAccessToken();
  return token;
};

module.exports = generateToken;
