import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import {
    Wallet, Package, CalendarDays, ChefHat,
    AlertTriangle, ArrowRight, ShoppingCart,
    Lightbulb, Clock, Utensils, TrendingDown,
    Coffee, Sun, Moon, Cookie, Activity, BarChart3,
    History, Check, Users, Plus, Heart, ShieldAlert,
    Pencil, SlidersHorizontal, X, CircleDot, Info,
    CheckCircle2, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

const SLOT_LABEL = {
    BREAKFAST: 'Sarapan',
    LUNCH:     'Makan Siang',
    DINNER:    'Makan Malam',
    SNACK:     'Camilan',
};

const SLOT_ICON = {
    BREAKFAST: Coffee,
    LUNCH:     Sun,
    DINNER:    Moon,
    SNACK:     Cookie,
};

const ACTIVITY_LABELS = {
    SEDENTARY:         'Tidak Aktif',
    LIGHTLY_ACTIVE:    'Sedikit Aktif',
    MODERATELY_ACTIVE: 'Cukup Aktif',
    VERY_ACTIVE:       'Sangat Aktif',
    EXTRA_ACTIVE:      'Ekstra Aktif',
};

const PERIODS = [
    { value: 'DAILY',   label: 'Harian (1 hari)',   days: 1  },
    { value: 'WEEKLY',  label: 'Mingguan (7 hari)', days: 7  },
    { value: 'MONTHLY', label: 'Bulanan (30 hari)', days: 30 },
];

/* ── Skeleton ── */
const Sk = ({ h = 16, w = '100%', r = 6 }) => (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
);

/* ── Today's Meal Row ── */
const MealRow = ({ meal }) => {
    const SlotIcon = SLOT_ICON[meal.meal_slot] || Utensils;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid var(--border-color)',
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <SlotIcon size={16} color="var(--primary)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 'var(--text-xs)', fontWeight: 700,
                    color: 'var(--tx-4)', textTransform: 'uppercase',
                    letterSpacing: '0.5px', marginBottom: 2,
                }}>
                    {SLOT_LABEL[meal.meal_slot] || meal.meal_slot}
                </div>
                <div style={{
                    fontSize: 'var(--text-sm)', fontWeight: 600,
                    color: 'var(--tx-1)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {meal.recipe_name}
                </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-1)' }}>
                    {Math.round(meal.total_calories || 0)} kkal
                </div>
            </div>
        </div>
    );
};

/* ── Low Stock Item ── */
const LowStockItem = ({ item }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px',
        borderRadius: 'var(--r-sm)',
        background: 'var(--warning-bg)',
        border: '1px solid var(--warning-border)',
        marginBottom: 6,
    }}>
        <AlertTriangle size={14} color="var(--warning)" strokeWidth={2.5} />
        <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--tx-1)' }}>
            {item.ingredient_name}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)' }}>
            {item.quantity} {item.unit}
        </span>
    </div>
);

/* ── Main Dashboard ── */
const Dashboard = () => {
    const { user }              = useAuth();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Modals State ──
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showPrefModal, setShowPrefModal]     = useState(false);

    // ── Form States ──
    const [familyForm, setFamilyForm] = useState({
        name: '', age: '', gender: 'MALE', weight: '', height: '', activity_level: 'MODERATELY_ACTIVE',
    });
    const [budgetForm, setBudgetForm] = useState({ amount: '', period: 'WEEKLY', days: 7 });
    const [prefForm, setPrefForm]     = useState({ ingredient_id: '', preference_type: 'AVOID' });

    const [ingredientsList, setIngredientsList] = useState([]);
    const [savingModal, setSavingModal]         = useState(false);
    const [modalError, setModalError]           = useState('');

    const loadDashboard = useCallback(() => {
        setLoading(true);
        api.get('/dashboard')
            .then(r => {
                setData(r.data.data);
                if (r.data.data?.budget) {
                    const b = r.data.data.budget;
                    setBudgetForm({ amount: b.amount, period: b.period, days: b.days });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // Lazy load ingredients when preference modal opens
    useEffect(() => {
        if (showPrefModal && ingredientsList.length === 0) {
            api.get('/ingredients')
                .then(r => setIngredientsList(r.data.data || []))
                .catch(() => {});
        }
    }, [showPrefModal, ingredientsList.length]);

    // ── Family Actions ──
    const handleSaveFamily = async (e) => {
        e.preventDefault();
        setSavingModal(true);
        setModalError('');
        try {
            await api.post('/family-members', familyForm);
            setShowFamilyModal(false);
            setFamilyForm({ name: '', age: '', gender: 'MALE', weight: '', height: '', activity_level: 'MODERATELY_ACTIVE' });
            loadDashboard();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Gagal menambahkan anggota keluarga.');
        } finally {
            setSavingModal(false);
        }
    };

    // ── Budget Actions ──
    const handleSaveBudget = async (e) => {
        e.preventDefault();
        if (!budgetForm.amount || budgetForm.amount <= 0) {
            return setModalError('Masukkan jumlah anggaran yang valid.');
        }
        setSavingModal(true);
        setModalError('');
        try {
            await api.post('/budgets', budgetForm);
            setShowBudgetModal(false);
            loadDashboard();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Gagal menyimpan anggaran makan.');
        } finally {
            setSavingModal(false);
        }
    };

    // ── Preference Actions ──
    const handleSavePref = async (e) => {
        e.preventDefault();
        if (!prefForm.ingredient_id) {
            return setModalError('Pilih bahan terlebih dahulu.');
        }
        setSavingModal(true);
        setModalError('');
        try {
            await api.post('/preferences', prefForm);
            setShowPrefModal(false);
            setPrefForm({ ingredient_id: '', preference_type: 'AVOID' });
            loadDashboard();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Gagal menyimpan preferensi.');
        } finally {
            setSavingModal(false);
        }
    };

    const handleDeletePref = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.delete(`/preferences/${id}`);
            loadDashboard();
        } catch (err) {
            console.error('Failed to remove preference', err);
        }
    };

    // ── Calculations ──
    const budget      = data?.budget;
    const usedCost    = data?.recent_plan?.estimated_cost || 0;
    const budgetAmt   = budget?.amount || 0;
    const pct         = budgetAmt ? Math.min((usedCost / budgetAmt) * 100, 100) : 0;
    const remaining   = Math.max(0, budgetAmt - usedCost);
    const budgetDays  = budget?.days || 7;
    const perDay      = budgetDays > 0 ? Math.round(budgetAmt / budgetDays) : 0;
    const perMeal     = budgetDays > 0 ? Math.round(budgetAmt / budgetDays / 3) : 0;

    const familyMembers       = data?.family_members || [];
    const totalFamilyCalories = familyMembers.reduce((s, m) => s + Number(m.daily_calories_target || 0), 0);
    const totalFamilyProtein  = familyMembers.reduce((s, m) => s + Number(m.daily_protein_target || 0), 0);
    const totalFamilyFat      = familyMembers.reduce((s, m) => s + Number(m.daily_fat_target || 0), 0);
    const totalFamilyCarbs    = familyMembers.reduce((s, m) => s + Number(m.daily_carbs_target || 0), 0);

    const preferences   = data?.preferences || [];
    const avoidPrefs    = preferences.filter(p => p.preference_type === 'AVOID');
    const favoritePrefs = preferences.filter(p => p.preference_type === 'FAVORITE');

    const firstName   = user?.name ? user.name.split(' ')[0] : 'Keluarga';
    const hour        = new Date().getHours();
    const greeting    = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';

    const todayMeals  = data?.upcoming_meals?.filter(m => {
        const mealDate = new Date(m.day_date);
        const today    = new Date();
        return mealDate.toDateString() === today.toDateString();
    }) || [];

    const hasActivePlan = (data?.active_plans || 0) > 0;

    // ── Onboarding / Setup Steps State ──
    const [guideCollapsed, setGuideCollapsed] = useState(() => {
        try {
            return localStorage.getItem('mealplanner_guide_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const toggleGuideCollapse = () => {
        setGuideCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('mealplanner_guide_collapsed', String(next));
            } catch (e) {}
            return next;
        });
    };

    const hasFamily     = familyMembers.length > 0;
    const hasBudget     = Boolean(budget && Number(budget.amount) > 0);
    const hasInventory  = (data?.total_inventory || 0) > 0;
    const hasPlan       = hasActivePlan;

    const setupSteps = [
        {
            num: 1,
            title: '1. Profil Keluarga',
            desc: 'Daftarkan anggota keluarga untuk kalkulasi porsi makan & target gizi harian (AKG) otomatis.',
            done: hasFamily,
            doneText: `${familyMembers.length} Orang Terdaftar`,
            actionLabel: '+ Tambah Anggota',
            onAction: () => { setShowFamilyModal(true); setModalError(''); },
        },
        {
            num: 2,
            title: '2. Plafon Anggaran',
            desc: 'Tentukan batas budget makan (mingguan/bulanan) agar biaya belanja dapur selalu terkendali.',
            done: hasBudget,
            doneText: budget ? `${fmt(budgetAmt)} / ${budget.days} hari` : 'Selesai',
            actionLabel: budget ? 'Ubah Budget' : 'Atur Anggaran',
            onAction: () => { setShowBudgetModal(true); setModalError(''); },
        },
        {
            num: 3,
            title: '3. Stok Dapur Anda',
            desc: 'Catat bahan yang sudah ada di rumah agar sistem memotongnya dari daftar belanja pasar.',
            done: hasInventory,
            doneText: `${data?.total_inventory || 0} Bahan di Dapur`,
            actionLabel: 'Kelola Stok Dapur',
            link: '/inventory',
        },
        {
            num: 4,
            title: '4. Rancang Menu Pertama',
            desc: 'Sistem pintar meracik jadwal menu sarapan, siang, malam & daftar belanja pasar otomatis!',
            done: hasPlan,
            doneText: `${data?.active_plans || 1} Rencana Menu Aktif`,
            actionLabel: 'Rancang Menu Sekarang',
            link: '/recommendation',
            isMain: true,
        },
    ];

    const completedStepsCount = setupSteps.filter(s => s.done).length;
    const isAllSetupComplete  = completedStepsCount === 4;
    const setupProgressPct    = Math.round((completedStepsCount / 4) * 100);

    return (
        <Layout
            title={`${greeting}, ${firstName}`}
            subtitle="Pusat kendali harian keluarga: profil gizi, batas anggaran, pantangan makanan, dan jadwal menu"
        >
            {/* ── Quick Actions ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12, marginBottom: 20,
            }} className="quickaction-grid">
                <Link
                    to="/recommendation"
                    data-tour="quick-meal-plan"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 20px',
                        background: 'var(--primary)', color: '#fff',
                        borderRadius: 'var(--r-md)',
                        textDecoration: 'none', fontWeight: 700, fontSize: 14,
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'background var(--t-fast), box-shadow var(--t-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-mid)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                    <div style={{
                        width: 40, height: 40, borderRadius: 'var(--r-sm)',
                        background: 'rgba(255,255,255,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Lightbulb size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <div>Rancang Menu Pintar</div>
                        <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.75, marginTop: 1 }}>Otomatis bergizi seimbang & hemat anggaran</div>
                    </div>
                </Link>

                <Link
                    to="/shopping"
                    data-tour="quick-shopping"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 20px',
                        background: 'var(--bg-surface)', color: 'var(--tx-1)',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: 'var(--r-md)',
                        textDecoration: 'none', fontWeight: 700, fontSize: 14,
                        transition: 'background var(--t-fast), border-color var(--t-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                    <div style={{
                        width: 40, height: 40, borderRadius: 'var(--r-sm)',
                        background: 'var(--bg-muted)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <ShoppingCart size={20} strokeWidth={2} color="var(--tx-2)" />
                    </div>
                    <div>
                        <div>Daftar Belanja Otomatis</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--tx-3)', marginTop: 1 }}>Kebutuhan resep dikurangi stok dapur</div>
                    </div>
                </Link>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                ── PANDUAN LANGKAH AWAL (Getting Started Roadmap for New Users) ──
               ══════════════════════════════════════════════════════════════ */}
            <div className="card" style={{
                marginBottom: 26,
                background: isAllSetupComplete
                    ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, var(--bg-surface) 100%)'
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, var(--bg-surface) 100%)',
                border: `1.5px solid ${isAllSetupComplete ? 'rgba(22, 163, 74, 0.25)' : 'rgba(37, 99, 235, 0.2)'}`,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                    borderBottom: guideCollapsed ? 'none' : '1px solid var(--border-color)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: isAllSetupComplete ? '#f0fdf4' : '#eff6ff',
                            border: `1.5px solid ${isAllSetupComplete ? '#bbf7d0' : '#bfdbfe'}`,
                            color: isAllSetupComplete ? '#16a34a' : '#2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {isAllSetupComplete ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <Sparkles size={20} strokeWidth={2.2} />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--tx-1)', margin: 0, letterSpacing: '-0.2px' }}>
                                    {isAllSetupComplete ? 'Pengaturan Dapur Lengkap & Siap Pakai!' : 'Langkah Mudah Memulai (4 Langkah Dapur Sehat & Hemat)'}
                                </h2>
                                <span style={{
                                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                    background: isAllSetupComplete ? '#f0fdf4' : '#eff6ff',
                                    color: isAllSetupComplete ? '#16a34a' : '#2563eb',
                                    border: `1px solid ${isAllSetupComplete ? '#bbf7d0' : '#bfdbfe'}`,
                                }}>
                                    {isAllSetupComplete ? '100% Selesai' : `${completedStepsCount}/4 Selesai (${setupProgressPct}%)`}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--tx-3)', margin: '2px 0 0 0' }}>
                                {isAllSetupComplete
                                    ? 'Seluruh data profil, anggaran, stok, dan jadwal telah terhubung otomatis. Anda siap belanja dan memasak!'
                                    : 'Ikuti langkah berurutan di bawah ini agar asisten MealPlanner dapat meracik menu yang paling akurat untuk keluarga Anda.'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={toggleGuideCollapse}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: 12, gap: 5, padding: '6px 12px' }}
                    >
                        {guideCollapsed ? (
                            <><ChevronDown size={14} /> Buka Panduan</>
                        ) : (
                            <><ChevronUp size={14} /> Sembunyikan</>
                        )}
                    </button>
                </div>

                {/* Body (when expanded) */}
                {!guideCollapsed && (
                    <div style={{ padding: '18px 20px 20px 20px' }}>
                        {/* Progress Bar */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{
                                width: '100%', height: 7, borderRadius: 999,
                                background: 'var(--bg-muted)', overflow: 'hidden',
                                border: '1px solid var(--border-color)',
                            }}>
                                <div style={{
                                    width: `${setupProgressPct}%`, height: '100%',
                                    background: isAllSetupComplete
                                        ? 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)'
                                        : 'linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)',
                                    borderRadius: 999,
                                    transition: 'width 0.4s ease',
                                }} />
                            </div>
                        </div>

                        {/* 4 Steps Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                            gap: 12,
                        }}>
                            {setupSteps.map((step) => {
                                return (
                                    <div
                                        key={step.num}
                                        style={{
                                            padding: 14,
                                            borderRadius: 'var(--r-md)',
                                            background: step.done ? 'var(--bg-surface)' : 'var(--bg-muted)',
                                            border: `1.5px solid ${step.done ? 'rgba(22, 163, 74, 0.3)' : 'var(--border-color)'}`,
                                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                            position: 'relative',
                                            transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: '50%',
                                                    background: step.done ? '#16a34a' : 'var(--bg-surface)',
                                                    border: `1.5px solid ${step.done ? '#16a34a' : 'var(--border-color)'}`,
                                                    color: step.done ? '#fff' : 'var(--tx-3)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 800, flexShrink: 0,
                                                }}>
                                                    {step.done ? <Check size={14} strokeWidth={3} /> : step.num}
                                                </div>
                                                {step.done ? (
                                                    <span style={{
                                                        fontSize: 10.5, fontWeight: 700, color: '#16a34a',
                                                        background: '#f0fdf4', padding: '2px 8px', borderRadius: 20,
                                                        border: '1px solid #bbf7d0',
                                                    }}>
                                                        ✓ Selesai
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        fontSize: 10.5, fontWeight: 700, color: 'var(--tx-3)',
                                                        background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 20,
                                                        border: '1px solid var(--border-color)',
                                                    }}>
                                                        Perlu Diatur
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 4 }}>
                                                {step.title}
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)', lineHeight: 1.45, marginBottom: 12 }}>
                                                {step.desc}
                                            </div>
                                        </div>

                                        <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                                            {step.done ? (
                                                <div style={{
                                                    fontSize: 11, fontWeight: 600, color: 'var(--tx-2)',
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                }}>
                                                    <CheckCircle2 size={12} color="#16a34a" /> {step.doneText}
                                                </div>
                                            ) : step.onAction ? (
                                                <button
                                                    type="button"
                                                    onClick={step.onAction}
                                                    className="btn btn-outline btn-sm"
                                                    style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, fontWeight: 700 }}
                                                >
                                                    {step.actionLabel}
                                                </button>
                                            ) : (
                                                <Link
                                                    to={step.link}
                                                    className={step.isMain ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                                                    style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}
                                                >
                                                    {step.actionLabel} <ArrowRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                ── PUSAT DATA KELUARGA (Family Hub: Anggota, Anggaran, Preferensi) ──
               ══════════════════════════════════════════════════════════════ */}
            <section style={{ marginBottom: 28 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 12, flexWrap: 'wrap', gap: 8,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: 'var(--primary-light, #ebf2eb)',
                            border: '1px solid var(--border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Users size={14} color="var(--primary)" strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 style={{
                                fontSize: 15, fontWeight: 700, color: 'var(--tx-1)',
                                letterSpacing: '-0.2px', margin: 0,
                            }}>
                                Profil, Anggaran & Pantangan Keluarga
                            </h2>
                            <span style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>
                                Tiga pondasi utama peracikan menu: jumlah anggota, plafon uang belanja, dan alergi makanan
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                    gap: 16,
                }}>
                    {/* ── CARD 1: ANGGOTA KELUARGA ── */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ paddingBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="card-title">Anggota Keluarga</div>
                                    <span className="badge badge-primary" style={{ fontSize: 10.5 }}>
                                        {familyMembers.length} Orang
                                    </span>
                                </div>
                                <div className="card-subtitle">Target kalori & gizi harian (AKG)</div>
                            </div>
                            <Link
                                to="/family"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 11.5, fontWeight: 600, color: 'var(--primary)',
                                    textDecoration: 'none',
                                }}
                            >
                                Kelola <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <Sk h={32} r={6} />
                                    <Sk h={45} r={8} />
                                    <Sk h={45} r={8} />
                                </div>
                            ) : familyMembers.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                                    {/* Aggregate Nutrition Badge */}
                                    <div style={{
                                        padding: '10px 12px',
                                        background: 'var(--bg-muted)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8,
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        flexWrap: 'wrap', gap: 6,
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                Total Target Gizi
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                                                {Math.round(totalFamilyCalories).toLocaleString('id-ID')} kkal/hari
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 10.5, color: 'var(--tx-3)', textAlign: 'right' }}>
                                            <div>Prot: <strong>{Math.round(totalFamilyProtein)}g</strong></div>
                                            <div>Lemak: <strong>{Math.round(totalFamilyFat)}g</strong></div>
                                        </div>
                                    </div>

                                    {/* Member Items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {familyMembers.slice(0, 3).map((m) => {
                                            const isMale = m.gender === 'MALE';
                                            return (
                                                <div key={m.id} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '8px 10px',
                                                    background: 'var(--bg-surface)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 8,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: isMale ? '#eff6ff' : '#fdf2f8',
                                                            border: `1.5px solid ${isMale ? '#bfdbfe' : '#fbcfe8'}`,
                                                            color: isMale ? '#1d4ed8' : '#be185d',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: 12, flexShrink: 0,
                                                        }}>
                                                            {m.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{
                                                                fontSize: 12.5, fontWeight: 600, color: 'var(--tx-1)',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {m.name}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>
                                                                {m.age} th · {m.weight}kg · {ACTIVITY_LABELS[m.activity_level] || m.activity_level}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: 11.5, fontWeight: 700, color: 'var(--tx-2)',
                                                        textAlign: 'right', flexShrink: 0,
                                                    }}>
                                                        {Math.round(m.daily_calories_target || 0)} kkal
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {familyMembers.length > 3 && (
                                            <div style={{ fontSize: 11, color: 'var(--tx-3)', textAlign: 'center', padding: '2px 0' }}>
                                                +{familyMembers.length - 3} anggota keluarga lainnya
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '24px 0', flex: 1 }}>
                                    <div className="empty-icon"><Users size={16} /></div>
                                    <h3 style={{ fontSize: 13 }}>Belum Ada Profil Keluarga</h3>
                                    <p style={{ fontSize: 11.5 }}>Daftarkan profil keluarga untuk perhitungan AKG otomatis.</p>
                                </div>
                            )}

                            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowFamilyModal(true); setModalError(''); }}
                                    className="btn btn-outline btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12 }}
                                >
                                    <Plus size={13} /> Tambah Anggota
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 2: ANGGARAN MAKAN ── */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ paddingBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="card-title">Anggaran Makan</div>
                                    <span className="badge badge-green" style={{ fontSize: 10.5 }}>
                                        {budget ? `${budget.days} hari` : 'Belum Diatur'}
                                    </span>
                                </div>
                                <div className="card-subtitle">Plafon biaya belanja & masak</div>
                            </div>
                            <Link
                                to="/budget"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 11.5, fontWeight: 600, color: 'var(--primary)',
                                    textDecoration: 'none',
                                }}
                            >
                                Rincian <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <Sk h={32} w="60%" r={4} />
                                    <Sk h={6} r={999} />
                                    <Sk h={30} r={6} />
                                </div>
                            ) : budget ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                    <div>
                                        <div style={{
                                            fontSize: 'var(--text-3xl)', fontWeight: 800,
                                            color: 'var(--tx-1)', letterSpacing: '-0.8px',
                                            lineHeight: 1.1, marginBottom: 2,
                                        }}>
                                            {fmt(budgetAmt)}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>
                                            Plafon per periode {budget.period === 'MONTHLY' ? 'bulanan' : budget.period === 'DAILY' ? 'harian' : 'mingguan'}
                                        </div>
                                    </div>

                                    {/* Progress track */}
                                    <div>
                                        <div className="progress-track" style={{ marginBottom: 6 }}>
                                            <div
                                                className={`progress-fill ${pct > 90 ? 'red' : pct > 70 ? 'amber' : 'primary'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                            <span style={{ color: 'var(--tx-3)' }}>
                                                Terpakai: <strong style={{ color: 'var(--tx-1)' }}>{fmt(usedCost)}</strong>
                                            </span>
                                            <span style={{ color: pct > 90 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                                                Sisa {fmt(remaining)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Breakdown Mini-Grid */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                                        padding: '10px 12px', background: 'var(--bg-muted)',
                                        borderRadius: 8, border: '1px solid var(--border-color)',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 10, color: 'var(--tx-3)', textTransform: 'uppercase', fontWeight: 700 }}>
                                                Alokasi Harian
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)', marginTop: 2 }}>
                                                {fmt(perDay)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, color: 'var(--tx-3)', textTransform: 'uppercase', fontWeight: 700 }}>
                                                Per Porsi Makan
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)', marginTop: 2 }}>
                                                {fmt(perMeal)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '24px 0', flex: 1 }}>
                                    <div className="empty-icon"><Wallet size={16} /></div>
                                    <h3 style={{ fontSize: 13 }}>Belum Ada Anggaran</h3>
                                    <p style={{ fontSize: 11.5 }}>Tentukan plafon anggaran belanja makan keluarga Anda.</p>
                                </div>
                            )}

                            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowBudgetModal(true); setModalError(''); }}
                                    className="btn btn-outline btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12 }}
                                >
                                    <Pencil size={12} /> {budget ? 'Ubah Batas Anggaran' : 'Atur Anggaran Sekarang'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 3: PREFERENSI & PANTANGAN ── */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ paddingBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="card-title">Preferensi & Alergi</div>
                                    <span className="badge badge-amber" style={{ fontSize: 10.5 }}>
                                        {avoidPrefs.length} Alergi · {favoritePrefs.length} Favorit
                                    </span>
                                </div>
                                <div className="card-subtitle">Penyaringan alergen & resep otomatis</div>
                            </div>
                            <Link
                                to="/preferences"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 11.5, fontWeight: 600, color: 'var(--primary)',
                                    textDecoration: 'none',
                                }}
                            >
                                Kelola <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <Sk h={24} w="80%" r={4} />
                                    <Sk h={24} w="60%" r={4} />
                                    <Sk h={24} w="70%" r={4} />
                                </div>
                            ) : preferences.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                    {/* Alergi & Pantangan Chips */}
                                    <div>
                                        <div style={{
                                            fontSize: 11, fontWeight: 700, color: 'var(--danger)',
                                            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6,
                                            textTransform: 'uppercase', letterSpacing: '0.4px',
                                        }}>
                                            <ShieldAlert size={12} /> Pantangan & Alergen ({avoidPrefs.length})
                                        </div>
                                        {avoidPrefs.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {avoidPrefs.slice(0, 4).map((p) => (
                                                    <span
                                                        key={p.id}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                                            padding: '3px 8px', borderRadius: 6,
                                                            background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                                                            color: 'var(--danger)', fontSize: 11.5, fontWeight: 600,
                                                        }}
                                                    >
                                                        {p.ingredient_name}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeletePref(p.id, e)}
                                                            title="Hapus pantangan"
                                                            style={{
                                                                background: 'transparent', border: 'none', padding: 0,
                                                                cursor: 'pointer', color: 'var(--danger)', opacity: 0.7,
                                                                display: 'flex', alignItems: 'center',
                                                            }}
                                                        >
                                                            <X size={11} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {avoidPrefs.length > 4 && (
                                                    <span style={{ fontSize: 11, color: 'var(--tx-3)', alignSelf: 'center' }}>
                                                        +{avoidPrefs.length - 4} lagi
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)', fontStyle: 'italic' }}>
                                                Tidak ada pantangan alergi aktif
                                            </div>
                                        )}
                                    </div>

                                    {/* Makanan Favorit Chips */}
                                    <div>
                                        <div style={{
                                            fontSize: 11, fontWeight: 700, color: 'var(--success)',
                                            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6,
                                            textTransform: 'uppercase', letterSpacing: '0.4px',
                                        }}>
                                            <Heart size={12} /> Menu / Bahan Favorit ({favoritePrefs.length})
                                        </div>
                                        {favoritePrefs.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {favoritePrefs.slice(0, 4).map((p) => (
                                                    <span
                                                        key={p.id}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                                            padding: '3px 8px', borderRadius: 6,
                                                            background: 'var(--success-bg)', border: '1px solid var(--success-border)',
                                                            color: 'var(--success)', fontSize: 11.5, fontWeight: 600,
                                                        }}
                                                    >
                                                        {p.ingredient_name}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeletePref(p.id, e)}
                                                            title="Hapus favorit"
                                                            style={{
                                                                background: 'transparent', border: 'none', padding: 0,
                                                                cursor: 'pointer', color: 'var(--success)', opacity: 0.7,
                                                                display: 'flex', alignItems: 'center',
                                                            }}
                                                        >
                                                            <X size={11} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {favoritePrefs.length > 4 && (
                                                    <span style={{ fontSize: 11, color: 'var(--tx-3)', alignSelf: 'center' }}>
                                                        +{favoritePrefs.length - 4} lagi
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)', fontStyle: 'italic' }}>
                                                Belum ada bahan favorit yang ditandai
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '24px 0', flex: 1 }}>
                                    <div className="empty-icon"><ShieldAlert size={16} /></div>
                                    <h3 style={{ fontSize: 13 }}>Belum Ada Pantangan</h3>
                                    <p style={{ fontSize: 11.5 }}>Tambahkan riwayat alergi keluarga untuk keamanan rekomendasi menu.</p>
                                </div>
                            )}

                            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowPrefModal(true); setModalError(''); }}
                                    className="btn btn-outline btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12 }}
                                >
                                    <Plus size={13} /> Tambah Pantangan / Favorit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                ── MENU & STATUS DAPUR HARI INI ──
               ══════════════════════════════════════════════════════════════ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 340px',
                gap: 20, alignItems: 'start',
            }} className="dashboard-grid">

                {/* LEFT COLUMN: TODAY'S & UPCOMING MEALS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── Today's Plan ── */}
                    <div className="card" data-tour="today-menu">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Menu Hari Ini</div>
                                <div className="card-subtitle">
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                            </div>
                            {hasActivePlan && (
                                <Link to="/meal-plans" style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 'var(--text-xs)', fontWeight: 600,
                                    color: 'var(--primary)',
                                    textDecoration: 'none',
                                }}
                                >
                                    Lihat semua <ArrowRight size={12} />
                                </Link>
                            )}
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <Sk h={40} w={40} r={8} />
                                            <div style={{ flex: 1 }}>
                                                <Sk h={10} w="40%" r={4} />
                                                <div style={{ marginTop: 5 }}>
                                                    <Sk h={14} w="60%" r={4} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : todayMeals.length > 0 ? (
                                <div>
                                    {todayMeals.map((meal, i) => (
                                        <MealRow key={i} meal={meal} />
                                    ))}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        marginTop: 14, paddingTop: 10,
                                        fontSize: 'var(--text-xs)', color: 'var(--tx-3)',
                                    }}>
                                        <Utensils size={12} />
                                        Total hari ini: {todayMeals.reduce((s, m) => s + (m.total_calories || 0), 0).toFixed(0)} kkal
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '32px 0' }}>
                                    <div className="empty-icon">
                                        <CalendarDays size={18} />
                                    </div>
                                    <h3>Belum ada jadwal hari ini</h3>
                                    <p>Buat meal plan baru untuk mendapatkan menu yang terencana dan sesuai anggaran.</p>
                                    <Link to="/recommendation" className="btn btn-primary" style={{ marginTop: 12 }}>
                                        <Lightbulb size={15} />
                                        Buat Sekarang
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Upcoming Meals (next few days) ── */}
                    {!loading && data?.upcoming_meals?.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Menu Mendatang</div>
                                    <div className="card-subtitle">Jadwal beberapa hari ke depan</div>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: '0 22px' }}>
                                {data.upcoming_meals.slice(0, 6).map((meal, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '11px 0',
                                        borderBottom: i < 5 ? '1px solid var(--border-color)' : 'none',
                                    }}>
                                        <div style={{
                                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                            letterSpacing: '0.5px', color: 'var(--tx-4)',
                                            width: 70, flexShrink: 0,
                                        }}>
                                            {new Date(meal.day_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}
                                        </div>
                                        <div style={{
                                            fontSize: 10, color: 'var(--tx-3)', width: 60,
                                            flexShrink: 0, fontWeight: 500,
                                        }}>
                                            {meal.meal_slot === 'BREAKFAST' ? 'Sarapan' :
                                             meal.meal_slot === 'LUNCH' ? 'Siang' :
                                             meal.meal_slot === 'DINNER' ? 'Malam' : 'Camilan'}
                                        </div>
                                        <div style={{
                                            flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600,
                                            color: 'var(--tx-1)', overflow: 'hidden',
                                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {meal.recipe_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--tx-3)', flexShrink: 0 }}>
                                            {Math.round(meal.total_calories || 0)} kkal
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: STOK & INVENTARIS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* ── Stats mini-grid ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { icon: Package, label: 'Stok Bahan', value: loading ? '—' : (data?.total_inventory || 0), sub: `${loading ? '—' : data?.low_stock || 0} menipis`, color: '#b85c38', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
                            { icon: ChefHat, label: 'Total Resep', value: loading ? '—' : (data?.total_recipes || 0), sub: 'Di katalog', color: 'var(--info)', bg: 'var(--info-bg)', border: 'var(--info-border)' },
                        ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
                            <div
                                key={label}
                                className="card"
                                style={{ padding: '16px' }}
                                data-tour={label === 'Stok Bahan' ? 'inventory-alert' : undefined}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: bg, border: `1px solid ${border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 10,
                                }}>
                                    <Icon size={18} color={color} strokeWidth={2} />
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                                {loading ? <Sk h={22} w="50%" r={3} /> : (
                                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
                                )}
                                <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 4 }}>{sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Low Stock Warning ── */}
                    {(loading || (data?.low_stock || 0) > 0) && (
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Stok Menipis</div>
                                    <div className="card-subtitle">Perlu segera diisi ulang</div>
                                </div>
                                {!loading && data?.low_stock > 0 && (
                                    <span className="badge badge-amber">{data.low_stock} item</span>
                                )}
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {[1, 2].map(i => <Sk key={i} h={38} r={8} />)}
                                    </div>
                                ) : data?.low_stock_items?.length > 0 ? (
                                    data.low_stock_items.map(item => (
                                        <LowStockItem key={item.id} item={item} />
                                    ))
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '16px 0', color: 'var(--tx-3)', fontSize: 'var(--text-sm)' }}>
                                        <Check size={14} color="var(--success)" strokeWidth={2.5} />
                                        <span>Semua stok dalam kondisi aman</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Feature Quick Access ── */}
            <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                    Modul Lainnya
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    {[
                        { to: '/nutrition', icon: Activity,     label: 'Tracker Nutrisi', desc: 'Pantau kalori & makronutrien', color: '#0284c7' },
                        { to: '/analytics', icon: BarChart3,    label: 'Analitik',        desc: 'Tren pengeluaran & resep',  color: '#7c3aed' },
                        { to: '/history',   icon: History,      label: 'Riwayat',          desc: 'Semua rencana makan lalu', color: '#475569' },
                        { to: '/meal-plans',icon: CalendarDays, label: 'Jadwal Makan',    desc: 'Kelola rencana aktif',     color: '#059669' },
                    ].map(({ to, icon: QuickIcon, label, desc, color }) => (
                        <Link key={to} to={to} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 14px',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                            borderRadius: 10, textDecoration: 'none',
                            transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <QuickIcon size={16} color={color} strokeWidth={2} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tx-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                                <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Panduan Fitur Tertanam ── */}
            <PageFeatureGuide guide={PAGE_GUIDES['/dashboard']} defaultOpen={false} />

            {/* ══════════════════════════════════════════════════════════════
                ── MODALS FOR INLINE DASHBOARD MANAGEMENT ──
               ══════════════════════════════════════════════════════════════ */}

            {/* 1. Modal Tambah Anggota Keluarga */}
            {showFamilyModal && (
                <div className="modal-overlay" onClick={() => setShowFamilyModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <div className="modal-title">Tambah Profil Anggota Keluarga</div>
                            <button className="modal-close" onClick={() => setShowFamilyModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSaveFamily}>
                            <div className="modal-body">
                                {modalError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{modalError}</div>}

                                <div className="form-group">
                                    <label className="form-label">Nama Anggota <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Contoh: Ayah, Ibu, Budi..."
                                        required
                                        value={familyForm.name}
                                        onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="g-2" style={{ gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Usia (tahun) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Usia"
                                            required
                                            min="1"
                                            max="120"
                                            value={familyForm.age}
                                            onChange={e => setFamilyForm({ ...familyForm, age: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Jenis Kelamin <span className="required">*</span></label>
                                        <select
                                            className="form-control"
                                            value={familyForm.gender}
                                            onChange={e => setFamilyForm({ ...familyForm, gender: e.target.value })}
                                        >
                                            <option value="MALE">Laki-laki</option>
                                            <option value="FEMALE">Perempuan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="g-2" style={{ gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Berat Badan (kg) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Berat"
                                            required
                                            step="0.5"
                                            min="3"
                                            value={familyForm.weight}
                                            onChange={e => setFamilyForm({ ...familyForm, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tinggi Badan (cm) <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Tinggi"
                                            required
                                            min="30"
                                            value={familyForm.height}
                                            onChange={e => setFamilyForm({ ...familyForm, height: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Aktivitas Fisik</label>
                                    <select
                                        className="form-control"
                                        value={familyForm.activity_level}
                                        onChange={e => setFamilyForm({ ...familyForm, activity_level: e.target.value })}
                                    >
                                        <option value="SEDENTARY">Tidak Aktif (Jarang bergerak / kerja duduk)</option>
                                        <option value="LIGHTLY_ACTIVE">Sedikit Aktif (Olahraga ringan 1-3 hari/minggu)</option>
                                        <option value="MODERATELY_ACTIVE">Cukup Aktif (Olahraga sedang 3-5 hari/minggu)</option>
                                        <option value="VERY_ACTIVE">Sangat Aktif (Olahraga berat 6-7 hari/minggu)</option>
                                        <option value="EXTRA_ACTIVE">Ekstra Aktif (Pekerja fisik berat / atlet)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowFamilyModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={savingModal}>
                                    {savingModal ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Modal Ubah Anggaran Makan */}
            {showBudgetModal && (
                <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <div className="modal-header">
                            <div className="modal-title">Atur Anggaran Makan Keluarga</div>
                            <button className="modal-close" onClick={() => setShowBudgetModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSaveBudget}>
                            <div className="modal-body">
                                {modalError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{modalError}</div>}

                                <div className="form-group">
                                    <label className="form-label">Periode Anggaran</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        {PERIODS.map(p => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => setBudgetForm(f => ({ ...f, period: p.value, days: p.days }))}
                                                style={{
                                                    padding: '8px 10px',
                                                    border: `1.5px solid ${budgetForm.period === p.value ? 'var(--primary)' : 'var(--border-color)'}`,
                                                    borderRadius: 8,
                                                    background: budgetForm.period === p.value ? 'var(--primary-light)' : 'var(--bg-surface)',
                                                    color: budgetForm.period === p.value ? 'var(--primary)' : 'var(--tx-1)',
                                                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                                                }}
                                            >
                                                {p.label.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Jumlah Anggaran (Rupiah) <span className="required">*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--tx-3)', fontSize: 13 }}>
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ paddingLeft: 38 }}
                                            placeholder="Contoh: 500000"
                                            required
                                            min="10000"
                                            step="5000"
                                            value={budgetForm.amount}
                                            onChange={e => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Preview */}
                                {budgetForm.amount > 0 && (
                                    <div style={{
                                        padding: '10px 12px', background: 'var(--bg-muted)',
                                        borderRadius: 8, border: '1px solid var(--border-color)',
                                        fontSize: 12, color: 'var(--tx-2)',
                                    }}>
                                        <div>Alokasi per hari: <strong>{fmt(Math.round(budgetForm.amount / (budgetForm.days || 7)))}</strong></div>
                                        <div style={{ marginTop: 2 }}>Alokasi per makan (3x sehari): <strong>{fmt(Math.round(budgetForm.amount / (budgetForm.days || 7) / 3))}</strong></div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowBudgetModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={savingModal}>
                                    {savingModal ? 'Menyimpan...' : 'Simpan Anggaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Modal Tambah Preferensi / Pantangan */}
            {showPrefModal && (
                <div className="modal-overlay" onClick={() => setShowPrefModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
                        <div className="modal-header">
                            <div className="modal-title">Tambah Preferensi / Pantangan</div>
                            <button className="modal-close" onClick={() => setShowPrefModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSavePref}>
                            <div className="modal-body">
                                {modalError && <div className="alert alert-danger" style={{ marginBottom: 14 }}>{modalError}</div>}

                                <div className="form-group">
                                    <label className="form-label">Tipe Preferensi</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <button
                                            type="button"
                                            onClick={() => setPrefForm({ ...prefForm, preference_type: 'AVOID' })}
                                            style={{
                                                padding: '10px',
                                                border: `1.5px solid ${prefForm.preference_type === 'AVOID' ? 'var(--danger)' : 'var(--border-color)'}`,
                                                borderRadius: 8,
                                                background: prefForm.preference_type === 'AVOID' ? 'var(--danger-bg)' : 'var(--bg-surface)',
                                                color: prefForm.preference_type === 'AVOID' ? 'var(--danger)' : 'var(--tx-1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                            }}
                                        >
                                            <ShieldAlert size={14} /> Hindari / Alergi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPrefForm({ ...prefForm, preference_type: 'FAVORITE' })}
                                            style={{
                                                padding: '10px',
                                                border: `1.5px solid ${prefForm.preference_type === 'FAVORITE' ? 'var(--success)' : 'var(--border-color)'}`,
                                                borderRadius: 8,
                                                background: prefForm.preference_type === 'FAVORITE' ? 'var(--success-bg)' : 'var(--bg-surface)',
                                                color: prefForm.preference_type === 'FAVORITE' ? 'var(--success)' : 'var(--tx-1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                            }}
                                        >
                                            <Heart size={14} /> Makanan Favorit
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Pilih Bahan Makanan <span className="required">*</span></label>
                                    <select
                                        className="form-control"
                                        required
                                        value={prefForm.ingredient_id}
                                        onChange={e => setPrefForm({ ...prefForm, ingredient_id: e.target.value })}
                                    >
                                        <option value="">-- Pilih bahan pangan --</option>
                                        {ingredientsList.map(ing => (
                                            <option key={ing.id} value={ing.id}>
                                                {ing.name} ({ing.category || 'Bahan'})
                                            </option>
                                        ))}
                                    </select>
                                    <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 4 }}>
                                        Bahan bertipe alergi akan disaring keluar dari seluruh rekomendasi resep secara otomatis.
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowPrefModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={savingModal}>
                                    {savingModal ? 'Menyimpan...' : 'Simpan Preferensi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </Layout>
    );
};

export default Dashboard;
