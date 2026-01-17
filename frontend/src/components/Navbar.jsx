import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, History, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Don't show navbar on landing or login
    if (location.pathname === '/' || location.pathname === '/login') return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <ShieldCheck className="brand-icon" size={32} />
                <span>SatyaCheck_OS</span>
            </div>
            <div className="nav-links">
                <div className="user-badge" style={{ marginRight: '1rem', fontWeight: 'bold' }}>
                    USER: {user?.name || 'GUEST'}
                </div>
                <Link to="/app" className={location.pathname === '/app' ? 'active' : ''}>
                    <Home size={20} /> TERMINAL
                </Link>
                <Link to="/app/history" className={location.pathname === '/app/history' ? 'active' : ''}>
                    <History size={20} /> ARCHIVES
                </Link>
                <button className="brutal-btn" onClick={handleLogout} style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
