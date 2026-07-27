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

/**
 * User profile object returned upon successful authentication.
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape of the payload returned by loginUser upon successful authentication.
 */
export interface LoginResponse {
  token: string;
  user: UserProfile;
}

/**
 * Shape of the payload expected by registerUser.
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * Shape of the payload returned by registerUser upon successful registration.
 */
export interface RegisterResponse {
  token: string;
  user: UserProfile;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Registers a new user with name, email, and password.
 * Returns the JWT token and user profile on success.
 *
 * @param {RegisterCredentials} credentials - The user's name, email, and password.
 * @returns {Promise<RegisterResponse>} The JWT token and user profile.
 * @throws {import("axios").AxiosError} On 400 (validation failure or user already exists).
 */
export async function registerUser(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", credentials);
  return data;
}

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

/**
 * Authenticates a user with email and password credentials.
 * Returns the JWT token and user profile on success.
 *
 * @param {Object} credentials - The user's email and password.
 * @returns {Promise<LoginResponse>} The token and user profile.
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  return data;
}
