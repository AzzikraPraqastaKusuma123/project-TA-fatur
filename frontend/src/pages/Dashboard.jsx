import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Wallet, Package, CalendarDays, ChefHat,
    AlertTriangle, ArrowRight, ShoppingCart,
    Lightbulb, Clock, Utensils, TrendingDown
} from 'lucide-react';

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

const SLOT_LABEL = {
    BREAKFAST: '🍳 Sarapan',
    LUNCH:     '☀️ Makan Siang',
    DINNER:    '🌙 Makan Malam',
    SNACK:     '🍎 Camilan',
};

/* ── Skeleton ── */
const Sk = ({ h = 16, w = '100%', r = 6 }) => (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
);

/* ── Today's Meal Row ── */
const MealRow = ({ meal }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)',
    }}>
        <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 18,
        }}>
            {meal.meal_slot === 'BREAKFAST' ? '🍳' :
             meal.meal_slot === 'LUNCH' ? '☀️' :
             meal.meal_slot === 'DINNER' ? '🌙' : '🍎'}
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

    useEffect(() => {
        api.get('/dashboard')
            .then(r => setData(r.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const budget      = data?.budget;
    const usedCost    = data?.recent_plan?.estimated_cost || 0;
    const budgetAmt   = budget?.amount || 0;
    const pct         = budgetAmt ? Math.min((usedCost / budgetAmt) * 100, 100) : 0;
    const remaining   = Math.max(0, budgetAmt - usedCost);

    const firstName   = user?.name ? user.name.split(' ')[0] : 'sana';

    const hour        = new Date().getHours();
    const greeting    = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';

    const todayMeals  = data?.upcoming_meals?.filter(m => {
        const mealDate = new Date(m.day_date);
        const today    = new Date();
        return mealDate.toDateString() === today.toDateString();
    }) || [];

    const hasActivePlan = (data?.active_plans || 0) > 0;

    return (
        <Layout title={`${greeting}, ${firstName} 👋`} subtitle="Berikut ringkasan perencanaan makan keluargamu hari ini">
            {/* ── Quick Actions ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12, marginBottom: 24,
            }} className="quickaction-grid">
                <Link
                    to="/recommendation"
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
                        <div>Buat Meal Plan</div>
                        <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.75, marginTop: 1 }}>Otomatis & sesuai anggaran</div>
                    </div>
                </Link>
                <Link
                    to="/shopping"
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
                        <div>Daftar Belanja</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--tx-3)', marginTop: 1 }}>Lihat kebutuhan minggu ini</div>
                    </div>
                </Link>
            </div>

            {/* ── Main 2-col layout ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 340px',
                gap: 20, alignItems: 'start',
            }} className="dashboard-grid">

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── Today's Plan ── */}
                    <div className="card">
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
                                }}>
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

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* ── Budget Card ── */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Anggaran Makan</div>
                                <div className="card-subtitle">
                                    {budget ? `${budget.days} hari` : 'Belum diatur'}
                                </div>
                            </div>
                            <Wallet size={18} color="var(--primary)" strokeWidth={2} />
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <Sk h={32} w="60%" r={4} />
                                    <Sk h={6} r={999} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Sk h={12} w="45%" r={4} />
                                        <Sk h={12} w="35%" r={4} />
                                    </div>
                                </div>
                            ) : budget ? (
                                <>
                                    <div style={{
                                        fontSize: 'var(--text-3xl)', fontWeight: 800,
                                        color: 'var(--tx-1)', letterSpacing: '-0.8px',
                                        marginBottom: 4,
                                    }}>
                                        {fmt(budgetAmt)}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--text-xs)', color: 'var(--tx-3)',
                                        marginBottom: 14,
                                    }}>
                                        Total anggaran keluarga
                                    </div>

                                    <div className="progress-track" style={{ marginBottom: 8 }}>
                                        <div
                                            className={`progress-fill ${pct > 90 ? 'red' : pct > 70 ? 'amber' : 'primary'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                        <span style={{ color: 'var(--tx-3)' }}>
                                            Terpakai: <strong style={{ color: 'var(--tx-1)' }}>{fmt(usedCost)}</strong>
                                        </span>
                                        <span style={{ color: pct > 90 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                                            Sisa {fmt(remaining)}
                                        </span>
                                    </div>

                                    {pct > 90 && (
                                        <div className="alert alert-danger" style={{ marginTop: 12, fontSize: 12 }}>
                                            <TrendingDown size={14} /> Anggaran hampir habis!
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="empty-state" style={{ padding: '20px 0' }}>
                                    <div className="empty-icon"><Wallet size={16} /></div>
                                    <h3>Belum ada anggaran</h3>
                                    <p>Atur anggaran makan keluargamu.</p>
                                    <Link to="/budget" className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
                                        Atur Anggaran
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Stats mini-grid ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { icon: Package, label: 'Stok Bahan', value: loading ? '—' : (data?.total_inventory || 0), sub: `${loading ? '—' : data?.low_stock || 0} menipis`, color: '#b85c38', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
                            { icon: ChefHat, label: 'Total Resep', value: loading ? '—' : (data?.total_recipes || 0), sub: 'Di katalog', color: 'var(--info)', bg: 'var(--info-bg)', border: 'var(--info-border)' },
                        ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
                            <div key={label} className="card" style={{ padding: '16px' }}>
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
                                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--tx-3)', fontSize: 'var(--text-sm)' }}>
                                        ✅ Semua stok dalam kondisi aman
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
