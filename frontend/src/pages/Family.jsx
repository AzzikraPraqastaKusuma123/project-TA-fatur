import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import api from '../services/api';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

const ACTIVITY = {
    SEDENTARY:         { label: 'Tidak Aktif',     short: 'Sedentary' },
    LIGHTLY_ACTIVE:    { label: 'Sedikit Aktif',   short: 'Light' },
    MODERATELY_ACTIVE: { label: 'Cukup Aktif',     short: 'Moderate' },
    VERY_ACTIVE:       { label: 'Sangat Aktif',    short: 'Active' },
    EXTRA_ACTIVE:      { label: 'Ekstra Aktif',    short: 'Extra' },
};

const GENDERS = [
    { value: 'MALE', label: 'Laki-laki' },
    { value: 'FEMALE', label: 'Perempuan' },
];

const EMPTY = {
    name: '', age: '', gender: 'MALE',
    weight: '', height: '', activity_level: 'MODERATELY_ACTIVE',
};

const Family = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal]     = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm]       = useState(EMPTY);
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState('');

    const load = () => {
        setLoading(true);
        api.get('/family-members')
            .then(r => setMembers(r.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
    const openEdit   = m  => {
        setEditing(m);
        setForm({ name: m.name, age: m.age, gender: m.gender, weight: m.weight, height: m.height, activity_level: m.activity_level });
        setError(''); setModal(true);
    };

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            if (editing) await api.put(`/family-members/${editing.id}`, form);
            else         await api.post('/family-members', form);
            setModal(false);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan.');
        } finally { setSaving(false); }
    };

    const handleDelete = async id => {
        if (!confirm('Hapus anggota ini?')) return;
        await api.delete(`/family-members/${id}`);
        load();
    };

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <Layout
            title="Anggota Keluarga"
            subtitle="Data keluarga untuk kalkulasi kebutuhan nutrisi"
            actions={
                <button className="btn btn-primary btn-sm" onClick={openCreate}>
                    <Plus size={12} strokeWidth={2.5} /> Tambah
                </button>
            }
        >
            {loading ? (
                <div className="g-3" style={{ gap: 12 }}>
                    {[1,2,3].map(i => (
                        <div key={i} className="card">
                            <div className="card-body">
                                <div className="skeleton" style={{ height: 180 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : members.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><Users size={16} /></div>
                        <h3>Belum ada anggota keluarga</h3>
                        <p>Tambahkan anggota keluarga untuk menghitung kebutuhan nutrisi dan merencanakan menu.</p>
                        <button className="btn btn-primary" onClick={openCreate}>
                            <Plus size={13} /> Tambah Anggota
                        </button>
                    </div>
                </div>
            ) : (
                <div className="g-3" style={{ gap: 12 }}>
                    {members.map(m => {
                        const initials = m.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
                        const isMale   = m.gender === 'MALE';
                        return (
                            <div key={m.id} className="card">
                                {/* Top border accent */}
                                <div style={{ height: 2, background: 'var(--border-strong)', borderRadius: 'var(--r-md) var(--r-md) 0 0' }} />

                                <div style={{ padding: '14px 16px' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 'var(--r-xs)',
                                            background: 'var(--tx-1)', color: 'var(--tx-inverse)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                                            transition: 'background var(--t-slow), color var(--t-slow)',
                                        }}>
                                            {initials}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--tx-1)', letterSpacing: '-0.2px' }}>
                                                {m.name}
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginTop: 1 }}>
                                                {m.age} th · {isMale ? 'Laki-laki' : 'Perempuan'} · {ACTIVITY[m.activity_level]?.short}
                                            </div>
                                        </div>
                                        <span className="badge badge-default">
                                            {ACTIVITY[m.activity_level]?.short}
                                        </span>
                                    </div>

                                    {/* Stats grid */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--r-xs)',
                                        overflow: 'hidden',
                                        marginBottom: 10,
                                    }}>
                                        {[
                                            ['Berat', `${m.weight} kg`],
                                            ['Tinggi', `${m.height} cm`],
                                            ['Kalori/hari', `${Math.round(m.daily_calories_target || 0)} kkal`],
                                            ['Protein',  `${Math.round(m.daily_protein_target || 0)} g`],
                                        ].map(([label, val], i) => (
                                            <div key={label} style={{
                                                padding: '7px 10px',
                                                background: 'var(--bg-root)',
                                                borderRight:  i % 2 === 0 ? '1px solid var(--border-color)' : 'none',
                                                borderBottom: i < 2       ? '1px solid var(--border-color)' : 'none',
                                                transition: 'background var(--t-slow)',
                                            }}>
                                                <div style={{ fontSize: 10, color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {label}
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)', marginTop: 2 }}>
                                                    {val}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Macro row */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                                        background: 'var(--bg-hover)',
                                        borderRadius: 'var(--r-xs)',
                                        border: '1px solid var(--border-color)',
                                        overflow: 'hidden',
                                        marginBottom: 12,
                                        transition: 'background var(--t-slow), border-color var(--t-slow)',
                                    }}>
                                        {[
                                            ['Karbo', `${Math.round(m.daily_carbs_target || 0)}g`],
                                            ['Lemak', `${Math.round(m.daily_fat_target || 0)}g`],
                                            ['Protein', `${Math.round(m.daily_protein_target || 0)}g`],
                                        ].map(([label, val], i, arr) => (
                                            <div key={label} style={{
                                                padding: '6px 8px', textAlign: 'center',
                                                borderRight: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                                            }}>
                                                <div style={{ fontSize: 11, color: 'var(--tx-3)', marginBottom: 2 }}>{label}</div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)' }}>{val}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            style={{ flex: 1 }}
                                            onClick={() => openEdit(m)}
                                        >
                                            <Pencil size={11} /> Edit
                                        </button>
                                        <button
                                            className="btn btn-danger-ghost btn-sm btn-icon"
                                            onClick={() => handleDelete(m.id)}
                                            title="Hapus"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{editing ? 'Edit Anggota' : 'Tambah Anggota'}</span>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                {error && <div className="alert alert-error">{error}</div>}

                                <div className="form-group">
                                    <label className="form-label">Nama <span className="req">*</span></label>
                                    <input className="form-control" placeholder="Contoh: Ayah" value={form.name} onChange={e => upd('name', e.target.value)} required />
                                </div>

                                <div className="g-2">
                                    <div className="form-group">
                                        <label className="form-label">Usia <span className="req">*</span></label>
                                        <input type="number" className="form-control" placeholder="25" value={form.age} onChange={e => upd('age', e.target.value)} min="1" max="120" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Jenis Kelamin <span className="req">*</span></label>
                                        <select className="form-control" value={form.gender} onChange={e => upd('gender', e.target.value)}>
                                            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Berat (kg) <span className="req">*</span></label>
                                        <input type="number" step="0.1" className="form-control" placeholder="60" value={form.weight} onChange={e => upd('weight', e.target.value)} min="1" required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tinggi (cm) <span className="req">*</span></label>
                                        <input type="number" step="0.1" className="form-control" placeholder="165" value={form.height} onChange={e => upd('height', e.target.value)} min="30" required />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Tingkat Aktivitas <span className="req">*</span></label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {Object.entries(ACTIVITY).map(([val, { label }]) => (
                                            <label key={val} style={{
                                                display: 'flex', alignItems: 'center', gap: 9,
                                                padding: '8px 10px',
                                                borderRadius: 'var(--r-xs)',
                                                border: `1px solid ${form.activity_level === val ? 'var(--border-focus)' : 'var(--border-color)'}`,
                                                background: form.activity_level === val ? 'var(--bg-active)' : 'var(--bg-surface)',
                                                cursor: 'pointer', transition: 'all var(--t-fast)',
                                            }}>
                                                <input
                                                    type="radio" name="activity" value={val}
                                                    checked={form.activity_level === val}
                                                    onChange={() => upd('activity_level', val)}
                                                    style={{ accentColor: 'var(--tx-1)', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: 12.5, fontWeight: form.activity_level === val ? 600 : 400, color: 'var(--tx-1)' }}>
                                                    {label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                                    {saving ? <><span className="spinner" /> Menyimpan...</> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ── Panduan Fitur Tertanam ── */}
            <PageFeatureGuide guide={PAGE_GUIDES['/family']} />
        </Layout>
    );
};

export default Family;
