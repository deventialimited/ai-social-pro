const { default: puppeteer } = require("puppeteer");

exports.renderImageFromHTML = async (canvas, htmlString, outputPath) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Dynamic size logic (safe fallback if canvas sizes are small)
  const width = Math.max(Math.min(canvas.width / 3, 600));
  const height = Math.max(Math.min(canvas.height / 3, 600));

  const page = await browser.newPage();

  // 👇 Apply high-resolution settings via deviceScaleFactor (like 2x Retina)
  await page.setViewport({
    width: parseInt(width),
    height: parseInt(height),
    deviceScaleFactor: 2, // Increase to 3 or 4 for even higher DPI
  });

  // Load HTML
  await page.setContent(htmlString, { waitUntil: "networkidle0" });
  await new Promise((resolve) => setTimeout(resolve, 200));
  // 👇 High-quality screenshot
  await page.screenshot({
    path: outputPath,
    type: "png",
    fullPage: true,
    omitBackground: false,
  });

  await browser.close();
  return outputPath;
};
