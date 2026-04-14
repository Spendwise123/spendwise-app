import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const FEATURES = [
    {
        icon: '📊',
        title: 'Real-Time Analytics',
        desc: 'Instantly see where your money goes with beautiful charts and breakdowns — updated the moment you log a transaction.',
    },
    {
        icon: '🎯',
        title: 'Smart Budgeting',
        desc: 'Set monthly limits per category and get notified before you overspend. Your budget, your rules.',
    },
    {
        icon: '📈',
        title: 'AI Spending Predictions',
        desc: "Our trajectory model analyzes your habits and forecasts how much you'll spend by month-end, so you can plan ahead.",
    },
    {
        icon: '💰',
        title: 'Savings Goals',
        desc: "Create goals, track progress, and celebrate milestones. Whether it's a vacation or an emergency fund, we've got you.",
    },
    {
        icon: '🏦',
        title: 'Investments Tracker',
        desc: "Monitor your portfolio's performance and profit/loss in one place. Stocks, crypto, mutual funds — all tracked.",
    },
    {
        icon: '📱',
        title: 'Mobile-First App',
        desc: 'A companion mobile app for iOS & Android keeps your finances in your pocket wherever you go.',
    },
];

const HOW_STEPS = [
    {
        n: '1',
        title: 'Sign Up Free',
        desc: 'Create your account in 30 seconds. No credit card, no commitments.',
    },
    {
        n: '2',
        title: 'Log Your Expenses',
        desc: 'Add transactions, set budgets, and connect your savings goals.',
    },
    {
        n: '3',
        title: 'Gain Control',
        desc: 'Watch the insights surface and make smarter financial decisions every day.',
    },
];

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
const AVATAR_INITIALS = ['J', 'A', 'R', 'M', 'L'];

export default function Landing() {
    // Animate-on-scroll for sections below the fold
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                        entry.target.classList.add('aos-visible');
                    }
                });
            },
            { threshold: 0.15 }
        );

        sectionRefs.current.forEach((el) => {
            if (el) {
                el.style.animationPlayState = 'paused';
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, []);

    const addRef = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    return (
        <div style={{ background: '#09090b', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#fff' }}>
            {/* ─── Nav ─── */}
            <nav className="landing-nav">
                <Link to="/" className="landing-logo">
                    <div className="landing-logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    SpendWise
                </Link>

                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it Works</a>
                    <a href="#pricing">Pricing</a>
                </div>

                <div className="landing-nav-actions">
                    <Link to="/login" className="btn-ghost">Sign In</Link>
                    <Link to="/signup" className="btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="landing-hero">
                <div className="hero-bg">
                    <div className="hero-grid" />
                    <div className="hero-blob-1" />
                    <div className="hero-blob-2" />
                    <div className="hero-blob-3" />
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Now with AI-powered predictions
                    </div>

                    <h1 className="hero-title">
                        Master Your Money.<br />
                        <span className="hero-title-gradient">Spend Wise.</span>
                    </h1>

                    <p className="hero-subtitle">
                        The all-in-one personal finance dashboard that tracks expenses,
                        predicts overspending, and helps you reach your savings goals — faster.
                    </p>

                    <div className="hero-actions">
                        <Link to="/signup" className="btn-hero-primary" id="hero-cta-signup">
                            Start for Free
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link to="/login" className="btn-hero-secondary" id="hero-cta-login">
                            Sign In
                        </Link>
                    </div>

                    {/* ─── Mockup Window ─── */}
                    <div className="hero-mockup">
                        <div className="hero-mockup-glow" />
                        <div className="hero-mockup-window">
                            <div className="mockup-topbar">
                                <span className="mockup-dot mockup-dot-red" />
                                <span className="mockup-dot mockup-dot-yellow" />
                                <span className="mockup-dot mockup-dot-green" />
                                <span className="mockup-urlbar">spendwise.app/dashboard</span>
                            </div>
                            <div className="mockup-body">
                                <div className="mockup-sidebar">
                                    <div className="mockup-sidebar-logo">
                                        <div className="mockup-sidebar-logo-icon" />
                                        <div className="mockup-sidebar-logo-text" />
                                    </div>
                                    {['Dashboard', 'Expenses', 'Budgets', 'Savings', 'Loans', 'Invest'].map((label, i) => (
                                        <div key={label} className={`mockup-nav-item ${i === 0 ? 'active' : ''}`}>
                                            <div className="mockup-nav-icon" />
                                            <div className="mockup-nav-label" style={{ width: `${50 + i * 5}px` }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="mockup-main">
                                    <div className="mockup-stats-row">
                                        {[0, 1, 2, 3].map((i) => (
                                            <div key={i} className="mockup-stat-card">
                                                <div className="mockup-stat-label" />
                                                <div className="mockup-stat-value" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mockup-charts-row">
                                        <div className="mockup-chart-card">
                                            <div className="mockup-chart-title" />
                                            <div className="mockup-chart-bars">
                                                {[35, 60, 45, 80, 55, 70, 40].map((h, i) => (
                                                    <div key={i} className="mockup-bar" style={{ height: `${h}%`, animationDelay: `${0.5 + i * 0.1}s` }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mockup-chart-card">
                                            <div className="mockup-chart-title" />
                                            <div className="mockup-donut-wrap">
                                                <svg className="mockup-donut" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f1f23" strokeWidth="3.8" />
                                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.8"
                                                        strokeDasharray="40 60" strokeDashoffset="25" />
                                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.8"
                                                        strokeDasharray="25 75" strokeDashoffset="-15" />
                                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3.8"
                                                        strokeDasharray="20 80" strokeDashoffset="-40" />
                                                </svg>
                                            </div>
                                            <div className="mockup-legend">
                                                {['#10b981', '#3b82f6', '#8b5cf6'].map((color, i) => (
                                                    <div key={i} className="mockup-legend-item">
                                                        <div className="mockup-legend-dot" style={{ background: color }} />
                                                        <div className="mockup-legend-line" style={{ width: `${50 + i * 15}px` }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Social Proof ─── */}
                    <div className="landing-social-proof">
                        <p className="social-proof-text">Trusted by developers & finance-minded people</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="social-proof-avatars">
                                {AVATAR_INITIALS.map((init, i) => (
                                    <div
                                        key={i}
                                        className="social-proof-avatar"
                                        style={{ background: AVATAR_COLORS[i], zIndex: AVATAR_INITIALS.length - i }}
                                    >
                                        {init}
                                    </div>
                                ))}
                            </div>
                            <span className="social-proof-count">
                                <strong>500+</strong> users taking control of their finances
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ─── */}
            <div className="landing-stats-bar" ref={addRef}>
                {[
                    { n: '₱2M+', label: 'Expenses Tracked' },
                    { n: '500+', label: 'Active Users' },
                    { n: '98%', label: 'Prediction Accuracy' },
                    { n: '4.9★', label: 'User Rating' },
                ].map((stat) => (
                    <div key={stat.label} className="stat-bar-item">
                        <div className="stat-bar-number">{stat.n}</div>
                        <div className="stat-bar-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ─── Features ─── */}
            <section className="landing-features" id="features">
                <div className="section-header" ref={addRef}>
                    <span className="section-label">Features</span>
                    <h2 className="section-title">Everything you need to<br />take control of your finances</h2>
                    <p className="section-subtitle">Powerful tools, beautifully designed — built for people who actually care about where their money goes.</p>
                </div>
                <div className="features-grid">
                    {FEATURES.map((feat) => (
                        <div key={feat.title} className="feature-card" ref={addRef}>
                            <div className="feature-icon-wrap">{feat.icon}</div>
                            <h3 className="feature-title">{feat.title}</h3>
                            <p className="feature-desc">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="landing-how" id="how-it-works">
                <div className="how-inner">
                    <div className="section-header" ref={addRef}>
                        <span className="section-label">How It Works</span>
                        <h2 className="section-title">From zero to financially aware<br />in under 2 minutes</h2>
                    </div>
                    <div className="how-steps">
                        {HOW_STEPS.map((step) => (
                            <div key={step.n} className="how-step" ref={addRef}>
                                <div className="how-step-number">{step.n}</div>
                                <h3 className="how-step-title">{step.title}</h3>
                                <p className="how-step-desc">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="landing-cta" ref={addRef}>
                <div className="cta-glow" />
                <h2>Your finances won't<br />fix themselves.</h2>
                <p>Join thousands already spending smarter with SpendWise.</p>
                <Link to="/signup" className="btn-hero-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }} id="cta-bottom-signup">
                    Start for Free — No Credit Card
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>

            {/* ─── Footer ─── */}
            <footer className="landing-footer">
                <Link to="/" className="footer-brand">
                    <div className="landing-logo-icon" style={{ width: 26, height: 26 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    SpendWise
                </Link>
                <div className="footer-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Sign Up</Link>
                </div>
                <p className="footer-copy">© 2025 SpendWise. All rights reserved.</p>
            </footer>
        </div>
    );
}
