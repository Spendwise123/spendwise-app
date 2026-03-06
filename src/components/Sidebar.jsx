import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isCollapsed }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);
    const closeSidebar = () => setIsMobileOpen(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userName = currentUser?.name || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    const userRole = currentUser?.role || 'user';

    return (
        <>
            {/* Mobile Header */}
            <header className="mobile-header">
                <div className="logo-mobile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon-small">
                        <path d="m3 17 2 2 4-4 4 4 9-9" />
                        <path d="M18 7h4v4" />
                    </svg>
                    <span>SpendWise</span>
                </div>
                <button className="hamburger" onClick={toggleSidebar}>
                    {isMobileOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                    )}
                </button>
            </header>

            {/* Backdrop */}
            {isMobileOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

            <aside className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                            <path d="m3 17 2 2 4-4 4 4 9-9" />
                            <path d="M18 7h4v4" />
                        </svg>
                        {!isCollapsed && (
                            <div className="logo-text">
                                <span className="brand">SpendWise</span>
                                <span className="subtext">User Panel</span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        {!isCollapsed && <span className="section-title">NAVIGATION</span>}
                        <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title={isCollapsed ? "Dashboard" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                            {!isCollapsed && <span>Dashboard</span>}
                        </NavLink>
                        <NavLink to="/expenses" onClick={closeSidebar} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title={isCollapsed ? "Expenses" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            {!isCollapsed && <span>Expenses</span>}
                        </NavLink>
                        <NavLink to="/predictions" onClick={closeSidebar} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title={isCollapsed ? "Predictions" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                            {!isCollapsed && <span>Predictions</span>}
                        </NavLink>
                        <NavLink to="/feedback" onClick={closeSidebar} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title={isCollapsed ? "Feedback" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            {!isCollapsed && <span>Feedback</span>}
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{userInitial}</div>
                        {!isCollapsed && (
                            <div className="user-details">
                                <span className="user-name">{userName}</span>
                                <span className="user-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
