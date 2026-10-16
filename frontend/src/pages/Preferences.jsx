import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Trash2, Heart, ShieldAlert, Search } from 'lucide-react';

const TYPE_CONFIG = {
    FAVORITE: {
        label:  'Favorit',
        badge:  'badge-green',
        icon:   <Heart size={11} />,
        color:  '#15803d',
        bg:     '#f0fdf4',
        border: '#bbf7d0',
    },
    AVOID: {
        label:  'Hindari / Alergi',
        badge:  'badge-red',
        icon:   <ShieldAlert size={11} />,
        color:  '#dc2626',
        bg:     '#fef2f2',
        border: '#fecaca',
    },
};

const Preferences = () => {
    const [prefs, setPrefs]           = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [modal, setModal]           = useState(false);
    const [form, setForm]             = useState({ ingredient_id: '', preference_type: 'AVOID' });
    const [saving, setSaving]         = useState(false);
    const [search, setSearch]         = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const load = () => {
        setLoading(true);
        api.get('/preferences')
            .then(r => setPrefs(r.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        api.get('/ingredients').then(r => setIngredients(r.data.data || []));
    }, []);

    const handleSave = async e => {
        e.preventDefault();
        if (!form.ingredient_id) return;
        setSaving(true);
        try {
            await api.post('/preferences', form);
            setModal(false);
            setForm({ ingredient_id: '', preference_type: 'AVOID' });
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan preferensi.');
        } finally { setSaving(false); }
    };

    const handleDelete = async id => {
        if (!confirm('Hapus preferensi ini?')) return;
        await api.delete(`/preferences/${id}`);
        load();
    };

    // Filter ingredients that are not already in preferences
    const existingIngIds = prefs.map(p => p.ingredient_id);
    const availableIngredients = ingredients.filter(i => !existingIngIds.includes(i.id));

    // Filter displayed preferences
    const filtered = prefs.filter(p => {
        const matchSearch = p.ingredient_name?.toLowerCase().includes(search.toLowerCase());
        const matchType   = filterType === 'ALL' || p.preference_type === filterType;
        return matchSearch && matchType;
    });

    const favorites = filtered.filter(p => p.preference_type === 'FAVORITE');
    const avoids    = filtered.filter(p => p.preference_type === 'AVOID');

    const renderGroup = (items, type) => {
        const cfg = TYPE_CONFIG[type];
        if (items.length === 0) return null;
        return (
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 20,
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        fontSize: 12, fontWeight: 700, color: cfg.color,
                    }}>
                        {cfg.icon} {cfg.label} ({items.length})
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {items.map(p => (
                        <div key={p.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 12px',
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            borderRadius: 20,
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)' }}>
                                {p.ingredient_name}
                            </span>
                            {p.category && (
                                <span style={{ fontSize: 10.5, color: 'var(--tx-3)' }}>
                                    {p.category}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 18, height: 18, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.08)',
                                    color: 'var(--tx-2)',
                                    transition: 'background 0.15s',
                                    flexShrink: 0,
                                }}
                                title="Hapus"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Layout
            title="Preferensi & Pantangan"
            subtitle="Tandai bahan yang disukai atau dihindari untuk menyempurnakan rekomendasi menu"
            actions={
                <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
                    <Plus size={12} strokeWidth={2.5} /> Tambah
                </button>
            }
        >
            {/* Info banner */}
            <div style={{
                padding: '12px 16px', marginBottom: 20,
                background: 'var(--amber-bg, #fffbeb)',
                border: '1px solid var(--amber-border, #fde68a)',
                borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--amber, #d97706)',
            }}>
                <strong>Bahan Hindari/Alergi</strong> akan otomatis dikecualikan dari semua resep yang direkomendasikan —
                ini adalah aturan wajib yang tidak dapat dilanggar oleh sistem.
                <strong style={{ marginLeft: 4 }}>Bahan Favorit</strong> meningkatkan skor prioritas resep yang menggunakannya.
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx-3)' }} />
                    <input
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: 32 }}
                        placeholder="Cari bahan..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[['ALL', 'Semua'], ['AVOID', 'Hindari'], ['FAVORITE', 'Favorit']].map(([val, label]) => (
                        <button
                            key={val}
                            type="button"
                            className="btn btn-sm"
                            style={{
                                background: filterType === val ? 'var(--tx-1)' : 'var(--bg-hover)',
                                color:      filterType === val ? 'var(--tx-inverse)' : 'var(--tx-2)',
                                border:     filterType === val ? 'none' : '1px solid var(--border-color)',
                            }}
                            onClick={() => setFilterType(val)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginLeft: 'auto' }}>
                    {filtered.length} preferensi
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--r-sm)' }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><Heart size={16} /></div>
                        <h3>{search ? 'Bahan tidak ditemukan' : 'Belum ada preferensi'}</h3>
                        <p>
                            {search
                                ? `Tidak ada bahan yang cocok dengan "${search}"`
                                : 'Tambahkan bahan yang Anda sukai atau hindari untuk meningkatkan kualitas rekomendasi.'
                            }
                        </p>
                        {!search && (
                            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
                                <Plus size={13} /> Tambah Preferensi
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {renderGroup(avoids,    'AVOID')}
                    {renderGroup(favorites, 'FAVORITE')}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <span className="modal-title">Tambah Preferensi Bahan</span>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                {/* Type selector */}
                                <div className="form-group">
                                    <label className="form-label">Jenis Preferensi <span className="req">*</span></label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, preference_type: val }))}
                                                style={{
                                                    padding: '10px',
                                                    border: `2px solid ${form.preference_type === val ? cfg.color : 'var(--border-color)'}`,
                                                    borderRadius: 'var(--r-sm)',
                                                    background: form.preference_type === val ? cfg.bg : 'var(--bg-surface)',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                <div style={{ fontSize: 16, marginBottom: 4 }}>
                                                    {val === 'FAVORITE' ? '❤️' : '🚫'}
                                                </div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: form.preference_type === val ? cfg.color : 'var(--tx-2)' }}>
                                                    {cfg.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ingredient selector */}
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Pilih Bahan <span className="req">*</span></label>
                                    <select
                                        className="form-control"
                                        value={form.ingredient_id}
                                        onChange={e => setForm(f => ({ ...f, ingredient_id: e.target.value }))}
                                        required
                                    >
                                        <option value="">-- Pilih bahan makanan --</option>
                                        {availableIngredients.map(i => (
                                            <option key={i.id} value={i.id}>
                                                {i.name} {i.category ? `(${i.category})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {availableIngredients.length === 0 && (
                                        <div className="form-hint">Semua bahan sudah memiliki preferensi.</div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !form.ingredient_id}>
                                    {saving ? <><span className="spinner" /> Menyimpan...</> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Preferences;
