import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    Flame, Dumbbell, Droplets, Wheat, Leaf,
    Sun, Coffee, Moon, Apple, TrendingUp,
    AlertCircle, CheckCircle2, Info
} from 'lucide-react';

const SLOT_CONFIG = {
    BREAKFAST: { label: 'Sarapan',     icon: Coffee, color: '#f59e0b', bg: '#fffbeb' },
    LUNCH:     { label: 'Makan Siang', icon: Sun,    color: '#10b981', bg: '#f0fdf4' },
    DINNER:    { label: 'Makan Malam', icon: Moon,   color: '#6366f1', bg: '#eef2ff' },
    SNACK:     { label: 'Camilan',     icon: Apple,  color: '#ec4899', bg: '#fdf4ff' },
};

const fmt1 = n => Number(n || 0).toFixed(1);
const fmtInt = n => Math.round(Number(n || 0)).toLocaleString('id-ID');

/* â”€â”€ Nutrient Bar â”€â”€ */
const NutrientBar = ({ label, value, target, unit, color, icon: Icon }) => {
    const pct = Math.min((value / (target || 1)) * 100, 100);
    const over = value > target;
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: color + '22', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Icon size={14} color={color} />
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--tx-2)' }}>{label}</span>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: over ? 'var(--danger)' : 'var(--tx-1)' }}>
                    {fmt1(value)}<span style={{ color: 'var(--tx-4)', fontWeight: 400 }}>/{fmt1(target)} {unit}</span>
                </span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: over ? 'var(--danger)' : color,
                    transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>{Math.round(pct)}% dari target</span>
                {over && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>âš  Melebihi target</span>}
                {!over && pct >= 80 && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>âœ“ Tercapai</span>}
            </div>
        </div>
    );
};

/* â”€â”€ Meal Slot Card â”€â”€ */
const MealSlotCard = ({ meal }) => {
    const cfg = SLOT_CONFIG[meal.meal_slot] || SLOT_CONFIG.BREAKFAST;
    const Icon = cfg.icon;
    return (
        <div style={{
            background: cfg.bg,
            border: `1px solid ${cfg.color}33`,
            borderLeft: `4px solid ${cfg.color}`,
            borderRadius: 'var(--r-sm)',
            padding: '14px 16px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: cfg.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={18} color={cfg.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                    {cfg.label}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--tx-1)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {meal.recipe_name}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Kalori',   val: `${fmtInt(meal.calories)} kkal`, color: '#f59e0b' },
                        { label: 'Protein',  val: `${fmt1(meal.protein)}g`,  color: '#10b981' },
                        { label: 'Lemak',    val: `${fmt1(meal.fat)}g`,      color: '#f97316' },
                        { label: 'Karbo',    val: `${fmt1(meal.carbs)}g`,    color: '#6366f1' },
                    ].map(n => (
                        <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: n.color, display: 'inline-block' }} />
                            <span style={{ fontSize: 11, color: 'var(--tx-3)' }}>{n.label}: <b style={{ color: 'var(--tx-2)' }}>{n.val}</b></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* â”€â”€ Calorie Ring â”€â”€ */
const CalRing = ({ calories, target }) => {
    const pct = Math.min((calories / (target || 1)) * 100, 100);
    const r = 54;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const over = calories > target;
    return (
        <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="10" />
                <circle cx="70" cy="70" r={r} fill="none"
                    stroke={over ? 'var(--danger)' : 'var(--primary)'}
                    strokeWidth="10"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <Flame size={18} color={over ? 'var(--danger)' : 'var(--primary)'} />
                <div style={{ fontSize: 22, fontWeight: 800, color: over ? 'var(--danger)' : 'var(--tx-1)', lineHeight: 1.1 }}>
                    {fmtInt(calories)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--tx-4)' }}>kkal</div>
            </div>
        </div>
    );
};

/* â”€â”€ Main Component â”€â”€ */
export default function Nutrition() {
    const [data, setData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('today');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [todayRes, summRes] = await Promise.all([
                    api.get('/nutrition/today'),
                    api.get('/nutrition/summary'),
                ]);
                setData(todayRes.data.data);
                setSummary(summRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (loading) return (
        <Layout title="Tracker Nutrisi">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
            </div>
        </Layout>
    );

    const { meals = [], totals = {}, targets = {}, family_size = 1 } = data || {};
    const noData = meals.length === 0;

    return (
        <Layout title="Tracker Nutrisi">
            {/* Header */}
            <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #2c4a2e 0%, #3d6b40 100%)', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
                            Hari Ini
                        </div>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: 'var(--text-xl)', fontWeight: 800 }}>Tracker Nutrisi</h2>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)' }}>{today}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Ukuran Keluarga</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{family_size} orang</div>
                    </div>
                </div>
            </div>

            {noData ? (
                <div className="card">
                    <div className="empty-state" style={{ padding: '48px 24px' }}>
                        <div className="empty-icon"><Leaf size={24} /></div>
                        <h3>Belum Ada Data Nutrisi</h3>
                        <p>Buat rencana makan terlebih dahulu untuk melacak nutrisi harian Anda.</p>
                        <a href="/recommendation" className="btn btn-primary" style={{ marginTop: 12 }}>Buat Rencana Makan</a>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                    {/* Left: Kalori Ring + Meals */}
                    <div>
                        {/* Calorie Summary */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Flame size={16} color="var(--primary)" /> Ringkasan Kalori Hari Ini
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                                <CalRing calories={totals.calories || 0} target={targets.calories || 2000} />
                                <div style={{ flex: 1, minWidth: 140 }}>
                                    <div style={{ fontSize: 13, color: 'var(--tx-3)', marginBottom: 4 }}>Terkonsumsi</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--tx-1)' }}>
                                        {fmtInt(totals.calories || 0)}
                                        <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--tx-4)' }}> kkal</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--tx-3)', marginTop: 8, marginBottom: 2 }}>Target</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx-2)' }}>
                                        {fmtInt(targets.calories || 0)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--tx-4)' }}>kkal</span>
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                        {totals.calories >= targets.calories * 0.8
                                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--success)', background: 'var(--success-bg)', padding: '3px 10px', borderRadius: 99 }}>
                                                <CheckCircle2 size={12} /> Target tercapai
                                              </span>
                                            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--warning)', background: 'var(--warning-bg)', padding: '3px 10px', borderRadius: 99 }}>
                                                <AlertCircle size={12} /> Perlu tambahan {fmtInt((targets.calories || 0) - (totals.calories || 0))} kkal
                                              </span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meal Slots Today */}
                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sun size={16} color="var(--primary)" /> Menu Hari Ini ({meals.length} waktu makan)
                            </h3>
                            {meals.map((meal, i) => <MealSlotCard key={i} meal={meal} />)}
                        </div>
                    </div>

                    {/* Right: Macro Breakdown */}
                    <div>
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 className="card-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={16} color="var(--primary)" /> Rincian Makronutrien
                            </h3>
                            <NutrientBar label="Protein"    value={totals.protein || 0} target={targets.protein || 50}  unit="g" color="#10b981" icon={Dumbbell} />
                            <NutrientBar label="Lemak"      value={totals.fat     || 0} target={targets.fat     || 65}  unit="g" color="#f97316" icon={Droplets} />
                            <NutrientBar label="Karbohidrat" value={totals.carbs  || 0} target={targets.carbs   || 300} unit="g" color="#6366f1" icon={Wheat}    />
                            <NutrientBar label="Serat"       value={totals.fiber  || 0} target={targets.fiber   || 25}  unit="g" color="#84cc16" icon={Leaf}     />
                        </div>

                        {/* Info Card */}
                        <div className="card" style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <Info size={18} color="var(--info)" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--info)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                                        Cara Membaca Tracker Ini
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.7 }}>
                                        <li>Data diambil dari rencana makan aktif Anda.</li>
                                        <li>Target dihitung berdasarkan kebutuhan rata-rata keluarga Anda ({family_size} orang).</li>
                                        <li>Bar hijau = tercapai, bar merah = melebihi batas harian.</li>
                                        <li>Perbarui rencana makan untuk mendapatkan data akurat.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Top Recipes */}
                        {summary?.top_recipes?.length > 0 && (
                            <div className="card" style={{ marginTop: 16 }}>
                                <h3 className="card-title" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Dumbbell size={16} color="var(--primary)" /> Resep Tinggi Protein
                                </h3>
                                {summary.top_recipes.map((r, i) => (
                                    <div key={r.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 0',
                                        borderBottom: i < summary.top_recipes.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 8,
                                            background: 'var(--primary-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 13, fontWeight: 800, color: 'var(--primary)',
                                        }}>{i + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--tx-1)' }}>{r.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 2 }}>
                                                {fmt1(r.total_protein)}g protein Â· {fmtInt(r.total_calories)} kkal
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--tx-4)', fontWeight: 500 }}>
                                            {r.times_used}Ã— dipakai
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* -- Panduan Fitur Tertanam -- */}
            <PageFeatureGuide guide={PAGE_GUIDES['/nutrition']} />
        </Layout>
    );
}

