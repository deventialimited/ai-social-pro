const { default: puppeteer } = require("puppeteer");

exports.renderImageFromHTML = async (canvas, htmlString, outputPath) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const width = parseInt(canvas?.width) || 800;
  const height = parseInt(canvas?.height) || 600;

  const page = await browser.newPage();
  await page.setContent(htmlString, { waitUntil: "networkidle0" });
  await page.setViewport({ width, height });
  await page.screenshot({ path: outputPath, type: "png" });
  await browser.close();
  return outputPath;
};
