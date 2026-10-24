import { useState } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { User, Lock, Sun, Moon, Monitor, Check, Eye, EyeOff } from 'lucide-react';

const TAB_LIST = [
    { id: 'profile',   icon: User,    label: 'Profil'     },
    { id: 'security',  icon: Lock,    label: 'Keamanan'   },
    { id: 'appearance',icon: Sun,     label: 'Tampilan'   },
];

/* â”€â”€â”€ Tab: Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ProfileTab = ({ user, onUpdated }) => {
    const [name, setName]     = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg]       = useState(null);

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true); setMsg(null);
        try {
            await api.put('/auth/profile', { name });
            setMsg({ type: 'success', text: 'Profil berhasil diperbarui.' });
            onUpdated?.();
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui.' });
        } finally { setSaving(false); }
    };

    const initials = (user?.name || '?').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

    return (
        <div>
            {/* Avatar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 0', marginBottom: 20,
                borderBottom: '1px solid var(--border-color)',
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 'var(--r-sm)',
                    background: 'var(--tx-1)', color: 'var(--tx-inverse)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800,
                    transition: 'background var(--t-slow), color var(--t-slow)',
                }}>
                    {initials}
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 2 }}>{user?.email}</div>
                    <div style={{ marginTop: 5 }}>
                        <span className={`badge ${user?.role === 'ADMIN' ? 'badge-amber' : 'badge-default'}`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'} mb-4`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                        className="form-control"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nama Anda"
                        required
                        style={{ maxWidth: 400 }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        className="form-control"
                        value={user?.email || ''}
                        disabled
                        style={{ maxWidth: 400, opacity: 0.6, cursor: 'not-allowed' }}
                    />
                    <div className="form-hint">Email tidak dapat diubah.</div>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <><span className="spinner" /> Menyimpan...</> : <><Check size={12} /> Simpan Perubahan</>}
                </button>
            </form>
        </div>
    );
};

/* â”€â”€â”€ Tab: Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SecurityTab = () => {
    const [form, setForm]     = useState({ password: '', confirm: '' });
    const [show, setShow]     = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg]       = useState(null);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async e => {
        e.preventDefault();
        if (form.password !== form.confirm)
            return setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
        if (form.password.length < 6)
            return setMsg({ type: 'error', text: 'Password minimal 6 karakter.' });

        setSaving(true); setMsg(null);
        try {
            await api.put('/auth/profile', { password: form.password });
            setMsg({ type: 'success', text: 'Password berhasil diperbarui.' });
            setForm({ password: '', confirm: '' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui.' });
        } finally { setSaving(false); }
    };

    return (
        <div style={{ maxWidth: 440 }}>
            {/* Info notice */}
            <div style={{
                padding: '12px 14px', marginBottom: 24,
                background: 'var(--blue-bg)', border: '1px solid var(--blue-border)',
                borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--blue)',
                lineHeight: 1.55,
            }}>
                Gunakan password yang kuat â€” minimal 6 karakter, kombinasi huruf dan angka.
            </div>

            {msg && (
                <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'} mb-4`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label className="form-label">Password Baru <span className="req">*</span></label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={show ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Min. 6 karakter"
                            value={form.password}
                            onChange={e => upd('password', e.target.value)}
                            style={{ paddingRight: 38 }}
                            required
                        />
                        <button type="button" onClick={() => setShow(s => !s)} style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--tx-3)', lineHeight: 0,
                        }}>
                            {show ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Konfirmasi Password <span className="req">*</span></label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Ulangi password baru"
                        value={form.confirm}
                        onChange={e => upd('confirm', e.target.value)}
                        required
                    />
                    {form.confirm && form.password !== form.confirm && (
                        <div className="form-error">Password tidak cocok</div>
                    )}
                </div>

                {/* Password strength indicator */}
                {form.password.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginBottom: 5 }}>
                            Kekuatan password:
                            <span style={{
                                marginLeft: 6, fontWeight: 600,
                                color: form.password.length >= 10 ? 'var(--green)' : form.password.length >= 6 ? 'var(--amber)' : 'var(--red)',
                            }}>
                                {form.password.length >= 10 ? 'Kuat' : form.password.length >= 6 ? 'Cukup' : 'Lemah'}
                            </span>
                        </div>
                        <div className="progress-track">
                            <div className={`progress-fill ${form.password.length >= 10 ? 'green' : form.password.length >= 6 ? 'amber' : 'red'}`}
                                style={{ width: `${Math.min(form.password.length * 8, 100)}%`, transition: 'width 0.3s ease, background 0.3s ease' }}
                            />
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <><span className="spinner" /> Menyimpan...</> : <><Lock size={12} /> Perbarui Password</>}
                </button>
            </form>
        </div>
    );
};

/* â”€â”€â”€ Tab: Appearance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const AppearanceTab = () => {
    const { theme, toggleTheme } = useTheme();

    const options = [
        {
            id: 'light', label: 'Light', desc: 'Latar terang, ideal untuk siang hari',
            icon: <Sun size={18} strokeWidth={1.8} />,
            preview: { bg: '#fafafa', card: '#ffffff', text: '#111111', border: '#e5e5e5' },
        },
        {
            id: 'dark', label: 'Dark', desc: 'Latar gelap, nyaman di lingkungan redup',
            icon: <Moon size={18} strokeWidth={1.8} />,
            preview: { bg: '#0a0a0a', card: '#111111', text: '#ededed', border: '#222222' },
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Tema Warna</h3>
                <p style={{ fontSize: 13, color: 'var(--tx-3)' }}>Pilih tema yang sesuai dengan lingkungan kerja Anda.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 520 }}>
                {options.map(o => (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => theme !== o.id && toggleTheme()}
                        style={{
                            padding: 0, textAlign: 'left', cursor: 'pointer',
                            border: `2px solid ${theme === o.id ? 'var(--border-focus)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--r-md)', overflow: 'hidden',
                            background: 'var(--bg-surface)',
                            transition: 'border-color var(--t-fast)',
                        }}
                    >
                        {/* Preview box */}
                        <div style={{
                            background: o.preview.bg, padding: '14px 14px 10px',
                            borderBottom: `1px solid ${o.preview.border}`,
                        }}>
                            {/* Mini card preview */}
                            <div style={{
                                background: o.preview.card,
                                border: `1px solid ${o.preview.border}`,
                                borderRadius: 6, padding: '8px 10px',
                            }}>
                                <div style={{ background: o.preview.text, height: 6, width: '60%', borderRadius: 2, opacity: 0.8, marginBottom: 5 }} />
                                <div style={{ background: o.preview.border, height: 5, width: '85%', borderRadius: 2, marginBottom: 3 }} />
                                <div style={{ background: o.preview.border, height: 5, width: '70%', borderRadius: 2 }} />
                            </div>
                        </div>

                        {/* Label */}
                        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--tx-1)', marginBottom: 2 }}>
                                    {o.label}
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>{o.desc}</div>
                            </div>
                            {theme === o.id && (
                                <div style={{
                                    width: 18, height: 18, borderRadius: '50%',
                                    background: 'var(--tx-1)', color: 'var(--tx-inverse)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, marginLeft: 8,
                                }}>
                                    <Check size={10} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--tx-3)' }}>
                Preferensi tema disimpan otomatis di browser Anda.
            </div>
        </div>
    );
};

/* â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Settings = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('profile');

    const activeTab = TAB_LIST.find(t => t.id === tab);

    return (
        <Layout title="Pengaturan" subtitle="Kelola akun dan preferensi Anda">
            <div style={{ maxWidth: 800 }}>
                <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
                    {/* Sidebar tabs */}
                    <div style={{
                        width: 190, flexShrink: 0,
                        borderRight: '1px solid var(--border-color)',
                        paddingRight: 0, marginRight: 32,
                    }}>
                        {TAB_LIST.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                style={{
                                    width: '100%', display: 'flex',
                                    alignItems: 'center', gap: 9,
                                    padding: '8px 12px 8px 0',
                                    marginBottom: 2,
                                    background: 'none', cursor: 'pointer',
                                    borderRight: `2px solid ${tab === t.id ? 'var(--border-focus)' : 'transparent'}`,
                                    color: tab === t.id ? 'var(--tx-1)' : 'var(--tx-3)',
                                    fontSize: 13, fontWeight: tab === t.id ? 600 : 500,
                                    textAlign: 'left',
                                    transition: 'color var(--t-fast), border-color var(--t-fast)',
                                }}
                            >
                                <t.icon size={14} strokeWidth={2} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: 20 }}>
                            <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>{activeTab?.label}</h2>
                        </div>
                        {tab === 'profile'    && <ProfileTab user={user} />}
                        {tab === 'security'   && <SecurityTab />}
                        {tab === 'appearance' && <AppearanceTab />}
                    </div>
                </div>
            </div>
            {/* -- Panduan Fitur Tertanam -- */}
            <PageFeatureGuide guide={PAGE_GUIDES['/settings']} />
        </Layout>
    );
};

export default Settings;

