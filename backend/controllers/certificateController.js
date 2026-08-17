const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const Certificate = require("../models/Certificate");
const { generateCertificatePdf } = require("../services/certificatePdfService");

const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `QA-CERT-${year}-${randomPart}`;
};

const issueCertificate = async (req, res) => {
  try {
    const {
      studentId: reqStudentId,
      courseId,
      studentName,
      courseTitle,
    } = req.body;

    const studentId = (req.user && req.user.role === 'admin' && reqStudentId)
      ? reqStudentId
      : (req.user?.userId || req.user?._id || reqStudentId);

    if (!studentId || !courseId || !studentName || !courseTitle) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, courseId, studentName, and courseTitle are required.",
      });
    }

    const existingCertificate = await Certificate.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already exists.",
        certificate: existingCertificate,
      });
    }

    const certificateNumber = generateCertificateNumber();
    const issueDate = new Date();

    const pdfPath = await generateCertificatePdf({
      studentName,
      courseTitle,
      issueDate,
      certificateNumber,
    });

    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      certificateNumber,
      issueDate,
      pdfPath,
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      certificate,
    });
  } catch (error) {
    console.error("Certificate issuance failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to issue certificate.",
      error: error.message,
    });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    const certificates = await Certificate.find({
      student: studentId,
    })
      .populate("course", "title")
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Failed to fetch certificates:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message,
    });
  }
};
const downloadCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({
      certificateNumber,
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    if (!certificate.pdfPath) {
      return res.status(404).json({
        success: false,
        message: "Certificate PDF is not available.",
      });
    }

    const resolvedPath = path.resolve(certificate.pdfPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: "Certificate PDF file not found on disk.",
      });
    }

    return res.download(
      resolvedPath,
      `${certificate.certificateNumber}.pdf`
    );
  } catch (error) {
    console.error("Certificate download failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download certificate.",
      error: error.message,
    });
  }
};
module.exports = {
  issueCertificate,
  getMyCertificates,
  downloadCertificate,
};