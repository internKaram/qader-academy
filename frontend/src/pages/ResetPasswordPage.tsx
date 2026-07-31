import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Card } from "../components/ui";
import { confirmPasswordReset } from "../services/auth-service";
import { isAxiosError } from "axios";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

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
 * message and redirects to /login after 3 seconds.
 *
 * @returns {JSX.Element}
 */
export function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);

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
    <header className="fixed inset-x-0 top-0 z-40 bg-white/90 shadow-[0_10px_30px_rgb(18_24_38_/_0.04)] backdrop-blur-xl">
      <div className="page-container flex min-h-18 items-center justify-between gap-6">
        <Link className="font-display text-xl font-black tracking-normal text-ink" to="/" aria-label="QaderAcademy home">
          QaderAcademy
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-ink-soft md:flex" aria-label="Primary navigation">
          <Link className="transition hover:text-brand-700" to="/">
            About
          </Link>
          <Link className="transition hover:text-brand-700" to="/courses">
            Courses
          </Link>
          <Link className="transition hover:text-brand-700" to="/">
            Contact
          </Link>
        </nav>

        <Link to="/login">
          <Button size="sm" className="rounded-full bg-canvas-warm text-ink-soft hover:bg-canvas-warm/80 border border-line/60 font-bold px-5">
            Sign In
          </Button>
        </Link>
      </div>
    </header>
  );

  // Common Full Footer component
  const FooterComponent = (
    <footer className="bg-canvas-dark pt-14 text-white">
      <div className="page-container">
        <div className="grid gap-10 border-b border-white/12 pb-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link className="font-display text-2xl font-black text-white" to="/" aria-label="QaderAcademy home">
              QaderAcademy
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
              Practical learning paths for career-relevant skills.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Learn</h2>
            <nav className="mt-4 grid gap-3 text-sm font-bold text-white/68" aria-label="Course categories">
              <Link className="transition hover:text-white" to="/courses">
                Featured courses
              </Link>
              <Link className="transition hover:text-white" to="/courses">
                Frontend development
              </Link>
              <Link className="transition hover:text-white" to="/courses">
                Data analysis
              </Link>
              <Link className="transition hover:text-white" to="/courses">
                Career communication
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Company</h2>
            <nav className="mt-4 grid gap-3 text-sm font-bold text-white/68" aria-label="Company navigation">
              <Link className="transition hover:text-white" to="/">
                About
              </Link>
              <Link className="transition hover:text-white" to="/">
                Testimonials
              </Link>
              <Link className="transition hover:text-white" to="/">
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Contact</h2>
            <div className="mt-4 grid gap-3 text-sm text-white/68">
              <p>Madinah, Saudi Arabia</p>
              <a className="font-bold transition hover:text-white" href="mailto:support@qaderacademy.com">
                support@qaderacademy.com
              </a>
              <a className="font-bold transition hover:text-white" href="tel:+966560019865">
                +966 56 001 9865
              </a>
            </div>
          </div>
        </div>

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
      <div className="flex min-h-screen flex-col bg-[#faf6f0] text-ink overflow-x-hidden">
        {HeaderComponent}
        <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
          <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
          <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span className="size-1.5 rounded-full bg-brand-400" key={index} />
            ))}
          </div>
          <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-md">
            <Card
              variant="elevated"
              padding="lg"
              className="rounded-3xl bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-line/40 text-center"
            >
              <Card.Body>
                <div className="flex flex-col items-center text-center py-2 space-y-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-amber-100/90 text-amber-600 ring-8 ring-amber-50 shadow-sm">
                    <AlertCircle className="size-8" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="font-display text-2xl font-black text-ink">Link Expired or Invalid</h1>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      Your password reset link has expired or is malformed. Reset links are only valid for <strong>15 minutes</strong>.
                    </p>
                  </div>
                  <div className="pt-3 w-full">
                    <Link to="/forgot-password" className="block">
                      <Button
                        fullWidth
                        className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold text-white shadow-md shadow-brand-600/25 transition"
                      >
                        Request a New Link
                      </Button>
                    </Link>
                  </div>
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
      <div className="flex min-h-screen flex-col bg-[#faf6f0] text-ink overflow-x-hidden">
        {HeaderComponent}
        <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
          <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
          <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span className="size-1.5 rounded-full bg-brand-400" key={index} />
            ))}
          </div>
          <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-md">
            <Card
              variant="elevated"
              padding="lg"
              className="rounded-3xl bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-line/40 text-center"
            >
              <Card.Body>
                <div className="flex flex-col items-center text-center py-2 space-y-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600 ring-8 ring-emerald-50 shadow-sm">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="font-display text-2xl font-black text-ink">Password Reset!</h1>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      Your password has been updated successfully. You can now sign in with your new password.
                    </p>
                  </div>
                  <div className="pt-3 w-full">
                    <Link to="/login" className="block">
                      <Button
                        fullWidth
                        className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold text-white shadow-md shadow-brand-600/25 transition"
                      >
                        Sign In Now
                      </Button>
                    </Link>
                  </div>
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
    <div className="flex min-h-screen flex-col bg-[#faf6f0] text-ink overflow-x-hidden">
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
            className="rounded-3xl bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-line/40"
          >
            {/* Card Header */}
            <Card.Header className="mb-6 text-center">
              <h1 className="font-display text-3xl font-extrabold text-ink">Reset Password</h1>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
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
                <div>
                  <div className="relative">
                    <Input
                      id="reset-password-new"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password (min 8 characters)"
                      autoComplete="new-password"
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
                      className="absolute right-3 top-2.5 text-ink-muted hover:text-ink transition p-1"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <Input
                  id="reset-password-confirm"
                  type="password"
                  placeholder="Confirm New Password"
                  autoComplete="new-password"
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
                    className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold shadow-md shadow-brand-600/25 text-white transition"
                  >
                    Update Password
                  </Button>
                </div>

                {/* Back to Sign In */}
                <p className="pt-2 text-center text-xs text-ink-muted">
                  <Link to="/login" className="font-bold text-brand-600 hover:underline">
                    Back to Sign In
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
