# OWASP Top 10 Security Review & Remediation Report

This document presents the complete security posture assessment and remediation audit for **Qader Academy** based on the **OWASP Top 10 (2021)** standard.

---

## 1. OWASP Top 10 Compliance & Mitigation Matrix

| OWASP Category | Risk Name | Status | Implemented Controls & Remediations | Test Coverage |
| :--- | :--- | :---: | :--- | :--- |
| **A01:2021** | Broken Access Control | 🟢 **Remediated** | - Added `authMiddleware` to protect certificate routes (`GET /`, `POST /`).<br>- Mitigated IDOR/BOLA in `enrollmentController.js` and `progressController.js` by scoping student operations strictly to `req.user.userId`.<br>- Fixed BOLA in `certificateController.js` by enforcing authenticated caller ID in `issueCertificate`.<br>- Protected certificate downloads against path traversal with `path.resolve` validation.<br>- Course/lesson CRUD verifies instructor ownership.<br>- Enforced frontend client-side route guards (`ProtectedRoute`) with stealth 404 access control for `/admin` and `/instructor` workspaces. | `backend/tests/security/access-control.test.js`<br>`backend/tests/auth/rbac-middleware.test.js`<br>`frontend/src/tests/protected-routes.test.tsx` |
| **A02:2021** | Cryptographic Failures | 🟢 **Remediated** | - Passwords hashed via `bcryptjs` with salt cost 10.<br>- Fixed sensitive data leakage in `admin-controller.js` (`.select('-passwordHash')`).<br>- JWT signing using HMAC-SHA256 with 7-day auth expiry and 15-minute reset token expiry. | `backend/tests/security/access-control.test.js`<br>`backend/tests/auth/login.test.js` |
| **A03:2021** | Injection | 🟢 **Remediated** | - Mongoose parameterized queries prevent SQL/NoSQL injection.<br>- Sanitized regex metacharacters in `admin-controller.js` search to eliminate ReDoS risk.<br>- Added strict integer and schema validation in `lesson-controller.js` `reorderLessons` before `bulkWrite`. | `backend/tests/security/access-control.test.js` |
| **A04:2021** | Insecure Design | 🟢 **Mitigated** | - Strict rate limiting (`loginLimiter`, `resetPasswordLimiter`, 5 req / 5 min).<br>- Single-use password reset tokens with explicit `purpose: 'password_reset'` validation.<br>- Guarded plaintext reset token logging in `auth-controller.js` behind non-production environment checks. | `backend/tests/auth/rate-limit.test.js`<br>`backend/tests/auth/confirm-reset.test.js` |
| **A05:2021** | Security Misconfiguration | 🟢 **Remediated** | - Integrated `helmet` middleware for security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `HSTS`, `Referrer-Policy`).<br>- Express fingerprinting disabled (`X-Powered-By` stripped).<br>- Configured strict CORS origin whitelist in `server.js` preventing wildcard access.<br>- Centralized error handling middleware in `server.js` preventing stack trace leaks. | `backend/tests/security/helmet.test.js` |
| **A06:2021** | Vulnerable and Outdated Components | 🟢 **Mitigated** | - `npm audit` executed across workspace root, backend, and frontend.<br>- **0 vulnerabilities** (0 critical, 0 high, 0 moderate, 0 low). | `npm audit` CI verification |
| **A07:2021** | Identification & Authentication Failures | 🟢 **Remediated** | - Normalized `req.user` (`userId`, `_id`, `id`) in `auth-middleware.js` to guarantee consistent downstream auth checks.<br>- Brute-force protection on `/login` and `/reset-password`. | `backend/tests/auth/auth-middleware.test.js`<br>`backend/tests/auth/rate-limit.test.js` |
| **A08:2021** | Software and Data Integrity Failures | 🟢 **Mitigated** | - Dependency integrity locked via `package-lock.json`.<br>- Certificate PDF generation strictly uses vetted internal HTML templates, HTML entity escaping, and isolated Puppeteer rendering. | `backend/tests/certificateService.test.js` |
| **A09:2021** | Security Logging and Monitoring Failures | 🟢 **Remediated** | - Added persistent `AuditLog` records for high-risk operations (user role elevation, user suspension).<br>- Standardized error console logging. | Unit & manual verification |
| **A10:2021** | Server-Side Request Forgery (SSRF) | 🟢 **Mitigated** | - Backend API does not accept arbitrary external URLs for fetching.<br>- Puppeteer PDF rendering runs locally with escaped entities and no external arbitrary network fetches. | Architectural verification |

---

## 2. Remediated Vulnerabilities

### 1. Certificate Routes Authentication (A01: Broken Access Control)
- **Vulnerability**: `GET /api/v1/certificates` and `POST /api/v1/certificates` were exposed without `authMiddleware`.
- **Fix**: Applied `authMiddleware` to both routes in `backend/routes/certificateRoutes.js`.

### 2. Enrollment & Progress IDOR / BOLA (A01: Broken Access Control)
- **Vulnerability**: `enrollInCourse`, `getStudentEnrollments`, and `getCompletionStatus` accepted arbitrary `studentId` from the request body or query, allowing unauthorized users to act on other users' records.
- **Fix**: Restricted student queries to the authenticated user ID (`req.user.userId`) in `backend/controllers/enrollmentController.js` and `backend/controllers/progressController.js`.

### 3. Password Hash Leakage in Admin Panel (A02: Cryptographic Failures)
- **Vulnerability**: `getAdminUsers` called `.select('-password')` instead of `.select('-passwordHash')`, exposing password hashes in API responses.
- **Fix**: Updated projection to `.select('-passwordHash')` in `backend/controllers/admin-controller.js`.

### 4. ReDoS in Admin Search (A03: Injection)
- **Vulnerability**: Admin search passed user-controlled input directly into `$regex` without character escaping.
- **Fix**: Sanitized search queries by escaping special regex characters in `backend/controllers/admin-controller.js`.

### 5. Centralized Error Handling (A05: Security Misconfiguration)
- **Vulnerability**: Lack of global error handler could leak stack traces and database internal details.
- **Fix**: Added global error handling middleware in `backend/server.js`.

### 6. Frontend UI Route Protection & Access Control (A01: Broken Access Control)
- **Vulnerability**: Unauthenticated visitors and unauthorized students could navigate directly to `/admin` or `/instructor` in the browser, rendering unauthorized UI views.
- **Fix**: Implemented `ProtectedRoute` with zero-knowledge stealth 404 access control in `frontend/src/App.tsx`, preventing component mounting for unauthorized users.

### 7. Certificate Issuance BOLA & Path Traversal (A01: Broken Access Control)
- **Vulnerability**: `issueCertificate` allowed arbitrary caller `studentId` assignment, and `downloadCertificate` passed paths directly without disk existence checks.
- **Fix**: Enforced authenticated user scoping in `certificateController.js` and verified resolved file paths before `res.download`.

### 8. CORS Wildcard Origin Misconfiguration (A05: Security Misconfiguration)
- **Vulnerability**: `app.use(cors())` enabled open wildcard `*` cross-origin access.
- **Fix**: Configured explicit origin whitelist in `backend/server.js` restricted to trusted frontend origins.

### 9. Plaintext Reset Token Log Leakage (A04: Insecure Design)
- **Vulnerability**: Mock email delivery logged raw reset URLs with active JWT signatures directly to standard output.
- **Fix**: Guarded reset token console logging in `backend/controllers/auth-controller.js` strictly behind non-production environment checks.

### 10. Lesson Reorder Input Schema Validation (A03: Injection)
- **Vulnerability**: `reorderLessons` executed MongoDB `bulkWrite` without verifying `orderIndex` type and positivity.
- **Fix**: Added positive integer validation for all lesson entries in `backend/controllers/lesson-controller.js`.

---

## 3. Verification & Automated Test Status

### Backend Test Suites (Jest)
```
PASS tests/security/helmet.test.js
PASS tests/security/access-control.test.js
PASS tests/auth/rate-limit.test.js
PASS tests/auth/auth-middleware.test.js
PASS tests/auth/rbac-middleware.test.js
PASS tests/auth/logout.test.js
PASS tests/certificateService.test.js
PASS tests/auth/register.test.js
PASS tests/auth/login.test.js
PASS tests/auth/confirm-reset.test.js

Test Suites: 10 passed, 10 total
Tests:       31 passed, 31 total
```

### Frontend Test Suites (Vitest)
```
PASS src/tests/protected-routes.test.tsx

Test Files:  1 passed, 1 total
Tests:       12 passed, 12 total
```
