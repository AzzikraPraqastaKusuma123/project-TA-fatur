import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import SpotlightTour from './SpotlightTour';
import FeatureGuideModal from './FeatureGuideModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Menu, Moon, Sun, LayoutDashboard, CalendarDays,
    ShoppingCart, Lightbulb, User, BookOpen,
    PanelLeftClose, PanelLeftOpen
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
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem('mealplanner_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });
    const [showTour, setShowTour]       = useState(false);
    const [showGuide, setShowGuide]     = useState(false);
    const { theme, toggleTheme }        = useTheme();
    const { user }                      = useAuth();
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

    const handleToggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(prev => !prev);
        } else {
            setIsCollapsed(prev => {
                const next = !prev;
                try {
                    localStorage.setItem('mealplanner_sidebar_collapsed', String(next));
                } catch (e) {}
                return next;
            });
        }
    };

    // Auto-open spotlight walkthrough for freshly registered users who haven't seen it yet
    useEffect(() => {
        if (!user?.id) return;
        try {
            const justRegistered = localStorage.getItem('just_registered') === 'true';
            const hasSeen = localStorage.getItem(`onboarding_seen_${user.id}`) === 'true';
            if (justRegistered && !hasSeen) {
                setShowTour(true);
            }
        } catch (e) {
            console.warn(e);
        }
    }, [user?.id]);

    return (
        <div className={`app-layout ${!isMobile && isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
                isCollapsed={!isMobile && isCollapsed}
                onToggleCollapse={handleToggleSidebar}
            />

            <div className="main-content">
                {/* ── Topbar ── */}
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            type="button"
                            className="sidebar-toggle-btn"
                            onClick={handleToggleSidebar}
                            title={isMobile ? "Buka menu navigasi" : (isCollapsed ? "Perbesar menu (Sidebar)" : "Perkecil menu (Sidebar)")}
                            aria-label="Toggle Sidebar"
                        >
                            {isMobile ? (
                                <Menu size={18} strokeWidth={2} />
                            ) : isCollapsed ? (
                                <PanelLeftOpen size={18} strokeWidth={2} />
                            ) : (
                                <PanelLeftClose size={18} strokeWidth={2} />
                            )}
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
                        {/* Panduan Fitur Button — kontekstual per halaman */}
                        <button
                            type="button"
                            className="onboarding-topbar-btn"
                            data-tour="help-button"
                            onClick={() => setShowGuide(true)}
                            title="Buka Panduan Fitur Halaman Ini"
                        >
                            <BookOpen size={13} strokeWidth={2} />
                            <span className="onboarding-btn-text">Panduan Fitur</span>
                        </button>

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

            {/* ── Feature Guide Modal (Kontekstual per Halaman) ── */}
            <FeatureGuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
            />

            {/* ── Interactive Spotlight Tour Layer (Onboarding) ── */}
            <SpotlightTour
                isOpen={showTour}
                onClose={() => setShowTour(false)}
                user={user}
            />

            <style>{`
                .onboarding-topbar-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: var(--r-sm, 8px);
                    border: 1px solid var(--border-color, #e2e8f0);
                    background: var(--bg-surface, #ffffff);
                    color: var(--tx-1, #0f172a);
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .onboarding-topbar-btn:hover {
                    background: var(--bg-hover, #f1f5f9);
                    border-color: var(--primary, #15803d);
                    color: var(--primary, #15803d);
                }
                .onboarding-topbar-btn svg {
                    color: var(--primary, #15803d);
                }
                @media (max-width: 640px) {
                    .onboarding-btn-text { display: none; }
                    .onboarding-topbar-btn { padding: 6px 8px; }
                }
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
