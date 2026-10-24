import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    ShoppingCart, Check, Package, Wallet, ListChecks,
    BarChart3, RefreshCw, ShoppingBag, X, ArrowRight,
    CircleDot, CheckCircle2, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

const CAT_COLORS = {
    PROTEIN:  { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    SAYURAN:  { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
    BUMBU:    { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    KARBOHIDRAT: { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    LEMAK:    { color: '#ec4899', bg: '#fdf4ff', border: '#f5d0fe' },
    OTHER:    { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

/* ── Shopping List View ─────────────────────────────────────── */
const ShoppingListView = ({ list, onUpdate, onApplyAll }) => {
    const [applying, setApplying] = useState(false);
    const [updating, setUpdating] = useState(null);

    const handleToggle = async item => {
        const nextStatus = item.status === 'PURCHASED' ? 'PENDING' : 'PURCHASED';
        setUpdating(item.id);
        try {
            await api.put(`/recommendations/shopping-item/${item.id}`, { status: nextStatus });
            onUpdate(item.id, nextStatus);
        } catch { alert('Gagal memperbarui status item.'); }
        finally { setUpdating(null); }
    };

    const handleApply = async () => {
        if (!confirm('Tambahkan semua item yang sudah dibeli ke stok inventaris?')) return;
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
    const boughtEst = bought.reduce((s, i) => s + (i.estimated_cost || 0), 0);
    const progress  = items.length > 0 ? (bought.length / items.length) * 100 : 0;

    // Group by category
    const grouped = {};
    for (const item of items) {
        const cat = item.category || 'OTHER';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    }

    return (
        <div>
            {/* Progress header */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)' }}>
                            {bought.length}/{items.length} item selesai
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--tx-3)', marginLeft: 8 }}>
                            · {fmt(boughtEst)} dari {fmt(totalEst)}
                        </span>
                    </div>
                    {progress === 100 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                            <CheckCircle2 size={14} /> Semua selesai!
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`, height: '100%', borderRadius: 99,
                        background: progress === 100 ? '#16a34a' : 'var(--primary)',
                        transition: 'width 0.4s ease',
                    }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx-4)', marginTop: 4 }}>
                    {progress.toFixed(0)}% selesai
                </div>
            </div>

            {/* Items grouped by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(grouped).map(([cat, catItems]) => {
                    const cc = CAT_COLORS[cat] || CAT_COLORS.OTHER;
                    const catBought = catItems.filter(i => i.status === 'PURCHASED').length;
                    return (
                        <div key={cat}>
                            {/* Category header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                marginBottom: 8,
                            }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: 20,
                                    fontSize: 11, fontWeight: 700,
                                    color: cc.color, background: cc.bg,
                                    border: `1px solid ${cc.border}`,
                                }}>
                                    {cat}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--tx-4)', fontWeight: 600 }}>
                                    {catBought}/{catItems.length}
                                </span>
                            </div>

                            {/* Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {catItems.map(item => {
                                    const isPurchased = item.status === 'PURCHASED';
                                    const isUpdating  = updating === item.id;
                                    return (
                                        <div key={item.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 14px',
                                            border: `1px solid ${isPurchased ? '#bbf7d0' : 'var(--border-color)'}`,
                                            borderRadius: 10,
                                            background: isPurchased ? '#f0fdf4' : 'var(--bg-surface)',
                                            opacity: isPurchased ? 0.75 : 1,
                                            transition: 'all 0.2s ease',
                                        }}>
                                            {/* Checkbox */}
                                            <button
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => handleToggle(item)}
                                                style={{
                                                    width: 24, height: 24, borderRadius: 7,
                                                    border: `2px solid ${isPurchased ? '#16a34a' : 'var(--border-color)'}`,
                                                    background: isPurchased ? '#16a34a' : 'var(--bg-surface)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: isUpdating ? 'wait' : 'pointer',
                                                    flexShrink: 0, transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {isUpdating
                                                    ? <div style={{ width: 11, height: 11, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                                    : isPurchased
                                                        ? <Check size={13} color="#fff" strokeWidth={3} />
                                                        : null
                                                }
                                            </button>

                                            {/* Name + qty */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 600, fontSize: 13.5, color: 'var(--tx-1)',
                                                    textDecoration: isPurchased ? 'line-through' : 'none',
                                                    textDecorationColor: '#9ca3af',
                                                }}>
                                                    {item.ingredient_name}
                                                </div>
                                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginTop: 1 }}>
                                                    {Number(item.quantity || 0).toFixed(1)} {item.unit}
                                                </div>
                                            </div>

                                            {/* Cost */}
                                            <div style={{
                                                textAlign: 'right', flexShrink: 0,
                                                fontWeight: 700, fontSize: 13,
                                                color: isPurchased ? '#16a34a' : 'var(--tx-1)',
                                            }}>
                                                {fmt(item.estimated_cost)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Apply to stock button */}
            {bought.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                        onClick={handleApply}
                        disabled={applying}
                    >
                        {applying
                            ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Menerapkan...</>
                            : <><Package size={14} /> Tambahkan {bought.length} Item ke Stok Inventaris</>
                        }
                    </button>
                    <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--tx-4)', marginTop: 6 }}>
                        Item yang sudah dibeli akan otomatis ditambahkan ke inventaris dapur Anda
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Main Page ──────────────────────────────────────────────── */
const Shopping = () => {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const loadAllLists = async (quiet = false) => {
        if (!quiet) setLoading(true);
        else setRefreshing(true);
        try {
            const plansRes = await api.get('/recommendations/meal-plans');
            const plans    = plansRes.data.data || [];
            const results  = [];
            for (const plan of plans) {
                try {
                    const detailRes = await api.get(`/recommendations/meal-plans/${plan.id}`);
                    const data      = detailRes.data.data;
                    if (data.shoppingList?.length > 0) {
                        results.push({
                            id:        data.shoppingList[0]?.shopping_list_id || plan.id,
                            planId:    plan.id,
                            startDate: plan.start_date,
                            endDate:   plan.end_date,
                            status:    plan.status,
                            items:     data.shoppingList,
                        });
                    }
                } catch { /* skip */ }
            }
            setShoppingLists(results);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadAllLists(); }, []);

    const handleUpdate = (listIdx, itemId, newStatus) => {
        setShoppingLists(prev => prev.map((list, i) => {
            if (i !== listIdx) return list;
            return { ...list, items: list.items.map(item => item.id === itemId ? { ...item, status: newStatus } : item) };
        }));
    };

    // Summary stats
    const allItems   = shoppingLists.flatMap(l => l.items);
    const totalPend  = allItems.filter(i => i.status === 'PENDING').reduce((s, i) => s + (i.estimated_cost || 0), 0);
    const totalBought= allItems.filter(i => i.status === 'PURCHASED').reduce((s, i) => s + (i.estimated_cost || 0), 0);
    const totalItems = allItems.length;
    const pctDone    = totalItems > 0 ? (allItems.filter(i => i.status === 'PURCHASED').length / totalItems * 100) : 0;

    return (
        <Layout
            title="Daftar Belanja"
            subtitle="Kelola daftar belanja dari semua rencana makan Anda"
            actions={
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => loadAllLists(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            }
        >
            {/* ── Workflow Educational Note ── */}
            <div style={{
                padding: '12px 16px', borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, var(--bg-surface) 100%)',
                border: '1px solid rgba(37, 99, 235, 0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, marginBottom: 18, flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: '#eff6ff', color: '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Lightbulb size={15} strokeWidth={2.5} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.5 }}>
                        <strong>Belanja Cerdas Anti-Mubazir:</strong> Daftar belanja di bawah ini dihitung otomatis dari resep menu aktif dikurangi stok yang sudah ada di rumah. Setelah berbelanja di pasar, centang barang yang dibeli lalu klik <strong>"Tambahkan ke Stok"</strong> agar inventaris dapur langsung terisi!
                    </div>
                </div>
            </div>

            {/* ── Summary ── */}
            {!loading && shoppingLists.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'Belum Dibeli', val: fmt(totalPend), icon: CircleDot, color: '#d97706' },
                        { label: 'Sudah Dibeli', val: fmt(totalBought), icon: CheckCircle2, color: '#16a34a' },
                        { label: 'Total Item', val: `${totalItems} item`, icon: ListChecks, color: '#6366f1' },
                        { label: 'Progres Belanja', val: `${pctDone.toFixed(0)}%`, icon: BarChart3, color: '#3b82f6' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
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
                                        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.3px' }}>
                                            {s.val}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)}
                </div>
            ) : shoppingLists.length === 0 ? (
                <div className="card" style={{ padding: '60px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-icon"><ShoppingBag size={22} /></div>
                        <h3>Belum ada daftar belanja</h3>
                        <p>Buat rekomendasi menu dan simpan hasilnya — daftar belanja akan otomatis dibuat.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 14 }}
                            onClick={() => navigate('/recommendation')}
                        >
                            <ArrowRight size={13} /> Buat Meal Plan
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {shoppingLists.map((list, idx) => {
                        const items    = list.items || [];
                        const bought   = items.filter(i => i.status === 'PURCHASED');
                        const pct      = items.length > 0 ? (bought.length / items.length * 100) : 0;
                        const totalEst = items.reduce((s, i) => s + (i.estimated_cost || 0), 0);
                        return (
                            <div key={list.id || idx} className="card" style={{ overflow: 'hidden' }}>
                                {/* Card header */}
                                <div style={{
                                    padding: '14px 20px',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                                    flexWrap: 'wrap',
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                            <ShoppingCart size={14} color="var(--primary)" />
                                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx-1)' }}>
                                                Daftar Belanja
                                                {list.status === 'ACTIVE' && (
                                                    <span style={{
                                                        marginLeft: 8,
                                                        padding: '2px 8px', borderRadius: 20,
                                                        fontSize: 10, fontWeight: 700,
                                                        color: '#16a34a', background: '#f0fdf4',
                                                        border: '1px solid #bbf7d0',
                                                    }}>
                                                        Aktif
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                                            {list.startDate
                                                ? `${new Date(list.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} — ${new Date(list.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                                : `Rencana Makan #${list.planId}`
                                            }
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, color: 'var(--tx-4)', fontWeight: 600, textTransform: 'uppercase' }}>Est. Total</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tx-1)' }}>{fmt(totalEst)}</div>
                                        </div>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%',
                                            background: `conic-gradient(var(--primary) ${pct}%, var(--bg-muted) 0)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: '50%',
                                                background: 'var(--bg-surface)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, fontWeight: 800, color: 'var(--primary)',
                                            }}>
                                                {pct.toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* List body */}
                                <div className="card-body">
                                    <ShoppingListView
                                        list={list}
                                        onUpdate={(itemId, newStatus) => handleUpdate(idx, itemId, newStatus)}
                                        onApplyAll={() => loadAllLists(true)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <PageFeatureGuide guide={PAGE_GUIDES['/shopping']} />
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </Layout>
    );
};

export default Shopping;
