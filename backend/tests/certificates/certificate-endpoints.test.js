const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const { connect, clearDatabase, closeDatabase } = require("../setup");

jest.mock("../../services/certificatePdfService", () => ({
  generateCertificatePdf: jest.fn(),
}));

const {
  generateCertificatePdf,
} = require("../../services/certificatePdfService");

const Certificate = require("../../models/Certificate");
const certificateRoutes = require("../../routes/certificateRoutes");
const verifyRoutes = require("../../routes/verifyRoutes");

// Minimal models needed for populate() in verification
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema({
      name: String,
      email: String,
    })
  );

const Course =
  mongoose.models.Course ||
  mongoose.model(
    "Course",
    new mongoose.Schema({
      title: String,
    })
  );

const app = express();
app.use(express.json());

app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/verify", verifyRoutes);

let student;
let course;
let tempPdfPath;
let token;

beforeAll(async () => {
  await connect();
  await Certificate.createIndexes();

  tempPdfPath = path.join(__dirname, "test-certificate.pdf");
});

beforeEach(async () => {
  student = await User.create({
    name: "Raghad Abdulqadir",
    email: "raghad@test.com",
  });

  course = await Course.create({
    title: "MERN Stack Course",
  });

  token = jwt.sign(
    { userId: student._id.toString(), id: student._id.toString(), role: "student" },
    process.env.JWT_SECRET || "test_jwt_secret_key_123"
  );

  fs.writeFileSync(tempPdfPath, "Test certificate PDF content");

  generateCertificatePdf.mockResolvedValue(tempPdfPath);
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();

  if (fs.existsSync(tempPdfPath)) {
    fs.unlinkSync(tempPdfPath);
  }
});

afterAll(async () => {
  await closeDatabase();
});

describe("Certificate endpoints", () => {
  describe("POST /api/v1/certificates", () => {
    it("should issue a certificate successfully", async () => {
      const res = await request(app)
        .post("/api/v1/certificates")
        .set("Authorization", `Bearer ${token}`)
        .send({
          studentId: student._id.toString(),
          courseId: course._id.toString(),
          studentName: student.name,
          courseTitle: course.title,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe(
        "Certificate issued successfully."
      );

      expect(res.body.certificate).toHaveProperty(
        "certificateNumber"
      );

      const count = await Certificate.countDocuments({
        student: student._id,
        course: course._id,
      });

      expect(count).toBe(1);
      expect(generateCertificatePdf).toHaveBeenCalledTimes(1);
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/certificates")
        .set("Authorization", `Bearer ${token}`)
        .send({
          studentId: student._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/certificates", () => {
    it("should return student's certificates", async () => {
      await Certificate.create({
        student: student._id,
        course: course._id,
        certificateNumber: "QA-CERT-TEST-001",
        issueDate: new Date(),
        pdfPath: tempPdfPath,
      });

      const res = await request(app)
        .get("/api/v1/certificates")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.certificates).toHaveLength(1);
    });

    it("should return 401 when user is not authenticated", async () => {
      const res = await request(app)
        .get("/api/v1/certificates");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(
        /Authentication is required|Not authorized/i
      );
    });
  });

  describe("GET /api/v1/verify/:certificateNumber", () => {
    it("should verify a valid certificate", async () => {
      await Certificate.create({
        student: student._id,
        course: course._id,
        certificateNumber: "QA-CERT-VERIFY-001",
        issueDate: new Date(),
        pdfPath: tempPdfPath,
      });

      const res = await request(app)
        .get("/api/v1/verify/QA-CERT-VERIFY-001");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.certificate.studentName).toBe(
        "Raghad Abdulqadir"
      );

      expect(res.body.certificate.courseTitle).toBe(
        "MERN Stack Course"
      );

      expect(res.body.certificate.certificateNumber).toBe(
        "QA-CERT-VERIFY-001"
      );

      // Privacy check
      expect(res.body.certificate).not.toHaveProperty("email");
    });

    it("should return 404 for an invalid certificate number", async () => {
      const res = await request(app)
        .get("/api/v1/verify/INVALID-CERTIFICATE");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Certificate not found or invalid."
      );
    });
  });

  describe("GET /api/v1/certificates/:certificateNumber/download", () => {
    it("should download an existing certificate PDF", async () => {
      await Certificate.create({
        student: student._id,
        course: course._id,
        certificateNumber: "QA-CERT-DOWNLOAD-001",
        issueDate: new Date(),
        pdfPath: tempPdfPath,
      });

      const res = await request(app)
        .get(
          "/api/v1/certificates/QA-CERT-DOWNLOAD-001/download"
        );

      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toContain(
        "QA-CERT-DOWNLOAD-001.pdf"
      );
    });

    it("should return 404 when certificate does not exist", async () => {
      const res = await request(app)
        .get(
          "/api/v1/certificates/DOES-NOT-EXIST/download"
        );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Certificate not found."
      );
    });
  });
});