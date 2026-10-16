import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { ShoppingCart, Check, Package, Loader2 } from 'lucide-react';

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

const STATUS_CONFIG = {
    PENDING:   { label: 'Belum Dibeli', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '○' },
    PURCHASED: { label: 'Sudah Dibeli', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '✓' },
    SKIPPED:   { label: 'Dilewati',     color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: '−' },
};

/* ─── Shopping List Detail ────────────────────────────── */
const ShoppingListView = ({ list, onUpdate, onApplyAll }) => {
    const [applying, setApplying] = useState(false);
    const [updating, setUpdating] = useState(null); // itemId being toggled

    const handleToggle = async (item) => {
        const nextStatus = item.status === 'PURCHASED' ? 'PENDING' : 'PURCHASED';
        setUpdating(item.id);
        try {
            await api.put(`/recommendations/shopping-item/${item.id}`, { status: nextStatus });
            onUpdate(item.id, nextStatus);
        } catch { alert('Gagal memperbarui status item.'); }
        finally { setUpdating(null); }
    };

    const handleApply = async () => {
        if (!confirm(`Tambahkan semua item yang sudah dibeli ke stok inventaris?`)) return;
        setApplying(true);
        try {
            await api.post(`/recommendations/shopping-list/${list.id}/apply`);
            onApplyAll();
            alert('Stok inventaris telah diperbarui!');
        } catch (e) {
            alert(e.response?.data?.message || 'Gagal menerapkan ke inventaris.');
        } finally { setApplying(false); }
    };

    const items    = list.items || [];
    const pending  = items.filter(i => i.status === 'PENDING');
    const bought   = items.filter(i => i.status === 'PURCHASED');
    const totalEst = items.reduce((s, i) => s + (i.estimated_cost || 0), 0);
    const boughtEst= bought.reduce((s, i) => s + (i.estimated_cost || 0), 0);
    const progress = items.length > 0 ? (bought.length / items.length) * 100 : 0;

    return (
        <div style={{ marginBottom: 24 }}>
            {/* List header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, gap: 10, flexWrap: 'wrap',
            }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--tx-1)', marginBottom: 2 }}>
                        Daftar Belanja #{list.id}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                        {bought.length}/{items.length} item dibeli · Est. {fmt(totalEst)}
                    </div>
                </div>
                {bought.length > 0 && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleApply}
                        disabled={applying}
                    >
                        {applying
                            ? <><span className="spinner" /> Menerapkan...</>
                            : <><Package size={12} /> Tambahkan ke Stok</>
                        }
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`, height: '100%',
                        background: progress === 100 ? '#16a34a' : '#3b82f6',
                        borderRadius: 4, transition: 'width 0.4s ease',
                    }} />
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--tx-3)', marginTop: 4 }}>
                    {progress.toFixed(0)}% selesai · Sudah dibeli: {fmt(boughtEst)}
                </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(item => {
                    const sc  = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                    const isUpdating = updating === item.id;
                    return (
                        <div key={item.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px',
                            border: `1px solid ${sc.border}`,
                            borderRadius: 'var(--r-xs)',
                            background: sc.bg,
                            opacity: item.status === 'PURCHASED' ? 0.75 : 1,
                            transition: 'all 0.2s ease',
                        }}>
                            {/* Checkbox */}
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleToggle(item)}
                                style={{
                                    width: 22, height: 22, borderRadius: 6,
                                    border: `2px solid ${item.status === 'PURCHASED' ? '#16a34a' : 'var(--border-color)'}`,
                                    background: item.status === 'PURCHASED' ? '#16a34a' : 'var(--bg-surface)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: isUpdating ? 'wait' : 'pointer',
                                    flexShrink: 0, transition: 'all 0.15s ease',
                                }}
                            >
                                {isUpdating
                                    ? <span className="spinner" style={{ width: 11, height: 11, borderWidth: 1.5 }} />
                                    : item.status === 'PURCHASED'
                                        ? <Check size={12} color="#fff" strokeWidth={3} />
                                        : null
                                }
                            </button>

                            {/* Name + details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: 600, fontSize: 13, color: 'var(--tx-1)',
                                    textDecoration: item.status === 'PURCHASED' ? 'line-through' : 'none',
                                }}>
                                    {item.ingredient_name}
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>
                                    {Number(item.quantity || 0).toFixed(1)} {item.unit}
                                </div>
                            </div>

                            {/* Cost */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx-1)' }}>
                                    {fmt(item.estimated_cost)}
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    fontSize: 10, fontWeight: 600,
                                    color: sc.color, background: sc.bg,
                                    border: `1px solid ${sc.border}`,
                                    borderRadius: 10, padding: '1px 6px',
                                    marginTop: 2,
                                }}>
                                    {sc.label}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Main Page ───────────────────────────────────────── */
const Shopping = () => {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [loading, setLoading]             = useState(true);

    const loadAllLists = async () => {
        setLoading(true);
        try {
            // Fetch all meal plans, then load their shopping lists
            const plansRes = await api.get('/recommendations/meal-plans');
            const plans    = plansRes.data.data || [];

            const results = [];
            for (const plan of plans) {
                try {
                    const detailRes = await api.get(`/recommendations/meal-plans/${plan.id}`);
                    const data      = detailRes.data.data;
                    if (data.shoppingList?.length > 0) {
                        // Shopping list items already have IDs from the DB
                        results.push({
                            id:        data.shoppingList[0]?.shopping_list_id || plan.id,
                            planId:    plan.id,
                            startDate: plan.start_date,
                            endDate:   plan.end_date,
                            items:     data.shoppingList,
                        });
                    }
                } catch { /* skip this plan */ }
            }
            setShoppingLists(results);
        } finally { setLoading(false); }
    };


    useEffect(() => { loadAllLists(); }, []);

    const handleUpdate = (listIdx, itemId, newStatus) => {
        setShoppingLists(prev => prev.map((list, i) => {
            if (i !== listIdx) return list;
            return {
                ...list,
                items: list.items.map(item =>
                    item.id === itemId ? { ...item, status: newStatus } : item
                )
            };
        }));
    };

    const totalPending = shoppingLists
        .flatMap(l => l.items)
        .filter(i => i.status === 'PENDING')
        .reduce((s, i) => s + (i.estimated_cost || 0), 0);

    return (
        <Layout
            title="Daftar Belanja"
            subtitle="Kelola daftar belanja dari semua rencana makan Anda"
        >
            {!loading && shoppingLists.length > 0 && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12, marginBottom: 20,
                }}>
                    {[
                        {
                            label: 'Total Belum Dibeli',
                            value: fmt(totalPending),
                            color: '#d97706', bg: '#fffbeb', border: '#fde68a',
                        },
                        {
                            label: 'Daftar Belanja Aktif',
                            value: `${shoppingLists.length} daftar`,
                            color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',
                        },
                        {
                            label: 'Total Item',
                            value: `${shoppingLists.flatMap(l => l.items).length} item`,
                            color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
                        },
                    ].map(s => (
                        <div key={s.label} style={{
                            padding: '12px 16px',
                            background: s.bg, border: `1px solid ${s.border}`,
                            borderRadius: 'var(--r-sm)',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx-1)', letterSpacing: '-0.4px' }}>
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-sm)' }} />)}
                </div>
            ) : shoppingLists.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><ShoppingCart size={18} /></div>
                        <h3>Belum ada daftar belanja</h3>
                        <p>Buat rekomendasi menu dan simpan hasilnya — daftar belanja akan otomatis dibuat.</p>
                    </div>
                </div>
            ) : (
                shoppingLists.map((list, idx) => (
                    <div key={list.id || idx} className="card" style={{ marginBottom: 16 }}>
                        <div className="card-header">
                            <div>
                                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShoppingCart size={14} /> Daftar untuk Jadwal Makan
                                </div>
                                <div className="card-subtitle">
                                    {list.startDate
                                        ? `${new Date(list.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} — ${new Date(list.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                        : `Rencana Makan #${list.planId}`
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <ShoppingListView
                                list={list}
                                onUpdate={(itemId, newStatus) => handleUpdate(idx, itemId, newStatus)}
                                onApplyAll={loadAllLists}
                            />
                        </div>
                    </div>
                ))
            )}
        </Layout>
    );
};

export default Shopping;
