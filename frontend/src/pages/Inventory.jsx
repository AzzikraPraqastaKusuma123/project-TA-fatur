import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import api from '../services/api';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import {
    Plus, Trash2, Package, Search, AlertTriangle,
    CheckCircle2, Lightbulb, Sparkles, RefreshCw,
    ShieldAlert, Calendar, ArrowRight, Check
} from 'lucide-react';

const CAT_COLORS = {
    PROTEIN:     { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    SAYURAN:     { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
    BUMBU:       { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    KARBOHIDRAT: { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    LEMAK:       { color: '#ec4899', bg: '#fdf4ff', border: '#f5d0fe' },
    OTHER:       { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const Inventory = () => {
    const [items, setItems]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [ingredients, setIngredients] = useState([]);
    const [modal, setModal]             = useState(false);
    const [form, setForm]               = useState({ ingredient_id: '', quantity: '', unit: '', expiry_date: '' });
    const [search, setSearch]           = useState('');
    const [addingStarter, setAddingStarter] = useState(false);
    const [starterSuccess, setStarterSuccess] = useState(false);

    const load = () => {
        setLoading(true);
        api.get('/inventory')
            .then(r => setItems(r.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        api.get('/ingredients')
            .then(r => setIngredients(r.data.data || []))
            .catch(() => {});
    }, []);

    const handleSave = async e => {
        e.preventDefault();
        try {
            await api.post('/inventory', form);
            setModal(false);
            setForm({ ingredient_id: '', quantity: '', unit: '', expiry_date: '' });
            load();
        } catch {
            alert('Gagal menyimpan stok bahan.');
        }
    };

    const handleDelete = async id => {
        if (!confirm('Hapus item stok ini dari dapur Anda?')) return;
        await api.delete(`/inventory/${id}`);
        load();
    };

    // Quick Starter Kit for new users
    const handleAddStarterKit = async () => {
        if (!ingredients.length) return;
        setAddingStarter(true);
        setStarterSuccess(false);

        const targets = [
            { match: 'beras', qty: 5000, fallbackUnit: 'gram' },
            { match: 'minyak', qty: 2000, fallbackUnit: 'ml' },
            { match: 'telur', qty: 1000, fallbackUnit: 'gram' },
            { match: 'bawang merah', qty: 250, fallbackUnit: 'gram' },
            { match: 'bawang putih', qty: 250, fallbackUnit: 'gram' },
            { match: 'garam', qty: 250, fallbackUnit: 'gram' },
        ];

        try {
            for (const target of targets) {
                const found = ingredients.find(ing =>
                    ing.name?.toLowerCase().includes(target.match)
                );
                if (found) {
                    await api.post('/inventory', {
                        ingredient_id: found.id,
                        quantity: target.qty,
                        unit: found.unit || target.fallbackUnit,
                    });
                }
            }
            setStarterSuccess(true);
            load();
        } catch (err) {
            console.error(err);
            alert('Gagal menambahkan paket dasar. Silakan tambahkan secara manual.');
        } finally {
            setAddingStarter(false);
        }
    };

    const filtered = items.filter(i =>
        i.ingredient_name?.toLowerCase().includes(search.toLowerCase())
    );

    const isExpiringSoon = item => {
        const d = item.expiration_date || item.expiry_date;
        if (!d) return false;
        const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff >= 0;
    };

    const isExpired = item => {
        const d = item.expiration_date || item.expiry_date;
        if (!d) return false;
        return new Date(d) < new Date();
    };

    const autoUnit = id => {
        const found = ingredients.find(i => String(i.id) === String(id));
        return found?.unit || '';
    };

    const expiredCount = items.filter(isExpired).length;
    const expiringCount = items.filter(isExpiringSoon).length;
    const safeCount = Math.max(0, items.length - expiredCount - expiringCount);

    return (
        <Layout
            title="Stok Bahan Dapur"
            subtitle="Inventaris bahan makanan yang tersedia di rumah untuk memotong kebutuhan belanja otomatis"
            actions={
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setForm({ ingredient_id: '', quantity: '', unit: '', expiry_date: '' });
                        setModal(true);
                    }}
                >
                    <Plus size={16} strokeWidth={2.5} /> Tambah Stok
                </button>
            }
        >
            {/* ── Workflow Educational Note ── */}
            <div style={{
                padding: '14px 18px', borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.05) 0%, var(--bg-surface) 100%)',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12, marginBottom: 20, flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: '#fff7ed', color: '#ea580c',
                        border: '1px solid #fed7aa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Lightbulb size={17} strokeWidth={2.5} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--tx-2)', lineHeight: 1.5 }}>
                        <strong>Mengapa Stok Dapur Sangat Penting?</strong> Saat meracik menu mingguan, asisten pintar MealPlanner akan memprioritaskan bahan yang sudah ada di sini. Bahan yang sudah tersedia <strong>TIDAK akan masuk ke daftar belanja pasar</strong>, sehingga belanja Anda jauh lebih hemat dan anti-mubazir.
                    </div>
                </div>
            </div>

            {/* ── Stat Counters ── */}
            {!loading && items.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: '#eff6ff', color: '#2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Package size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Total Stok Bahan
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.3px' }}>
                                {items.length} Macam Bahan
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: '#f0fdf4', color: '#16a34a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <CheckCircle2 size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Kondisi Segar / Aman
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.3px' }}>
                                {safeCount} Bahan
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: (expiringCount > 0 || expiredCount > 0) ? '#fff7ed' : 'var(--bg-muted)',
                            color: (expiringCount > 0 || expiredCount > 0) ? '#ea580c' : 'var(--tx-3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <AlertTriangle size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                Perlu Dimasak Segera
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: (expiringCount > 0 || expiredCount > 0) ? '#ea580c' : 'var(--tx-2)', letterSpacing: '-0.3px' }}>
                                {expiringCount + expiredCount} Bahan
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Inventory Card ── */}
            <div className="card">
                {/* Toolbar */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', gap: 12, alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 360, minWidth: 220 }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx-4)' }} />
                        <input
                            type="text"
                            className="form-control"
                            style={{ paddingLeft: 36, fontSize: 13 }}
                            placeholder="Cari nama bahan di dapur..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--tx-3)', fontWeight: 600 }}>
                            {filtered.length} dari {items.length} bahan
                        </span>
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={load}
                                className="btn btn-outline btn-sm"
                                style={{ gap: 4, fontSize: 11.5 }}
                                title="Perbarui data"
                            >
                                <RefreshCw size={12} /> Refresh
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="skeleton" style={{ height: 46, borderRadius: 8 }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    search ? (
                        <div className="empty-state" style={{ padding: '48px 20px' }}>
                            <div className="empty-icon"><Search size={20} /></div>
                            <h3>Bahan tidak ditemukan</h3>
                            <p>Tidak ada bahan di dapur yang cocok dengan kata kunci "{search}".</p>
                            <button className="btn btn-outline btn-sm" onClick={() => setSearch('')}>
                                Hapus Pencarian
                            </button>
                        </div>
                    ) : (
                        /* ── Interactive Starter Pack Empty State for New Users ── */
                        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: '#fff7ed', border: '1.5px solid #fed7aa',
                                color: '#ea580c', margin: '0 auto 16px auto',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Package size={26} strokeWidth={2.2} />
                            </div>

                            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--tx-1)', marginBottom: 6 }}>
                                Dapur Anda Masih Kosong
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--tx-3)', maxWidth: 480, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                                Masukkan bahan makanan yang sudah tersedia di kulkas atau lemari dapur Anda. Anda dapat menambahkan paket bahan pokok dasar langsung dalam 1 klik!
                            </p>

                            <div style={{
                                maxWidth: 480, margin: '0 auto 24px auto',
                                padding: '14px 16px', borderRadius: 10,
                                background: 'var(--bg-muted)', border: '1px solid var(--border-color)',
                                textAlign: 'left'
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx-2)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Sparkles size={14} color="#ea580c" /> Paket Bahan Pokok Dapur Cepat:
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)', lineHeight: 1.5 }}>
                                    Beras (5 kg), Minyak Goreng (2 Liter), Telur Ayam (1 kg), Bawang Merah (250g), Bawang Putih (250g), Garam (250g).
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddStarterKit}
                                    disabled={addingStarter}
                                    style={{ gap: 6, fontWeight: 700 }}
                                >
                                    {addingStarter ? (
                                        <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Memasukkan Paket Bahan...</>
                                    ) : starterSuccess ? (
                                        <><Check size={14} strokeWidth={3} /> Paket Berhasil Ditambahkan!</>
                                    ) : (
                                        <><Sparkles size={14} /> Masukkan 6 Bahan Pokok Sekaligus</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setModal(true)}
                                    style={{ gap: 6 }}
                                >
                                    <Plus size={14} /> Tambah Manual
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Bahan Makanan</th>
                                    <th>Kategori</th>
                                    <th>Jumlah di Dapur</th>
                                    <th>Kadaluarsa</th>
                                    <th>Status Stok</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(item => {
                                    const expired = isExpired(item);
                                    const expiring = isExpiringSoon(item);
                                    const catStyle = CAT_COLORS[item.category] || CAT_COLORS.OTHER;
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--tx-1)' }}>
                                                    {item.ingredient_name}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: 10.5, fontWeight: 700,
                                                    padding: '2px 8px', borderRadius: 20,
                                                    color: catStyle.color, background: catStyle.bg,
                                                    border: `1px solid ${catStyle.border}`,
                                                    textTransform: 'uppercase', letterSpacing: '0.3px',
                                                }}>
                                                    {item.category || 'LAINNYA'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--tx-1)' }}>
                                                    {Number(item.quantity).toLocaleString('id-ID')}
                                                </span>{' '}
                                                <span style={{ color: 'var(--tx-3)', fontSize: 12, fontWeight: 600 }}>
                                                    {item.unit}
                                                </span>
                                            </td>
                                            <td>
                                                {(item.expiration_date || item.expiry_date) ? (
                                                    <span style={{
                                                        fontSize: 12, fontWeight: 600,
                                                        color: expired ? 'var(--danger)' : expiring ? '#ea580c' : 'var(--tx-2)',
                                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    }}>
                                                        <Calendar size={12} />
                                                        {new Date(item.expiration_date || item.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--tx-4)', fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                {expired ? (
                                                    <span className="badge badge-red" style={{ gap: 4 }}>
                                                        <AlertTriangle size={11} /> Kadaluarsa
                                                    </span>
                                                ) : expiring ? (
                                                    <span className="badge badge-amber" style={{ gap: 4 }}>
                                                        <AlertTriangle size={11} /> Dekat Kadaluarsa
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-green" style={{ gap: 4 }}>
                                                        <CheckCircle2 size={11} /> Segar / Aman
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{
                                                        color: 'var(--danger)',
                                                        borderColor: 'rgba(239, 68, 68, 0.25)',
                                                        background: 'transparent',
                                                        padding: '4px 8px',
                                                    }}
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Hapus item dari dapur"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Tambah Stok */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
                        <div className="modal-header">
                            <div className="modal-title">Tambah Stok Bahan Dapur</div>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Pilih Bahan Makanan <span className="required">*</span></label>
                                    <select
                                        className="form-control"
                                        value={form.ingredient_id}
                                        onChange={e => setForm({ ...form, ingredient_id: e.target.value, unit: autoUnit(e.target.value) })}
                                        required
                                    >
                                        <option value="">-- Pilih bahan dari katalog --</option>
                                        {ingredients.map(i => (
                                            <option key={i.id} value={i.id}>{i.name} ({i.unit}) - {i.category || 'Lainnya'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="g-grid g-cols-2" style={{ gap: 12 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Jumlah / Berat <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            placeholder="Contoh: 500"
                                            value={form.quantity}
                                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Satuan <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="gram, ml, butir..."
                                            value={form.unit}
                                            onChange={e => setForm({ ...form, unit: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        Tanggal Kadaluarsa <span style={{ fontSize: 11, color: 'var(--tx-3)', fontWeight: 400 }}>(Opsional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.expiry_date}
                                        onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <div className="form-hint">Isi jika bahan memiliki batas kadaluarsa agar sistem memberi pengingat otomatis.</div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ marginTop: 8 }}>
                                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan ke Stok</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Panduan Fitur Tertanam ── */}
            <PageFeatureGuide guide={PAGE_GUIDES['/inventory']} />
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </Layout>
    );
};

export default Inventory;
