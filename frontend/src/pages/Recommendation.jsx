import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Check, AlertTriangle, ShoppingCart, BarChart2, Info, ChevronDown, ChevronUp, Leaf, Zap, PiggyBank, Sparkles, Clock } from 'lucide-react';

/* ─── Planning Modes (replacing raw weight inputs) ────────────── */
const MODES = [
    {
        id: 'hemat',
        icon: PiggyBank,
        emoji: '💰',
        title: 'Mode Hemat',
        subtitle: 'Prioritaskan penghematan biaya',
        desc: 'Cocok untuk anggaran terbatas. Sistem akan mencari kombinasi menu paling terjangkau.',
        color: '#b85c38',
        bg: '#fbeee8',
        border: '#e8b49e',
        weights: { cost: 0.65, nutrition: 0.15, repetition: 0.1, preference: 0.1 },
    },
    {
        id: 'seimbang',
        icon: Leaf,
        emoji: '🥗',
        title: 'Mode Gizi Seimbang',
        subtitle: 'Gizi terbaik dalam anggaran',
        desc: 'Pilihan terbaik untuk keluarga. Menyeimbangkan nutrisi optimal dengan harga yang wajar.',
        color: '#2c4a2e',
        bg: '#ebf2eb',
        border: '#c8dac9',
        weights: { cost: 0.3, nutrition: 0.45, repetition: 0.15, preference: 0.1 },
    },
    {
        id: 'praktis',
        icon: Zap,
        emoji: '⚡',
        title: 'Mode Praktis',
        subtitle: 'Menu sederhana dan cepat masak',
        desc: 'Untuk ibu yang sibuk. Pilih menu-menu yang tidak berulang dan mudah disiapkan.',
        color: '#1a5f7a',
        bg: '#e8f4f8',
        border: '#93cfe0',
        weights: { cost: 0.35, nutrition: 0.25, repetition: 0.25, preference: 0.15 },
    },
];

const LOADING_STEPS = [
    { label: 'Memeriksa anggaran keluarga…',    icon: '💰' },
    { label: 'Memilih bahan yang tersedia…',     icon: '🥕' },
    { label: 'Mencocokkan resep dengan peralatan…', icon: '🍳' },
    { label: 'Menghitung kombinasi terbaik…',    icon: '🧮' },
    { label: 'Menyusun jadwal menu…',            icon: '📋' },
    { label: 'Selesai!',                         icon: '✅' },
];

const SLOT_LABEL = { BREAKFAST: 'Sarapan', LUNCH: 'Makan Siang', DINNER: 'Makan Malam' };
const SLOT_EMOJI = { BREAKFAST: '🍳', LUNCH: '☀️', DINNER: '🌙' };
const SLOT_COLOR = {
    BREAKFAST: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
    LUNCH:     { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    DINNER:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
};

const fmt    = n => `Rp${(n || 0).toLocaleString('id-ID')}`;
const fmtNum = (n, dec = 1) => Number(n || 0).toFixed(dec);

/* ─── Nutrition Bar ───────────────────────────────────────────── */
const NutritionBar = ({ label, actual, target, unit, color }) => {
    const pct     = target > 0 ? Math.min((actual / target) * 100, 130) : 0;
    const isOver  = actual > target * 1.1;
    const isUnder = target > 0 && actual < target * 0.8;
    const barColor = isOver ? 'var(--danger)' : isUnder ? 'var(--warning)' : color;
    const status   = isOver ? 'Berlebih' : isUnder ? 'Kurang' : 'Baik';
    const statusColor = isOver ? 'var(--danger)' : isUnder ? 'var(--warning)' : 'var(--success)';
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5, alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--tx-2)' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--tx-3)' }}>
                        {fmtNum(actual, 0)}{unit}
                        {target > 0 && <span style={{ color: 'var(--tx-4)' }}> / {fmtNum(target, 0)}{unit}</span>}
                    </span>
                    {target > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: statusColor,
                            background: isOver ? 'var(--danger-bg)' : isUnder ? 'var(--warning-bg)' : 'var(--success-bg)',
                            padding: '1px 6px', borderRadius: 4 }}>
                            {status}
                        </span>
                    )}
                </div>
            </div>
            <div style={{ height: 7, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
};

/* ─── Collapsible Day Row ─────────────────────────────────────── */
const DayRow = ({ day, slots }) => {
    const [open, setOpen] = useState(true);
    const dayTotal = Object.values(day.meals || {}).reduce((s, m) => s + (m?.cost || 0), 0);
    return (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 8 }}>
            <button type="button" onClick={() => setOpen(o => !o)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', background: 'var(--bg-muted)',
                borderBottom: open ? '1px solid var(--border-color)' : 'none', cursor: 'pointer',
            }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx-1)' }}>
                    Hari ke-{day.day}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>{fmt(dayTotal)}</span>
                    {open ? <ChevronUp size={14} color="var(--tx-3)" /> : <ChevronDown size={14} color="var(--tx-3)" />}
                </div>
            </button>
            {open && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${slots.length}, 1fr)` }}>
                    {slots.map((slot, si) => {
                        const meal = day.meals?.[slot];
                        const colors = SLOT_COLOR[slot] || {};
                        return (
                            <div key={slot} style={{
                                padding: '12px 14px',
                                borderRight: si < slots.length - 1 ? '1px solid var(--border-color)' : 'none',
                                background: meal ? 'var(--bg-surface)' : 'var(--bg-root)',
                            }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 10, fontWeight: 700,
                                    color: colors.text || 'var(--tx-3)',
                                    background: colors.bg || 'var(--bg-hover)',
                                    border: `1px solid ${colors.border || 'var(--border-color)'}`,
                                    borderRadius: 4, padding: '2px 7px',
                                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7,
                                }}>
                                    {SLOT_EMOJI[slot]} {SLOT_LABEL[slot]}
                                </div>
                                {meal ? (
                                    <>
                                        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--tx-1)', marginBottom: 3, lineHeight: 1.35 }}>
                                            {meal.recipe_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>
                                            {Math.round(meal.calories)} kkal · {fmt(meal.cost)}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 11.5, color: 'var(--tx-4)', fontStyle: 'italic' }}>Tidak ada menu</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ─── Mode Card ───────────────────────────────────────────────── */
const ModeCard = ({ mode, selected, onClick }) => {
    const Icon = mode.icon;
    const isSelected = selected === mode.id;
    return (
        <button
            type="button"
            onClick={() => onClick(mode.id)}
            style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '18px 16px',
                border: `2px solid ${isSelected ? mode.color : 'var(--border-color)'}`,
                borderRadius: 'var(--r-md)',
                background: isSelected ? mode.bg : 'var(--bg-surface)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? `0 0 0 3px ${mode.bg}` : 'none',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 'var(--r-sm)',
                    background: isSelected ? mode.color : 'var(--bg-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 20,
                    transition: 'background 0.18s ease',
                }}>
                    {isSelected
                        ? <Icon size={20} color="#fff" strokeWidth={2} />
                        : <span>{mode.emoji}</span>
                    }
                </div>
                {isSelected && (
                    <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: mode.color, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? mode.color : 'var(--tx-1)', marginBottom: 2 }}>
                    {mode.title}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: isSelected ? mode.color : 'var(--tx-3)', marginBottom: 6, opacity: 0.8 }}>
                    {mode.subtitle}
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.55 }}>
                    {mode.desc}
                </div>
            </div>
        </button>
    );
};

/* ─── Main Page ───────────────────────────────────────────────── */
const Recommendation = () => {
    const [loading, setLoading]   = useState(false);
    const [loadStep, setLoadStep] = useState(0);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState('');
    const [days, setDays]         = useState(7);
    const [mode, setMode]         = useState('seimbang');
    const [saving, setSaving]     = useState(false);
    const [saved, setSaved]       = useState(false);
    const [budget, setBudget]     = useState(null);

    useEffect(() => {
        api.get('/budgets').then(r => {
            if (r.data?.data) setBudget(r.data.data);
        }).catch(() => {});
    }, []);

    const handleGenerate = async () => {
        if (!budget || budget.amount <= 0) {
            setError('Silakan atur anggaran terlebih dahulu di halaman Anggaran.');
            return;
        }

        setLoading(true); setError(''); setResult(null); setSaved(false); setLoadStep(0);

        const interval = setInterval(() => {
            setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
        }, 900);

        try {
            const selectedMode = MODES.find(m => m.id === mode);
            const maxRepeatVal = Math.max(3, Math.ceil(days / 3));
            const res = await api.post('/recommendations/generate', {
                days,
                slots:     ['BREAKFAST', 'LUNCH', 'DINNER'],
                budget:    budget.amount,
                maxRepeat: maxRepeatVal,
                weights:   selectedMode.weights,
            });
            setResult(res.data.data);
        } catch (err) {
            const msg         = err.response?.data?.message || 'Gagal menghasilkan rekomendasi.';
            const suggestions = err.response?.data?.suggestions;
            setError(suggestions ? `${msg}\n\nSaran:\n• ${suggestions.join('\n• ')}` : msg);
        } finally {
            clearInterval(interval);
            setLoadStep(LOADING_STEPS.length - 1);
            setTimeout(() => setLoading(false), 400);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        setSaving(true);
        try {
            await api.post('/recommendations/save', {
                mealPlan:     result.mealPlan,
                totalCost:    result.totalCost,
                budget:       result.budget,
                startDate:    new Date().toISOString().split('T')[0],
                shoppingList: result.shoppingList,
            });
            setSaved(true);
        } catch {
            alert('Gagal menyimpan rencana makan. Silakan coba lagi.');
        } finally { setSaving(false); }
    };

    const slots  = ['BREAKFAST', 'LUNCH', 'DINNER'];
    const nt     = result?.nutritionTarget || {};
    const na     = result?.nutrition       || {};
    const selMode = MODES.find(m => m.id === mode);

    return (
        <Layout
            title="Buat Rencana Makan"
            subtitle="Pilih mode yang sesuai, kami yang urus sisanya"
        >
            {/* ── Anggaran Banner ── */}
            <div style={{ marginBottom: 20 }}>
                {budget ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', gap: 12, flexWrap: 'wrap',
                        background: 'var(--success-bg)', border: '1px solid var(--success-border)',
                        borderRadius: 'var(--r-md)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>💳</span>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Anggaran Aktif
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)' }}>
                                    {fmt(budget.amount)}
                                    <span style={{ fontWeight: 400, color: 'var(--tx-3)', fontSize: 12 }}> untuk {budget.days} hari · {budget.period}</span>
                                </div>
                            </div>
                        </div>
                        <span style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 600 }}>✓ Siap digunakan</span>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px',
                        background: 'var(--warning-bg)', border: '1px solid var(--warning-border)',
                        borderRadius: 'var(--r-md)',
                    }}>
                        <AlertTriangle size={16} color="var(--warning)" strokeWidth={2.5} />
                        <span style={{ fontSize: 13, color: 'var(--tx-2)' }}>
                            Belum ada anggaran.{' '}
                            <a href="/budget" style={{ fontWeight: 700, color: 'var(--warning)', textDecoration: 'underline' }}>
                                Atur anggaran terlebih dahulu
                            </a>
                        </span>
                    </div>
                )}
            </div>

            {/* ── Step 1: Pilih Mode ── */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">
                            <Sparkles size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                            Pilih Mode Perencanaan
                        </div>
                        <div className="card-subtitle">Apa yang paling penting buat keluargamu saat ini?</div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="mode-grid">
                        {MODES.map(m => (
                            <ModeCard key={m.id} mode={m} selected={mode} onClick={setMode} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Step 2: Pilih Durasi ── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">
                            <Clock size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                            Berapa Lama?
                        </div>
                        <div className="card-subtitle">Pilih periode perencanaan makan</div>
                    </div>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                        {[
                            { d: 3,  label: '3 hari',  sub: 'Akhir pekan' },
                            { d: 5,  label: '5 hari',  sub: 'Hari kerja' },
                            { d: 7,  label: '1 minggu', sub: 'Populer ⭐' },
                            { d: 10, label: '10 hari',  sub: '' },
                            { d: 14, label: '2 minggu', sub: 'Terhemat' },
                        ].map(({ d, label, sub }) => (
                            <button
                                key={d} type="button"
                                onClick={() => setDays(d)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    padding: '10px 16px', borderRadius: 'var(--r-sm)',
                                    border: `2px solid ${days === d ? 'var(--primary)' : 'var(--border-color)'}`,
                                    background: days === d ? 'var(--primary-light)' : 'var(--bg-surface)',
                                    cursor: 'pointer', minWidth: 80, transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{ fontWeight: 700, fontSize: 14, color: days === d ? 'var(--primary)' : 'var(--tx-1)' }}>
                                    {label}
                                </span>
                                {sub && (
                                    <span style={{ fontSize: 10, color: days === d ? 'var(--primary)' : 'var(--tx-3)', marginTop: 2 }}>
                                        {sub}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleGenerate}
                            disabled={loading || !budget}
                            style={{
                                justifyContent: 'center', minWidth: 220,
                                background: loading ? 'var(--primary-mid)' : selMode?.color || 'var(--primary)',
                                borderColor: loading ? 'var(--primary-mid)' : selMode?.color || 'var(--primary)',
                            }}
                        >
                            {loading ? (
                                <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Sedang memproses...</>
                            ) : (
                                <><Sparkles size={17} /> Buat Rencana {selMode?.title}</>
                            )}
                        </button>
                        {result && !loading && (
                            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                                ✓ Hasil sebelumnya masih tersedia di bawah
                            </span>
                        )}
                    </div>

                    {/* Loading Progress */}
                    {loading && (
                        <div style={{
                            marginTop: 20, padding: '18px 20px',
                            background: selMode?.bg || 'var(--primary-light)',
                            borderRadius: 'var(--r-md)',
                            border: `1px solid ${selMode?.border || 'var(--primary-soft)'}`,
                        }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: selMode?.color || 'var(--primary)', marginBottom: 14 }}>
                                🍽️ Sedang menyusun rencana terbaik untuk keluargamu…
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {LOADING_STEPS.map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        opacity: i <= loadStep ? 1 : 0.35,
                                        transition: 'opacity 0.4s ease',
                                    }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: i < loadStep ? 'var(--success)' : i === loadStep ? selMode?.color : 'var(--bg-hover)',
                                            transition: 'background 0.3s ease',
                                        }}>
                                            {i < loadStep ? (
                                                <Check size={12} color="#fff" strokeWidth={3} />
                                            ) : i === loadStep ? (
                                                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                                            ) : (
                                                <span style={{ fontSize: 10 }}>{step.icon}</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: i === loadStep ? 600 : 400,
                                            color: i < loadStep ? 'var(--success)' : i === loadStep ? 'var(--tx-1)' : 'var(--tx-3)' }}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="alert alert-danger" style={{ marginTop: 14, whiteSpace: 'pre-line' }}>
                            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: 3 }}>Gagal membuat rencana makan</strong>
                                <span style={{ fontSize: 12.5 }}>{error}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── HASIL ── */}
            {result && (
                <div>
                    {/* Summary bar */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20,
                    }}>
                        {[
                            {
                                emoji: '💰', label: 'Total Biaya Estimasi',
                                value: fmt(result.totalCost),
                                sub: `Sisa anggaran: ${fmt(result.budgetRemaining)}`,
                                color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)',
                            },
                            {
                                emoji: '✅', label: 'Status Rencana',
                                value: result.status === 'OPTIMAL' ? 'Rencana Optimal' : 'Rencana Layak',
                                sub: result.validationPassed ? 'Semua kebutuhan terpenuhi' : 'Ada beberapa catatan',
                                color: result.validationPassed ? 'var(--info)' : 'var(--warning)',
                                bg: result.validationPassed ? 'var(--info-bg)' : 'var(--warning-bg)',
                                border: result.validationPassed ? 'var(--info-border)' : 'var(--warning-border)',
                            },
                            {
                                emoji: '🍽️', label: 'Total Menu Unik',
                                value: `${result.candidateCount} resep`,
                                sub: `Diproses dalam ${result.performance?.totalTime || 0}ms`,
                                color: 'var(--tx-2)', bg: 'var(--bg-muted)', border: 'var(--border-color)',
                            },
                        ].map(s => (
                            <div key={s.label} style={{
                                padding: '16px 18px', borderRadius: 'var(--r-md)',
                                background: s.bg, border: `1px solid ${s.border}`,
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                                    {s.emoji} {s.label}
                                </div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.4px', marginBottom: 3 }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Jadwal Menu */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-header">
                            <div>
                                <div className="card-title">📅 Jadwal Menu {days} Hari</div>
                                <div className="card-subtitle">Klik setiap hari untuk melihat detail menu</div>
                            </div>
                            <span className="badge badge-primary">{selMode?.title}</span>
                        </div>
                        <div className="card-body" style={{ padding: '16px 20px' }}>
                            {result.mealPlan?.map(day => (
                                <DayRow key={day.day} day={day} slots={slots} />
                            ))}
                        </div>
                    </div>

                    {/* Ringkasan Nutrisi */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    <BarChart2 size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                    Ringkasan Nutrisi
                                </div>
                                <div className="card-subtitle">Total nutrisi seluruh periode vs. kebutuhan keluarga</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div style={{ maxWidth: 560 }}>
                                <NutritionBar label="Kalori"      actual={na.total_calories} target={nt.calories * days} unit=" kkal" color="var(--danger)" />
                                <NutritionBar label="Protein"     actual={na.total_protein}  target={nt.protein  * days} unit="g"     color="var(--info)" />
                                <NutritionBar label="Lemak"       actual={na.total_fat}       target={nt.fat      * days} unit="g"     color="var(--warning)" />
                                <NutritionBar label="Karbohidrat" actual={na.total_carbs}     target={nt.carbs    * days} unit="g"     color="var(--success)" />
                            </div>
                            {!nt.calories && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--tx-3)', marginTop: 4 }}>
                                    <Info size={13} />
                                    Target nutrisi belum tersedia. Tambahkan anggota keluarga untuk kalkulasi otomatis.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Daftar Belanja */}
                    {result.shoppingList?.length > 0 && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-header">
                                <div>
                                    <div className="card-title">
                                        <ShoppingCart size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                        Daftar Belanja
                                    </div>
                                    <div className="card-subtitle">
                                        {result.shoppingList.length} item perlu dibeli · Total: {fmt(result.shoppingList.reduce((s, i) => s + i.estimated_cost, 0))}
                                    </div>
                                </div>
                            </div>
                            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Bahan Makanan</th>
                                            <th style={{ textAlign: 'right' }}>Perlu Beli</th>
                                            <th style={{ textAlign: 'right' }}>Stok Ada</th>
                                            <th style={{ textAlign: 'right' }}>Estimasi Biaya</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.shoppingList.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 600 }}>{item.ingredient_name}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--tx-1)' }}>
                                                    {fmtNum(item.to_buy, 1)} {item.unit}
                                                </td>
                                                <td style={{ textAlign: 'right', color: 'var(--tx-3)' }}>
                                                    {fmtNum(item.stock, 1)} {item.unit}
                                                </td>
                                                <td style={{ textAlign: 'right', color: 'var(--tx-2)', fontWeight: 600 }}>
                                                    {fmt(item.estimated_cost)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} style={{ fontWeight: 700, textAlign: 'right', color: 'var(--tx-2)' }}>Total Belanja:</td>
                                            <td style={{ fontWeight: 800, textAlign: 'right', color: 'var(--tx-1)', fontSize: 15 }}>
                                                {fmt(result.shoppingList.reduce((s, i) => s + i.estimated_cost, 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Penjelasan Sistem (jika ada) */}
                    {result.explanation && (
                        <div style={{
                            padding: '14px 18px', marginBottom: 16,
                            background: 'var(--bg-muted)', borderRadius: 'var(--r-sm)',
                            border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                                💡 Catatan Sistem
                            </div>
                            <p style={{ fontSize: 12.5, color: 'var(--tx-2)', lineHeight: 1.7, margin: 0 }}>
                                {result.explanation}
                            </p>
                        </div>
                    )}

                    {/* Simpan */}
                    {!saved ? (
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {saving
                                ? <><span className="spinner" /> Menyimpan jadwal…</>
                                : <><Check size={18} /> Simpan Sebagai Jadwal Aktif</>
                            }
                        </button>
                    ) : (
                        <div className="alert alert-success">
                            <Check size={16} style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: 2 }}>Jadwal berhasil disimpan! 🎉</strong>
                                Rencana makan sudah aktif. Lihat di menu <a href="/meal-plans" style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>Jadwal Makan</a>.
                            </div>
                        </div>
                    )}
                </div>
            )}


        </Layout>
    );
};

export default Recommendation;
