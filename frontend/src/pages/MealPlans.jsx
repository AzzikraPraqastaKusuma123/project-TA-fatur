import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    CalendarDays, Trash2, ChevronDown, ChevronUp,
    ShoppingCart, Plus, Flame, Wallet, Clock,
    CheckCircle2, Coffee, Sun, Moon, Apple,
    TrendingDown, Package, X, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Config ─────────────────────────────────────────────────── */
const SLOT_CONFIG = {
    BREAKFAST: { label: 'Sarapan',     icon: Coffee, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    LUNCH:     { label: 'Makan Siang', icon: Sun,    color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
    DINNER:    { label: 'Makan Malam', icon: Moon,   color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
    SNACK:     { label: 'Camilan',     icon: Apple,  color: '#ec4899', bg: '#fdf4ff', border: '#f5d0fe' },
};

const STATUS_CONFIG = {
    ACTIVE:    { label: 'Aktif',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    COMPLETED: { label: 'Selesai', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
    CANCELLED: { label: 'Dibatal', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDate = dt => dt ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

/* ── Progress Bar ───────────────────────────────────────────── */
const ProgBar = ({ pct, color }) => (
    <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            borderRadius: 99,
            background: pct > 100 ? 'var(--danger)' : color || 'var(--primary)',
            transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
    </div>
);

/* ── Day Column ─────────────────────────────────────────────── */
const DayColumn = ({ date, meals }) => {
    const d = new Date(date);
    const isToday = d.toDateString() === new Date().toDateString();
    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${isToday ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: 12, overflow: 'hidden',
            minWidth: 160, flex: '1 1 160px',
            boxShadow: isToday ? '0 0 0 2px var(--primary)20' : 'none',
        }}>
            <div style={{
                padding: '10px 12px',
                background: isToday ? 'var(--primary)' : 'var(--bg-muted)',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <div style={{
                    fontSize: 10, fontWeight: 800,
                    color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--tx-4)',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                    {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                </div>
                <div style={{
                    fontSize: 14, fontWeight: 800,
                    color: isToday ? '#fff' : 'var(--tx-1)',
                }}>
                    {d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
                {isToday && (
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 1 }}>HARI INI</div>
                )}
            </div>
            <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(SLOT_CONFIG).map(([slot, cfg]) => {
                    const meal = meals[slot];
                    const Icon = cfg.icon;
                    if (!meal) return null;
                    return (
                        <div key={slot} style={{
                            padding: '8px 10px',
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            borderRadius: 8,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                <Icon size={10} color={cfg.color} />
                                <span style={{
                                    fontSize: 9, fontWeight: 800, color: cfg.color,
                                    textTransform: 'uppercase', letterSpacing: '0.4px',
                                }}>
                                    {cfg.label}
                                </span>
                            </div>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--tx-1)', lineHeight: 1.3 }}>
                                {meal.recipe_name}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--tx-4)', marginTop: 2 }}>
                                {Math.round(meal.total_calories || 0)} kkal
                            </div>
                        </div>
                    );
                })}
                {Object.keys(meals).length === 0 && (
                    <div style={{
                        fontSize: 11, color: 'var(--tx-4)', fontStyle: 'italic',
                        textAlign: 'center', padding: '8px 0',
                    }}>
                        Tidak ada menu
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Plan Card ──────────────────────────────────────────────── */
const PlanCard = ({ plan, onDelete }) => {
    const [open, setOpen]       = useState(false);
    const [detail, setDetail]   = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const loadDetail = async () => {
        if (detail !== null) { setOpen(o => !o); return; }
        setLoading(true);
        try {
            const r = await api.get(`/recommendations/meal-plans/${plan.id}`);
            setDetail(r.data.data);
        } catch { setDetail({}); }
        finally { setLoading(false); setOpen(true); }
    };

    const handleDelete = async e => {
        e.stopPropagation();
        if (!window.confirm('Hapus rencana makan ini? Tindakan ini tidak bisa dibatalkan.')) return;
        setDeleting(true);
        try {
            await api.delete(`/recommendations/meal-plans/${plan.id}`);
            onDelete(plan.id);
        } catch {
            alert('Gagal menghapus. Coba lagi.');
        } finally { setDeleting(false); }
    };

    // Group items by date → slot
    const grouped = {};
    if (detail?.items) {
        for (const item of detail.items) {
            if (!grouped[item.day_date]) grouped[item.day_date] = {};
            grouped[item.day_date][item.meal_slot] = item;
        }
    }

    const utilPct  = plan.total_budget > 0 ? ((plan.estimated_cost / plan.total_budget) * 100).toFixed(1) : 0;
    const saving   = (plan.total_budget || 0) - (plan.estimated_cost || 0);
    const statusCfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.ACTIVE;
    const duration  = plan.start_date && plan.end_date
        ? Math.round((new Date(plan.end_date) - new Date(plan.start_date)) / 86400000) + 1 : 0;

    const totalCals    = detail?.items?.reduce((s, i) => s + Number(i.total_calories || 0), 0) || 0;
    const avgDailyCals = duration > 0 ? Math.round(totalCals / duration) : 0;

    return (
        <div style={{
            border: `1px solid ${open ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: 14, overflow: 'hidden',
            background: 'var(--bg-surface)',
            boxShadow: open ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
        }}>
            {/* Status accent bar */}
            <div style={{ height: 3, background: statusCfg.color, opacity: 0.8 }} />

            {/* Card Header */}
            <div style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={loadDetail}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    {/* Left */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Status + date row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '3px 10px', borderRadius: 99,
                                fontSize: 11, fontWeight: 700,
                                background: statusCfg.bg, color: statusCfg.color,
                                border: `1px solid ${statusCfg.border}`,
                            }}>
                                {statusCfg.label}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--tx-3)' }}>
                                <CalendarDays size={12} />
                                {fmtDate(plan.start_date)} — {fmtDate(plan.end_date)}
                            </span>
                            {duration > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--tx-3)' }}>
                                    <Clock size={12} /> {duration} hari
                                </span>
                            )}
                        </div>

                        {/* Budget mini grid */}
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
                            {[
                                { label: 'Budget', value: fmt(plan.total_budget), color: 'var(--tx-1)' },
                                { label: 'Realisasi', value: fmt(plan.estimated_cost), color: 'var(--tx-1)' },
                                { label: saving >= 0 ? 'Hemat' : 'Lebih', value: fmt(Math.abs(saving)),
                                  color: saving >= 0 ? '#16a34a' : '#dc2626' },
                            ].map(g => (
                                <div key={g.label}>
                                    <div style={{ fontSize: 10, color: 'var(--tx-4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>
                                        {g.label}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: g.color, letterSpacing: '-0.3px' }}>
                                        {g.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Utilization bar */}
                        <div style={{ maxWidth: 300 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--tx-4)', marginBottom: 4, fontWeight: 600 }}>
                                <span>Utilisasi Budget</span>
                                <span style={{ color: Number(utilPct) > 100 ? '#dc2626' : '#16a34a', fontWeight: 800 }}>
                                    {utilPct}%
                                </span>
                            </div>
                            <ProgBar pct={Number(utilPct)} />
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div
                        style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => navigate('/shopping')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px',
                                background: 'var(--bg-muted)', border: '1px solid var(--border-color)',
                                borderRadius: 8, color: 'var(--tx-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--tx-2)'; }}
                        >
                            <ShoppingCart size={13} /> Belanja
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: 'var(--bg-muted)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--tx-3)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--tx-3)'; }}
                        >
                            {deleting
                                ? <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                : <Trash2 size={14} />
                            }
                        </button>
                        <button
                            onClick={loadDetail}
                            style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: open ? 'var(--primary)10' : 'var(--bg-muted)',
                                border: `1px solid ${open ? 'var(--primary)40' : 'var(--border-color)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: open ? 'var(--primary)' : 'var(--tx-3)',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {loading
                                ? <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                : open ? <ChevronUp size={15} /> : <ChevronDown size={15} />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Detail */}
            {open && detail && (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '18px 20px', background: 'var(--bg-muted)' }}>
                    {/* Summary stats */}
                    {detail.items?.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                            {[
                                { label: 'Total Kalori', val: `${Math.round(totalCals).toLocaleString()} kkal`, icon: Flame, color: '#f59e0b' },
                                { label: 'Rata-rata/Hari', val: `${avgDailyCals.toLocaleString()} kkal`, icon: TrendingDown, color: '#10b981' },
                                { label: 'Total Menu', val: `${detail.items.length} resep`, icon: Package, color: '#6366f1' },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} style={{
                                        flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '12px 14px', background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-color)', borderRadius: 10,
                                    }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 8,
                                            background: s.color + '18',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Icon size={15} color={s.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 9.5, color: 'var(--tx-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                {s.label}
                                            </div>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.3px' }}>
                                                {s.val}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Calendar Grid */}
                    {Object.keys(grouped).length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--tx-4)', fontSize: 13, padding: '16px 0' }}>
                            Tidak ada detail item untuk rencana ini.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                            <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
                                {Object.entries(grouped)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([date, meals]) => (
                                        <DayColumn key={date} date={date} meals={meals} />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Shopping list badge */}
                    {detail.shoppingList?.length > 0 && (
                        <div style={{
                            marginTop: 16, padding: '12px 16px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: '#eff6ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <ShoppingCart size={16} color="#1d4ed8" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)' }}>
                                    {detail.shoppingList.length} item di daftar belanja
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>
                                    Est. {fmt(detail.shoppingList.reduce((s, i) => s + (i.estimated_cost || 0), 0))}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/shopping')}
                                className="btn btn-primary btn-sm"
                            >
                                Lihat Daftar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Main Page ──────────────────────────────────────────────── */
export default function MealPlans() {
    const [plans, setPlans]     = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/recommendations/meal-plans')
            .then(r => setPlans(r.data.data || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (filter === 'ALL') setFiltered(plans);
        else setFiltered(plans.filter(p => p.status === filter));
    }, [plans, filter]);

    const handleDelete = id => setPlans(prev => prev.filter(p => p.id !== id));

    const totalBudget  = plans.reduce((s, p) => s + (p.total_budget    || 0), 0);
    const totalSpent   = plans.reduce((s, p) => s + (p.estimated_cost  || 0), 0);
    const totalSavings = totalBudget - totalSpent;
    const activePlan   = plans.filter(p => p.status === 'ACTIVE').length;

    const FILTER_TABS = [
        { key: 'ALL',       label: `Semua`,   count: plans.length },
        { key: 'ACTIVE',    label: `Aktif`,   count: plans.filter(p => p.status === 'ACTIVE').length },
        { key: 'COMPLETED', label: `Selesai`, count: plans.filter(p => p.status === 'COMPLETED').length },
    ];

    return (
        <Layout
            title="Jadwal Makan"
            subtitle="Kelola semua rencana makan yang telah dibuat"
            actions={
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/recommendation')}>
                    <Plus size={13} strokeWidth={2.5} /> Buat Rencana
                </button>
            }
        >
            {/* ── Summary Strip ── */}
            {!loading && plans.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'Total Rencana', val: plans.length, icon: CalendarDays, color: 'var(--primary)' },
                        { label: 'Rencana Aktif', val: activePlan,   icon: CheckCircle2, color: '#16a34a' },
                        { label: 'Total Budget',
                          val: totalBudget >= 1_000_000
                            ? `Rp${(totalBudget/1_000_000).toFixed(1)}jt`
                            : `Rp${(totalBudget/1000).toFixed(0)}rb`,
                          icon: Wallet, color: '#6366f1' },
                        { label: totalSavings >= 0 ? 'Total Hemat' : 'Selisih Lebih',
                          val: Math.abs(totalSavings) >= 1_000_000
                            ? `Rp${(Math.abs(totalSavings)/1_000_000).toFixed(1)}jt`
                            : `Rp${(Math.abs(totalSavings)/1000).toFixed(0)}rb`,
                          icon: BarChart3,
                          color: totalSavings >= 0 ? '#16a34a' : '#dc2626' },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="card" style={{ padding: '16px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: s.color + '18',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={16} color={s.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'var(--tx-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            {s.label}
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.4px' }}>
                                            {s.val}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Filter Tabs ── */}
            {!loading && plans.length > 0 && (
                <div style={{
                    display: 'flex', gap: 4, marginBottom: 16,
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10, padding: 4,
                    width: 'fit-content',
                }}>
                    {FILTER_TABS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '6px 14px', borderRadius: 7, border: 'none',
                                background: filter === f.key ? 'var(--bg-surface)' : 'transparent',
                                color: filter === f.key ? 'var(--primary)' : 'var(--tx-3)',
                                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: filter === f.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            }}
                        >
                            {f.label}
                            <span style={{
                                marginLeft: 5, padding: '1px 6px', borderRadius: 20,
                                background: filter === f.key ? 'var(--primary)15' : 'var(--border-color)',
                                color: filter === f.key ? 'var(--primary)' : 'var(--tx-4)',
                                fontSize: 10, fontWeight: 800,
                            }}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ padding: '60px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-icon"><CalendarDays size={22} /></div>
                        <h3>Belum Ada Jadwal Menu Makan</h3>
                        <p>Rancang jadwal menu keluarga otomatis yang sehat, lezat, dan ramah kantong, lalu simpan di sini.</p>
                        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/recommendation')}>
                            <Plus size={13} /> Rancang Menu Pertama
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(p => (
                        <PlanCard key={p.id} plan={p} onDelete={handleDelete} />
                    ))}
                    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--tx-4)', marginTop: 4, fontWeight: 600 }}>
                        {filtered.length} dari {plans.length} rencana makan
                    </div>
                </div>
            )}

            <PageFeatureGuide guide={PAGE_GUIDES['/meal-plans']} />
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </Layout>
    );
}
