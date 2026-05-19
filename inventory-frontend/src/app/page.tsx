"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);

  const { addToast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  // Handle active retry countdowns
  useEffect(() => {
    if (cooldown === null) return;
    if (cooldown <= 0) {
      setCooldown(null);
      return;
    }
    const interval = setInterval(() => {
      setCooldown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety check: Prevent execution during active cooldown blocks
    if (cooldown !== null && cooldown > 0) {
      addToast(`Rate limit active. Please wait ${cooldown}s before submitting.`, "error");
      return;
    }

    if (!email || !password) {
      addToast("Please fill out all required fields", "error");
      return;
    }

    if (!isLoginMode) {
      if (!name) {
        addToast("Name is required for registration", "error");
        return;
      }
      if (password.length < 6) {
        addToast("Password must be at least 6 characters long", "error");
        return;
      }
      if (password !== confirmPassword) {
        addToast("Passwords do not match", "error");
        return;
      }
    }

    setLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";

      const payload = isLoginMode
        ? { email, password }
        : { name, email, password };

      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const rawData = await res.json();
      
      // Handle the global ApiResponse wrapper if present
      const data = rawData.data || rawData;

      if (!res.ok || (rawData.success !== undefined && !rawData.success)) {
        // Enforce progressive cooldown timers on HTTP 429 Too Many Requests
        if (res.status === 429) {
          const match = (rawData.message || "").match(/retry in (\d+) seconds/i);
          const seconds = match ? parseInt(match[1], 10) : 60;
          setCooldown(seconds);
        }
        throw new Error(rawData.message || data.message || (isLoginMode ? "Invalid credentials" : "Registration failed"));
      }

      addToast(
        isLoginMode ? "Welcome back! Login successful." : "Account created! Welcome to Enterprise Inventory.",
        "success"
      );

      // Auto-login maps jwt, email, name, and role into AuthContext
      login(data.token, data.email, data.name, data.role);
    } catch (err: any) {
      addToast(err.message || "An unexpected error occurred", "error");

      // Fallback parser if error was thrown by fetch
      if (err.message && err.message.toLowerCase().includes("retry in")) {
        const match = err.message.match(/retry in (\d+) seconds/i);
        if (match) {
          setCooldown(parseInt(match[1], 10));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE: Landing Page / Product Showcase (Deep contrast theme elements) */}
      <div style={styles.showcaseSection}>
        <div style={styles.ambientGlow}></div>
        <div style={styles.showcaseContent}>
          <div style={styles.brandBadge}>
            <svg style={styles.brandIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>v2.5 Enterprise Secured</span>
          </div>

          <h1 style={styles.showcaseTitle}>
            Enterprise-grade <br />
            <span style={styles.gradientText}>Inventory Management</span>
          </h1>

          <p style={styles.showcaseDesc}>
            A secure, scalable, and ultra-high-speed platform designed to track warehouse logistics, manage suppliers, and optimize stock distributions in real-time.
          </p>

          {/* Real-time Dashboard Preview Element */}
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <div style={styles.previewDotRed}></div>
              <div style={styles.previewDotYellow}></div>
              <div style={styles.previewDotGreen}></div>
              <span style={styles.previewTitle}>Live Portal Preview</span>
            </div>
            <div style={styles.previewStats}>
              <div style={styles.miniStat}>
                <span style={styles.miniStatVal}>1,949</span>
                <span style={styles.miniStatLabel}>Total Stock Value</span>
              </div>
              <div style={styles.miniStat}>
                <span style={styles.miniStatVal} className="flex items-center gap-2">
                  1 <span style={styles.alertDot}></span>
                </span>
                <span style={styles.miniStatLabel}>Low Stock Items</span>
              </div>
              <div style={styles.miniStat}>
                <span style={styles.miniStatVal}>99.9%</span>
                <span style={styles.miniStatLabel}>Uptime SLA</span>
              </div>
            </div>
            <div style={styles.previewChartMask}>
              <div style={styles.previewBar1}></div>
              <div style={styles.previewBar2}></div>
              <div style={styles.previewBar3}></div>
            </div>
          </div>

          {/* Benefit Items */}
          <div style={styles.benefitList}>
            <div style={styles.benefitItem}>
              <div style={styles.benefitIconWrap}>🛡️</div>
              <div>
                <h4 style={styles.benefitHeading}>Advanced JWT & HttpOnly Hardening</h4>
                <p style={styles.benefitSub}>Multi-layered API token security and automated edge cookie protection.</p>
              </div>
            </div>
            <div style={styles.benefitItem}>
              <div style={styles.benefitIconWrap}>⚡</div>
              <div>
                <h4 style={styles.benefitHeading}>Sub-Millisecond Query Response</h4>
                <p style={styles.benefitSub}>Spring Boot paginated database streams with customized query indexing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login/Register Portal (Adaptive design variables) */}
      <div style={styles.authSection}>
        <div style={styles.cardContainer}>
          <div className="card" style={styles.authCard}>

            {/* Sliding Toggle Tabs */}
            <div style={styles.tabContainer}>
              <button
                type="button"
                style={{
                  ...styles.tabButton,
                  ...(isLoginMode ? styles.activeTabButton : {})
                }}
                disabled={cooldown !== null}
                onClick={() => { setIsLoginMode(true); setShowPassword(false); }}
              >
                Sign In
              </button>
              <button
                type="button"
                style={{
                  ...styles.tabButton,
                  ...(!isLoginMode ? styles.activeTabButton : {})
                }}
                disabled={cooldown !== null}
                onClick={() => { setIsLoginMode(false); setShowPassword(false); }}
              >
                Create Account
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {isLoginMode ? "Access Portal" : "Join the Platform"}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {isLoginMode ? "Sign in using your enterprise credentials" : "Create a new verified operator account"}
              </p>
            </div>

            {/* Brute Force Cooldown Alert Banner */}
            {cooldown !== null && cooldown > 0 && (
              <div style={styles.cooldownBanner}>
                <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Rate limiting active. Please wait <strong>{cooldown}s</strong> before retry.</span>
              </div>
            )}

            <form onSubmit={handleAuth} style={styles.form}>
              {/* Registration specific Name field */}
              {!isLoginMode && (
                <div>
                  <label className="label">Full Name</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      className="input"
                      style={styles.inputWithIcon}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      disabled={cooldown !== null}
                      required={!isLoginMode}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                  <input
                    type="email"
                    className="input"
                    style={styles.inputWithIcon}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="operator@company.com"
                    disabled={cooldown !== null}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div style={styles.inputWrapper}>
                  <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    style={{ ...styles.inputWithIcon, paddingRight: '2.5rem' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={cooldown !== null}
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg style={styles.eyeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg style={styles.eyeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Registration specific Password Confirmation field */}
              {!isLoginMode && (
                <div>
                  <label className="label">Confirm Password</label>
                  <div style={styles.inputWrapper}>
                    <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <input
                      type="password"
                      className="input"
                      style={styles.inputWithIcon}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      disabled={cooldown !== null}
                      required={!isLoginMode}
                    />
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <span style={styles.validationError}>Passwords do not match</span>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  height: '42px',
                  ...(cooldown !== null ? { backgroundColor: 'var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.6 } : {})
                }}
                disabled={loading || cooldown !== null}
              >
                {cooldown !== null ? (
                  <span>Blocked ({cooldown}s)</span>
                ) : loading ? (
                  <div style={styles.loadingSpinnerWrap}>
                    <div style={styles.spinner}></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>{isLoginMode ? "Access System" : "Create Operator Account"}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline CSS Styles mapped to high contrast, dark/light CSS variables
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-main)',
    overflowX: 'hidden',
    position: 'relative',
    transition: 'background-color 0.4s ease, color 0.4s ease',
  },
  showcaseSection: {
    flex: 1,
    display: 'none',
    '@media (min-width: 1024px)': {
      display: 'flex',
    },
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem 6rem',
    position: 'relative',
    backgroundColor: '#030712',
    borderRight: '1px solid var(--border-light)',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(0,0,0,0) 60%)',
    pointerEvents: 'none',
    filter: 'blur(40px)',
  },
  ambientGlow2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 60%)',
    pointerEvents: 'none',
    filter: 'blur(40px)',
  },
  showcaseContent: {
    maxWidth: '600px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  brandBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 1rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    border: '1px solid rgba(79, 70, 229, 0.2)',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    boxShadow: '0 0 15px rgba(79, 70, 229, 0.15)',
  },
  brandIcon: {
    width: '14px',
    height: '14px',
  },
  showcaseTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#ffffff',
    letterSpacing: '-0.04em',
  },
  gradientText: {
    background: 'linear-gradient(to right, #818cf8, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  showcaseDesc: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    color: '#94a3b8',
    marginBottom: '2rem',
    maxWidth: '90%',
  },
  previewCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    transform: 'perspective(1000px) rotateY(5deg)',
    transition: 'transform 0.5s ease',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.75rem',
  },
  previewDotRed: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' },
  previewDotYellow: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' },
  previewDotGreen: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' },
  previewTitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginLeft: '0.5rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  previewStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  miniStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  miniStatVal: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#ffffff',
    fontFamily: 'var(--font-heading)',
  },
  alertDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    display: 'inline-block',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
  },
  miniStatLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
  },
  previewChartMask: {
    display: 'flex',
    alignItems: 'flex-end',
    height: '32px',
    gap: '6px',
    marginTop: '1.5rem',
  },
  previewBar1: { height: '30%', width: '100%', backgroundColor: '#4f46e5', opacity: 0.5, borderRadius: '4px' },
  previewBar2: { height: '70%', width: '100%', backgroundColor: '#4f46e5', opacity: 0.8, borderRadius: '4px' },
  previewBar3: { height: '50%', width: '100%', backgroundColor: '#4f46e5', opacity: 0.6, borderRadius: '4px' },
  previewBar4: { height: '100%', width: '100%', backgroundColor: '#4f46e5', opacity: 1, borderRadius: '4px', boxShadow: '0 0 10px rgba(79, 70, 229, 0.5)' },
  benefitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  benefitItem: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'flex-start',
  },
  benefitIconWrap: {
    fontSize: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  benefitHeading: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '0.25rem',
  },
  benefitSub: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  authSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: 'var(--bg)',
    transition: 'background-color 0.3s ease',
    position: 'relative',
  },
  authGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, var(--primary-light) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  cardContainer: {
    width: '100%',
    maxWidth: '440px',
    zIndex: 1,
  },
  authCard: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '2.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    transition: 'all 0.3s ease',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'var(--surface-hover)',
    padding: '0.35rem',
    borderRadius: 'var(--radius)',
    marginBottom: '2.5rem',
    border: '1px solid var(--border)',
  },
  tabButton: {
    flex: 1,
    padding: '0.65rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTabButton: {
    backgroundColor: 'var(--surface)',
    color: 'var(--text-main)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    width: '18px',
    height: '18px',
    color: 'var(--text-placeholder)',
    pointerEvents: 'none',
    transition: 'color 0.2s ease',
  },
  inputWithIcon: {
    paddingLeft: '2.75rem',
  },
  passwordToggle: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-placeholder)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    borderRadius: 'var(--radius)',
    transition: 'background-color 0.2s ease',
  },
  eyeIcon: {
    width: '18px',
    height: '18px',
  },
  validationError: {
    color: 'var(--danger)',
    fontSize: '0.8rem',
    marginTop: '0.4rem',
    display: 'block',
    fontWeight: 500,
  },
  loadingSpinnerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderLeftColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  cooldownBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    lineHeight: '1.4',
    fontWeight: 500,
  }
};
