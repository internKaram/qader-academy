const express = require("express");
const {
  issueCertificate,
  getMyCertificates,
  downloadCertificate,
} = require("../controllers/certificateController");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.get("/", authMiddleware, getMyCertificates);
router.post("/", authMiddleware, issueCertificate);

router.get(
  "/:certificateNumber/download",
  downloadCertificate
);

module.exports = router;