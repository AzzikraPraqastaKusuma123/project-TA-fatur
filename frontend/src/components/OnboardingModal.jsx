import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Wallet, Package, Wrench, Heart, Lightbulb, ShoppingCart,
    ArrowRight, ArrowLeft, Check, X, Compass, LayoutGrid,
    CheckCircle2, Flame, ShieldAlert, ChevronRight, HelpCircle
} from 'lucide-react';

/* ─── 7 Core Features Data ───────────────────────────────────── */
const FEATURES = [
    {
        id: 'family',
        step: 1,
        title: 'Anggota Keluarga',
        tagline: 'Kebutuhan Gizi Akurat',
        category: 'Keluarga & Kesehatan',
        path: '/family',
        icon: Users,
        color: '#2563eb',
        bg: 'rgba(37, 99, 235, 0.12)',
        borderColor: 'rgba(37, 99, 235, 0.25)',
        summary: 'Hitung kebutuhan kalori dan makronutrisi (protein, lemak, karbohidrat) setiap anggota keluarga secara otomatis.',
        benefit: 'Setiap anggota keluarga (anak, dewasa, lansia) mendapatkan asupan gizi seimbang sesuai standar Mifflin-St Jeor.',
        proTip: 'Isi usia, tinggi, berat badan, dan level aktivitas dengan benar agar target gizi harian akurat.',
    },
    {
        id: 'budget',
        step: 2,
        title: 'Anggaran Makan',
        tagline: 'Kendali Pengeluaran Rumah Tangga',
        category: 'Finansial & Hemat',
        path: '/budget',
        icon: Wallet,
        color: '#16a34a',
        bg: 'rgba(22, 163, 74, 0.12)',
        borderColor: 'rgba(22, 163, 74, 0.25)',
        summary: 'Tentukan batas budget makan keluarga per hari, per minggu, atau per bulan sesuai kemampuan finansial Anda.',
        benefit: 'Mencegah pembengkakan biaya dapur tanpa harus mengorbankan variasi menu dan kelezatan masakan.',
        proTip: 'Mode mingguan (7 hari) adalah pilihan paling ideal untuk belanja bahan segar terjadwal di pasar.',
    },
    {
        id: 'inventory',
        step: 3,
        title: 'Stok Dapur (Pantry)',
        tagline: 'Anti-Mubazir & Zero Waste',
        category: 'Manajemen Dapur',
        path: '/inventory',
        icon: Package,
        color: '#ea580c',
        bg: 'rgba(234, 88, 12, 0.12)',
        borderColor: 'rgba(234, 88, 12, 0.25)',
        summary: 'Catat bahan makanan yang sudah Anda miliki di kulkas atau lemari dapur beserta tanggal kadaluarsanya.',
        benefit: 'Sistem cerdas akan memprioritaskan bahan yang sudah ada sehingga menghemat biaya belanja dan mencegah bahan membusuk.',
        proTip: 'Sistem akan memberi lencana peringatan warna kuning/merah saat bahan mendekati masa kadaluarsa.',
    },
    {
        id: 'equipment',
        step: 4,
        title: 'Peralatan Masak',
        tagline: 'Garansi Resep Bisa Dimasak',
        category: 'Peralatan Dapur',
        path: '/equipment',
        icon: Wrench,
        color: '#0891b2',
        bg: 'rgba(8, 145, 178, 0.12)',
        borderColor: 'rgba(8, 145, 178, 0.25)',
        summary: 'Tandai perkakas masak yang Anda miliki di rumah (kompor, wajan, panci, oven, rice cooker, blender).',
        benefit: 'Anda tidak akan pernah direkomendasikan resep yang membutuhkan alat yang tidak Anda miliki di dapur.',
        proTip: 'Centang minimal Kompor Gas dan Wajan untuk langsung membuka puluhan pilihan resep masakan Nusantara.',
    },
    {
        id: 'preferences',
        step: 5,
        title: 'Preferensi & Pantangan',
        tagline: 'Aman dari Alergi & Sesuai Selera',
        category: 'Selera & Alergen',
        path: '/preferences',
        icon: Heart,
        color: '#e11d48',
        bg: 'rgba(225, 29, 72, 0.12)',
        borderColor: 'rgba(225, 29, 72, 0.25)',
        summary: 'Tandai bahan masakan favorit keluarga atau bahan yang harus dihindari (alergi udang, telur, kacang, dll).',
        benefit: 'Resep yang mengandung bahan pantangan akan disaring keras dan tidak akan pernah muncul dalam menu Anda.',
        proTip: 'Gunakan tipe "Hindari" untuk anggota keluarga yang memiliki pantangan kolesterol atau alergi tertentu.',
    },
    {
        id: 'recommendation',
        step: 6,
        title: 'Rencana Menu Cerdas',
        tagline: 'Peracikan Menu Seimbang & Otomatis',
        category: 'Fitur Utama',
        path: '/recommendation',
        icon: Lightbulb,
        color: '#7c3aed',
        bg: 'rgba(124, 58, 237, 0.12)',
        borderColor: 'rgba(124, 58, 237, 0.25)',
        summary: 'Hanya dengan satu klik, sistem cerdas menyusun jadwal sarapan, siang, dan malam yang bergizi seimbang dan pas di kantong.',
        benefit: 'Menghilangkan pusing "hari ini masak apa?", menjamin biaya di bawah anggaran, dan menjaga nutrisi keluarga tetap tercukupi.',
        proTip: 'Pilih "Mode Gizi Seimbang" untuk kombinasi kesehatan dan efisiensi pengeluaran yang paling optimal.',
    },
    {
        id: 'shopping',
        step: 7,
        title: 'Daftar Belanja Pintar',
        tagline: 'Belanja Efisien & Terintegrasi',
        category: 'Belanja & Logistik',
        path: '/shopping',
        icon: ShoppingCart,
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.12)',
        borderColor: 'rgba(5, 150, 105, 0.25)',
        summary: 'Sistem otomatis menghitung selisih bahan (Kebutuhan Resep dikurangi Stok Dapur) dan mengestimasi total harganya.',
        benefit: 'Anda tidak akan membeli bahan yang sudah ada di rumah. Setelah belanja, stok langsung masuk otomatis ke dapur.',
        proTip: 'Centang barang yang dibeli di pasar, lalu klik tombol "Tambahkan ke Stok" untuk memperbarui inventaris dapur seketika.',
    },
];

/* ─── 3 Langkah Mudah Memulai ────────────────────────────────── */
const QUICK_STEPS = [
    {
        num: '1',
        title: 'Isi Data Keluarga',
        desc: 'Tambahkan data diri dan anggota keluarga untuk menentukan target kalori harian.',
        to: '/family',
        btnText: 'Buka Anggota Keluarga',
    },
    {
        num: '2',
        title: 'Atur Anggaran & Alat Masak',
        desc: 'Tentukan budget belanja makan dan centang peralatan masak yang Anda miliki di rumah.',
        to: '/budget',
        btnText: 'Atur Anggaran',
    },
    {
        num: '3',
        title: 'Hasilkan Rencana Menu',
        desc: 'Buka menu rekomendasi, pilih mode rencana, dan nikmati jadwal menu otomatis tanpa repot!',
        to: '/recommendation',
        btnText: 'Buat Meal Plan',
    },
];

const OnboardingModal = ({ isOpen, onClose, user }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [viewMode, setViewMode] = useState('tour'); // 'tour' | 'grid' | 'checklist'
    const [dontShowAgain, setDontShowAgain] = useState(true);

    const totalSteps = FEATURES.length;
    const currentFeature = FEATURES[currentStep];

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

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'ArrowRight' && viewMode === 'tour') {
                setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowLeft' && viewMode === 'tour') {
                setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, viewMode, totalSteps, handleClose]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setViewMode('checklist');
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleNavigate = (path) => {
        handleClose();
        navigate(path);
    };

    const progressPct = ((currentStep + 1) / totalSteps) * 100;
    const FeatureIcon = currentFeature.icon;

    return (
        <div className="onboarding-overlay" onClick={handleClose}>
            <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
                {/* ── Progress Bar Top ── */}
                {viewMode === 'tour' && (
                    <div className="onboarding-progress-track">
                        <div
                            className="onboarding-progress-fill"
                            style={{
                                width: `${progressPct}%`,
                                backgroundColor: currentFeature.color,
                            }}
                        />
                    </div>
                )}

                {/* ── Modal Header ── */}
                <div className="onboarding-header">
                    <div className="onboarding-header-left">
                        <div className="onboarding-badge-brand">
                            <BookOpen size={14} />
                            <span>Panduan Fitur MealPlanner</span>
                        </div>
                        <h2 className="onboarding-title">
                            {viewMode === 'checklist'
                                ? 'Rencana Anda Siap Dibuat'
                                : viewMode === 'grid'
                                ? 'Katalog Seluruh Fitur Sistem'
                                : 'Kenali Fitur Cerdas MealPlanner'}
                        </h2>
                    </div>

                    <div className="onboarding-header-right">
                        {/* Tab Mode Switcher */}
                        <div className="onboarding-view-tabs">
                            <button
                                type="button"
                                className={`onboarding-tab-btn ${viewMode === 'tour' ? 'active' : ''}`}
                                onClick={() => setViewMode('tour')}
                                title="Tur Langkah demi Langkah"
                            >
                                <Compass size={13} />
                                <span>Tur</span>
                            </button>
                            <button
                                type="button"
                                className={`onboarding-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Lihat Semua Fitur Sekaligus"
                            >
                                <LayoutGrid size={13} />
                                <span>Semua Fitur</span>
                            </button>
                            <button
                                type="button"
                                className={`onboarding-tab-btn ${viewMode === 'checklist' ? 'active' : ''}`}
                                onClick={() => setViewMode('checklist')}
                                title="3 Langkah Cepat"
                            >
                                <CheckCircle2 size={13} />
                                <span>Mulai</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            className="onboarding-close-btn"
                            onClick={handleClose}
                            title="Tutup panduan (Esc)"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Modal Body: 3 Modes ── */}
                <div className="onboarding-body">
                    {/* MODE 1: STEP-BY-STEP TOUR */}
                    {viewMode === 'tour' && (
                        <div className="tour-slide-container">
                            <div className="tour-slide-header">
                                <div className="tour-step-counter">
                                    <span className="step-pill" style={{ background: currentFeature.bg, color: currentFeature.color, border: `1px solid ${currentFeature.borderColor}` }}>
                                        Langkah {currentFeature.step} dari {totalSteps}
                                    </span>
                                    <span className="category-pill">{currentFeature.category}</span>
                                </div>

                                <button
                                    type="button"
                                    className="tour-try-btn"
                                    onClick={() => handleNavigate(currentFeature.path)}
                                    title="Langsung coba halaman ini"
                                >
                                    <span>Buka Fitur Ini</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="tour-feature-hero">
                                <div
                                    className="tour-icon-box"
                                    style={{
                                        background: currentFeature.bg,
                                        color: currentFeature.color,
                                        border: `1.5px solid ${currentFeature.borderColor}`,
                                        boxShadow: `0 8px 24px -6px ${currentFeature.color}33`,
                                    }}
                                >
                                    <FeatureIcon size={32} strokeWidth={2.2} />
                                </div>
                                <div className="tour-feature-meta">
                                    <h3 className="tour-feature-title">{currentFeature.title}</h3>
                                    <p className="tour-feature-tagline">{currentFeature.tagline}</p>
                                </div>
                            </div>

                            <div className="tour-info-grid">
                                <div className="tour-info-card">
                                    <div className="info-card-label">Fungsi Utama</div>
                                    <p className="info-card-text">{currentFeature.summary}</p>
                                </div>
                                <div className="tour-info-card">
                                    <div className="info-card-label">Manfaat Bagi Keluarga</div>
                                    <p className="info-card-text">{currentFeature.benefit}</p>
                                </div>
                            </div>

                            <div className="tour-protip-box">
                                <div className="protip-header">
                                    <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span className="protip-label">Tips Penggunaan Efektif:</span>
                                </div>
                                <p className="protip-text">{currentFeature.proTip}</p>
                            </div>
                        </div>
                    )}

                    {/* MODE 2: GRID OVERVIEW */}
                    {viewMode === 'grid' && (
                        <div className="grid-overview-container">
                            <p className="grid-overview-subtitle">
                                Seluruh 7 pilar sistem MealPlanner dirancang bekerja bersamaan agar perencanaan menu keluarga Anda otomatis, bergizi, dan hemat budget.
                            </p>
                            <div className="features-grid">
                                {FEATURES.map((feat) => {
                                    const FIcon = feat.icon;
                                    return (
                                        <div
                                            key={feat.id}
                                            className="feature-grid-item"
                                            onClick={() => handleNavigate(feat.path)}
                                        >
                                            <div className="grid-item-top">
                                                <div
                                                    className="grid-item-icon"
                                                    style={{ background: feat.bg, color: feat.color, border: `1px solid ${feat.borderColor}` }}
                                                >
                                                    <FIcon size={18} strokeWidth={2.2} />
                                                </div>
                                                <span className="grid-item-step">#{feat.step}</span>
                                            </div>
                                            <div className="grid-item-title">{feat.title}</div>
                                            <div className="grid-item-tagline">{feat.tagline}</div>
                                            <p className="grid-item-desc">{feat.summary}</p>
                                            <div className="grid-item-footer">
                                                <span style={{ color: feat.color, fontWeight: 600 }}>Coba halaman</span>
                                                <ChevronRight size={13} color={feat.color} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* MODE 3: QUICK START CHECKLIST */}
                    {viewMode === 'checklist' && (
                        <div className="checklist-container">
                            <div className="checklist-hero">
                                <div className="checklist-badge">Langkah Awal yang Mudah</div>
                                <h3>3 Langkah Cepat Memulai Penggunaan MealPlanner</h3>
                                <p>Ikuti 3 tahapan ringkas ini untuk langsung menghasilkan rencana menu pertama Anda:</p>
                            </div>

                            <div className="checklist-steps">
                                {QUICK_STEPS.map((qs) => (
                                    <div key={qs.num} className="checklist-card">
                                        <div className="checklist-num">{qs.num}</div>
                                        <div className="checklist-content">
                                            <div className="checklist-title">{qs.title}</div>
                                            <p className="checklist-desc">{qs.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm checklist-btn"
                                            onClick={() => handleNavigate(qs.to)}
                                        >
                                            <span>{qs.btnText}</span>
                                            <ChevronRight size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Modal Footer ── */}
                <div className="onboarding-footer">
                    <div className="onboarding-footer-left">
                        {/* Stepper Dots (Tour mode only) */}
                        {viewMode === 'tour' && (
                            <div className="stepper-dots">
                                {FEATURES.map((f, i) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        className={`stepper-dot ${i === currentStep ? 'active' : ''}`}
                                        onClick={() => setCurrentStep(i)}
                                        title={`Buka langkah ${i + 1}: ${f.title}`}
                                        style={{
                                            backgroundColor: i === currentStep ? currentFeature.color : undefined,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <label className="onboarding-checkbox-label">
                            <input
                                type="checkbox"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                            />
                            <span>Jangan tampilkan otomatis lagi</span>
                        </label>
                    </div>

                    <div className="onboarding-footer-right">
                        {viewMode === 'tour' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={handleClose}
                                >
                                    Lewati
                                </button>

                                {currentStep > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={handlePrev}
                                    >
                                        <ArrowLeft size={13} />
                                        <span>Sebelumnya</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={handleNext}
                                >
                                    <span>
                                        {currentStep < totalSteps - 1
                                            ? `Lanjut (${currentStep + 1}/${totalSteps})`
                                            : 'Selesai & Mulai'}
                                    </span>
                                    <ArrowRight size={13} />
                                </button>
                            </>
                        )}

                        {viewMode !== 'tour' && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleNavigate('/recommendation')}
                            >
                                <span>Buat Meal Plan Pertama Saya</span>
                                <ArrowRight size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Embedded Scoped CSS ── */}
            <style>{`
                .onboarding-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: rgba(15, 17, 23, 0.65);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    animation: onbFadeIn 0.22s ease-out forwards;
                }

                @keyframes onbFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .onboarding-card {
                    position: relative;
                    width: 100%;
                    max-width: 660px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-surface, #ffffff);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 16px;
                    box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08);
                    overflow: hidden;
                    animation: onbSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes onbSlideUp {
                    from { transform: translateY(16px) scale(0.98); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }

                .onboarding-progress-track {
                    width: 100%;
                    height: 3.5px;
                    background: var(--bg-hover, #f1f5f9);
                }

                .onboarding-progress-fill {
                    height: 100%;
                    transition: width 0.35s ease, background-color 0.35s ease;
                }

                .onboarding-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px 14px;
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .onboarding-badge-brand {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: var(--primary, #15803d);
                    margin-bottom: 4px;
                }

                

                .onboarding-title {
                    font-size: 17px;
                    font-weight: 800;
                    color: var(--tx-1, #0f172a);
                    margin: 0;
                    letter-spacing: -0.3px;
                }

                .onboarding-header-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .onboarding-view-tabs {
                    display: flex;
                    align-items: center;
                    background: var(--bg-hover, #f1f5f9);
                    padding: 3px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    gap: 2px;
                }

                .onboarding-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 10px;
                    font-size: 11.5px;
                    font-weight: 600;
                    border: none;
                    background: transparent;
                    color: var(--tx-3, #64748b);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .onboarding-tab-btn.active {
                    background: var(--bg-surface, #ffffff);
                    color: var(--tx-1, #0f172a);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }

                .onboarding-close-btn {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    border: 1px solid var(--border-color, #e2e8f0);
                    background: transparent;
                    color: var(--tx-3, #64748b);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .onboarding-close-btn:hover {
                    background: var(--bg-hover, #f1f5f9);
                    color: var(--tx-1, #0f172a);
                }

                .onboarding-body {
                    padding: 22px 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                /* Tour Slide */
                .tour-slide-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .tour-step-counter {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .step-pill {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 6px;
                }

                .category-pill {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--tx-3, #64748b);
                }

                .tour-try-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: transparent;
                    border: none;
                    color: var(--primary, #15803d);
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 4px 6px;
                    border-radius: 6px;
                    transition: background 0.15s ease;
                }

                .tour-try-btn:hover {
                    background: var(--bg-hover, #f1f5f9);
                }

                .tour-feature-hero {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .tour-icon-box {
                    width: 58px;
                    height: 58px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.25s ease;
                }

                .tour-feature-hero:hover .tour-icon-box {
                    transform: scale(1.05);
                }

                .tour-feature-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--tx-1, #0f172a);
                    margin: 0 0 3px;
                    letter-spacing: -0.4px;
                }

                .tour-feature-tagline {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--tx-3, #64748b);
                    margin: 0;
                }

                .tour-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .tour-info-card {
                    padding: 14px;
                    border-radius: 10px;
                    background: var(--bg-root, #f8fafc);
                    border: 1px solid var(--border-color, #e2e8f0);
                }

                .info-card-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--tx-2, #334155);
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    margin-bottom: 6px;
                }

                .info-card-text {
                    font-size: 12.5px;
                    line-height: 1.5;
                    color: var(--tx-2, #334155);
                    margin: 0;
                }

                .tour-protip-box {
                    padding: 12px 14px;
                    border-radius: 10px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    color: #92400e;
                }

                [data-theme='dark'] .tour-protip-box {
                    background: rgba(245, 158, 11, 0.12);
                    border-color: rgba(245, 158, 11, 0.25);
                    color: #fde68a;
                }

                .protip-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11.5px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .protip-text {
                    font-size: 12px;
                    line-height: 1.45;
                    margin: 0;
                }

                /* Grid Overview */
                .grid-overview-subtitle {
                    font-size: 13px;
                    color: var(--tx-3, #64748b);
                    margin: 0 0 16px;
                    line-height: 1.5;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 10px;
                }

                .feature-grid-item {
                    padding: 12px 14px;
                    border-radius: 10px;
                    background: var(--bg-root, #f8fafc);
                    border: 1px solid var(--border-color, #e2e8f0);
                    cursor: pointer;
                    transition: all 0.16s ease;
                }

                .feature-grid-item:hover {
                    border-color: var(--primary, #15803d);
                    background: var(--bg-hover, #f1f5f9);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }

                .grid-item-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .grid-item-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .grid-item-step {
                    font-size: 10.5px;
                    font-weight: 700;
                    color: var(--tx-4, #94a3b8);
                }

                .grid-item-title {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: var(--tx-1, #0f172a);
                    margin-bottom: 2px;
                }

                .grid-item-tagline {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--primary, #15803d);
                    margin-bottom: 6px;
                }

                .grid-item-desc {
                    font-size: 11.5px;
                    line-height: 1.45;
                    color: var(--tx-3, #64748b);
                    margin: 0 0 10px;
                }

                .grid-item-footer {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    border-top: 1px dashed var(--border-color, #e2e8f0);
                    padding-top: 8px;
                }

                /* Checklist Mode */
                .checklist-hero {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .checklist-badge {
                    display: inline-block;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 12px;
                    background: rgba(22, 163, 74, 0.12);
                    color: var(--primary, #15803d);
                    margin-bottom: 8px;
                }

                .checklist-hero h3 {
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--tx-1, #0f172a);
                    margin: 0 0 6px;
                }

                .checklist-hero p {
                    font-size: 12.5px;
                    color: var(--tx-3, #64748b);
                    margin: 0;
                }

                .checklist-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .checklist-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px;
                    background: var(--bg-root, #f8fafc);
                    border: 1px solid var(--border-color, #e2e8f0);
                    border-radius: 12px;
                    transition: border-color 0.15s ease;
                }

                .checklist-card:hover {
                    border-color: var(--primary, #15803d);
                }

                .checklist-num {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary, #15803d);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .checklist-content {
                    flex: 1;
                }

                .checklist-title {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: var(--tx-1, #0f172a);
                    margin-bottom: 2px;
                }

                .checklist-desc {
                    font-size: 11.5px;
                    color: var(--tx-3, #64748b);
                    margin: 0;
                    line-height: 1.4;
                }

                .checklist-btn {
                    flex-shrink: 0;
                }

                /* Footer */
                .onboarding-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 24px;
                    background: var(--bg-root, #f8fafc);
                    border-top: 1px solid var(--border-color, #e2e8f0);
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .onboarding-footer-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stepper-dots {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .stepper-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 4px;
                    border: none;
                    background: var(--border-color, #cbd5e1);
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease;
                }

                .stepper-dot.active {
                    width: 22px;
                    background: var(--primary, #15803d);
                }

                .onboarding-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11.5px;
                    color: var(--tx-3, #64748b);
                    cursor: pointer;
                    user-select: none;
                }

                .onboarding-checkbox-label input {
                    cursor: pointer;
                }

                .onboarding-footer-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                @media (max-width: 640px) {
                    .tour-info-grid {
                        grid-template-columns: 1fr;
                    }
                    .onboarding-header {
                        padding: 14px 16px;
                    }
                    .onboarding-body {
                        padding: 16px;
                    }
                    .onboarding-footer {
                        padding: 12px 16px;
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .onboarding-footer-left {
                        justify-content: space-between;
                    }
                    .onboarding-footer-right {
                        justify-content: flex-end;
                    }
                }
            `}</style>
        </div>
    );
};

export default OnboardingModal;
