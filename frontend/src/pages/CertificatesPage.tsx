import { useState } from "react";

type Certificate = {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
};

const API_BASE_URL = "http://127.0.0.1:5002/api/v1";

const sampleCertificate: Certificate = {
  certificateNumber: "QA-CERT-2026-0CF2A873",
  studentName: "Raghad Abdulqadir",
  courseTitle: "Full-Stack Web Development with MERN",
  issueDate: "29 July 2026",
};

function CertificatesPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/certificates/${sampleCertificate.certificateNumber}/download`
      );

      if (!response.ok) {
        throw new Error("Unable to download the certificate.");
      }

      const pdfBlob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = `${sampleCertificate.certificateNumber}.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(pdfUrl);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "An unexpected error occurred."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="certificates-page">
      <section className="certificates-hero">
        <div>
          <span className="certificates-badge">Your achievements</span>

          <h1>Certificates</h1>

          <p>
            View and download the certificates you earned after completing
            your Qader Academy courses.
          </p>
        </div>
      </section>

      <section className="certificates-content">
        <article className="certificate-card">
          <div className="certificate-card-accent" />

          <div className="certificate-card-body">
            <div className="certificate-icon" aria-hidden="true">
              ✓
            </div>

            <div className="certificate-information">
              <span className="certificate-status">Course completed</span>

              <h2>{sampleCertificate.courseTitle}</h2>

              <p>
                Awarded to{" "}
                <strong>{sampleCertificate.studentName}</strong> on{" "}
                {sampleCertificate.issueDate}.
              </p>

              <div className="certificate-number">
                <span>Certificate number</span>
                <strong>{sampleCertificate.certificateNumber}</strong>
              </div>
            </div>

            <button
              className="certificate-download-button"
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? "Downloading..." : "Download Certificate"}
            </button>
          </div>
        </article>

        {error && (
          <p className="certificate-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

export default CertificatesPage;