import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import api from '../services/api';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import { Check, X, Utensils, Flame, ChefHat, Zap, Wrench } from 'lucide-react';

const EQUIPMENT_ICONS = {
    'Kompor Gas':      Flame,
    'Rice Cooker':     Utensils,
    'Wajan':           Utensils,
    'Panci':           Utensils,
    'Oven':            ChefHat,
    'Blender':         Zap,
    'Kukusan':         Flame,
    'Talenan':         Utensils,
    'Parutan':         Wrench,
    'Pressure Cooker': Flame,
};

const Equipment = () => {
    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(null); // equipment_id being toggled

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
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20, maxWidth: 400,
                }}>
                    {[
                        { label: 'Dimiliki', value: owned.length, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                        { label: 'Tidak Dimiliki', value: notOwned.length, color: 'var(--tx-3)', bg: 'var(--bg-root)', border: 'var(--border-color)' },
                    ].map(s => (
                        <div key={s.label} style={{
                            padding: '12px 16px',
                            background: s.bg,
                            border: `1px solid ${s.border}`,
                            borderRadius: 'var(--r-sm)',
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--r-sm)' }} />
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {items.map(item => {
                        const isOwned   = !!item.owned;
                        const isLoading = saving === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleToggle(item)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '14px 16px',
                                    border: `2px solid ${isOwned ? '#16a34a' : 'var(--border-color)'}`,
                                    borderRadius: 'var(--r-sm)',
                                    background: isOwned ? '#f0fdf4' : 'var(--bg-surface)',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.18s ease',
                                    opacity: isLoading ? 0.6 : 1,
                                }}
                            >
                                {(() => {
                                    const EqIcon = EQUIPMENT_ICONS[item.name] || Utensils;
                                    return (
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 8,
                                            background: isOwned ? 'rgba(22, 163, 74, 0.12)' : 'var(--bg-muted)',
                                            border: `1px solid ${isOwned ? '#16a34a' : 'var(--border-color)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <EqIcon size={18} color={isOwned ? '#16a34a' : 'var(--tx-3)'} strokeWidth={2} />
                                        </div>
                                    );
                                })()}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: 600, fontSize: 13,
                                        color: isOwned ? '#15803d' : 'var(--tx-1)',
                                        marginBottom: 2,
                                    }}>
                                        {item.name}
                                    </div>
                                    {item.description && (
                                        <div style={{ fontSize: 11, color: 'var(--tx-3)', lineHeight: 1.3 }}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                    background: isOwned ? '#16a34a' : 'var(--bg-hover)',
                                    border: `1.5px solid ${isOwned ? '#16a34a' : 'var(--border-color)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.18s ease',
                                }}>
                                    {isLoading
                                        ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                                        : isOwned
                                            ? <Check size={12} color="#fff" strokeWidth={3} />
                                            : null
                                    }
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
            {/* ── Panduan Fitur Tertanam ── */}
            <PageFeatureGuide guide={PAGE_GUIDES['/equipment']} />
        </Layout>
    );
};

export default Equipment;
