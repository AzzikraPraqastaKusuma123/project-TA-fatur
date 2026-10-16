import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import {
    Plus, Search, Pencil, Trash2, Shield, User as UserIcon,
    RefreshCw, X, Check, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

const ROLES = ['USER', 'ADMIN'];
const EMPTY_FORM = { name: '', email: '', password: '', role: 'USER' };
const fmt = dt => new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/* ─── Stat card ─────────────────────────────────────────────────── */
const S = ({ label, value, sub }) => (
    <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-delta">{sub}</div>}
    </div>
);

/* ─── Role Badge ─────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => (
    <span className={`badge ${role === 'ADMIN' ? 'badge-amber' : 'badge-default'}`}>
        {role === 'ADMIN'
            ? <><Shield size={9} style={{ marginRight: 3 }} />Admin</>
            : 'User'
        }
    </span>
);

/* ─── Modal ─────────────────────────────────────────────────────── */
const UserModal = ({ user, onClose, onSaved }) => {
    const isEdit = !!user?.id;
    const [form, setForm]   = useState(user?.id ? { name: user.name, email: user.email, password: '', role: user.role } : EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState('');

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            if (isEdit) {
                const payload = { name: form.name, email: form.email, role: form.role };
                if (form.password) payload.password = form.password;
                await api.put(`/admin/users/${user.id}`, payload);
            } else {
                if (!form.password) return setError('Password wajib diisi saat membuat user baru.');
                await api.post('/admin/users', form);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan.');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{isEdit ? `Edit: ${user.name}` : 'Tambah User Baru'}</span>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-error mb-4">{error}</div>}

                        <div className="g-2">
                            <div className="form-group">
                                <label className="form-label">Nama Lengkap <span className="req">*</span></label>
                                <input className="form-control" placeholder="John Doe" value={form.name} onChange={e => upd('name', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role <span className="req">*</span></label>
                                <select className="form-control" value={form.role} onChange={e => upd('role', e.target.value)}>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address <span className="req">*</span></label>
                            <input type="email" className="form-control" placeholder="user@example.com" value={form.email} onChange={e => upd('email', e.target.value)} required />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                Password {isEdit && <span style={{ color: 'var(--tx-4)', fontWeight: 400, textTransform: 'none' }}>(kosongkan jika tidak diubah)</span>}
                                {!isEdit && <span className="req"> *</span>}
                            </label>
                            <input
                                type="password" className="form-control"
                                placeholder={isEdit ? '••••••••' : 'Min. 6 karakter'}
                                value={form.password}
                                onChange={e => upd('password', e.target.value)}
                                minLength={form.password ? 6 : undefined}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                            {saving ? <><span className="spinner" /> Menyimpan...</> : <><Check size={12} /> Simpan</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── Detail Drawer ──────────────────────────────────────────────── */
const DetailDrawer = ({ userId, onClose }) => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/admin/users/${userId}`)
            .then(r => setData(r.data.data))
            .finally(() => setLoading(false));
    }, [userId]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
            display: 'flex', justifyContent: 'flex-end',
        }} onClick={onClose}>
            <div style={{
                width: '100%', maxWidth: 420,
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border-color)',
                height: '100%', overflowY: 'auto',
                animation: 'slideIn .2s ease',
                transition: 'background var(--t-slow)',
            }} onClick={e => e.stopPropagation()}>
                <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

                {/* Header */}
                <div style={{
                    padding: '14px 18px', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1,
                    transition: 'background var(--t-slow)',
                }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>Detail User</span>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>

                <div style={{ padding: 18 }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
                        </div>
                    ) : data ? (
                        <>
                            {/* Avatar + name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 'var(--r-sm)',
                                    background: 'var(--tx-1)', color: 'var(--tx-inverse)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 800, flexShrink: 0,
                                    transition: 'background var(--t-slow), color var(--t-slow)',
                                }}>
                                    {data.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>{data.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 2 }}>{data.email}</div>
                                    <div style={{ marginTop: 5 }}><RoleBadge role={data.role} /></div>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div style={{
                                border: '1px solid var(--border-color)', borderRadius: 'var(--r-sm)',
                                overflow: 'hidden', marginBottom: 16,
                            }}>
                                {[
                                    ['ID User', `#${data.id}`],
                                    ['Bergabung', fmt(data.created_at)],
                                    ['Anggaran', data.budget_amount
                                        ? `Rp${Number(data.budget_amount).toLocaleString('id-ID')} / ${data.budget_days} hari`
                                        : 'Belum diatur'],
                                    ['Anggota Keluarga', `${data.family_members?.length || 0} orang`],
                                ].map(([label, val], i, arr) => (
                                    <div key={label} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '9px 13px',
                                        borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        background: i % 2 === 0 ? 'var(--bg-hover)' : 'var(--bg-surface)',
                                        transition: 'background var(--t-slow)',
                                    }}>
                                        <span style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>{label}</span>
                                        <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: label === 'ID User' ? 'monospace' : 'inherit' }}>{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Family members */}
                            {data.family_members?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--tx-3)', marginBottom: 8 }}>
                                        Anggota Keluarga
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {data.family_members.map(m => (
                                            <div key={m.id} style={{
                                                display: 'flex', justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                background: 'var(--bg-root)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--r-xs)',
                                                transition: 'background var(--t-slow)',
                                            }}>
                                                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{m.name}</span>
                                                <span style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>
                                                    {m.age} th · {m.gender === 'MALE' ? 'L' : 'P'} · {Math.round(m.daily_calories_target || 0)} kkal
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent plans */}
                            {data.recent_plans?.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--tx-3)', marginBottom: 8 }}>
                                        Rencana Makan Terbaru
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {data.recent_plans.map(p => (
                                            <div key={p.id} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '8px 12px',
                                                background: 'var(--bg-root)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--r-xs)',
                                                transition: 'background var(--t-slow)',
                                            }}>
                                                <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {p.name}
                                                </span>
                                                <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : p.status === 'COMPLETED' ? 'badge-default' : 'badge-amber'}`} style={{ marginLeft: 8, flexShrink: 0 }}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state"><p>Gagal memuat data.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────── */
const AdminUsers = () => {
    const [data, setData]         = useState({ users: [], total: 0, stats: {} });
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [roleFilter, setRole]   = useState('');
    const [page, setPage]         = useState(1);
    const [modal, setModal]       = useState(null);  // null | 'create' | user-obj
    const [drawer, setDrawer]     = useState(null);  // userId

    const LIMIT = 15;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/users', { params: { search, role: roleFilter, page, limit: LIMIT } });
            setData(r.data.data);
        } catch {/* db offline */}
        finally { setLoading(false); }
    }, [search, roleFilter, page]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus akun "${name}"? Semua data terkait akan ikut terhapus.`)) return;
        await api.delete(`/admin/users/${id}`);
        load();
    };

    const handleRoleToggle = async (user) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!confirm(`Ubah role "${user.name}" menjadi ${newRole}?`)) return;
        await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
        load();
    };

    const totalPages = Math.ceil(data.total / LIMIT);
    const stats = data.stats || {};

    return (
        <Layout
            title="Manajemen Pengguna"
            subtitle="Kelola akun pengguna dan hak akses"
            actions={
                <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
                    <Plus size={12} strokeWidth={2.5} /> Tambah User
                </button>
            }
        >
            {/* Stats */}
            <div className="stat-grid mb-5">
                <S label="Total Pengguna" value={stats.total_users || 0} />
                <S label="Regular User"   value={stats.total_regular || 0} />
                <S label="Administrator"  value={stats.total_admins || 0} />
                <S label="Baru (7 Hari)"  value={stats.new_this_week || 0} sub="Pendaftaran baru" />
            </div>

            {/* Toolbar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 14, flexWrap: 'wrap',
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx-3)', pointerEvents: 'none' }} />
                    <input
                        className="form-control"
                        style={{ paddingLeft: 32 }}
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                {/* Role filter */}
                <select
                    className="form-control"
                    style={{ width: 'auto', minWidth: 120 }}
                    value={roleFilter}
                    onChange={e => { setRole(e.target.value); setPage(1); }}
                >
                    <option value="">Semua Role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <button className="btn btn-ghost btn-sm btn-icon" onClick={load} title="Refresh">
                    <RefreshCw size={13} strokeWidth={2} />
                </button>

                {data.total > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--tx-3)', marginLeft: 'auto' }}>
                        {data.total} pengguna
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Pengguna</th>
                            <th>Role</th>
                            <th>Bergabung</th>
                            <th>Keluarga</th>
                            <th>Rencana</th>
                            <th>Anggaran</th>
                            <th style={{ textAlign: 'right', paddingRight: 14 }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 60 }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : data.users.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state" style={{ padding: '40px 0' }}>
                                        <div className="empty-icon"><UserIcon size={16} /></div>
                                        <h3>{search || roleFilter ? 'Tidak ada hasil' : 'Belum ada pengguna'}</h3>
                                        <p>{search || roleFilter ? 'Coba ubah filter pencarian.' : 'Klik "+ Tambah User" untuk membuat pengguna pertama.'}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.users.map(u => (
                            <tr key={u.id} style={{ cursor: 'pointer' }}>
                                {/* User info */}
                                <td onClick={() => setDrawer(u.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 30, height: 30, borderRadius: 'var(--r-xs)',
                                            background: 'var(--tx-1)', color: 'var(--tx-inverse)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                                            transition: 'background var(--t-slow), color var(--t-slow)',
                                        }}>
                                            {u.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>

                                <td onClick={() => setDrawer(u.id)}>
                                    <RoleBadge role={u.role} />
                                </td>

                                <td onClick={() => setDrawer(u.id)} style={{ color: 'var(--tx-3)', fontSize: 12 }}>
                                    {fmt(u.created_at)}
                                </td>

                                <td onClick={() => setDrawer(u.id)} style={{ color: 'var(--tx-2)', fontSize: 13, fontWeight: 500 }}>
                                    {u.family_count || 0}
                                </td>

                                <td onClick={() => setDrawer(u.id)} style={{ color: 'var(--tx-2)', fontSize: 13, fontWeight: 500 }}>
                                    {u.plan_count || 0}
                                </td>

                                <td onClick={() => setDrawer(u.id)} style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                                    {u.budget_amount
                                        ? `Rp${Number(u.budget_amount).toLocaleString('id-ID')}`
                                        : <span style={{ color: 'var(--tx-4)' }}>—</span>
                                    }
                                </td>

                                {/* Actions */}
                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                        <button
                                            className="btn btn-ghost btn-sm btn-icon"
                                            title={`Jadikan ${u.role === 'ADMIN' ? 'User' : 'Admin'}`}
                                            onClick={() => handleRoleToggle(u)}
                                        >
                                            {u.role === 'ADMIN'
                                                ? <UserIcon size={12} strokeWidth={2} />
                                                : <Shield size={12} strokeWidth={2} />
                                            }
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm btn-icon"
                                            title="Edit"
                                            onClick={() => setModal(u)}
                                        >
                                            <Pencil size={12} strokeWidth={2} />
                                        </button>
                                        <button
                                            className="btn btn-danger-ghost btn-sm btn-icon"
                                            title="Hapus"
                                            onClick={() => handleDelete(u.id, u.name)}
                                        >
                                            <Trash2 size={12} strokeWidth={2} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                        Halaman {page} dari {totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-sm btn-icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft size={13} />
                        </button>
                        <button className="btn btn-outline btn-sm btn-icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <UserModal
                    user={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); load(); }}
                />
            )}

            {/* Detail Drawer */}
            {drawer && <DetailDrawer userId={drawer} onClose={() => setDrawer(null)} />}
        </Layout>
    );
};

export default AdminUsers;
