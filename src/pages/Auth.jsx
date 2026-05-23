import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// ─── Scramble Text Component ───
const ScrambleText = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = '!@#$%^&*<>[]/\\{}|~?';

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const interval = 25;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      const scrambled = text.split('').map((char, index) => {
        if (char === ' ' || char === '\n') return char;
        if (progress > (index / text.length)) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');

      setDisplayText(scrambled);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplayText(text);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span style={{ position: 'relative', display: 'inline-block', verticalAlign: 'top' }}>
      <span style={{ visibility: 'hidden', pointerEvents: 'none' }}>{text}</span>
      <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {displayText}
      </span>
    </span>
  );
};

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();

  // Determine initial mode from route
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [authLoading, setAuthLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [successMode, setSuccessMode] = useState(false);

  // Visibility states
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const signupStrength = getPasswordStrength(signupPassword);

  // Sync initial state and handle browse navigation (Back/Forward)
  useEffect(() => {
    const isSignupPath = location.pathname === '/signup';
    if (isSignUp !== isSignupPath) {
      setIsSignUp(isSignupPath);
    }
  }, [location.pathname]);

  // Keep URL in sync on explicit toggle
  useEffect(() => {
    const path = isSignUp ? '/signup' : '/login';
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  }, [isSignUp, navigate, location.pathname]);

  const switchMode = () => {
    if (animating) return;
    setAnimating(true);
    setLoginError('');
    setSignupError('');
    setTimeout(() => {
      setIsSignUp((prev) => !prev);
      setAnimating(false);
    }, 50);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !validateEmail(loginEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setAuthLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setSuccessMode(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setLoginError(err.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (!name || name.length < 2) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail || !validateEmail(signupEmail)) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (signupStrength < 2) {
      setSignupError('Password is too weak.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    try {
      await signup(signupEmail, signupPassword, name);
      setSuccessMode(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setSignupError(err.message || 'Failed to create account');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={`auth-page ${isSignUp ? 'auth-page--signup' : 'auth-page--login'}`}>
      {/* ── Ambient background orbs ── */}
      <div className="auth-orb auth-orb--emerald" />
      <div className="auth-orb auth-orb--blue" />
      <div className="auth-orb auth-orb--violet" />

      {/* ── Noise texture overlay ── */}
      <div className="auth-noise" />

      <div className="auth-panel-wrapper">

        {/* ════════════════════════════════
            LEFT — Branded hero panel
        ════════════════════════════════ */}
        <div className="auth-hero">
          <div className="auth-hero__inner">
            {/* Logo */}
            <div className="auth-brand">
              <div className="auth-brand__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="auth-brand__name">SpendWise</span>
            </div>

            {/* Headline with Scramble Effect */}
            <div className="auth-hero__copy">
              <h2 className="auth-hero__title">
                {isSignUp
                  ? <>Join thousands<br /><span><ScrambleText text="spending smarter" /></span></>
                  : <>Your money,<br /><span><ScrambleText text="intelligently managed" /></span></>
                }
              </h2>
              <p className="auth-hero__desc">
                {isSignUp
                  ? <ScrambleText text="AI-powered insights that turn raw transactions into a clear financial picture—from day one." />
                  : <ScrambleText text="Pick up exactly where you left off. Your AI spending coach never sleeps." />
                }
              </p>
            </div>

            {/* Feature pills */}
            <ul className="auth-hero__features">
              {[
                { icon: '✦', text: 'AI-driven spending predictions' },
                { icon: '✦', text: 'Real-time budget alerts' },
                { icon: '✦', text: 'Smart expense categorisation' },
              ].map((f, i) => (
                <li key={i} className="auth-hero__feature" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="feature-icon">{f.icon}</span> {f.text}
                </li>
              ))}
            </ul>

            {/* Floating stat cards */}
            <div className="auth-hero__cards">
              <div className="stat-card stat-card--a">
                <div className="stat-card__label">Avg. monthly savings</div>
                <div className="stat-card__value">$342</div>
                <div className="stat-card__trend stat-card__trend--up">↑ 18%</div>
              </div>
              <div className="stat-card stat-card--b">
                <div className="stat-card__label">Budget accuracy</div>
                <div className="stat-card__value">94.7%</div>
                <div className="stat-card__trend stat-card__trend--up">↑ AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT — Sliding form panel
        ════════════════════════════════ */}
        <div className="auth-forms">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${!isSignUp ? 'auth-tab--active' : ''}`}
              onClick={() => isSignUp && switchMode()}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${isSignUp ? 'auth-tab--active' : ''}`}
              onClick={() => !isSignUp && switchMode()}
              type="button"
            >
              Sign Up
            </button>
            <div className={`auth-tab-indicator ${isSignUp ? 'auth-tab-indicator--right' : ''}`} />
          </div>

          {/* Form viewport — clips sliding panels */}
          <div className="auth-form-viewport">
            <div className={`auth-form-track ${isSignUp ? 'auth-form-track--signup' : ''}`}>

              {/* ── Sign In form ── */}
              <div className={`auth-form-slot ${!isSignUp ? 'active' : ''}`}>
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Welcome back</h1>
                  <p className="auth-form-sub">Sign in to your SpendWise account</p>
                </div>

                {loginError && (
                  <div className="auth-alert auth-alert--error">
                    <span className="auth-alert__icon">⚠</span> {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="auth-form" noValidate>
                  <div className={`auth-field ${loginEmail && (validateEmail(loginEmail) ? 'auth-field--valid' : 'auth-field--invalid')}`}>
                    <label htmlFor="login-email" className="auth-field__label">Email address</label>
                    <div className="auth-field__wrap">
                      <span className="auth-field__icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="login-password" className="auth-field__label">Password</label>
                    <div className="auth-field__wrap">
                      <span className="auth-field__icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        id="login-password"
                        type={showLoginPass ? "text" : "password"}
                        className="auth-input"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-field__toggle"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        aria-label={showLoginPass ? "Hide password" : "Show password"}
                        aria-pressed={showLoginPass}
                      >
                        {showLoginPass ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className={`auth-submit ${successMode ? 'auth-submit--success' : ''}`} id="login-submit" disabled={authLoading || successMode}>
                    {successMode ? (
                      <svg className="success-check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : authLoading ? (
                      <><span className="auth-spinner" /> Signing in…</>
                    ) : (
                      <><span>Sign In</span> <span className="auth-submit__arrow">→</span></>
                    )}
                  </button>
                </form>

                <p className="auth-switch-hint">
                  Don't have an account?{' '}
                  <button className="auth-switch-btn" onClick={switchMode} type="button">Create one</button>
                </p>
              </div>

              {/* ── Sign Up form ── */}
              <div className={`auth-form-slot ${isSignUp ? 'active' : ''}`}>
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Create account</h1>
                  <p className="auth-form-sub">Start your smart spending journey today</p>
                </div>

                {signupError && (
                  <div className="auth-alert auth-alert--error">
                    <span className="auth-alert__icon">⚠</span> {signupError}
                  </div>
                )}

                <form onSubmit={handleSignup} className="auth-form" noValidate>
                  <div className={`auth-field ${name && (name.length > 2 ? 'auth-field--valid' : 'auth-field--invalid')}`}>
                    <label htmlFor="signup-name" className="auth-field__label">Full name</label>
                    <div className="auth-field__wrap">
                      <span className="auth-field__icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </span>
                      <input
                        id="signup-name"
                        type="text"
                        className="auth-input"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={`auth-field ${signupEmail && (validateEmail(signupEmail) ? 'auth-field--valid' : 'auth-field--invalid')}`}>
                    <label htmlFor="signup-email" className="auth-field__label">Email address</label>
                    <div className="auth-field__wrap">
                      <span className="auth-field__icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <input
                        id="signup-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-fields-row">
                    <div className={`auth-field ${signupPassword && (signupStrength >= 3 ? 'auth-field--valid' : 'auth-field--invalid')}`}>
                      <label htmlFor="signup-password" className="auth-field__label">Password</label>
                      <div className="auth-field__wrap">
                        <span className="auth-field__icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <input
                          id="signup-password"
                          type={showSignupPass ? "text" : "password"}
                          className="auth-input"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="auth-field__toggle"
                          onClick={() => setShowSignupPass(!showSignupPass)}
                          aria-label={showSignupPass ? "Hide password" : "Show password"}
                          aria-pressed={showSignupPass}
                        >
                          {showSignupPass ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                      </div>

                      {/* Strength Meter */}
                      <div className="auth-strength">
                        <div className={`auth-strength__bar ${signupPassword ? `auth-strength__bar--level-${signupStrength}` : ''}`} />
                        <span className="auth-strength__label">
                          {signupStrength === 0 && signupPassword && "Too weak"}
                          {signupStrength === 1 && "Weak"}
                          {signupStrength === 2 && "Fair"}
                          {signupStrength === 3 && "Good"}
                          {signupStrength === 4 && "Strong"}
                        </span>
                      </div>
                    </div>

                    <div className={`auth-field ${confirmPassword && (confirmPassword === signupPassword ? 'auth-field--valid' : 'auth-field--invalid')}`}>
                      <label htmlFor="signup-confirm" className="auth-field__label">Re-type Password</label>
                      <div className="auth-field__wrap">
                        <span className="auth-field__icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </span>
                        <input
                          id="signup-confirm"
                          type={showConfirmPass ? "text" : "password"}
                          className="auth-input"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="auth-field__toggle"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          aria-label={showConfirmPass ? "Hide password" : "Show password"}
                          aria-pressed={showConfirmPass}
                        >
                          {showConfirmPass ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={`auth-submit ${successMode ? 'auth-submit--success' : ''}`} id="signup-submit" disabled={authLoading || successMode}>
                    {successMode ? (
                      <svg className="success-check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : authLoading ? (
                      <><span className="auth-spinner" /> Creating account…</>
                    ) : (
                      <><span>Create Account</span> <span className="auth-submit__arrow">→</span></>
                    )}
                  </button>
                </form>

                <p className="auth-switch-hint">
                  Already have an account?{' '}
                  <button className="auth-switch-btn" onClick={switchMode} type="button">Sign in</button>
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
