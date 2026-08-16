const express = require("express");
const {
  verifyCertificate,
} = require("../controllers/certificateController");

const router = express.Router();

router.get("/:certificateNumber", verifyCertificate);

module.exports = router;