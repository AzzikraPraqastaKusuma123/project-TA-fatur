import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import {
    Menu, Moon, Sun, LayoutDashboard, CalendarDays,
    ShoppingCart, Lightbulb, User
} from 'lucide-react';

/* ─── Mobile Bottom Nav — 5 most used pages ─────────────── */
const BOTTOM_NAV = [
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Home' },
    { to: '/meal-plans',     icon: CalendarDays,    label: 'Jadwal' },
    { to: '/recommendation', icon: Lightbulb,       label: 'Buat Plan' },
    { to: '/shopping',       icon: ShoppingCart,    label: 'Belanja' },
    { to: '/settings',       icon: User,            label: 'Profil' },
];

const BottomNav = () => {
    const location = useLocation();
    return (
        <nav className="bottom-nav">
            {BOTTOM_NAV.map(({ to, icon: Icon, label }) => {
                const isActive = location.pathname === to ||
                    (to !== '/dashboard' && location.pathname.startsWith(to));
                return (
                    <NavLink
                        key={to}
                        to={to}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 4px',
                            gap: 4,
                            color: isActive ? 'var(--primary)' : 'var(--tx-4)',
                            fontSize: 10,
                            fontWeight: isActive ? 700 : 500,
                            textDecoration: 'none',
                            transition: 'color var(--t-fast)',
                            minHeight: 56,
                            fontFamily: 'var(--font)',
                        }}
                    >
                        {isActive && (
                            <span style={{
                                position: 'absolute',
                                top: 0,
                                width: 28, height: 3,
                                background: 'var(--primary)',
                                borderRadius: '0 0 3px 3px',
                                transition: 'width var(--t-base)',
                            }} />
                        )}
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.5 : 1.8}
                            color={isActive ? 'var(--primary)' : 'var(--tx-4)'}
                        />
                        <span style={{ letterSpacing: '0.1px' }}>{label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

/* ─── Layout ─────────────────────────────────────────────── */
const Layout = ({ children, title, subtitle, actions }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile]       = useState(window.innerWidth <= 1024);
    const { theme, toggleTheme }        = useTheme();
    const location                      = useLocation();

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobile, sidebarOpen]);

    return (
        <div className="app-layout">
            {/* Sidebar backdrop (mobile) */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(20,18,14,0.55)',
                        zIndex: 190,
                        backdropFilter: 'blur(3px)',
                        WebkitBackdropFilter: 'blur(3px)',
                    }}
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-content">
                {/* ── Topbar ── */}
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            className="icon-btn mobile-toggle"
                            onClick={() => setSidebarOpen(true)}
                            title="Buka menu"
                        >
                            <Menu size={18} strokeWidth={2} />
                        </button>

                        {title && (
                            <div>
                                <div className="topbar-title">{title}</div>
                                {subtitle && (
                                    <div className="topbar-subtitle">{subtitle}</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="topbar-right">
                        {/* Page actions (desktop only) */}
                        {actions && (
                            <div className="actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {actions}
                            </div>
                        )}

                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                        >
                            {theme === 'dark'
                                ? <Sun size={14} strokeWidth={2} />
                                : <Moon size={14} strokeWidth={2} />
                            }
                        </button>
                    </div>
                </header>

                {/* ── Page Body ── */}
                <main className="page-body" key={location.pathname}>
                    {(title || actions) && (
                        <div className="page-header">
                            <div className="page-header-left">
                                <h1>{title}</h1>
                                {subtitle && <p>{subtitle}</p>}
                            </div>
                            {actions && (
                                <div className="page-header-actions actions-mobile">
                                    {actions}
                                </div>
                            )}
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {isMobile && <BottomNav />}

            <style>{`
                @media (max-width: 1024px) {
                    .actions-desktop { display: none !important; }
                }
                @media (min-width: 1025px) {
                    .actions-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Layout;
