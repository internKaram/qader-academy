import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Input, Button, Card } from "../components/ui";
import { registerUser } from "../services/auth-service";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import loginIllustration from "../assets/login-learners-illustration.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validates the registration form fields inline.
 *
 * @param {string} name - The raw full name input.
 * @param {string} email - The raw email input.
 * @param {string} password - The raw password input.
 * @param {string} confirmPassword - The raw confirm password input.
 * @returns {FormErrors} Field-level error strings, or empty object if valid.
 */
function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FormErrors {
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * RegisterPage — User account registration page.
 *
 * Features full inline validation, password visibility toggle, GSAP entrance
 * animations, Google sign up CTA, and full multi-column footer matching the
 * Qader Academy design system.
 *
 * @returns {JSX.Element}
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

  // ── GSAP Entrance Animations ───────────────────────────────────────────────
  useEffect(() => {
    const scope = pageRef.current;
    if (!scope) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const context = gsap.context(() => {
      // Fade/slide card only, keeping illustration static for seamless navigation
      gsap.from("[data-register-card]", { autoAlpha: 0, y: 20, duration: 0.5, ease: "power3.out" });
    }, scope);

    return () => context.revert();
  }, []);

  /**
   * Handles registration form submission.
   *
   * @param {FormEvent<HTMLFormElement>} e - Form submit event.
   * @returns {Promise<void>}
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const validationErrors = validateRegisterForm(name, email, password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Store JWT token and user profile in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Navigate based on user role (default student)
      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const apiMessage = err.response?.data?.message ?? "";
        if (apiMessage.includes("already exists")) {
          setErrors({ email: "An account with this email already exists." });
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

  return (
    <div ref={pageRef} className="flex min-h-screen flex-col bg-[#faf6f0] text-ink overflow-x-hidden">
      {/* Header */}
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

            {/* Right Column — Register Card */}
            <div data-register-card className="flex justify-center">
              <div className="w-full max-w-md">
                <Card
                  variant="elevated"
                  padding="lg"
                  className="rounded-3xl bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-line/40"
                >
                  {/* Card Header */}
                  <Card.Header className="mb-6">
                    <h1 className="font-display text-3xl font-extrabold text-ink">Create Account</h1>
                    <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                      Join QaderAcademy and start learning today.
                    </p>
                  </Card.Header>

                  {/* Card Body */}
                  <Card.Body>
                    <form
                      id="register-form"
                      noValidate
                      onSubmit={handleSubmit}
                      className="space-y-4"
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

                      {/* Full Name */}
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Full Name"
                        autoComplete="name"
                        value={name}
                        error={errors.name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                      />

                      {/* Email Address */}
                      <Input
                        id="register-email"
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

                      {/* Password field with Eye Toggle */}
                      <div>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min 8 characters)"
                            autoComplete="new-password"
                            value={password}
                            error={errors.password}
                            inputClassName="pr-11"
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-2.5 text-ink-muted hover:text-ink transition p-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="size-5" />
                            ) : (
                              <Eye className="size-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Confirm Password"
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
                          id="register-submit"
                          type="submit"
                          fullWidth
                          loading={isLoading}
                          className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold shadow-md shadow-brand-600/25 text-white transition"
                        >
                          Create Account
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="relative flex items-center justify-center my-3">
                        <div className="w-full border-t border-line/60" />
                        <span className="absolute bg-white px-3 text-xs text-ink-muted">or</span>
                      </div>

                      {/* Social Login Button */}
                      <div>
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-line/80 bg-white py-3 px-4 text-xs font-semibold text-ink shadow-sm hover:bg-canvas-warm transition"
                        >
                          <svg className="size-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          Sign up with Google
                        </button>
                      </div>

                      {/* Already have an account link */}
                      <p className="pt-2 text-center text-xs text-ink-muted">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-brand-600 hover:underline">
                          Sign in
                        </Link>
                      </p>
                    </form>
                  </Card.Body>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Full Footer */}
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
    </div>
  );
}
