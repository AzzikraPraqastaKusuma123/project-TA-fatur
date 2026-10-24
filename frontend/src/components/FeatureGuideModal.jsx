import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    X, BookOpen, ChevronRight, Lightbulb, Link2,
    ArrowRight, ExternalLink, Search, CheckCheck,
    HelpCircle, LayoutDashboard, Users, Wallet, SlidersHorizontal,
    Package, Wrench, UtensilsCrossed, CalendarPlus, CalendarDays,
    ShoppingCart, Activity, BarChart3, History, Settings,
    Database, Grid
} from 'lucide-react';
import { getGuideForPath, getAllGuides } from '../data/featureGuidesData';

const ICON_MAP = {
    LayoutDashboard,
    Users,
    Wallet,
    SlidersHorizontal,
    Package,
    Wrench,
    UtensilsCrossed,
    CalendarPlus,
    CalendarDays,
    ShoppingCart,
    Activity,
    BarChart3,
    History,
    Settings,
    Database,
};

/* ─── Workflow Step Component ───────────────────────────────────── */
const WorkflowStep = ({ step, color, isLast }) => (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
            <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: `2px solid ${color || 'var(--primary)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: color || 'var(--primary)',
            }}>
                {step.step}
            </div>
            {!isLast && (
                <div style={{
                    width: 2, flex: 1, minHeight: 22, marginTop: 4,
                    background: 'var(--border-color)',
                }} />
            )}
        </div>
        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--tx-1)', marginBottom: 3 }}>
                {step.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.65 }}>
                {step.desc}
            </div>
        </div>
    </div>
);

/* ─── Integration Row ────────────────────────────────────────────── */
const IntegrationRow = ({ label, desc, color }) => (
    <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px',
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
    }}>
        <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: color || 'var(--primary)', marginTop: 6, flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--tx-1)', marginRight: 6 }}>
                {label}:
            </span>
            <span style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.55 }}>
                {desc}
            </span>
        </div>
    </div>
);

/* ─── Tip Row ────────────────────────────────────────────────────── */
const TipRow = ({ text, color }) => (
    <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px',
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
    }}>
        <CheckCheck size={14} color={color || 'var(--primary)'} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.6 }}>
            {text}
        </div>
    </div>
);

/* ─── Directory Card ─────────────────────────────────────────────── */
const DirectoryCard = ({ guide, onClick, isActive }) => {
    const IconComp = ICON_MAP[guide.iconName] || BookOpen;
    const accent = guide.color || 'var(--primary)';

    return (
        <button
            type="button"
            onClick={() => onClick(guide.route)}
            style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: `1.5px solid ${isActive ? accent : 'var(--border-color)'}`,
                background: isActive ? 'var(--bg-muted)' : 'var(--bg-surface)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
            }}
            onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
        >
            <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <IconComp size={16} color={accent} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontWeight: 600, fontSize: 12.5,
                    color: isActive ? accent : 'var(--tx-1)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {guide.title}
                </div>
                <div style={{
                    fontSize: 11, color: 'var(--tx-3)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginTop: 1,
                }}>
                    {guide.tagline}
                </div>
            </div>
            <ChevronRight size={14} color="var(--tx-3)" style={{ flexShrink: 0 }} />
        </button>
    );
};

/* ─── FeatureGuideModal ─────────────────────────────────────────── */
const FeatureGuideModal = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'directory'
    const [selectedPath, setSelectedPath] = useState(location.pathname);
    const [searchQuery, setSearchQuery] = useState('');
    const overlayRef = useRef(null);
    const allGuides = getAllGuides();

    // Update selected path when location changes
    useEffect(() => {
        setSelectedPath(location.pathname);
    }, [location.pathname]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setActiveTab('guide');
            setSelectedPath(location.pathname);
            setSearchQuery('');
        }
    }, [isOpen, location.pathname]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSelectDirectory = useCallback((route) => {
        setSelectedPath(route);
        setActiveTab('guide');
    }, []);

    const handleNavigateToPage = useCallback((route) => {
        navigate(route);
        onClose();
    }, [navigate, onClose]);

    if (!isOpen) return null;

    const guide = getGuideForPath(selectedPath);
    const isCurrentPage = selectedPath === location.pathname;
    const GuideIcon = guide ? (ICON_MAP[guide.iconName] || BookOpen) : BookOpen;
    const accentColor = guide?.color || 'var(--primary)';

    const filteredGuides = allGuides.filter(g =>
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Backdrop */}
            <div
                ref={overlayRef}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    zIndex: 9000,
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                }}
            />

            {/* Modal Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Panduan Fitur Sistem"
                style={{
                    position: 'fixed',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9001,
                    width: 'min(760px, calc(100vw - 32px))',
                    maxHeight: 'calc(100vh - 48px)',
                    background: 'var(--bg-surface)',
                    borderRadius: 14,
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* ── Modal Header ── */}
                <div style={{
                    padding: '18px 24px 14px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <BookOpen size={16} color="var(--primary)" strokeWidth={2} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--tx-1)', letterSpacing: '-0.2px' }}>
                                    Dokumentasi & Panduan Fitur
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginTop: 1 }}>
                                    MealPlanner — Panduan operasional sistem perencanaan makan
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            title="Tutup (Esc)"
                            style={{
                                width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--tx-3)', transition: 'all 0.15s',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-surface)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--tx-1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--tx-3)'; }}
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex', gap: 4,
                        background: 'var(--bg-muted)',
                        borderRadius: 8, padding: 3,
                    }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('guide')}
                            style={{
                                flex: 1, padding: '7px 12px',
                                borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'all 0.15s ease',
                                cursor: 'pointer',
                                background: activeTab === 'guide' ? 'var(--bg-surface)' : 'transparent',
                                color: activeTab === 'guide' ? 'var(--tx-1)' : 'var(--tx-3)',
                                boxShadow: activeTab === 'guide' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                border: 'none',
                            }}
                        >
                            <GuideIcon size={14} color={activeTab === 'guide' ? accentColor : 'var(--tx-3)'} />
                            <span>Panduan: {guide?.title || 'Halaman Ini'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('directory')}
                            style={{
                                flex: 1, padding: '7px 12px',
                                borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'all 0.15s ease',
                                cursor: 'pointer',
                                background: activeTab === 'directory' ? 'var(--bg-surface)' : 'transparent',
                                color: activeTab === 'directory' ? 'var(--tx-1)' : 'var(--tx-3)',
                                boxShadow: activeTab === 'directory' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                border: 'none',
                            }}
                        >
                            <Grid size={14} color={activeTab === 'directory' ? 'var(--primary)' : 'var(--tx-3)'} />
                            <span>Semua Modul ({allGuides.length})</span>
                        </button>
                    </div>
                </div>

                {/* ── Modal Body ── */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 24px',
                }}>
                    {/* TAB 1: GUIDE */}
                    {activeTab === 'guide' && guide && (
                        <div>
                            {/* Header Overview Card */}
                            <div style={{
                                padding: '16px 18px',
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)',
                                borderLeft: `3px solid ${accentColor}`,
                                borderRadius: 10,
                                marginBottom: 20,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx-1)' }}>
                                        {guide.title}
                                    </span>
                                    <span style={{
                                        fontSize: 11, color: 'var(--tx-3)',
                                        background: 'var(--bg-surface)', padding: '1px 6px',
                                        borderRadius: 4, border: '1px solid var(--border-color)',
                                    }}>
                                        {guide.route}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--tx-3)', marginBottom: 8, fontWeight: 500 }}>
                                    {guide.tagline}
                                </div>
                                <div style={{ fontSize: 12.5, color: 'var(--tx-2)', lineHeight: 1.65 }}>
                                    {guide.description}
                                </div>
                            </div>

                            {/* Open Page Button (if viewing another page) */}
                            {!isCurrentPage && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8, marginBottom: 20,
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                                        Anda sedang melihat panduan untuk halaman lain.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigateToPage(guide.route)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '6px 12px', borderRadius: 6,
                                            background: accentColor, color: '#fff',
                                            fontSize: 12, fontWeight: 600,
                                            border: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        Buka Halaman <ExternalLink size={12} />
                                    </button>
                                </div>
                            )}

                            {/* 2-Column Workflow & Integration */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: 24,
                            }}>
                                {/* Workflow */}
                                {guide.workflow?.length > 0 && (
                                    <div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            paddingBottom: 8, marginBottom: 12,
                                            borderBottom: '1px solid var(--border-color)',
                                        }}>
                                            <ArrowRight size={13} color={accentColor} strokeWidth={2.2} />
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx-2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                                Alur Penggunaan
                                            </span>
                                        </div>
                                        <div>
                                            {guide.workflow.map((step, idx) => (
                                                <WorkflowStep
                                                    key={step.step}
                                                    step={step}
                                                    color={accentColor}
                                                    isLast={idx === guide.workflow.length - 1}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Integrations & Tips */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {guide.integration?.length > 0 && (
                                        <div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                paddingBottom: 8, marginBottom: 10,
                                                borderBottom: '1px solid var(--border-color)',
                                            }}>
                                                <Link2 size={13} color={accentColor} strokeWidth={2.2} />
                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx-2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                                    Integrasi Sistem
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {guide.integration.map((item, idx) => (
                                                    <IntegrationRow key={idx} label={item.label} desc={item.desc} color={accentColor} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {guide.tips?.length > 0 && (
                                        <div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                paddingBottom: 8, marginBottom: 10,
                                                borderBottom: '1px solid var(--border-color)',
                                            }}>
                                                <Lightbulb size={13} color={accentColor} strokeWidth={2.2} />
                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx-2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                                    Praktik Terbaik
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {guide.tips.map((tip, idx) => (
                                                    <TipRow key={idx} text={tip} color={accentColor} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DIRECTORY */}
                    {activeTab === 'directory' && (
                        <div>
                            {/* Search bar */}
                            <div style={{
                                position: 'relative',
                                marginBottom: 16,
                            }}>
                                <Search size={14} color="var(--tx-3)" style={{
                                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Cari fitur, alur kerja, atau panduan..."
                                    style={{
                                        width: '100%',
                                        padding: '9px 12px 9px 34px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-muted)',
                                        color: 'var(--tx-1)',
                                        fontSize: 12.5,
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Cards Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: 10,
                            }}>
                                {filteredGuides.map(g => (
                                    <DirectoryCard
                                        key={g.route}
                                        guide={g}
                                        isActive={selectedPath === g.route}
                                        onClick={handleSelectDirectory}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Modal Footer ── */}
                <div style={{
                    padding: '12px 24px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11.5,
                    color: 'var(--tx-3)',
                    flexShrink: 0,
                }}>
                    <span>Tekan <kbd style={{ padding: '2px 5px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 4, fontSize: 10 }}>Esc</kbd> untuk menutup</span>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--tx-1)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </>
    );
};

export default FeatureGuideModal;
