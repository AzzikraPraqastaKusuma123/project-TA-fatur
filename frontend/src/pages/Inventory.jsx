import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Trash2, Package, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ ingredient_id: '', quantity: '', unit: '', expiry_date: '' });
    const [search, setSearch] = useState('');

    const load = () => {
        setLoading(true);
        api.get('/inventory').then(r => setItems(r.data.data || [])).finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        api.get('/ingredients').then(r => setIngredients(r.data.data || []));
    }, []);

    const handleSave = async e => {
        e.preventDefault();
        try {
            await api.post('/inventory', form);
            setModal(false);
            setForm({ ingredient_id: '', quantity: '', unit: '', expiry_date: '' });
            load();
        } catch { alert('Gagal menyimpan stok'); }
    };

    const handleDelete = async id => {
        if (!confirm('Hapus item stok ini?')) return;
        await api.delete(`/inventory/${id}`);
        load();
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

    return (
        <Layout
            title="Stok Bahan Makanan"
            subtitle="Kelola persediaan bahan makanan yang tersedia di rumah Anda"
            actions={
                <button className="btn btn-primary" onClick={() => setModal(true)}>
                    <Plus size={16} strokeWidth={2.5} /> Tambah Stok
                </button>
            }
        >
            <div className="card">
                {/* Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: 'var(--border-light)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            style={{ paddingLeft: 38 }}
                            placeholder="Cari bahan makanan..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                        {filtered.length} dari {items.length} bahan
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 24 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8, marginBottom: 8 }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Package size={28} /></div>
                        <h3>{search ? 'Bahan tidak ditemukan' : 'Stok masih kosong'}</h3>
                        <p>{search ? `Tidak ada bahan yang cocok dengan "${search}"` : 'Tambahkan bahan makanan yang tersedia di rumah Anda untuk memaksimalkan rekomendasi menu.'}</p>
                        {!search && (
                            <button className="btn btn-primary" onClick={() => setModal(true)}>
                                <Plus size={15} /> Tambah Stok Pertama
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Bahan</th>
                                    <th>Kategori</th>
                                    <th>Jumlah</th>
                                    <th>Kadaluarsa</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(item => {
                                    const expired = isExpired(item);
                                    const expiring = isExpiringSoon(item);
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{item.ingredient_name}</div>
                                            </td>
                                            <td>
                                                <span className="badge badge-gray">{item.category || '—'}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700 }}>{item.quantity}</span>{' '}
                                                <span style={{ color: 'var(--text-muted)' }}>{item.unit}</span>
                                            </td>
                                            <td style={{ color: expired ? 'var(--danger)' : expiring ? 'var(--accent-dark)' : 'var(--text-secondary)' }}>
                                                {(item.expiration_date || item.expiry_date)
                                                    ? new Date(item.expiration_date || item.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                }
                                            </td>
                                            <td>
                                                {expired ? (
                                                    <span className="badge badge-red"><AlertTriangle size={11} /> Kadaluarsa</span>
                                                ) : expiring ? (
                                                    <span className="badge badge-amber"><AlertTriangle size={11} /> Hampir Habis</span>
                                                ) : (
                                                    <span className="badge badge-green"><CheckCircle size={11} /> Aman</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: 'var(--danger-50)', color: 'var(--danger)', border: '1px solid var(--danger-100)' }}
                                                    onClick={() => handleDelete(item.id)}
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

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">➕ Tambah Stok Bahan</div>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Pilih Bahan <span className="required">*</span></label>
                                    <select
                                        className="form-control"
                                        value={form.ingredient_id}
                                        onChange={e => setForm({ ...form, ingredient_id: e.target.value, unit: autoUnit(e.target.value) })}
                                        required
                                    >
                                        <option value="">-- Pilih bahan makanan --</option>
                                        {ingredients.map(i => (
                                            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="g-grid g-cols-2">
                                    <div className="form-group">
                                        <label className="form-label">Jumlah <span className="required">*</span></label>
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
                                    <div className="form-group">
                                        <label className="form-label">Satuan <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="gram, ikat, butir..."
                                            value={form.unit}
                                            onChange={e => setForm({ ...form, unit: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Tanggal Kadaluarsa <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(Opsional)</span></label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.expiry_date}
                                        onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <div className="form-hint">Isi jika ada tanggal kadaluarsa. Sistem akan memberikan peringatan saat mendekati tanggal ini.</div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">💾 Simpan Stok</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Inventory;
