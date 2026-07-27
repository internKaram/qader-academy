import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Card } from "../components/ui";
import { confirmPasswordReset } from "../services/auth-service";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validates the reset-password form fields inline.
 *
 * @param {string} newPassword - The new password entered by the user.
 * @param {string} confirmPassword - The confirmation password entered by the user.
 * @returns {FormErrors} An object with field-level error strings, or empty if valid.
 */
function validateResetPasswordForm(
  newPassword: string,
  confirmPassword: string
): FormErrors {
  const errors: FormErrors = {};

  if (!newPassword) {
    errors.newPassword = "New password is required.";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (newPassword && newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ResetPasswordPage — Step 2 of the password reset flow.
 *
 * Reads the one-time JWT from the `?token=` URL search param and presents
 * two password fields. On a successful API call it displays a confirmation
 * message and redirects to /login after 3 seconds. On a token-expired error
 * it surfaces a friendly message with a link back to /forgot-password.
 *
 * @returns {JSX.Element}
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (!urlToken) {
      setIsExpired(true);
    } else {
      setToken(urlToken);
    }
  }, []);

  // Countdown timer after successful reset
  useEffect(() => {
    if (!isSuccess) return;
    if (countdown <= 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  /**
   * Handles form submission: validates, calls the API, and manages state.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form submit event.
   * @returns {Promise<void>}
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const validationErrors = validateResetPasswordForm(newPassword, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      setErrors({ form: "Reset token is missing. Please request a new link." });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await confirmPasswordReset(token, newPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const apiMessage = err.response?.data?.message ?? "";

        if (status === 400 && (apiMessage.includes("expired") || apiMessage.includes("Invalid"))) {
          setIsExpired(true);
        } else if (status === 429) {
          setErrors({ form: "Too many requests. Please wait a few minutes and try again." });
        } else {
          setErrors({ form: apiMessage || "Something went wrong. Please try again later." });
        }
      } else {
        setErrors({ form: "Something went wrong. Please try again later." });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();

  // Common Header component
  const HeaderComponent = (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/90 shadow-[0_10px_30px_rgb(18_24_38_/_0.06)] backdrop-blur-xl">
      <div className="page-container flex min-h-18 items-center justify-between gap-6">
        <Link className="font-display text-xl font-black tracking-normal text-ink" to="/" aria-label="QaderAcademy home">
          QaderAcademy
        </Link>
        <Link to="/login">
          <Button size="sm" style={{
            backgroundColor: '#3b635a',
            boxShadow: '0 4px 12px rgba(59, 99, 90, 0.3)',
          }}>
            Sign In
          </Button>
        </Link>
      </div>
    </header>
  );

  // Common Footer component
  const FooterComponent = (
    <footer className="bg-canvas-dark text-white">
      <div className="page-container">
        <div className="flex flex-col gap-4 py-6 text-sm text-white/56 md:flex-row md:items-center md:justify-between">
          <p>Copyright {currentYear} QaderAcademy. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <span aria-disabled="true">Privacy policy coming soon</span>
            <span aria-disabled="true">Terms of use coming soon</span>
          </div>
        </div>
      </div>
    </footer>
  );

  // ── Expired token UI ────────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-soft text-ink">
        {HeaderComponent}
        <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
          <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
          <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span className="size-1.5 rounded-full bg-brand-400" key={index} />
            ))}
          </div>
          <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-md text-center">
            <Card
              variant="elevated"
              padding="lg"
              className="overflow-hidden border-t-4 border-brand-600 bg-white"
            >
              <Card.Header className="mb-4">
                <h1 className="font-display text-2xl font-black text-ink">Link Expired or Invalid</h1>
              </Card.Header>
              <Card.Body>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Your password reset link has expired or is malformed. Reset links are only valid
                  for <strong>15 minutes</strong>.
                </p>
                <div className="pt-4">
                  <Link
                    to="/forgot-password"
                    className="inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700"
                  >
                    Request a New Link
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        </main>
        {FooterComponent}
      </div>
    );
  }

  // ── Success UI ──────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas-soft text-ink">
        {HeaderComponent}
        <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
          <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
          <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span className="size-1.5 rounded-full bg-brand-400" key={index} />
            ))}
          </div>
          <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-md text-center">
            <Card
              variant="elevated"
              padding="lg"
              className="overflow-hidden border-t-4 border-green-600 bg-white"
            >
              <Card.Header className="mb-3">
                <h1 className="font-display text-2xl font-black text-green-800">Password Reset!</h1>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-green-700">
                  Your password has been updated successfully.
                </p>
                <p className="mt-2 text-sm text-green-600">
                  Redirecting to login in <strong>{countdown}</strong> second{countdown !== 1 ? "s" : ""}…
                </p>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Go to Login Now
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        </main>
        {FooterComponent}
      </div>
    );
  }

  // ── Form UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-canvas-soft text-ink">
      {HeaderComponent}
      <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
        {/* Background decorative shapes */}
        <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
        <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <span className="size-1.5 rounded-full bg-brand-400" key={index} />
          ))}
        </div>
        <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-md">

          {/* Card using official Card UI component */}
          <Card
            variant="elevated"
            padding="lg"
            className="overflow-hidden border-t-4 border-brand-600 bg-white"
          >
            {/* Card Header */}
            <Card.Header className="mb-6 text-center">
              <h1 className="font-display text-2xl font-black text-ink">Reset Password</h1>
              <p className="mt-1.5 text-sm text-ink-muted">
                Please enter your new password below.
              </p>
            </Card.Header>

            {/* Card Body */}
            <Card.Body>
              <form
                id="reset-password-form"
                noValidate
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Form-level error banner */}
                {errors.form && (
                  <div
                    role="alert"
                    className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
                  >
                    {errors.form}
                  </div>
                )}

                {/* New password with Eye Visibility Toggle */}
                <div className="relative">
                  <Input
                    id="reset-password-new"
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    error={errors.newPassword}
                    inputClassName="pr-11"
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] text-ink-muted hover:text-ink transition p-1"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                {/* Confirm password */}
                <Input
                  id="reset-password-confirm"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                />

                {/* Submit Pill Button */}
                <div className="pt-2">
                  <Button
                    id="reset-password-submit"
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold shadow-md shadow-brand-600/20 text-white transition"
                  >
                    Update Password
                  </Button>
                </div>

                {/* Back to login */}
                <p className="pt-2 text-center text-sm text-ink-muted">
                  <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                    Back to login
                  </Link>
                </p>
              </form>
            </Card.Body>
          </Card>
        </div>
      </main>
      {FooterComponent}
    </div>
  );
}
