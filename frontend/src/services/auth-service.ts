import api from "../api/axios";

// ─── Response Types ──────────────────────────────────────────────────────────

/**
 * Shape of the response returned by requestPasswordReset.
 */
export interface RequestResetResponse {
  message: string;
}

/**
 * Shape of the response returned by confirmPasswordReset.
 */
export interface ConfirmResetResponse {
  message: string;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Step 1 of the password reset flow.
 * Sends the user'"'"'s email to the backend to trigger a password-reset email.
 * Always resolves with a 200 response regardless of whether the email exists
 * (anti-enumeration design). Only rejects on network or rate-limit errors.
 *
 * @param {string} email - The email address associated with the account.
 * @returns {Promise<RequestResetResponse>} The API success message.
 * @throws {import("axios").AxiosError} On 429 (rate limited) or 5xx server errors.
 */
export async function requestPasswordReset(
  email: string
): Promise<RequestResetResponse> {
  const { data } = await api.post<RequestResetResponse>(
    "/auth/reset-password",
    { email }
  );
  return data;
}

/**
 * Step 2 of the password reset flow.
 * Submits the one-time reset token (from the URL query param) and the new
 * password chosen by the user to the backend for verification and storage.
 *
 * @param {string} token - The JWT reset token extracted from the URL.
 * @param {string} newPassword - The new password chosen by the user (min 8 chars).
 * @returns {Promise<ConfirmResetResponse>} The API success message.
 * @throws {import("axios").AxiosError} On 400 (expired/invalid token, bad password) or 5xx errors.
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<ConfirmResetResponse> {
  const { data } = await api.post<ConfirmResetResponse>(
    "/auth/confirm-reset",
    { token, newPassword }
  );
  return data;
}
