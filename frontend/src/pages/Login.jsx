import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, Moon, Sun, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail]       = useState('user@demo.com');
    const [password, setPassword] = useState('password123');
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login }        = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate         = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Periksa koneksi atau kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Theme toggle top right */}
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                style={{ position: 'absolute', top: 16, right: 16 }}
                title="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/logo.jpg" alt="MealPlanner" />
                        <span className="auth-logo-name">MealPlanner</span>
                    </div>
                    <h1>Selamat datang kembali</h1>
                    <p>Masuk ke akun Anda untuk melanjutkan perencanaan menu.</p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 16 }}>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="form-icon-wrap">
                            <Mail size={13} className="input-icon" />
                            <input
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
                        <label className="form-label">Password</label>
                        <div className="form-icon-wrap" style={{ position: 'relative' }}>
                            <Lock size={13} className="input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingRight: 36 }}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(s => !s)}
                                style={{
                                    position: 'absolute', right: 9, top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--tx-3)',
                                    lineHeight: 0, padding: 2,
                                }}
                            >
                                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                        disabled={loading}
                        style={{ marginTop: 8, justifyContent: 'center' }}
                    >
                        {loading
                            ? <><span className="spinner" /> Memverifikasi...</>
                            : <>Masuk <ArrowRight size={14} /></>
                        }
                    </button>
                </form>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    margin: '18px 0', color: 'var(--tx-4)', fontSize: 12
                }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                    <span>atau</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                </div>

                <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--tx-3)' }}>
                    Belum punya akun?{' '}
                    <Link to="/register" style={{ color: 'var(--tx-1)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        Daftar
                    </Link>
                </p>

                {/* Demo credentials */}
                <div style={{
                    marginTop: 16,
                    padding: '9px 12px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 11.5,
                    color: 'var(--tx-3)',
                    fontFamily: 'Menlo, Consolas, monospace',
                }}>
                    Demo &nbsp;·&nbsp; user@demo.com &nbsp;/&nbsp; password123
                </div>
            </div>
        </div>
    );
};

export default Login;
