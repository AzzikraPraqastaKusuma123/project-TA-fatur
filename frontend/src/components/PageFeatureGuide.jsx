import { useState } from 'react';
import {
    LayoutDashboard, Users, Wallet, SlidersHorizontal, Package,
    Wrench, UtensilsCrossed, CalendarPlus, CalendarDays,
    ShoppingCart, Activity, BarChart3, History, Settings,
    Database, BookOpen, ChevronDown, ChevronUp, ArrowRight,
    Lightbulb, Link2, HelpCircle, CheckCheck, CircleDot
} from 'lucide-react';

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

/**
 * PageFeatureGuide — Komponen panduan fitur kontekstual tertanam di halaman.
 * Desain bersih, presisi, bertema dokumentasi enterprise, bebas ornamen AI-slop.
 */
const PageFeatureGuide = ({ guide, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    if (!guide) return null;

    const PageIcon = ICON_MAP[guide.iconName] || BookOpen;
    const accentColor = guide.color || 'var(--primary)';

    return (
        <section
            aria-label={`Panduan Fitur ${guide.title}`}
            style={{
                marginTop: 32,
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                background: 'var(--bg-surface)',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
        >
            {/* ── Toggle Header ── */}
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: open ? 'var(--bg-muted)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    gap: 16,
                    textAlign: 'left',
                    borderBottom: open ? '1px solid var(--border-color)' : 'none',
                    transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => {
                    if (!open) e.currentTarget.style.background = 'var(--bg-muted)';
                }}
                onMouseLeave={e => {
                    if (!open) e.currentTarget.style.background = 'transparent';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                        width: 32, height: 32,
                        borderRadius: 8,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <PageIcon size={16} color={accentColor} strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                                fontWeight: 700,
                                fontSize: 13.5,
                                color: 'var(--tx-1)',
                                letterSpacing: '-0.2px',
                            }}>
                                Panduan Fitur: {guide.title}
                            </span>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 12,
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--tx-3)',
                            }}>
                                Dokumentasi
                            </span>
                        </div>
                        {!open && (
                            <div style={{
                                fontSize: 12,
                                color: 'var(--tx-3)',
                                marginTop: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {guide.tagline}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: 'var(--tx-3)', fontSize: 12, fontWeight: 600,
                    flexShrink: 0,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                }}>
                    <span>{open ? 'Tutup Panduan' : 'Lihat Panduan'}</span>
                    {open
                        ? <ChevronUp size={14} color="var(--tx-3)" />
                        : <ChevronDown size={14} color="var(--tx-3)" />
                    }
                </div>
            </button>

            {/* ── Body ── */}
            {open && (
                <div style={{ padding: '24px' }}>

                    {/* Overview Callout */}
                    <div style={{
                        display: 'flex', gap: 14, alignItems: 'flex-start',
                        padding: '14px 18px',
                        background: 'var(--bg-muted)',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        borderLeft: `3px solid ${accentColor}`,
                        marginBottom: 24,
                    }}>
                        <HelpCircle
                            size={16}
                            color={accentColor}
                            strokeWidth={2}
                            style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 700,
                                color: 'var(--tx-3)', textTransform: 'uppercase',
                                letterSpacing: '0.6px', marginBottom: 4,
                            }}>
                                Ringkasan Fungsi
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: 13,
                                color: 'var(--tx-2)',
                                lineHeight: 1.7,
                            }}>
                                {guide.description}
                            </p>
                        </div>
                    </div>

                    {/* Grid Layout: Workflow vs Integrasi & Tips */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 28,
                    }}>

                        {/* ── Steps Column ── */}
                        {guide.workflow?.length > 0 && (
                            <div>
                                <SectionLabel icon={ArrowRight} text="Alur Penggunaan" color={accentColor} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 14 }}>
                                    {guide.workflow.map((step, idx) => (
                                        <StepRow
                                            key={step.step}
                                            step={step}
                                            color={accentColor}
                                            isLast={idx === guide.workflow.length - 1}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Right Column: Integration & Tips ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {guide.integration?.length > 0 && (
                                <div>
                                    <SectionLabel icon={Link2} text="Integrasi Sistem" color={accentColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                                        {guide.integration.map((item, idx) => (
                                            <IntRow key={idx} label={item.label} desc={item.desc} color={accentColor} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {guide.tips?.length > 0 && (
                                <div>
                                    <SectionLabel icon={Lightbulb} text="Praktik Terbaik" color={accentColor} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
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
        </section>
    );
};

/* ── Section Label ─────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, text, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-color)',
    }}>
        <Icon size={14} color={color} strokeWidth={2.2} />
        <span style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--tx-2)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
        }}>
            {text}
        </span>
    </div>
);

/* ── Step Row ──────────────────────────────────────────── */
const StepRow = ({ step, color, isLast }) => (
    <div style={{
        display: 'flex',
        gap: 14,
        paddingBottom: isLast ? 0 : 20,
        position: 'relative',
    }}>
        {/* Number + Vertical Connecting Line */}
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
        }}>
            <div style={{
                width: 24, height: 24,
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: color,
                flexShrink: 0,
            }}>
                {step.step}
            </div>
            {!isLast && (
                <div style={{
                    width: 2,
                    flex: 1,
                    minHeight: 22,
                    background: 'var(--border-color)',
                    marginTop: 4,
                }} />
            )}
        </div>

        {/* Content */}
        <div style={{ paddingBottom: isLast ? 0 : 2 }}>
            <div style={{
                fontWeight: 600,
                fontSize: 13,
                color: 'var(--tx-1)',
                marginBottom: 3,
                lineHeight: 1.4,
            }}>
                {step.title}
            </div>
            <div style={{
                fontSize: 12,
                color: 'var(--tx-3)',
                lineHeight: 1.65,
            }}>
                {step.desc}
            </div>
        </div>
    </div>
);

/* ── Integration Row ───────────────────────────────────── */
const IntRow = ({ label, desc, color }) => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
    }}>
        <CircleDot size={13} color={color} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--tx-1)',
                display: 'inline-block',
                marginRight: 6,
            }}>
                {label}:
            </span>
            <span style={{
                fontSize: 12,
                color: 'var(--tx-3)',
                lineHeight: 1.55,
            }}>
                {desc}
            </span>
        </div>
    </div>
);

/* ── Tip Row ───────────────────────────────────────────── */
const TipRow = ({ text, color }) => (
    <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
    }}>
        <CheckCheck
            size={14}
            color={color}
            strokeWidth={2.2}
            style={{ flexShrink: 0, marginTop: 2 }}
        />
        <span style={{
            fontSize: 12,
            color: 'var(--tx-2)',
            lineHeight: 1.6,
        }}>
            {text}
        </span>
    </div>
);

export default PageFeatureGuide;
