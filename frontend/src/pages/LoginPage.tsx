import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Input, Button, Card } from "../components/ui";
import { SiteChrome } from "../components/SiteChrome";
import { loginUser } from "../services/auth-service";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import loginIllustration from "../assets/login-learners-illustration.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validates the login form fields inline.
 *
 * @param {string} email - The raw email input value.
 * @param {string} password - The raw password input value.
 * @returns {FormErrors} Field-level error strings, or empty object if valid.
 */
function validateLoginForm(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * LoginPage — User Login Interface.
 *
 * Implements a split two-column design with smooth GSAP entrance & floating animations,
 * high-quality vector illustration, email/password inputs with eye visibility toggle,
 * and social login options matching Qader Academy aesthetics.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ── GSAP Entrance Animations ───────────────────────────────────────────────
  useEffect(() => {
    const scope = pageRef.current;
    if (!scope) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const context = gsap.context(() => {
      // Entrance Timeline
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-illustration]", { x: -36, autoAlpha: 0, duration: 0.85 })
        .from("[data-login-card]", { x: 36, autoAlpha: 0, duration: 0.85 }, "-=0.65");
    }, scope);

    return () => context.revert();
  }, []);

  /**
   * Handles form submission: validates inputs, calls the login API, and navigates.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form submit event.
   * @returns {Promise<void>}
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({ email: email.trim(), password });
      
      // Store JWT token and user details in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Navigate based on user role
      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const apiMessage = err.response?.data?.message ?? "";

        if (status === 401) {
          setErrors({ form: "Invalid email or password. Please try again." });
        } else if (status === 429) {
          setErrors({ form: "Too many login attempts. Please wait a few minutes and try again." });
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
    <SiteChrome ref={pageRef} className="flex min-h-screen flex-col bg-[#faf6f0] text-ink overflow-x-hidden">
      {/* Main Split Section */}
      <main className="relative flex-1 flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden bg-[#fff7f3]">
        {/* Background decorative shapes matching HomePage */}
        <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
        <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <span className="size-1.5 rounded-full bg-brand-400" key={index} />
          ))}
        </div>
        <div className="absolute bottom-12 right-12 size-72 rounded-full bg-[#e9f7f1]/60 blur-xl" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left Column — Vector Illustration with Floating GSAP Animation */}
            <div data-hero-illustration className="flex justify-center p-4">
              <img
                src={loginIllustration}
                alt="Learners collaborating around laptops"
                className="w-full max-w-md lg:max-w-lg object-contain"
              />
            </div>

            {/* Right Column — Login Card with Slide-in GSAP Animation */}
            <div data-login-card className="flex justify-center">
              <div className="w-full max-w-md">
                <Card
                  variant="elevated"
                  padding="lg"
                  className="rounded-3xl bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-line/40"
                >
                  {/* Card Header */}
                  <Card.Header className="mb-6">
                    <h1 className="font-display text-3xl font-extrabold text-ink">Welcome back</h1>
                  </Card.Header>

                  {/* Card Body */}
                  <Card.Body>
                    <form
                      id="login-form"
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

                      {/* Email or Username */}
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Email or Username"
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
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            autoComplete="current-password"
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

                        {/* Forgot Password Link */}
                        <div className="flex justify-end pt-1.5">
                          <Link
                            to="/forgot-password"
                            className="text-xs text-ink-muted hover:text-brand-600 underline transition"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </div>

                      {/* Submit Pill Button */}
                      <div className="pt-3">
                        <Button
                          id="login-submit"
                          type="submit"
                          fullWidth
                          loading={isLoading}
                          className="rounded-full bg-brand-600 hover:bg-brand-700 py-3.5 text-base font-bold shadow-md shadow-brand-600/25 text-white transition"
                        >
                          Sign In
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="relative flex items-center justify-center my-4">
                        <div className="w-full border-t border-line/60" />
                        <span className="absolute bg-white px-3 text-xs text-ink-muted">or</span>
                      </div>

                      {/* Social Login Button */}
                      <div className="pt-1">
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
                          Continue with Google
                        </button>
                      </div>

                      {/* Don't have an account link */}
                      <p className="pt-3 text-center text-xs text-ink-muted">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-bold text-brand-600 hover:underline">
                          Sign up
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

    </SiteChrome>
  );
}
