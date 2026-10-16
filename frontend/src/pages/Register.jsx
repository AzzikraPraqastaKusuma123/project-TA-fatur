import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Lock, Eye, EyeOff, Moon, Sun, ArrowRight } from 'lucide-react';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const { login }        = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate         = useNavigate();

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registrasi gagal.');
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                style={{ position: 'absolute', top: 16, right: 16 }}
                title="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/logo.jpg" alt="MealPlanner" />
                        <span className="auth-logo-name">MealPlanner</span>
                    </div>
                    <h1>Buat akun baru</h1>
                    <p>Daftarkan diri untuk mulai merencanakan menu keluarga Anda.</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nama lengkap</label>
                        <div className="form-icon-wrap">
                            <User size={13} className="input-icon" />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nama Anda"
                                value={form.name}
                                onChange={e => upd('name', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <div className="form-icon-wrap">
                            <Mail size={13} className="input-icon" />
                            <input
                                type="email"
                                className="form-control"
                                placeholder="nama@contoh.com"
                                value={form.email}
                                onChange={e => upd('email', e.target.value)}
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
                                placeholder="Min. 6 karakter"
                                value={form.password}
                                onChange={e => upd('password', e.target.value)}
                                style={{ paddingRight: 36 }}
                                minLength={6}
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
                            ? <><span className="spinner" /> Membuat akun...</>
                            : <>Buat Akun <ArrowRight size={14} /></>
                        }
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--tx-3)', marginTop: 18 }}>
                    Sudah punya akun?{' '}
                    <Link to="/login" style={{ color: 'var(--tx-1)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
