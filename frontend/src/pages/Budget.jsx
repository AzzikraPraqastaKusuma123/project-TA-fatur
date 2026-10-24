import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import api from '../services/api';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import { Wallet, Check } from 'lucide-react';

const PERIODS = [
    { value: 'DAILY',   label: 'Harian',   days: 1  },
    { value: 'WEEKLY',  label: 'Mingguan', days: 7  },
    { value: 'MONTHLY', label: 'Bulanan',  days: 30 },
    { value: 'CUSTOM',  label: 'Kustom',   days: null },
];

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

const Budget = () => {
    const [budget, setBudget]   = useState(null);
    const [form, setForm]       = useState({ amount: '', period: 'WEEKLY', days: 7 });
    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/budgets')
            .then(r => {
                if (r.data.data) {
                    const b = r.data.data;
                    setBudget(b);
                    setForm({ amount: b.amount, period: b.period, days: b.days });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async e => {
        e.preventDefault();
        if (!form.amount || form.amount <= 0) return setError('Masukkan jumlah anggaran yang valid.');
        setSaving(true); setError('');
        try {
            await api.post('/budgets', form);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
            const r = await api.get('/budgets');
            if (r.data.data) setBudget(r.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan anggaran.');
        } finally { setSaving(false); }
    };

    const perDay  = form.days > 0 ? Math.round(form.amount / form.days) : 0;
    const perMeal = form.days > 0 ? Math.round(form.amount / form.days / 3) : 0;

    return (
        <Layout title="Anggaran Makan" subtitle="Atur anggaran untuk perencanaan menu yang optimal">
            <div style={{ maxWidth: 820 }}>
                <div className="g-2" style={{ alignItems: 'start', gap: 20 }}>
                    {/* Form */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Konfigurasi Anggaran</div>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="card-body">
                                {success && (
                                    <div className="alert alert-success" style={{ marginBottom: 14 }}>
                                        <Check size={13} /> Anggaran berhasil disimpan.
                                    </div>
                                )}
                                {error && (
                                    <div className="alert alert-error" style={{ marginBottom: 14 }}>
                                        {error}
                                    </div>
                                )}

                                {/* Amount */}
                                <div className="form-group">
                                    <label className="form-label">Total Anggaran <span className="req">*</span></label>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            padding: '0 11px', height: 34,
                                            background: 'var(--bg-hover)',
                                            border: '1px solid var(--border-color)',
                                            borderRight: 'none',
                                            borderRadius: 'var(--r-sm) 0 0 var(--r-sm)',
                                            fontSize: 13, fontWeight: 500,
                                            color: 'var(--tx-2)', flexShrink: 0,
                                        }}>
                                            Rp
                                        </div>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="500000"
                                            style={{ borderRadius: '0 var(--r-sm) var(--r-sm) 0' }}
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || '' })}
                                            min="1" required
                                        />
                                    </div>
                                </div>

                                {/* Period selector */}
                                <div className="form-group">
                                    <label className="form-label">Periode</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                                        {PERIODS.map(p => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => {
                                                    const days = p.days ?? form.days;
                                                    setForm({ ...form, period: p.value, days });
                                                }}
                                                style={{
                                                    padding: '8px 0',
                                                    borderRadius: 'var(--r-xs)',
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    border: `1px solid ${form.period === p.value ? 'var(--border-focus)' : 'var(--border-color)'}`,
                                                    background: form.period === p.value ? 'var(--bg-active)' : 'var(--bg-surface)',
                                                    color: form.period === p.value ? 'var(--tx-1)' : 'var(--tx-2)',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--t-fast)',
                                                }}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom days */}
                                {form.period === 'CUSTOM' && (
                                    <div className="form-group">
                                        <label className="form-label">Jumlah hari</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.days}
                                            onChange={e => setForm({ ...form, days: parseInt(e.target.value) || 1 })}
                                            min="1" max="365"
                                            style={{ maxWidth: 120 }}
                                        />
                                    </div>
                                )}

                                {/* Live estimate */}
                                {form.amount > 0 && form.days > 0 && (
                                    <div style={{
                                        padding: '10px 12px',
                                        background: 'var(--bg-root)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--r-sm)',
                                        marginBottom: 16,
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 1,
                                    }}>
                                        {[
                                            ['Per hari',     fmt(perDay)],
                                            ['Per makan',    fmt(perMeal)],
                                        ].map(([label, val], i) => (
                                            <div key={label} style={{
                                                padding: '8px 10px',
                                                borderRight: i === 0 ? '1px solid var(--border-color)' : 'none',
                                            }}>
                                                <div style={{ fontSize: 10.5, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                    {label}
                                                </div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx-1)', marginTop: 2, letterSpacing: '-0.4px' }}>
                                                    {val}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                                    {saving ? <><span className="spinner" /> Menyimpan...</> : 'Simpan Anggaran'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Current budget summary */}
                    <div>
                        {loading ? (
                            <div className="card">
                                <div className="card-body">
                                    <div className="skeleton" style={{ height: 160 }} />
                                </div>
                            </div>
                        ) : budget ? (
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">Anggaran Aktif</div>
                                    <span className="badge badge-green">Aktif</span>
                                </div>
                                <div className="card-body">
                                    {/* Big number */}
                                    <div style={{
                                        fontSize: 28, fontWeight: 700,
                                        letterSpacing: '-0.8px', color: 'var(--tx-1)',
                                        marginBottom: 3, lineHeight: 1
                                    }}>
                                        {fmt(budget.amount)}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--tx-3)', marginBottom: 18 }}>
                                        per {budget.days} hari · {PERIODS.find(p => p.value === budget.period)?.label}
                                    </div>

                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--r-sm)',
                                        overflow: 'hidden',
                                    }}>
                                        {[
                                            ['Per hari',  fmt(Math.round(budget.amount / budget.days))],
                                            ['Per makan', fmt(Math.round(budget.amount / budget.days / 3))],
                                        ].map(([label, val], i) => (
                                            <div key={label} style={{
                                                padding: '10px 12px',
                                                borderRight: i === 0 ? '1px solid var(--border-color)' : 'none',
                                                background: 'var(--bg-root)',
                                                transition: 'background var(--t-slow)',
                                            }}>
                                                <div style={{ fontSize: 10.5, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>
                                                    {label}
                                                </div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)', letterSpacing: '-0.3px' }}>
                                                    {val}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-icon"><Wallet size={16} /></div>
                                    <h3>Belum ada anggaran</h3>
                                    <p>Isi form di sebelah kiri untuk mengatur anggaran.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* ── Panduan Fitur Tertanam ── */}
            <PageFeatureGuide guide={PAGE_GUIDES['/budget']} />
        </Layout>
    );
};

export default Budget;
