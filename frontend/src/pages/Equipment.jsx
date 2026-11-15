import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import api from '../services/api';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import { Check, Utensils, ChefHat, Award, Info } from 'lucide-react';

/* ── Equipment visual config (Guaranteed Accurate & Offline) ─── */
const EQUIPMENT_CONFIG = {
    'Kompor Gas': {
        emoji: '🔥',
        image: '/images/equipment/kompor-gas.jpg',
        color: '#ef4444', bg: '#fef2f2', border: '#fecaca',
        tip: 'Tungku kompor gas api biru untuk menumis, menggoreng, dan merebus cepat',
    },
    'Rice Cooker': {
        emoji: '🍚',
        image: '/images/equipment/rice-cooker.jpg',
        color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
        tip: 'Penanak nasi otomatis agar nasi pulen, matang merata, dan hangat',
    },
    'Wajan': {
        emoji: '🍳',
        image: '/images/equipment/wajan.jpg',
        color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
        tip: 'Wajan penggorengan cekung serbaguna untuk menumis bumbu & menggoreng',
    },
    'Panci': {
        emoji: '🫕',
        image: '/images/equipment/panci.jpg',
        color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
        tip: 'Panci bergagang untuk merebus sup, sayur kuah bening, dan kaldu',
    },
    'Oven': {
        emoji: '🥘',
        image: '/images/equipment/oven.jpg',
        color: '#d97706', bg: '#fffbeb', border: '#fde68a',
        tip: 'Oven pemanggang panas merata untuk memanggang daging, ayam, dan kue',
    },
    'Blender': {
        emoji: '🥤',
        image: '/images/equipment/blender.jpg',
        color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0',
        tip: 'Blender pisau putar tajam untuk menghaluskan bumbu dapur dan membuat jus',
    },
    'Kukusan': {
        emoji: '♨️',
        image: '/images/equipment/kukusan.jpg',
        color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc',
        tip: 'Kukusan bersusun dengan uap air panas untuk masakan sehat tanpa minyak',
    },
    'Talenan': {
        emoji: '🔪',
        image: '/images/equipment/talenan.jpg',
        color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb',
        tip: 'Alas talenan kayu higienis untuk memotong sayur, bumbu, dan daging',
    },
    'Parutan': {
        emoji: '🥕',
        image: '/images/equipment/parutan.jpg',
        color: '#f97316', bg: '#fff7ed', border: '#fed7aa',
        tip: 'Parutan stainless steel bergerigi untuk memarut kelapa, keju, dan bumbu',
    },
    'Pressure Cooker': {
        emoji: '⚡',
        image: '/images/equipment/pressure-cooker.jpg',
        color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
        tip: 'Panci presto tekanan tinggi untuk melunakkan daging sapi & ayam lebih cepat',
    },
};

function getEqConfig(name) {
    return EQUIPMENT_CONFIG[name] || {
        emoji: '🍴',
        image: null,
        color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
        tip: 'Peralatan memasak serbaguna',
    };
}

/* ── Equipment Card ──────────────────────────────────────────── */
const EquipmentCard = ({ item, isLoading, onToggle }) => {
    const [hov, setHov] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const isOwned = !!item.owned;
    const cfg = getEqConfig(item.name);

    return (
        <button
            type="button"
            disabled={isLoading}
            onClick={() => onToggle(item)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', flexDirection: 'column',
                padding: 0, textAlign: 'left', cursor: isLoading ? 'wait' : 'pointer',
                border: `2px solid ${isOwned ? '#16a34a' : hov ? cfg.border : 'var(--border-color)'}`,
                borderRadius: 16,
                background: isOwned ? cfg.bg : 'var(--bg-surface)',
                transition: 'all 0.2s ease',
                boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
                transform: hov && !isLoading ? 'translateY(-2px)' : 'none',
                opacity: isLoading ? 0.6 : 1,
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* ── Image Area ── */}
            <div style={{
                position: 'relative', width: '100%', height: 120, flexShrink: 0,
                overflow: 'hidden',
            }}>
                {cfg.image && !imgErr ? (
                    <img
                        src={cfg.image}
                        alt={item.name}
                        onError={() => setImgErr(true)}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            transform: hov ? 'scale(1.08)' : 'scale(1)',
                            filter: isOwned ? 'none' : 'grayscale(30%)',
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        background: isOwned
                            ? `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}40)`
                            : 'var(--bg-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 48,
                        transition: 'transform 0.3s ease',
                        transform: hov ? 'scale(1.08)' : 'scale(1)',
                    }}>
                        {cfg.emoji}
                    </div>
                )}

                {/* Owned overlay */}
                {isOwned && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(22,163,74,0.08), rgba(22,163,74,0.18))',
                    }} />
                )}

                {/* Check badge */}
                <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 26, height: 26, borderRadius: '50%',
                    background: isOwned ? '#16a34a' : 'rgba(255,255,255,0.85)',
                    border: `2px solid ${isOwned ? '#16a34a' : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s ease',
                }}>
                    {isLoading
                        ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                        : isOwned
                            ? <Check size={13} color="#fff" strokeWidth={3} />
                            : null
                    }
                </div>
            </div>

            {/* ── Card Body ── */}
            <div style={{ padding: '12px 14px', flex: 1 }}>
                <div style={{
                    fontWeight: 700, fontSize: 13.5,
                    color: isOwned ? cfg.color : 'var(--tx-1)',
                    marginBottom: 4,
                }}>
                    {item.name}
                </div>
                {item.description && (
                    <div style={{ fontSize: 11, color: 'var(--tx-3)', lineHeight: 1.4, marginBottom: 6 }}>
                        {item.description}
                    </div>
                )}
                {/* Tip */}
                <div style={{
                    fontSize: 10.5, color: isOwned ? cfg.color : 'var(--tx-4)',
                    fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: 4,
                }}>
                    <Info size={10} style={{ flexShrink: 0, marginTop: 1 }} />
                    {cfg.tip}
                </div>
            </div>

            {/* Owned status bar */}
            {isOwned && (
                <div style={{
                    padding: '7px 14px',
                    borderTop: `1px solid ${cfg.color}30`,
                    background: `${cfg.color}10`,
                    fontSize: 10.5, fontWeight: 700, color: cfg.color,
                    display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    <Check size={11} strokeWidth={3} /> Dimiliki · Klik untuk lepas
                </div>
            )}
            {!isOwned && (
                <div style={{
                    padding: '7px 14px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-muted)',
                    fontSize: 10.5, fontWeight: 600, color: 'var(--tx-4)',
                    display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    + Klik untuk tandai dimiliki
                </div>
            )}
        </button>
    );
};

/* ── Main Page ──────────────────────────────────────────────── */
const Equipment = () => {
    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(null);

    const load = () => {
        setLoading(true);
        api.get('/equipment')
            .then(r => setItems(r.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleToggle = async (item) => {
        setSaving(item.id);
        try {
            if (item.owned) {
                await api.delete(`/equipment/${item.id}`);
            } else {
                await api.post('/equipment', { equipment_id: item.id });
            }
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memperbarui peralatan.');
        } finally {
            setSaving(null);
        }
    };

    const owned    = items.filter(i => i.owned);
    const notOwned = items.filter(i => !i.owned);
    const pct      = items.length ? Math.round((owned.length / items.length) * 100) : 0;

    return (
        <Layout
            title="Peralatan Masak"
            subtitle="Tandai peralatan yang Anda miliki agar sistem hanya merekomendasikan resep yang sesuai"
        >
            {/* Info banner */}
            <div style={{
                padding: '12px 16px', marginBottom: 20,
                background: 'var(--blue-bg, #eff6ff)',
                border: '1px solid var(--blue-border, #bfdbfe)',
                borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--blue, #1d4ed8)',
            }}>
                <strong>Penting:</strong> Sistem hanya akan merekomendasikan resep yang bisa dibuat dengan peralatan yang Anda centang.
                Semakin lengkap peralatan yang ditambahkan, semakin banyak pilihan resep yang tersedia.
            </div>

            {/* Stats */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Dimiliki',          value: owned.length,    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: ChefHat },
                        { label: 'Belum Dimiliki',    value: notOwned.length, color: '#6b7280', bg: 'var(--bg-muted)', border: 'var(--border-color)', icon: Utensils },
                        { label: 'Kelengkapan Dapur', value: `${pct}%`,       color: pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626', bg: '#f5f3ff', border: '#ddd6fe', icon: Award },
                    ].map(s => (
                        <div key={s.label} style={{
                            padding: '14px 16px',
                            background: s.bg, border: `1px solid ${s.border}`,
                            borderRadius: 14,
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                background: `${s.color}18`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <s.icon size={18} color={s.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                    {s.label}
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>
                                    {s.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Progress bar */}
            {!loading && items.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--tx-3)', marginBottom: 6 }}>
                        <span>Progress Kelengkapan Peralatan</span>
                        <span style={{ color: pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 8, borderRadius: 999, background: 'var(--bg-muted)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <div style={{
                            width: `${pct}%`, height: '100%', borderRadius: 999,
                            background: pct >= 70
                                ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                                : pct >= 40
                                    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                                    : 'linear-gradient(90deg, #dc2626, #ef4444)',
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <div className="skeleton" style={{ height: 120, borderRadius: 0 }} />
                            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />
                                <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '70%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><Utensils size={18} /></div>
                        <h3>Belum ada data peralatan</h3>
                        <p>Hubungi admin untuk menambahkan data peralatan memasak.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Owned section */}
                    {owned.length > 0 && (
                        <div style={{ marginBottom: 28 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                                fontSize: 13, fontWeight: 700, color: '#16a34a',
                            }}>
                                <ChefHat size={16} color="#16a34a" />
                                Peralatan yang Dimiliki ({owned.length})
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                                {owned.map(item => (
                                    <EquipmentCard
                                        key={item.id}
                                        item={item}
                                        isLoading={saving === item.id}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Not owned section */}
                    {notOwned.length > 0 && (
                        <div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                                fontSize: 13, fontWeight: 700, color: 'var(--tx-3)',
                            }}>
                                <Utensils size={16} color="var(--tx-3)" />
                                Belum Dimiliki ({notOwned.length}) — Klik untuk tandai
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                                {notOwned.map(item => (
                                    <EquipmentCard
                                        key={item.id}
                                        item={item}
                                        isLoading={saving === item.id}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Panduan Fitur Tertanam ── */}
            <PageFeatureGuide guide={PAGE_GUIDES['/equipment']} />
        </Layout>
    );
};

export default Equipment;
