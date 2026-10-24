import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    BarChart2, TrendingUp, TrendingDown,
    Wallet, ChefHat, Flame, PieChart,
    Calendar, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;
const fmtShort = n => {
    const v = Number(n || 0);
    if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000)     return `Rp${(v / 1_000).toFixed(0)}rb`;
    return `Rp${v}`;
};

const COLORS = ['#2c4a2e', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#f97316'];

/* â”€â”€ Stat Card â”€â”€ */
const StatCard = ({ label, value, sub, icon: Icon, color = 'var(--primary)', trend }) => (
    <div className="card" style={{ flex: '1 1 160px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ fontSize: 11, color: 'var(--tx-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                    {label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx-1)', lineHeight: 1.1 }}>{value}</div>
                {sub && <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 4 }}>{sub}</div>}
            </div>
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={18} color={color} />
            </div>
        </div>
        {trend !== undefined && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                {trend > 0
                    ? <><ArrowUpRight size={13} color="var(--success)" /><span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>{trend}% lebih hemat</span></>
                    : trend < 0
                        ? <><ArrowDownRight size={13} color="var(--danger)" /><span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>{Math.abs(trend)}% lebih mahal</span></>
                        : <><Minus size={13} color="var(--tx-4)" /><span style={{ fontSize: 11, color: 'var(--tx-4)', fontWeight: 600 }}>Stabil</span></>
                }
            </div>
        )}
    </div>
);

const CustomTooltipSpend = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
            <div style={{ fontWeight: 700, color: 'var(--tx-1)', marginBottom: 6, fontSize: 13 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
                    {p.name}: <b>{fmtShort(p.value)}</b>
                </div>
            ))}
        </div>
    );
};

export default function Analytics() {
    const [overview, setOverview] = useState(null);
    const [spending, setSpending] = useState([]);
    const [topRecipes, setTopRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetPlans, setBudgetPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('spending');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ovRes, spRes, rpRes, catRes, bpRes] = await Promise.all([
                    api.get('/analytics/overview'),
                    api.get('/analytics/spending?months=6'),
                    api.get('/analytics/recipes'),
                    api.get('/analytics/categories'),
                    api.get('/analytics/budget'),
                ]);
                setOverview(ovRes.data.data);
                setSpending(spRes.data.data || []);
                setTopRecipes(rpRes.data.data || []);
                setCategories(catRes.data.data || []);
                setBudgetPlans(bpRes.data.data?.plans || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const tabs = [
        { id: 'spending',   label: 'Tren Pengeluaran', icon: TrendingUp },
        { id: 'recipes',    label: 'Resep Populer',    icon: ChefHat },
        { id: 'categories', label: 'Kategori Makanan', icon: PieChart },
        { id: 'budget',     label: 'Budget vs Realisasi', icon: Wallet },
    ];

    if (loading) return (
        <Layout title="Analitik">
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, flex: '1 1 160px', borderRadius: 12 }} />)}
            </div>
            <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
        </Layout>
    );

    const savingsPct = overview?.total_budget > 0
        ? Math.round(((overview.total_budget - overview.total_spent) / overview.total_budget) * 100) : 0;

    return (
        <Layout title="Analitik">
            {/* Summary Stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <StatCard label="Total Rencana" value={overview?.total_plans || 0} icon={Calendar} color="#6366f1" sub="rencana makan dibuat" />
                <StatCard label="Total Dibelanjakan" value={fmtShort(overview?.total_spent)} icon={Wallet} color="var(--primary)" sub="dari semua rencana" />
                <StatCard label="Total Dihemat" value={fmtShort(overview?.total_savings)} icon={TrendingDown} color="var(--success)" trend={savingsPct} />
                <StatCard label="Resep Dipakai" value={overview?.total_recipes_used || 0} icon={ChefHat} color="var(--accent)" sub="resep unik" />
                <StatCard label="Rata-rata Kalori" value={`${(overview?.avg_daily_calories || 0).toLocaleString()} kkal`} icon={Flame} color="#f59e0b" sub="per hari" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-muted)', padding: 4, borderRadius: 10, flexWrap: 'wrap' }}>
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                            flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                            background: activeTab === t.id ? 'var(--bg-surface)' : 'transparent',
                            color: activeTab === t.id ? 'var(--primary)' : 'var(--tx-3)',
                            boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s',
                        }}>
                            <Icon size={14} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'spending' && (
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: 20 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={16} color="var(--primary)" /> Tren Pengeluaran 6 Bulan Terakhir
                        </span>
                    </h3>
                    {spending.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon"><BarChart2 size={20} /></div><h3>Belum Ada Data</h3><p>Buat beberapa rencana makan untuk melihat tren pengeluaran.</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={spending} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#2c4a2e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2c4a2e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--tx-3)' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 11, fill: 'var(--tx-3)' }} axisLine={false} tickLine={false} width={70} />
                                <Tooltip content={<CustomTooltipSpend />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="avg_budget" name="Budget" stroke="#6366f1" fill="url(#colorBudget)" strokeWidth={2} strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="total_spent" name="Dibelanjakan" stroke="#2c4a2e" fill="url(#colorSpent)" strokeWidth={2.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}

            {activeTab === 'recipes' && (
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: 20 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ChefHat size={16} color="var(--primary)" /> 10 Resep Paling Sering Digunakan
                        </span>
                    </h3>
                    {topRecipes.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon"><ChefHat size={20} /></div><h3>Belum Ada Data</h3></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topRecipes.slice(0,8)} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--tx-3)' }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: 'var(--tx-2)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    content={({ active, payload }) => active && payload?.length ? (
                                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px' }}>
                                            <b style={{ color: 'var(--tx-1)', fontSize: 13 }}>{payload[0]?.payload?.name}</b>
                                            <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 4 }}>{payload[0]?.value}Ã— digunakan</div>
                                            <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>{Math.round(payload[0]?.payload?.total_calories || 0)} kkal</div>
                                        </div>
                                    ) : null}
                                />
                                <Bar dataKey="usage_count" name="Dipakai" fill="var(--primary)" radius={[0, 6, 6, 0]}>
                                    {topRecipes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: 20 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PieChart size={16} color="var(--primary)" /> Distribusi Kategori Makanan
                        </span>
                    </h3>
                    {categories.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon"><PieChart size={20} /></div><h3>Belum Ada Data</h3></div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                            <ResponsiveContainer width="100%" height={280} style={{ flex: '1 1 260px' }}>
                                <RePieChart>
                                    <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                                        {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [`${v} resep`, n]} />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: '1 1 180px' }}>
                                {categories.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: 'var(--tx-2)', fontWeight: 600, flex: 1 }}>{c.category}</span>
                                        <span style={{ fontSize: 13, color: 'var(--tx-1)', fontWeight: 700 }}>{c.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'budget' && (
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: 20 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Wallet size={16} color="var(--primary)" /> Riwayat Budget vs Pengeluaran Aktual
                        </span>
                    </h3>
                    {budgetPlans.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon"><Wallet size={20} /></div><h3>Belum Ada Data</h3></div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        {['Periode', 'Budget', 'Realisasi', 'Hemat', 'Utilisasi', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--tx-3)', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgetPlans.map((p, i) => {
                                        const saving = (p.total_budget || 0) - (p.estimated_cost || 0);
                                        const over = saving < 0;
                                        return (
                                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-muted)' }}>
                                                <td style={{ padding: '10px 12px', color: 'var(--tx-2)', fontWeight: 500 }}>
                                                    {new Date(p.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} â€“{' '}
                                                    {new Date(p.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: 'var(--tx-2)' }}>{fmt(p.total_budget)}</td>
                                                <td style={{ padding: '10px 12px', color: 'var(--tx-1)', fontWeight: 600 }}>{fmt(p.estimated_cost)}</td>
                                                <td style={{ padding: '10px 12px', fontWeight: 600, color: over ? 'var(--danger)' : 'var(--success)' }}>
                                                    {over ? 'âˆ’' : '+'}{fmt(Math.abs(saving))}
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                                        background: p.utilization_pct > 100 ? 'var(--danger-bg)' : p.utilization_pct > 85 ? 'var(--warning-bg)' : 'var(--success-bg)',
                                                        color: p.utilization_pct > 100 ? 'var(--danger)' : p.utilization_pct > 85 ? 'var(--warning)' : 'var(--success)',
                                                    }}>
                                                        {p.utilization_pct || 0}%
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{
                                                        display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                                        background: p.status === 'ACTIVE' ? 'var(--primary-light)' : 'var(--bg-muted)',
                                                        color: p.status === 'ACTIVE' ? 'var(--primary)' : 'var(--tx-4)',
                                                    }}>
                                                        {p.status === 'ACTIVE' ? 'Aktif' : 'Selesai'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            {/* -- Panduan Fitur Tertanam -- */}
            <PageFeatureGuide guide={PAGE_GUIDES['/analytics']} />
        </Layout>
    );
}

