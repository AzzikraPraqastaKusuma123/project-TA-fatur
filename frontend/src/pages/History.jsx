import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    History as HistoryIcon, Calendar, ChevronDown, ChevronUp,
    Trash2, ShoppingCart, Wallet, Clock, CheckCircle2,
    AlertCircle, ChefHat, Star, Filter
} from 'lucide-react';

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

const SLOT_LABELS = { BREAKFAST: 'ðŸ³ Sarapan', LUNCH: 'â˜€ï¸ Siang', DINNER: 'ðŸŒ™ Malam', SNACK: 'ðŸŽ Camilan' };
const STATUS_CONFIG = {
    ACTIVE:    { label: 'Aktif',    color: 'var(--primary)', bg: 'var(--primary-light)' },
    COMPLETED: { label: 'Selesai', color: 'var(--success)', bg: 'var(--success-bg)' },
    CANCELLED: { label: 'Dibatal', color: 'var(--danger)',  bg: 'var(--danger-bg)' },
};

/* â”€â”€ Rating Stars (visual only) â”€â”€ */
const Stars = ({ n = 0 }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(i => (
            <Star key={i} size={12} fill={i <= n ? '#f59e0b' : 'none'} stroke={i <= n ? '#f59e0b' : 'var(--border-color)'} />
        ))}
    </div>
);

/* â”€â”€ Progress Bar â”€â”€ */
const Progress = ({ value, color = 'var(--primary)' }) => (
    <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-muted)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, borderRadius: 99, background: color, transition: 'width 0.5s ease' }} />
    </div>
);

/* â”€â”€ History Plan Card â”€â”€ */
const HistoryCard = ({ plan, onDelete }) => {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadDetail = async () => {
        if (detail !== null) { setOpen(o => !o); return; }
        setLoadingDetail(true);
        try {
            const r = await api.get(`/recommendations/meal-plans/${plan.id}`);
            setDetail(r.data.data);
        } catch { setDetail({}); }
        finally { setLoadingDetail(false); setOpen(true); }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Hapus rencana makan "${fmtDate(plan.start_date)} â€“ ${fmtDate(plan.end_date)}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        setDeleting(true);
        try {
            await api.delete(`/recommendations/meal-plans/${plan.id}`);
            onDelete(plan.id);
        } catch (e) {
            alert(e.response?.data?.message || 'Gagal menghapus rencana.');
        } finally { setDeleting(false); }
    };

    const utilPct = plan.total_budget > 0 ? ((plan.estimated_cost / plan.total_budget) * 100).toFixed(1) : 0;
    const saving = (plan.total_budget || 0) - (plan.estimated_cost || 0);
    const statusCfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.ACTIVE;
    const duration = plan.start_date && plan.end_date
        ? Math.round((new Date(plan.end_date) - new Date(plan.start_date)) / 86400000) + 1 : 0;

    // Group items by date
    const grouped = {};
    if (detail?.items) {
        for (const item of detail.items) {
            if (!grouped[item.day_date]) grouped[item.day_date] = [];
            grouped[item.day_date].push(item);
        }
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
            {/* Card Header */}
            <div style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={loadDetail}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                            <div style={{
                                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                background: statusCfg.bg, color: statusCfg.color,
                            }}>
                                {statusCfg.label}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--tx-3)' }}>
                                <Calendar size={12} />
                                {fmtDate(plan.start_date)} â€“ {fmtDate(plan.end_date)}
                            </div>
                            {duration > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--tx-3)' }}>
                                    <Clock size={12} /> {duration} hari
                                </div>
                            )}
                        </div>

                        {/* Budget progress */}
                        <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--tx-3)', marginBottom: 4 }}>
                                <span>Budget: <b style={{ color: 'var(--tx-2)' }}>{fmt(plan.total_budget)}</b></span>
                                <span>Realisasi: <b style={{ color: 'var(--tx-1)' }}>{fmt(plan.estimated_cost)}</b></span>
                            </div>
                            <Progress value={Number(utilPct)} color={Number(utilPct) > 100 ? 'var(--danger)' : 'var(--primary)'} />
                        </div>

                        {/* Savings badge */}
                        {saving > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--success)', background: 'var(--success-bg)', padding: '2px 8px', borderRadius: 99 }}>
                                <CheckCircle2 size={11} /> Hemat {fmt(saving)} ({utilPct}% utilisasi)
                            </span>
                        )}
                        {saving < 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '2px 8px', borderRadius: 99 }}>
                                <AlertCircle size={11} /> Melebihi budget {fmt(Math.abs(saving))}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--danger)',
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                        <button onClick={loadDetail} style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--bg-muted)', border: '1px solid var(--border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--tx-3)',
                        }}>
                            {loadingDetail ? (
                                <div style={{ width: 14, height: 14, border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            ) : open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Detail */}
            {open && detail && (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', background: 'var(--bg-muted)' }}>
                    {Object.keys(grouped).length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--tx-4)', fontSize: 13, padding: '12px 0' }}>Tidak ada detail item untuk rencana ini.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                            {Object.entries(grouped).map(([date, items]) => (
                                <div key={date} style={{ background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    <div style={{ padding: '8px 12px', background: 'var(--primary-light)', borderBottom: '1px solid var(--primary-soft)' }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                                            {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <div style={{ padding: '8px 12px' }}>
                                        {items.map((item, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: j < items.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                                                <span style={{ fontSize: 14 }}>{SLOT_LABELS[item.meal_slot]?.split(' ')[0]}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.recipe_name}
                                                    </div>
                                                    <div style={{ fontSize: 10, color: 'var(--tx-4)' }}>
                                                        {Math.round(item.total_calories || 0)} kkal
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Shopping list summary */}
                    {detail.shoppingList && detail.shoppingList.length > 0 && (
                        <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <ShoppingCart size={14} color="var(--info)" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--info)' }}>
                                    Shopping List ({detail.shoppingList.length} item)
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {detail.shoppingList.slice(0, 8).map((item, i) => (
                                    <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg-surface)', border: '1px solid var(--info-border)', borderRadius: 99, color: 'var(--tx-2)' }}>
                                        {item.ingredient_name}
                                    </span>
                                ))}
                                {detail.shoppingList.length > 8 && (
                                    <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>+{detail.shoppingList.length - 8} lagi</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* â”€â”€ Main Component â”€â”€ */
export default function History() {
    const [plans, setPlans] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [sort, setSort] = useState('newest');
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const r = await api.get('/recommendations/meal-plans');
                setPlans(r.data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        let result = [...plans];
        if (filter !== 'ALL') result = result.filter(p => p.status === filter);
        if (sort === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (sort === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (sort === 'cheapest') result.sort((a, b) => (a.estimated_cost || 0) - (b.estimated_cost || 0));
        else if (sort === 'priciest') result.sort((a, b) => (b.estimated_cost || 0) - (a.estimated_cost || 0));
        setFiltered(result);
    }, [plans, filter, sort]);

    const handleDelete = id => setPlans(prev => prev.filter(p => p.id !== id));

    const summary = {
        total: plans.length,
        active: plans.filter(p => p.status === 'ACTIVE').length,
        totalSavings: plans.reduce((s, p) => s + ((p.total_budget || 0) - (p.estimated_cost || 0)), 0),
        avgUtil: plans.length > 0
            ? Math.round(plans.reduce((s, p) => s + (p.total_budget > 0 ? (p.estimated_cost / p.total_budget) * 100 : 0), 0) / plans.length)
            : 0,
    };

    if (loading) return (
        <Layout title="Riwayat Rencana">
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, flex: 1, borderRadius: 12 }} />)}
            </div>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 10 }} />)}
        </Layout>
    );

    return (
        <Layout title="Riwayat Rencana Makan">
            {/* Summary Strip */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Rencana',  val: summary.total,                icon: HistoryIcon, color: 'var(--primary)' },
                    { label: 'Aktif',          val: summary.active,               icon: CheckCircle2, color: 'var(--success)' },
                    { label: 'Total Dihemat',  val: fmt(summary.totalSavings),    icon: Wallet,       color: 'var(--accent)' },
                    { label: 'Rata-rata Util', val: `${summary.avgUtil}%`,        icon: ChefHat,      color: '#6366f1' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card" style={{ flex: '1 1 140px', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={15} color={s.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: 'var(--tx-4)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx-1)' }}>{s.val}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid',
                                borderColor: filter === f ? 'var(--primary)' : 'var(--border-color)',
                                background: filter === f ? 'var(--primary)' : 'transparent',
                                color: filter === f ? '#fff' : 'var(--tx-3)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                                {f === 'ALL' ? `Semua (${plans.length})` : STATUS_CONFIG[f]?.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Filter size={13} color="var(--tx-4)" />
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--tx-2)', background: 'var(--bg-input)', cursor: 'pointer' }}
                        >
                            <option value="newest">Terbaru</option>
                            <option value="oldest">Terlama</option>
                            <option value="cheapest">Termurah</option>
                            <option value="priciest">Termahal</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Plans List */}
            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state" style={{ padding: '48px 24px' }}>
                        <div className="empty-icon"><HistoryIcon size={22} /></div>
                        <h3>Belum Ada Riwayat</h3>
                        <p>Mulai buat rencana makan pertama Anda untuk melihat riwayat di sini.</p>
                        <a href="/recommendation" className="btn btn-primary" style={{ marginTop: 12 }}>Buat Rencana Makan</a>
                    </div>
                </div>
            ) : (
                <div>
                    {filtered.map(plan => (
                        <HistoryCard key={plan.id} plan={plan} onDelete={handleDelete} />
                    ))}
                    <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--tx-4)' }}>
                        Menampilkan {filtered.length} dari {plans.length} rencana makan
                    </div>
                </div>
            )}
            {/* -- Panduan Fitur Tertanam -- */}
            <PageFeatureGuide guide={PAGE_GUIDES['/history']} />
        </Layout>
    );
}

