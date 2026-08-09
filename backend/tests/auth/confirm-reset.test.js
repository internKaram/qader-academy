const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");

// --- Environment -----------------------------------------------------------
process.env.JWT_SECRET = "test-secret-confirm-reset";

// --- Isolated app (no rate-limit middleware) --------------------------------
// We wire the controller directly so tests are not subject to the IP-level
// rate limiter that guards the production route. Rate limiting is covered
// by its own middleware unit test.
const app = express();
app.use(express.json());

const { confirmPasswordReset } = require("../../controllers/auth-controller");
app.post("/api/v1/auth/confirm-reset", confirmPasswordReset);

// --- DB helpers -----------------------------------------------------------
let mongoServer;
const User = require("../../models/user");

/**
 * Spins up an in-memory MongoDB instance and connects Mongoose to it.
 *
 * @returns {Promise<void>}
 */
async function connectTestDb() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

/**
 * Seeds a test user and returns a signed password-reset JWT for that user.
 *
 * @param {Object} [overrides={}] - Optional field overrides for the test user document.
 * @param {string | number} [expiresIn="15m"] - Expiry passed to jwt.sign for the reset token.
 * @returns {Promise<{token: string, user: import("mongoose").Document}>}
 */
async function seedUserAndResetToken(overrides = {}, expiresIn = "15m") {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("OldPassword1!", salt);

  const user = await User.create({
    name: "Test User",
    email: "reset-test@qader.academy",
    passwordHash,
    role: "student",
    ...overrides,
  });

  const token = jwt.sign(
    { userId: user._id, purpose: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  return { token, user };
}

// --- Lifecycle ------------------------------------------------------------
beforeAll(async () => {
  await connectTestDb();
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

// --- Tests ----------------------------------------------------------------
describe("POST /api/v1/auth/confirm-reset (AUTH-05)", () => {

  // TC-1: Happy path
  it("should reset the password and return 200 when given a valid token and new password", async () => {
    const { token } = await seedUserAndResetToken();
    const res = await request(app)
      .post("/api/v1/auth/confirm-reset")
      .send({ token, newPassword: "NewSecureP@ss1" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password has been reset successfully. You may now log in.");
  });

  // TC-2: Expired token
  it("should return 400 when the reset token has expired", async () => {
    const { token } = await seedUserAndResetToken({}, "1ms");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const res = await request(app)
      .post("/api/v1/auth/confirm-reset")
      .send({ token, newPassword: "NewSecureP@ss1" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Reset link has expired. Please request a new one.");
  });

  // TC-3: Wrong purpose claim
  it("should return 400 when the token purpose is not password_reset", async () => {
    const user = await User.create({
      name: "Other User",
      email: "other@qader.academy",
      passwordHash: await bcrypt.hash("pass1234", 10),
      role: "student",
    });
    const authToken = jwt.sign(
      { userId: user._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const res = await request(app)
      .post("/api/v1/auth/confirm-reset")
      .send({ token: authToken, newPassword: "NewSecureP@ss1" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid reset token purpose.");
  });

  // TC-4: Password too short
  it("should return 400 when the new password is fewer than 8 characters", async () => {
    const { token } = await seedUserAndResetToken();
    const res = await request(app)
      .post("/api/v1/auth/confirm-reset")
      .send({ token, newPassword: "short" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password must be at least 8 characters long");
  });

  // TC-5: Missing fields
  it("should return 400 when token or newPassword is missing from the request body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/confirm-reset")
      .send({ newPassword: "NewSecureP@ss1" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Token and new password are required");
  });

  // TC-6: Garbage token string
  it("should return 400 for a malformed or tampered token string", async () => {
    const res = await request(app)
      .post("/api/v1/auth/confirm-reset")
      .send({ token: "this.is.not.a.jwt", newPassword: "NewSecureP@ss1" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid or malformed reset token.");
  });
});
