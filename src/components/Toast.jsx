import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const ICONS = {
    success: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    ),
    error: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" /><path d="m9 9 6 6" />
        </svg>
    ),
    warning: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
    ),
    info: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
    ),
};

const ToastItem = ({ toast, onDismiss }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 350);
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    return (
        <div className={`toast toast--${toast.type} ${exiting ? 'toast--exit' : ''}`}>
            <span className="toast__icon">{ICONS[toast.type] || ICONS.info}</span>
            <span className="toast__message">{toast.message}</span>
            <button className="toast__close" onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 350); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
            </button>
        </div>
    );
};

// Hook for toast management
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const ToastContainer = () => (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
            ))}
        </div>
    );

    return { addToast, ToastContainer };
}

export default useToast;
