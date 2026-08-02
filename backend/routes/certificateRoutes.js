const express = require("express");
const {
  issueCertificate,
  getMyCertificates,
  downloadCertificate,
} = require("../controllers/certificateController");

const router = express.Router();

router.get("/", getMyCertificates);
router.post("/", issueCertificate);

router.get(
  "/:certificateNumber/download",
  downloadCertificate
);

module.exports = router;