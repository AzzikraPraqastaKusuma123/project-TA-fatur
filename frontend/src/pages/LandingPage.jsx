import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
    Moon, Sun, ArrowRight, Check, Users, Wallet, CalendarDays,
    Lightbulb, Package, ChefHat, BarChart3, Shield
} from 'lucide-react';

const FEATURES = [
    { icon: CalendarDays, title: 'Jadwal Makan Otomatis',    desc: 'Sistem pintar meracik menu harian secara seimbang sesuai anggaran belanja dan kebutuhan nutrisi.' },
    { icon: Wallet,       title: 'Kontrol Anggaran Ketat',   desc: 'Atur anggaran harian, mingguan, atau bulanan. Pantau pengeluaran secara real-time.' },
    { icon: Users,        title: 'Profil Nutrisi Keluarga',  desc: 'Kalkulasi kebutuhan kalori, protein, lemak, dan karbohidrat setiap anggota keluarga.' },
    { icon: Package,      title: 'Manajemen Stok Dapur',     desc: 'Pantau stok bahan di rumah, dapatkan peringatan kadaluarsa, dan belanja lebih hemat.' },
    { icon: Lightbulb,    title: 'Rekomendasi Menu Pintar',  desc: 'Rekomendasi resep otomatis berdasarkan bahan di rumah, anggaran, dan alergi keluarga.' },
    { icon: BarChart3,    title: 'Analitik & Laporan',       desc: 'Pantau riwayat menu, tren pengeluaran, dan capaian nutrisi keluarga.' },
];

const STATS = [
    { value: '100+', label: 'Resep Nusantara' },
    { value: '3×', label: 'Slot Makan / Hari' },
    { value: '100%', label: 'Gizi Seimbang (AKG)' },
    { value: 'Hemat', label: 'Sesuai Anggaran' },
];

const LandingPage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div style={{
            background: 'var(--bg-root)',
            color: 'var(--tx-1)',
            fontFamily: 'var(--font)',
            transition: 'background var(--t-slow), color var(--t-slow)',
        }}>
            {/* ── Navbar ── */}
            <nav className="lp-nav" style={{
                position: 'sticky', top: 0, zIndex: 100,
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                padding: '0 40px', height: 52,
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background var(--t-slow), border-color var(--t-slow)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                        src="/logo.svg"
                        alt="MealPlanner"
                        width={28}
                        height={28}
                        style={{
                            borderRadius: 7,
                            display: 'block',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                        }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
                        MealPlanner
                    </span>
                </div>

                <div className="lp-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                        {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                    </button>
                    <Link to="/login" className="btn btn-ghost btn-sm lp-nav-links">Masuk</Link>
                    <Link to="/register" className="btn btn-primary btn-sm">
                        Mulai Gratis <ArrowRight size={12} />
                    </Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{
                maxWidth: 860, margin: '0 auto',
                padding: '80px 40px 64px',
                textAlign: 'center',
            }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 999,
                    fontSize: 11.5, fontWeight: 600,
                    color: 'var(--tx-2)',
                    marginBottom: 28,
                    background: 'var(--bg-hover)',
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--green)', display: 'inline-block'
                    }} />
                    Gratis · Tidak butuh kartu kredit
                </div>

                <h1 style={{
                    fontSize: 'clamp(32px, 5vw, 52px)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    marginBottom: 20,
                    color: 'var(--tx-1)',
                }}>
                    Rencanakan menu keluarga{' '}
                    <span style={{
                        textDecoration: 'underline',
                        textDecorationStyle: 'wavy',
                        textUnderlineOffset: 5,
                        textDecorationColor: 'var(--green)',
                    }}>lebih cerdas</span>
                </h1>

                <p style={{
                    fontSize: 16, color: 'var(--tx-3)', lineHeight: 1.7,
                    maxWidth: 540, margin: '0 auto 36px',
                }}>
                    Sistem perencanaan makan berbasis anggaran dan nutrisi keluarga.
                    Optimasi otomatis jadwal makan, stok bahan, dan daftar belanja.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Mulai Sekarang <ArrowRight size={15} />
                    </Link>
                    <Link to="/login" className="btn btn-outline btn-lg">
                        Masuk ke Akun
                    </Link>
                </div>

                {/* Trust note */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 20,
                    marginTop: 28, flexWrap: 'wrap'
                }}>
                    {['Tidak perlu kartu kredit', 'Setup dalam 2 menit', 'Data aman & privat'].map(t => (
                        <div key={t} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, color: 'var(--tx-3)', fontWeight: 500,
                        }}>
                            <Check size={12} color="var(--green)" strokeWidth={2.5} />
                            {t}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Stats bar ── */}
            <section style={{
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                transition: 'background var(--t-slow), border-color var(--t-slow)',
            }}>
                <div style={{
                    maxWidth: 860, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                }}>
                    {STATS.map((s, i) => (
                        <div key={s.label} style={{
                            padding: '24px 0', textAlign: 'center',
                            borderRight: i < STATS.length - 1 ? '1px solid var(--border-color)' : 'none',
                        }}>
                            <div style={{
                                fontSize: 26, fontWeight: 800,
                                letterSpacing: '-0.6px', color: 'var(--tx-1)',
                            }}>{s.value}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--tx-3)', marginTop: 3, fontWeight: 500 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--tx-3)', marginBottom: 10 }}>
                        Fitur Unggulan
                    </p>
                    <h2 style={{
                        fontSize: 'clamp(22px, 3vw, 32px)',
                        fontWeight: 800, letterSpacing: '-0.04em',
                        color: 'var(--tx-1)', lineHeight: 1.2,
                    }}>
                        Semua yang Anda butuhkan<br />dalam satu platform
                    </h2>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1, border: '1px solid var(--border-color)',
                    borderRadius: 'var(--r-md)', overflow: 'hidden',
                }}>
                    {FEATURES.map((f, i) => (
                        <div key={f.title} style={{
                            padding: '24px 22px',
                            background: 'var(--bg-surface)',
                            borderRight: i % 3 < 2 ? '1px solid var(--border-color)' : 'none',
                            borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none',
                            transition: 'background var(--t-fast)',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                        >
                            <div style={{
                                width: 32, height: 32, borderRadius: 'var(--r-xs)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-hover)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 14, color: 'var(--tx-2)',
                                transition: 'background var(--t-slow), border-color var(--t-slow)',
                            }}>
                                <f.icon size={15} strokeWidth={1.8} />
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--tx-1)', marginBottom: 7, letterSpacing: '-0.2px' }}>
                                {f.title}
                            </div>
                            <div style={{ fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.65 }}>
                                {f.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section style={{
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                transition: 'background var(--t-slow)',
            }}>
                <div style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--tx-3)', marginBottom: 10 }}>
                            Cara Kerja
                        </p>
                        <h2 style={{
                            fontSize: 'clamp(22px, 3vw, 30px)',
                            fontWeight: 800, letterSpacing: '-0.04em',
                            color: 'var(--tx-1)',
                        }}>
                            Mulai dalam 3 langkah
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, position: 'relative' }}>
                        {[
                            { step: '01', title: 'Daftarkan Keluarga', desc: 'Tambahkan data anggota keluarga: usia, berat, tinggi, dan tingkat aktivitas untuk menghitung kebutuhan nutrisi.' },
                            { step: '02', title: 'Atur Anggaran', desc: 'Tentukan budget makan harian/mingguan. Sistem akan menyesuaikan rekomendasi menu agar sesuai anggaran.' },
                            { step: '03', title: 'Dapatkan Jadwal', desc: 'Sistem pintar secara otomatis meracik jadwal menu seimbang dan hemat. Simpan dan nikmati bersama keluarga.' },
                        ].map((s, i) => (
                            <div key={s.step} style={{
                                padding: '28px 28px',
                                borderLeft: i > 0 ? '1px solid var(--border-color)' : 'none',
                            }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, letterSpacing: '1px',
                                    color: 'var(--tx-4)', marginBottom: 14,
                                    fontFamily: 'Menlo, monospace',
                                }}>
                                    {s.step}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--tx-1)', marginBottom: 9, letterSpacing: '-0.3px' }}>
                                    {s.title}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--tx-3)', lineHeight: 1.65 }}>
                                    {s.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Security note ── */}
            <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 40px' }}>
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '24px 28px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-surface)',
                    transition: 'background var(--t-slow), border-color var(--t-slow)',
                }}>
                    <div style={{
                        width: 36, height: 36, flexShrink: 0,
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--r-xs)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--tx-2)', background: 'var(--bg-hover)',
                    }}>
                        <Shield size={16} strokeWidth={1.8} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5, color: 'var(--tx-1)' }}>
                            Data Anda Aman
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--tx-3)', lineHeight: 1.65 }}>
                            Semua data keluarga disimpan secara lokal dan terenkripsi. Kami tidak menjual atau berbagi data
                            kepada pihak ketiga. Autentikasi menggunakan JWT dengan enkripsi bcrypt.
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                transition: 'background var(--t-slow)',
            }}>
                <div style={{
                    maxWidth: 600, margin: '0 auto',
                    padding: '72px 40px',
                    textAlign: 'center',
                }}>
                    <h2 style={{
                        fontSize: 'clamp(24px, 3vw, 36px)',
                        fontWeight: 800, letterSpacing: '-0.04em',
                        color: 'var(--tx-1)', marginBottom: 14,
                    }}>
                        Mulai rencanakan menu keluarga Anda
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--tx-3)', marginBottom: 28 }}>
                        Gratis selamanya. Tidak perlu kartu kredit.
                    </p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Buat Akun Gratis <ArrowRight size={15} />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                borderTop: '1px solid var(--border-color)',
                padding: '20px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 8,
                transition: 'border-color var(--t-slow)',
            }}>
                <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>
                    © 2026 MealPlanner. Hak cipta dilindungi.
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    {[
                        { to: '/login', label: 'Masuk' },
                        { to: '/register', label: 'Daftar' },
                    ].map(l => (
                        <Link key={l.to} to={l.to} style={{
                            fontSize: 12, color: 'var(--tx-3)', fontWeight: 500,
                            transition: 'color var(--t-fast)',
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--tx-1)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--tx-3)'}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>
            </footer>

            {/* ── Comprehensive responsive styles ── */}
            <style>{`
                /* Base section padding */
                section > div, .lp-inner { padding-left: 40px; padding-right: 40px; }

                /* Navbar */
                @media (max-width: 640px) {
                    .lp-nav { padding: 0 16px !important; }
                    .lp-nav .lp-nav-links { display: none !important; }
                    .lp-nav .lp-nav-actions a:first-child { display: none !important; }
                }

                /* Hero: stack CTA buttons on mobile */
                @media (max-width: 600px) {
                    .lp-hero-btns {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .lp-hero-btns a {
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .lp-trust-row {
                        flex-direction: column !important;
                        gap: 8px !important;
                        align-items: flex-start !important;
                    }
                }

                /* Stats bar: 2x2 on mobile, add borders */
                @media (max-width: 600px) {
                    .lp-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .lp-stats-grid > div {
                        border-right: none !important;
                        border-bottom: 1px solid var(--border-color) !important;
                    }
                    .lp-stats-grid > div:nth-child(odd) {
                        border-right: 1px solid var(--border-color) !important;
                    }
                    .lp-stats-grid > div:nth-child(3),
                    .lp-stats-grid > div:nth-child(4) {
                        border-bottom: none !important;
                    }
                }

                /* Features: 1 col on mobile, 2 col on tablet */
                @media (max-width: 900px) {
                    .lp-features-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .lp-features-grid > div:nth-child(2n) {
                        border-right: none !important;
                    }
                    .lp-features-grid > div:nth-child(n+5) {
                        border-bottom: none !important;
                    }
                }
                @media (max-width: 540px) {
                    .lp-features-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .lp-features-grid > div {
                        border-right: none !important;
                    }
                }

                /* Steps: stack on mobile */
                @media (max-width: 680px) {
                    .lp-steps-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .lp-steps-grid > div {
                        border-left: none !important;
                        border-top: 1px solid var(--border-color) !important;
                        padding: 20px 0 !important;
                    }
                    .lp-steps-grid > div:first-child {
                        border-top: none !important;
                    }
                }

                /* Sections padding on mobile */
                @media (max-width: 768px) {
                    section { }
                    section > div { padding-left: 20px !important; padding-right: 20px !important; }
                    footer { padding: 16px 20px !important; }
                    .lp-section-inner { padding: 48px 20px !important; }
                    .lp-hero-section { padding: 48px 20px 40px !important; }
                    .lp-security-section { padding: 32px 20px !important; }
                    .lp-cta-section { padding: 48px 20px !important; }
                    .lp-security-box { padding: 16px !important; }
                    .lp-trust-row { justify-content: flex-start !important; }
                }

                /* Touch targets */
                @media (hover: none) {
                    a.btn { min-height: 44px; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
