import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Moon,
    Sun,
    ArrowRight,
    Leaf,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    TrendingDown,
    Zap
} from 'lucide-react';

/* ── App Logo Component ─────────────────────────────────────── */
const AppLogoIcon = ({ size = 44, className = '' }) => (
    <img
        src="/logo.svg"
        alt="MealPlanner Logo"
        width={size}
        height={size}
        className={className}
        style={{
            borderRadius: Math.round(size * 0.24),
            display: 'block',
            flexShrink: 0,
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.22))'
        }}
    />
);

/* ── Value highlights on left panel ─────────────────────────── */
const highlights = [
    {
        title: 'Otomatisasi Menu Mingguan',
        desc: 'Rekomendasi resep variatif disesuaikan dengan stok dapur Anda.',
    },
    {
        title: 'Pemenuhan Standar AKG Keluarga',
        desc: 'Pantau kalori, protein, dan serat harian tiap anggota keluarga.',
    },
    {
        title: 'Efisiensi Anggaran Belanja',
        desc: 'Kurangi pemborosan makanan hingga 30% dengan daftar belanja terstruktur.',
    },
];

const Login = () => {
    const [email, setEmail]       = useState('user@demo.com');
    const [password, setPassword] = useState('password123');
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login }               = useAuth();
    const { theme, toggleTheme }  = useTheme();
    const navigate                = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleFillDemo = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setError('');
    };

    return (
        <div className="auth-split-page">

            {/* ── Left panel — Brand Story & Live Showcase ────── */}
            <div className="auth-split-left" aria-hidden="true">
                {/* Ambient glowing background blobs */}
                <div className="auth-blob auth-blob-1" />
                <div className="auth-blob auth-blob-2" />

                <div className="auth-split-left-inner">
                    {/* Brand header */}
                    <div className="auth-brand-mark">
                        <AppLogoIcon size={54} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="auth-brand-name">MealPlanner</span>
                                <span style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    letterSpacing: '0.6px',
                                    textTransform: 'uppercase',
                                    padding: '2px 8px',
                                    borderRadius: 999,
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    color: '#95d5b2',
                                    border: '1px solid rgba(255, 255, 255, 0.18)'
                                }}>
                                    Smart Food-Tech
                                </span>
                            </div>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                                Perencanaan Menu & Gizi Keluarga
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="auth-split-headline">
                        <h2>Rencanakan makan sehat keluarga dengan cerdas</h2>
                        <p>
                            Satu dasbor terpadu untuk racikan menu bergizi, pemantauan AKG,
                            inventaris stok dapur, dan efisiensi belanja bulanan.
                        </p>
                    </div>

                    {/* Highlight pillars */}
                    <ul className="auth-feature-list">
                        {highlights.map((item, idx) => (
                            <li key={idx} style={{ alignItems: 'flex-start' }}>
                                <CheckCircle2 size={18} className="auth-feature-check" style={{ marginTop: 2 }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 13.5 }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                                        {item.desc}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Glassmorphic Live Preview Card */}
                    <div className="auth-food-card" style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span className="auth-food-day-label" style={{ margin: 0 }}>
                                Menu Hari Ini • 3 Porsi
                            </span>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#95d5b2',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'rgba(82, 183, 136, 0.18)',
                                padding: '3px 8px',
                                borderRadius: 6
                            }}>
                                <Sparkles size={11} /> 96% AKG Tercapai
                            </span>
                        </div>

                        <div className="auth-food-items" style={{ gap: 6 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.92)',
                                background: 'rgba(0,0,0,0.12)',
                                padding: '6px 10px',
                                borderRadius: 8
                            }}>
                                <span>🍚 Nasi Merah Organik</span>
                                <span style={{ opacity: 0.7, fontSize: 11.5 }}>180 kkal</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.92)',
                                background: 'rgba(0,0,0,0.12)',
                                padding: '6px 10px',
                                borderRadius: 8
                            }}>
                                <span>🥦 Tumis Brokoli Wortel Jamur</span>
                                <span style={{ opacity: 0.7, fontSize: 11.5 }}>95 kkal</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.92)',
                                background: 'rgba(0,0,0,0.12)',
                                padding: '6px 10px',
                                borderRadius: 8
                            }}>
                                <span>🍗 Ayam Panggang Rempah Madu</span>
                                <span style={{ opacity: 0.7, fontSize: 11.5 }}>240 kkal</span>
                            </div>
                        </div>

                        <div className="auth-food-stats" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="auth-food-stat">
                                    <Leaf size={12} />
                                    <span>515 kkal</span>
                                </span>
                                <span className="auth-food-stat-sep">·</span>
                                <span className="auth-food-stat-text">Protein 34g</span>
                                <span className="auth-food-stat-sep">·</span>
                                <span className="auth-food-stat-text">Serat 9g</span>
                            </div>
                            <span style={{
                                fontSize: 11,
                                color: '#fca311',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                            }}>
                                <TrendingDown size={11} /> Hemat ~28%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel — Login Form ─────────────────────── */}
            <div className="auth-split-right">
                {/* Theme toggle button */}
                <button
                    className="theme-toggle auth-theme-btn"
                    onClick={toggleTheme}
                    title="Ganti Tema (Terang / Gelap)"
                    id="auth-theme-toggle"
                >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                <div className="auth-form-wrap">
                    {/* Mobile Brand Header (Visible only on mobile/tablet) */}
                    <div className="auth-mobile-logo">
                        <AppLogoIcon size={42} />
                        <div>
                            <span className="auth-brand-name" style={{ fontSize: 20 }}>MealPlanner</span>
                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>Perencana Menu Sehat Keluarga</div>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Selamat datang kembali</h1>
                        <p className="auth-form-subtitle">
                            Masuk ke akun Anda untuk melanjutkan perencanaan menu dan gizi keluarga.
                        </p>
                    </div>

                    {/* Error alert */}
                    {error && (
                        <div className="alert alert-error auth-alert" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">
                                Alamat Email
                            </label>
                            <div className="form-icon-wrap">
                                <Mail size={15} className="input-icon" />
                                <input
                                    id="login-email"
                                    type="email"
                                    className="form-control"
                                    placeholder="nama@contoh.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="auth-label-row">
                                <label className="form-label" htmlFor="login-password">
                                    Kata Sandi
                                </label>
                                <a
                                    href="#"
                                    className="auth-forgot-link"
                                    tabIndex={-1}
                                    onClick={e => {
                                        e.preventDefault();
                                        alert('Untuk demonstrasi, silakan gunakan kredensial demo di bawah.');
                                    }}
                                >
                                    Lupa kata sandi?
                                </a>
                            </div>
                            <div className="form-icon-wrap" style={{ position: 'relative' }}>
                                <Lock size={15} className="input-icon" />
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Masukkan kata sandi"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ paddingRight: 40 }}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    id="login-toggle-password"
                                    onClick={() => setShowPass(s => !s)}
                                    className="auth-eye-btn"
                                    tabIndex={-1}
                                    title={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="login-submit-btn"
                            className="btn btn-primary w-full btn-lg auth-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? <><span className="spinner" /> Memverifikasi...</>
                                : <>Masuk ke Dasbor <ArrowRight size={16} /></>
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-text">atau</span>
                        <div className="auth-divider-line" />
                    </div>

                    {/* Register CTA */}
                    <p className="auth-cta-text">
                        Belum memiliki akun?{' '}
                        <Link to="/register" className="auth-cta-link" id="auth-register-link">
                            Daftar sekarang gratis
                        </Link>
                    </p>

                    {/* Demo credentials quick-fill box */}
                    <div className="auth-demo-box" style={{
                        marginTop: 20,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        borderRadius: 10,
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ShieldCheck size={14} color="var(--primary)" />
                                <span className="auth-demo-label" style={{ color: 'var(--tx-1)', fontSize: 11, fontWeight: 700 }}>
                                    Akun Uji Coba (Demo)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleFillDemo('user@demo.com', 'password123')}
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--primary)',
                                    background: 'var(--primary-soft)',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3
                                }}
                            >
                                <Zap size={10} /> 1-Klik Isi
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--tx-3)' }}>
                            <span>Email:</span>
                            <code>user@demo.com</code>
                            <span style={{ opacity: 0.4 }}>•</span>
                            <span>Sandi:</span>
                            <code>password123</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
