const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatIssueDate = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

async function generateCertificatePdf({
  studentName,
  courseTitle,
  issueDate,
  certificateNumber,
}) {
  let browser;

  try {
    const templatePath = path.resolve(
      __dirname,
      "../../docs/certificate-prototype/certificate.html"
    );

    const outputDirectory = path.resolve(
      __dirname,
      "../generated-certificates"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Certificate template not found: ${templatePath}`);
    }

    fs.mkdirSync(outputDirectory, { recursive: true });

    let html = fs.readFileSync(templatePath, "utf8");

    html = html
      .replaceAll("Raghad Abdulqadir", escapeHtml(studentName))
      .replaceAll(
        "Full-Stack Web Development with MERN",
        escapeHtml(courseTitle)
      )
      .replaceAll("30 July 2026", formatIssueDate(issueDate))
      .replaceAll(
        "QA-CERT-2026-0001",
        escapeHtml(certificateNumber)
      );

    const outputPath = path.join(
      outputDirectory,
      `${certificateNumber}.pdf`
    );

    browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
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

    return outputPath;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  generateCertificatePdf,
};