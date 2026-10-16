import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { CalendarDays, Trash2, ChevronDown, ChevronUp, ShoppingCart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLOT_LABEL  = { BREAKFAST: 'Sarapan', LUNCH: 'Makan Siang', DINNER: 'Makan Malam' };
const SLOT_COLOR  = {
    BREAKFAST: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    LUNCH:     { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    DINNER:    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
};
const fmt   = n  => `Rp${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDt = dt => dt ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

/* ─── Single Plan Card ────────────────────────────────── */
const PlanCard = ({ plan, onDelete }) => {
    const [open, setOpen]   = useState(false);
    const [items, setItems] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadDetail = async () => {
        if (items !== null) { setOpen(o => !o); return; }
        setLoading(true);
        try {
            const r = await api.get(`/recommendations/meal-plans/${plan.id}`);
            setItems(r.data.data);
        } catch { setItems({}); }
        finally  { setLoading(false); setOpen(true); }
    };

    // Group items by date → slot
    const grouped = {};
    if (items?.items) {
        for (const item of items.items) {
            if (!grouped[item.day_date]) grouped[item.day_date] = {};
            grouped[item.day_date][item.meal_slot] = item;
        }
    }

    const utilPct = plan.total_budget > 0
        ? ((plan.estimated_cost / plan.total_budget) * 100).toFixed(1)
        : 0;

    return (
        <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--r-sm)',
            overflow: 'hidden',
            marginBottom: 10,
            background: 'var(--bg-surface)',
        }}>
            {/* Header row */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                background: 'var(--bg-root)',
                borderBottom: open ? '1px solid var(--border-color)' : 'none',
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--tx-1)', marginBottom: 3 }}>
                        {fmtDt(plan.start_date)} — {fmtDt(plan.end_date)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                        Anggaran: {fmt(plan.total_budget)} · Biaya estimasi: {fmt(plan.estimated_cost)}
                        {utilPct > 0 && ` (${utilPct}%)`}
                    </div>
                </div>

                {/* Utilisation bar */}
                <div style={{ width: 80, flexShrink: 0 }}>
                    <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                            width: `${Math.min(utilPct, 100)}%`, height: '100%',
                            background: utilPct > 100 ? '#ef4444' : '#16a34a',
                            borderRadius: 3, transition: 'width 0.4s ease',
                        }} />
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--tx-3)', textAlign: 'right', marginTop: 2 }}>
                        {utilPct}%
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={loadDetail}
                    >
                        {loading
                            ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                            : open ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        }
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm"
                        style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                        onClick={() => onDelete(plan.id)}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Expanded items */}
            {open && items && (
                <div style={{ padding: '12px 16px' }}>
                    {Object.keys(grouped).length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--tx-3)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                            Tidak ada detail jadwal tersedia.
                        </div>
                    ) : (
                        Object.entries(grouped)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([date, slots]) => (
                                <div key={date} style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tx-2)', marginBottom: 6 }}>
                                        {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                                        {['BREAKFAST', 'LUNCH', 'DINNER'].map(slot => {
                                            const meal = slots[slot];
                                            const sc   = SLOT_COLOR[slot] || {};
                                            return (
                                                <div key={slot} style={{
                                                    padding: '8px 10px',
                                                    background: meal ? sc.bg : 'var(--bg-root)',
                                                    border: `1px solid ${meal ? sc.border : 'var(--border-color)'}`,
                                                    borderRadius: 'var(--r-xs)',
                                                }}>
                                                    <div style={{ fontSize: 9.5, fontWeight: 700, color: meal ? sc.text : 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                                                        {SLOT_LABEL[slot]}
                                                    </div>
                                                    {meal ? (
                                                        <>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-1)', lineHeight: 1.3 }}>
                                                                {meal.recipe_name}
                                                            </div>
                                                            <div style={{ fontSize: 10.5, color: 'var(--tx-3)', marginTop: 2 }}>
                                                                {Math.round(meal.total_calories || 0)} kkal
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div style={{ fontSize: 11, color: 'var(--tx-3)', fontStyle: 'italic' }}>—</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                    )}

                    {/* Shopping list summary */}
                    {items.shoppingList?.length > 0 && (
                        <div style={{
                            marginTop: 14, padding: '10px 12px',
                            background: 'var(--bg-root)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--r-xs)',
                            fontSize: 12.5, color: 'var(--tx-2)',
                        }}>
                            <strong>Daftar belanja:</strong> {items.shoppingList.length} item ·{' '}
                            Est. {fmt(items.shoppingList.reduce((s, i) => s + (i.estimated_cost || 0), 0))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Main Page ───────────────────────────────────────── */
const MealPlans = () => {
    const [plans, setPlans]     = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate              = useNavigate();

    const load = () => {
        setLoading(true);
        api.get('/recommendations/meal-plans')
            .then(r => setPlans(r.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async id => {
        if (!confirm('Hapus jadwal makan ini? Tindakan ini tidak dapat dibatalkan.')) return;
        await api.delete(`/recommendations/meal-plans/${id}`);
        load();
    };

    return (
        <Layout
            title="Jadwal Makan"
            subtitle="Riwayat semua rencana makan yang telah disimpan"
            actions={
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/recommendation')}
                >
                    <ExternalLink size={12} strokeWidth={2.5} /> Buat Jadwal Baru
                </button>
            }
        >
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--r-sm)' }} />)}
                </div>
            ) : plans.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><CalendarDays size={18} /></div>
                        <h3>Belum ada jadwal makan</h3>
                        <p>Buat rekomendasi menu terlebih dahulu, kemudian simpan hasilnya.</p>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/recommendation')}>
                            Buat Rekomendasi
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: 13, color: 'var(--tx-3)', marginBottom: 12 }}>
                        {plans.length} rencana makan tersimpan
                    </div>
                    {plans.map(p => (
                        <PlanCard key={p.id} plan={p} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default MealPlans;
