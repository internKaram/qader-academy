import { useEffect, useState } from "react";

type CertificateVerification = {
  certificateNumber: string;
  studentName?: string;
  courseTitle?: string;
  issueDate: string;
};

const API_BASE_URL = "http://127.0.0.1:5002/api/v1";

function VerifyCertificatePage() {
  const [certificate, setCertificate] =
    useState<CertificateVerification | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pathname = window.location.pathname;

  const certificateNumber =
    pathname.split("/verify/")[1] || "";

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/verify/${certificateNumber}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Certificate not found or invalid."
          );
        }

        setCertificate(data.certificate);
      } catch (verificationError) {
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "Unable to verify this certificate."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!certificateNumber) {
      setError("Certificate number is missing.");
      setLoading(false);
      return;
    }

    verifyCertificate();
  }, [certificateNumber]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <main className="verify-page">
        <section className="verify-card">
          <div className="verify-loading-icon">...</div>

          <h1>Verifying Certificate</h1>

          <p>
            Please wait while we check this certificate.
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="verify-page">
        <section className="verify-card verify-card-error">
          <div className="verify-error-icon">×</div>

          <span className="verify-label verify-label-error">
            Verification Failed
          </span>

          <h1>Certificate Not Verified</h1>

          <p>{error}</p>

          <div className="verify-number-box">
            <span>Certificate Number</span>
            <strong>{certificateNumber}</strong>
          </div>
        </section>
      </main>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <main className="verify-page">
      <section className="verify-card">
        <div className="verify-success-icon">✓</div>

        <span className="verify-label">
          Official Qader Academy Certificate
        </span>

        <h1>Certificate Verified</h1>

        <p className="verify-description">
          This certificate is authentic and was issued by
          Qader Academy.
        </p>

        <div className="verify-details">
          <div className="verify-detail-row">
            <span>Student</span>
            <strong>
              {certificate.studentName || "Student information unavailable"}
            </strong>
          </div>

          <div className="verify-detail-row">
            <span>Course</span>
            <strong>
              {certificate.courseTitle || "Course information unavailable"}
            </strong>
          </div>

          <div className="verify-detail-row">
            <span>Issue Date</span>
            <strong>{formatDate(certificate.issueDate)}</strong>
          </div>

          <div className="verify-detail-row">
            <span>Certificate Number</span>
            <strong>{certificate.certificateNumber}</strong>
          </div>
        </div>

        <div className="verify-security-note">
          <div className="verify-security-icon">✓</div>

          <div>
            <strong>Public verification</strong>

            <p>
              Only certificate information is displayed.
              No private student information is exposed.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default VerifyCertificatePage;