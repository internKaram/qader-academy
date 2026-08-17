import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import VerifyCertificatePage from "../VerifyCertificatePage"

describe("VerifyCertificatePage", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.pushState({}, "", "/")
  })

  it("shows verified certificate details for a valid certificate", async () => {
    window.history.pushState(
      {},
      "",
      "/verify/QA-CERT-TEST-001"
    )

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        certificate: {
          certificateNumber: "QA-CERT-TEST-001",
          studentName: "Raghad Abdulqadir",
          courseTitle: "MERN Stack Course",
          issueDate: "2026-08-17T00:00:00.000Z",
        },
      }),
    } as Response)

    render(<VerifyCertificatePage />)

    expect(
      screen.getByText("Verifying Certificate")
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByText("Certificate Verified")
      ).toBeInTheDocument()
    })

    expect(
      screen.getByText("Raghad Abdulqadir")
    ).toBeInTheDocument()

    expect(
      screen.getByText("MERN Stack Course")
    ).toBeInTheDocument()

    expect(
      screen.getByText("QA-CERT-TEST-001")
    ).toBeInTheDocument()
  })

  it("shows not verified for an invalid certificate", async () => {
    window.history.pushState(
      {},
      "",
      "/verify/INVALID-CERTIFICATE"
    )

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: "Certificate not found or invalid.",
      }),
    } as Response)

    render(<VerifyCertificatePage />)

    await waitFor(() => {
      expect(
        screen.getByText("Certificate Not Verified")
      ).toBeInTheDocument()
    })

    expect(
      screen.getByText("Certificate not found or invalid.")
    ).toBeInTheDocument()

    expect(
      screen.getByText("INVALID-CERTIFICATE")
    ).toBeInTheDocument()
  })
})