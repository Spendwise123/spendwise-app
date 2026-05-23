import React, { useState, useEffect, useCallback } from 'react';
import './Feedback.css';
import { getFeedbacks, updateFeedback } from '../data/mockApi';
import { CATEGORIES } from '../constants/categories';
import useToast from '../components/Toast';

const Feedback = () => {
    const { addToast, ToastContainer } = useToast();
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    // Track which item has the recategorize dropdown open
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchFeedbacks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getFeedbacks();
            setFeedbacks(data);
        } catch (err) {
            addToast('Failed to load feedback items.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClick = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleConfirm = async (fb) => {
        setUpdatingId(fb.id);
        try {
            const updated = await updateFeedback(fb.id, {
                is_confirmed: true,
                confirmed_category: fb.suggested_category,
            });
            setFeedbacks(prev => prev.map(f => f.id === fb.id ? updated : f));
            addToast(`✓ Category "${fb.suggested_category}" confirmed!`, 'success');
        } catch {
            addToast('Failed to confirm category.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRecategorize = async (fb, newCategory) => {
        setOpenDropdownId(null);
        setUpdatingId(fb.id);
        try {
            const updated = await updateFeedback(fb.id, {
                is_confirmed: true,
                confirmed_category: newCategory,
            });
            setFeedbacks(prev => prev.map(f => f.id === fb.id ? updated : f));
            addToast(`↺ Recategorized to "${newCategory}"`, 'success');
        } catch {
            addToast('Failed to recategorize.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    // Dynamic stats
    const pending = feedbacks.filter(f => !f.is_confirmed).length;
    const confirmed = feedbacks.filter(f => f.is_confirmed).length;
    const correctCount = feedbacks.filter(
        f => f.is_confirmed && f.confirmed_category === f.suggested_category
    ).length;
    const accuracy = confirmed > 0
        ? Math.round((correctCount / confirmed) * 100)
        : 0;

    if (isLoading) {
        return (
            <div className="feedback-container loading-wrapper">
                <div className="spinner"></div>
                <p>Loading feedback items...</p>
            </div>
        );
    }

    return (
        <div className="feedback-container">
            <ToastContainer />
            <header className="page-header">
                <div className="header-left">
                    <h1>ML Feedback</h1>
                    <p>Help improve predictions by confirming or correcting AI-assigned categories</p>
                </div>
            </header>

            <div className="feedback-stats">
                <div className="card stat-card">
                    <div className="stat-info">
                        <p className="stat-label">Pending Review</p>
                        <h2 className="stat-value">{pending}</h2>
                    </div>
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-info">
                        <p className="stat-label">Confirmed</p>
                        <h2 className="stat-value">{confirmed}</h2>
                    </div>
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-info">
                        <p className="stat-label">ML Accuracy</p>
                        <h2 className="stat-value">{accuracy}%</h2>
                    </div>
                    <div className="stat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                    </div>
                </div>
            </div>

            <div className="card list-card">
                <div className="list-header">
                    <h3>Category Reviews</h3>
                    <p className="subtitle">
                        The ML model assigned these categories. Confirm if correct or select the right one.
                    </p>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="empty-feedback">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <p>No expenses to review yet. Add some expenses first!</p>
                    </div>
                ) : (
                    <div className="review-list">
                        {feedbacks.map((fb) => {
                            const txn = fb.transaction_details;
                            const isBusy = updatingId === fb.id;
                            return (
                                <div key={fb.id} className={`review-item ${fb.is_confirmed ? 'confirmed' : ''}`}>
                                    <div className="review-status-bar">
                                        {fb.is_confirmed ? (
                                            <span className="status-badge confirmed-badge">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                Confirmed
                                            </span>
                                        ) : (
                                            <span className="status-badge pending-badge">Pending</span>
                                        )}
                                    </div>

                                    <div className="review-info">
                                        <span className="merchant">{txn?.description || 'Unknown Transaction'}</span>
                                        <span className="amount">₱{parseFloat(txn?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        <div className="meta">
                                            {txn?.date
                                                ? new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '—'
                                            }
                                            {' • '}ML suggested:
                                            <span className="assigned"> {fb.suggested_category}</span>
                                            {fb.is_confirmed && fb.confirmed_category && (
                                                <>
                                                    {' → '}
                                                    <span className="confirmed-cat">{fb.confirmed_category}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {!fb.is_confirmed && (
                                        <div className="review-actions">
                                            <button
                                                className={`correct-btn ${isBusy ? 'btn-busy' : ''}`}
                                                onClick={() => handleConfirm(fb)}
                                                disabled={isBusy}
                                                title="Confirm ML-assigned category"
                                            >
                                                {isBusy ? (
                                                    <span className="btn-spinner" />
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                )}
                                                Correct
                                            </button>

                                            {/* Recategorize Dropdown */}
                                            <div
                                                className="dropdown-wrapper"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    className={`recategorize-btn ${isBusy ? 'btn-busy' : ''}`}
                                                    onClick={() => setOpenDropdownId(openDropdownId === fb.id ? null : fb.id)}
                                                    disabled={isBusy}
                                                    title="Change category"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                                    Recategorize
                                                </button>
                                                {openDropdownId === fb.id && (
                                                    <div className="category-dropdown">
                                                        {CATEGORIES.map(cat => (
                                                            <button
                                                                key={cat}
                                                                className={`dropdown-option ${cat === fb.suggested_category ? 'current' : ''}`}
                                                                onClick={() => handleRecategorize(fb, cat)}
                                                            >
                                                                {cat === fb.suggested_category && (
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                                )}
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {fb.is_confirmed && (
                                        <div className="review-actions">
                                            <div className="dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="recategorize-btn"
                                                    onClick={() => setOpenDropdownId(openDropdownId === fb.id ? null : fb.id)}
                                                    title="Change category again"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                                    Change
                                                </button>
                                                {openDropdownId === fb.id && (
                                                    <div className="category-dropdown">
                                                        {CATEGORIES.map(cat => (
                                                            <button
                                                                key={cat}
                                                                className={`dropdown-option ${cat === fb.confirmed_category ? 'current' : ''}`}
                                                                onClick={() => handleRecategorize(fb, cat)}
                                                            >
                                                                {cat === fb.confirmed_category && (
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                                )}
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedback;
