import { useState, useEffect, useCallback, useRef } from 'react';
import {
    BookOpen, ArrowRight, ArrowLeft, X, Check,
    Lightbulb, ShoppingCart, CalendarDays, Wallet, Package, Users
} from 'lucide-react';

/* ─── 7 Spotlight Steps on Dashboard & Layout ────────────────── */
const TOUR_STEPS = [
    {
        id: 'quick-meal-plan',
        selector: '[data-tour="quick-meal-plan"]',
        title: 'Rancang Menu Pintar Otomatis',
        icon: Lightbulb,
        color: '#7c3aed',
        desc: 'Fitur utama sistem! Cukup sekali klik, asisten pintar MealPlanner akan meracik jadwal sarapan, makan siang, dan makan malam yang bergizi seimbang dan pas di kantong belanja Anda.',
        proTip: 'Gunakan "Mode Gizi Seimbang" untuk kombinasi kesehatan keluarga dan efisiensi pengeluaran terbaik.',
        preferredPlacement: 'bottom',
    },
    {
        id: 'quick-shopping',
        selector: '[data-tour="quick-shopping"]',
        title: 'Daftar Belanja Terintegrasi',
        icon: ShoppingCart,
        color: '#059669',
        desc: 'Sistem otomatis menghitung bahan apa saja yang harus dibeli di pasar (Kebutuhan Resep dikurangi Stok Dapur). Anda tidak akan membeli bahan yang sudah ada di rumah.',
        proTip: 'Setelah belanja, centang item lalu klik "Tambahkan ke Stok" agar inventaris dapur langsung terisi otomatis.',
        preferredPlacement: 'bottom',
    },
    {
        id: 'today-menu',
        selector: '[data-tour="today-menu"]',
        title: 'Menu Makan Hari Ini',
        icon: CalendarDays,
        color: '#ea580c',
        desc: 'Pantau jadwal menu makan keluarga Anda untuk hari ini secara real-time lengkap dengan rincian kalori per porsinya agar asupan gizi harian selalu terkontrol.',
        proTip: 'Menu berubah otomatis mengikuti hari dan jadwal meal plan aktif yang sudah Anda buat.',
        preferredPlacement: 'top',
    },
    {
        id: 'budget-card',
        selector: '[data-tour="budget-card"]',
        title: 'Kendali Anggaran Makan',
        icon: Wallet,
        color: '#16a34a',
        desc: 'Pantau batas pengeluaran makanan rumah tangga dan persentase biaya yang sudah terpakai agar keuangan dapur tetap aman dan terhindar dari pemborosan.',
        proTip: 'Tentukan budget mingguan di menu Anggaran Makan agar belanja bahan segar di pasar lebih teratur.',
        preferredPlacement: 'left',
    },
    {
        id: 'inventory-alert',
        selector: '[data-tour="inventory-alert"]',
        title: 'Pengingat Stok & Kadaluarsa',
        icon: Package,
        color: '#b85c38',
        desc: 'Sistem cerdas akan memberi peringatan jika ada bahan dapur yang stoknya menipis atau mendekati tanggal kadaluarsa agar segera dimasak (Zero Food Waste).',
        proTip: 'Isi tanggal kadaluarsa saat mencatat stok agar notifikasi otomatis aktif.',
        preferredPlacement: 'left',
    },
    {
        id: 'sidebar-nav',
        selector: '[data-tour="sidebar-nav"]',
        title: 'Navigasi Menu Lengkap',
        icon: Users,
        color: '#2563eb',
        desc: 'Di bilah samping ini Anda dapat mengelola data profil Anggota Keluarga, Peralatan Masak yang dimiliki, Preferensi Alergi, dan Katalog Resep masakan.',
        proTip: 'Semakin lengkap data keluarga dan alat masak yang Anda isi, semakin presisi menu yang disarankan.',
        preferredPlacement: 'right',
    },
    {
        id: 'help-button',
        selector: '[data-tour="help-button"]',
        title: 'Panduan Fitur Kapan Saja',
        icon: BookOpen,
        color: '#15803d',
        desc: 'Jika Anda ingin mengulang tur sorotan ini kapan saja, cukup klik tombol "Panduan Fitur" ini di bilah atas.',
        proTip: 'Anda juga bisa menekan tombol Esc di keyboard untuk menutup tur ini sewaktu-waktu.',
        preferredPlacement: 'bottom',
    },
];

const SpotlightTour = ({ isOpen, onClose, user }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, placement: 'bottom' });
    const [dontShowAgain, setDontShowAgain] = useState(true);
    const isMounted = useRef(true);

    const stepData = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
    const totalSteps = TOUR_STEPS.length;

    // Save seen state and close
    const handleClose = useCallback(() => {
        if (dontShowAgain && user?.id) {
            try {
                localStorage.setItem(`onboarding_seen_${user.id}`, 'true');
            } catch (e) {
                console.warn(e);
            }
        }
        try {
            localStorage.removeItem('just_registered');
        } catch (e) {}
        onClose();
    }, [dontShowAgain, user?.id, onClose]);

    // Recalculate target position
    const updateTargetPosition = useCallback(() => {
        if (!isOpen) return;
        const selector = stepData.selector;
        const el = document.querySelector(selector);

        if (!el) {
            // Target element might not be rendered yet, try fallback center
            setTargetRect(null);
            return;
        }

        const rect = el.getBoundingClientRect();
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
        });

        // Compute popover coordinates
        const popWidth = Math.min(360, window.innerWidth - 32);
        const popHeight = 260; // estimated max height
        const margin = 14;
        let top = 0;
        let left = 0;
        let placement = stepData.preferredPlacement || 'bottom';

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        // Mobile fallback: pin to bottom sheet
        if (viewportW <= 640) {
            placement = 'mobile-bottom';
            top = viewportH - popHeight - 20;
            left = (viewportW - popWidth) / 2;
            setPopoverPos({ top, left, placement });
            return;
        }

        if (placement === 'bottom') {
            top = rect.bottom + margin;
            left = rect.left + rect.width / 2 - popWidth / 2;
            if (top + popHeight > viewportH) {
                // Flip to top
                top = rect.top - popHeight - margin;
                placement = 'top';
            }
        } else if (placement === 'top') {
            top = rect.top - popHeight - margin;
            left = rect.left + rect.width / 2 - popWidth / 2;
            if (top < 10) {
                top = rect.bottom + margin;
                placement = 'bottom';
            }
        } else if (placement === 'left') {
            top = rect.top + rect.height / 2 - popHeight / 2;
            left = rect.left - popWidth - margin;
            if (left < 10) {
                top = rect.bottom + margin;
                left = (viewportW - popWidth) / 2;
                placement = 'bottom';
            }
        } else if (placement === 'right') {
            top = rect.top + rect.height / 2 - popHeight / 2;
            left = rect.right + margin;
            if (left + popWidth > viewportW) {
                top = rect.bottom + margin;
                left = (viewportW - popWidth) / 2;
                placement = 'bottom';
            }
        }

        // Keep inside horizontal boundaries
        left = Math.max(16, Math.min(left, viewportW - popWidth - 16));
        top = Math.max(16, Math.min(top, viewportH - popHeight - 16));

        setPopoverPos({ top, left, placement });
    }, [isOpen, stepData]);

    // Scroll to target and update position
    useEffect(() => {
        if (!isOpen) return;
        const selector = stepData.selector;
        const el = document.querySelector(selector);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const timer = setTimeout(() => {
            updateTargetPosition();
        }, 120);

        return () => clearTimeout(timer);
    }, [isOpen, currentStep, stepData.selector, updateTargetPosition]);

    // Update on resize or scroll
    useEffect(() => {
        if (!isOpen) return;
        const handleResizeOrScroll = () => {
            updateTargetPosition();
        };
        window.addEventListener('resize', handleResizeOrScroll);
        window.addEventListener('scroll', handleResizeOrScroll, true);
        return () => {
            window.removeEventListener('resize', handleResizeOrScroll);
            window.removeEventListener('scroll', handleResizeOrScroll, true);
        };
    }, [isOpen, updateTargetPosition]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'ArrowRight') {
                setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowLeft') {
                setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, totalSteps, handleClose]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const StepIcon = stepData.icon;

    return (
        <div className="spotlight-tour-root">
            {/* ── Dark Layer with Cutout Spotlight ── */}
            {targetRect ? (
                <div
                    className="spotlight-highlight-box"
                    style={{
                        top: Math.max(0, targetRect.top - 6),
                        left: Math.max(0, targetRect.left - 6),
                        width: targetRect.width + 12,
                        height: targetRect.height + 12,
                        borderColor: stepData.color,
                    }}
                />
            ) : (
                <div className="spotlight-fallback-backdrop" onClick={handleClose} />
            )}

            {/* ── Floating Tooltip Popover Layer ── */}
            <div
                className={`spotlight-popover placement-${popoverPos.placement}`}
                style={{
                    top: popoverPos.top,
                    left: popoverPos.left,
                }}
            >
                {/* Header */}
                <div className="popover-header">
                    <div className="popover-step-badge" style={{ backgroundColor: `${stepData.color}18`, color: stepData.color, borderColor: `${stepData.color}33` }}>
                        <StepIcon size={12} strokeWidth={2.5} />
                        <span>Langkah {currentStep + 1} dari {totalSteps}</span>
                    </div>

                    <button
                        type="button"
                        className="popover-close-btn"
                        onClick={handleClose}
                        title="Tutup panduan (Esc)"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="popover-body">
                    <h4 className="popover-title">{stepData.title}</h4>
                    <p className="popover-desc">{stepData.desc}</p>

                    {stepData.proTip && (
                        <div className="popover-protip">
                            <Lightbulb size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span className="protip-txt">{stepData.proTip}</span>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="popover-footer">
                    <div className="popover-footer-left">
                        {/* Stepper Dots */}
                        <div className="popover-dots">
                            {TOUR_STEPS.map((s, idx) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className={`popover-dot ${idx === currentStep ? 'active' : ''}`}
                                    onClick={() => setCurrentStep(idx)}
                                    title={`Langkah ${idx + 1}: ${s.title}`}
                                    style={{
                                        backgroundColor: idx === currentStep ? stepData.color : undefined,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="popover-footer-right">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm popover-skip-btn"
                            onClick={handleClose}
                        >
                            Lewati
                        </button>

                        {currentStep > 0 && (
                            <button
                                type="button"
                                className="btn btn-outline btn-sm popover-nav-btn"
                                onClick={handlePrev}
                            >
                                <ArrowLeft size={13} />
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-primary btn-sm popover-next-btn"
                            onClick={handleNext}
                            style={{ backgroundColor: stepData.color, borderColor: stepData.color }}
                        >
                            <span>
                                {currentStep < totalSteps - 1 ? 'Lanjut' : 'Selesai'}
                            </span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                </div>

                <div className="popover-checkbox-wrap">
                    <label className="popover-checkbox-label">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        <span>Jangan tampilkan otomatis lagi</span>
                    </label>
                </div>
            </div>

            {/* ── Scoped CSS ── */}
            <style>{`
                .spotlight-tour-root {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    pointer-events: auto;
                }

                /* Spotlight Box using Massive Box-Shadow for the Dark Layer */
                .spotlight-highlight-box {
                    position: fixed;
                    z-index: 10001;
                    border: 2px solid var(--primary, #16a34a);
                    border-radius: 12px;
                    box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.72),
                                0 0 24px rgba(22, 163, 74, 0.45);
                    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                    pointer-events: none;
                    animation: spotPulse 2s infinite ease-in-out;
                }

                @keyframes spotPulse {
                    0%, 100% {
                        box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.72),
                                    0 0 16px rgba(22, 163, 74, 0.35);
                    }
                    50% {
                        box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.72),
                                    0 0 28px rgba(22, 163, 74, 0.65);
                    }
                }

                .spotlight-fallback-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.72);
                    z-index: 10001;
                }

                /* Floating Popover Layer */
                .spotlight-popover {
                    position: fixed;
                    z-index: 10005;
                    width: 350px;
                    max-width: calc(100vw - 32px);
                    background: var(--bg-surface, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 14px;
                    box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.35),
                                0 0 0 1px rgba(255, 255, 255, 0.08);
                    padding: 16px;
                    transition: top 0.28s ease, left 0.28s ease;
                    animation: popoverFadeIn 0.22s ease-out forwards;
                }

                @keyframes popoverFadeIn {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }

                .popover-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .popover-step-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 3px 8px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                }

                .popover-close-btn {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    background: transparent;
                    color: var(--tx-3, #64748b);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .popover-close-btn:hover {
                    background: var(--bg-hover, #f1f5f9);
                    color: var(--tx-1, #0f172a);
                }

                .popover-body {
                    margin-bottom: 14px;
                }

                .popover-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--tx-1, #0f172a);
                    margin: 0 0 6px;
                    letter-spacing: -0.3px;
                }

                .popover-desc {
                    font-size: 12.5px;
                    line-height: 1.5;
                    color: var(--tx-2, #334155);
                    margin: 0 0 10px;
                }

                .popover-protip {
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    font-size: 11.5px;
                    line-height: 1.4;
                    color: #92400e;
                }

                [data-theme='dark'] .popover-protip {
                    background: rgba(245, 158, 11, 0.12);
                    border-color: rgba(245, 158, 11, 0.25);
                    color: #fde68a;
                }

                .protip-bulb {
                    flex-shrink: 0;
                    font-size: 12px;
                }

                .protip-txt {
                    flex: 1;
                }

                .popover-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 10px;
                    border-top: 1px solid var(--border-color, #e2e8f0);
                    gap: 8px;
                }

                .popover-dots {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .popover-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 3px;
                    border: none;
                    background: var(--border-color, #cbd5e1);
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease;
                }

                .popover-dot.active {
                    width: 16px;
                }

                .popover-footer-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .popover-skip-btn {
                    font-size: 11.5px;
                    padding: 4px 8px;
                }

                .popover-nav-btn {
                    padding: 4px 8px;
                }

                .popover-next-btn {
                    padding: 4px 10px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #ffffff !important;
                }

                .popover-checkbox-wrap {
                    margin-top: 8px;
                    padding-top: 6px;
                    border-top: 1px dashed var(--border-color, #e2e8f0);
                }

                .popover-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10.5px;
                    color: var(--tx-3, #64748b);
                    cursor: pointer;
                    user-select: none;
                }

                .popover-checkbox-label input {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default SpotlightTour;
