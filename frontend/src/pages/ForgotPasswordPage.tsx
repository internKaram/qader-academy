import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { Input, Button, Card } from "../components/ui";
import { SiteChrome } from "../components/SiteChrome";
import { requestPasswordReset } from "../services/auth-service";
import { isAxiosError } from "axios";
import { CheckCircle2 } from "lucide-react";
import loginIllustration from "../assets/login-learners-illustration.png";

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
 * Renders a split 2-column layout matching the LoginPage design system.
 * On submission it calls the POST /api/v1/auth/reset-password endpoint.
 * The success banner is always shown on a 200 response (anti-enumeration design).
 *
 * @returns {JSX.Element}
 */
export function ForgotPasswordPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // ── GSAP Entrance Animations ───────────────────────────────────────────────
  useEffect(() => {
    const scope = pageRef.current;
    if (!scope) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const context = gsap.context(() => {
      // Fade/slide card only, keeping illustration static for seamless navigation
      gsap.from("[data-forgot-card]", { autoAlpha: 0, y: 20, duration: 0.5, ease: "power3.out" });
    }, scope);

    return () => context.revert();
  }, []);

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

  return (
    <SiteChrome ref={pageRef} className="flex min-h-screen flex-col bg-[#faf6f0] text-ink overflow-x-hidden">
      {/* Main Split Section */}
      <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
        {/* Background decorative shapes */}
        <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
        <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <span className="size-1.5 rounded-full bg-brand-400" key={index} />
          ))}
        </div>
        <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left Column — Illustration */}
            <div data-hero-illustration className="flex justify-center p-4">
              <img
                src={loginIllustration}
                alt="Learners collaborating around laptops"
                className="w-full max-w-md lg:max-w-lg object-contain"
              />
            </div>

            {/* Right Column — Card */}
            <div data-forgot-card className="flex justify-center">
              <div className="w-full max-w-md">
                <Card
                  variant="elevated"
                  padding="lg"
                  className="rounded-3xl bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-line/40"
                >
                  {/* Card Header */}
                  <Card.Header className="mb-6">
                    <h1 className="font-display text-3xl font-extrabold text-ink">Forgot Password</h1>
                    <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                      Please enter your email address below to receive a password reset link.
                    </p>
                  </Card.Header>

                  {/* Card Body */}
                  <Card.Body>
                    {/* Success notification state */}
                    {isSuccess ? (
                      <div
                        role="status"
                        aria-live="polite"
                        className="flex flex-col items-center text-center py-2 space-y-4"
                      >
                        {/* Icon Badge */}
                        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600 ring-8 ring-emerald-50 shadow-sm">
                          <CheckCircle2 className="size-8" />
                        </div>

                        {/* Heading & Details */}
                        <div className="space-y-2">
                          <h2 className="font-display text-2xl font-black text-ink">Check your inbox!</h2>
                          <p className="text-sm leading-relaxed text-ink-muted">
                            If an account with <span className="font-bold text-ink">{email}</span> exists, a password reset link has been sent.
                          </p>
                        </div>

                        {/* Back to Sign In Action Button */}
                        <div className="pt-3 w-full">
                          <Link to="/login" className="block">
                            <Button
                              fullWidth
                              className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold text-white shadow-md shadow-brand-600/25 transition"
                            >
                              Back to Sign In
                            </Button>
                          </Link>
                        </div>
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
                          type="email"
                          placeholder="Email Address"
                          autoComplete="email"
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
                            className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold shadow-md shadow-brand-600/25 text-white transition"
                          >
                            Send Reset Link
                          </Button>
                        </div>

                        {/* Back to sign in */}
                        <p className="pt-2 text-center text-xs text-ink-muted">
                          Remembered it?{" "}
                          <Link to="/login" className="font-bold text-brand-600 hover:underline">
                            Sign in
                          </Link>
                        </p>
                      </form>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>

    </SiteChrome>
  );
}
