import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Card } from "../components/ui";
import { requestPasswordReset } from "../services/auth-service";
import { isAxiosError } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  email?: string;
  form?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validates the forgot-password form fields inline.
 *
 * @param {string} email - The raw email input value.
 * @returns {FormErrors} An object with field-level error strings, or empty if valid.
 */
function validateForgotPasswordForm(email: string): FormErrors {
  const errors: FormErrors = {};

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ForgotPasswordPage — Step 1 of the password reset flow.
 *
 * Renders a single email field. On submission it calls the
 * POST /api/v1/auth/reset-password endpoint. The success banner is always
 * shown on a 200 response, regardless of whether the account exists,
 * to prevent email enumeration (mirrors the backend anti-enumeration design).
 *
 * @returns {JSX.Element}
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  /**
   * Handles form submission: validates, calls the API, and manages state.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form submit event.
   * @returns {Promise<void>}
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const validationErrors = validateForgotPasswordForm(email);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setIsSuccess(true);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 429) {
        setErrors({ form: "Too many requests. Please wait a few minutes and try again." });
      } else {
        setErrors({ form: "Something went wrong. Please try again later." });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-canvas-soft text-ink">
      {/* Header */}
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

      {/* Main Content */}
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
              <h1 className="font-display text-2xl font-black text-ink">Forgot Password</h1>
              <p className="mt-1.5 text-sm text-ink-muted">
                Please enter your account email below.
              </p>
            </Card.Header>

            {/* Card Body */}
            <Card.Body>
              {/* Success state */}
              {isSuccess ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-green-200 bg-green-50 px-6 py-6 text-center"
                >
                  <p className="font-bold text-green-800 text-lg">Check your inbox!</p>
                  <p className="mt-2 text-sm leading-relaxed text-green-700">
                    If an account with that email exists, a password reset link has been sent.
                    The link expires in <strong>15 minutes</strong>.
                  </p>
                  <Link
                    to="/login"
                    className="mt-5 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Back to login
                  </Link>
                </div>
              ) : (
                <form
                  id="forgot-password-form"
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

                  {/* Email field */}
                  <Input
                    id="forgot-password-email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    error={errors.email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  />

                  {/* Submit Pill Button */}
                  <div className="pt-2">
                    <Button
                      id="forgot-password-submit"
                      type="submit"
                      fullWidth
                      loading={isLoading}
                      className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold shadow-md shadow-brand-600/20 text-white transition"
                    >
                      Send Reset Link
                    </Button>
                  </div>

                  {/* Back to login */}
                  <p className="pt-2 text-center text-sm text-ink-muted">
                    Remembered it?{" "}
                    <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                      Log in
                    </Link>
                  </p>
                </form>
              )}
            </Card.Body>
          </Card>
        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
}
