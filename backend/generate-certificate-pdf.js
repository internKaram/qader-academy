const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function generateCertificatePdf() {
  let browser;

  try {
    const certificatePath = path.resolve(
      __dirname,
      "../docs/certificate-prototype/certificate.html"
    );

    const outputDirectory = path.resolve(
      __dirname,
      "../docs/certificate-prototype/output"
    );

    const outputPath = path.join(
      outputDirectory,
      "qader-academy-certificate.pdf"
    );

    if (!fs.existsSync(certificatePath)) {
      throw new Error(
        `Certificate template was not found: ${certificatePath}`
      );
    }

    fs.mkdirSync(outputDirectory, {
      recursive: true,
    });

    browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1123,
      height: 794,
      deviceScaleFactor: 1,
    });

    await page.goto(`file://${certificatePath}`, {
      waitUntil: "networkidle0",
    });

    await page.emulateMediaType("print");

    await page.evaluateHandle("document.fonts.ready");

    await page.pdf({
      path: outputPath,
      width: "297mm",
      height: "210mm",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      pageRanges: "1",
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    console.log("Certificate PDF generated successfully:");
    console.log(outputPath);
  } catch (error) {
    console.error("Failed to generate certificate PDF:");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

generateCertificatePdf();