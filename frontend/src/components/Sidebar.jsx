import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Wallet, Package, Wrench,
    UtensilsCrossed, Lightbulb, CalendarDays, ShoppingCart,
    Heart, BarChart3, ChefHat, FlaskConical, LogOut,
    Settings, History, Activity, UserCog, Leaf, Database
} from 'lucide-react';

const NAV_GROUPS = [
    {
        label: 'Beranda',
        items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ]
    },
    {
        label: 'Keluarga',
        items: [
            { to: '/family',      icon: Users,   label: 'Anggota Keluarga' },
            { to: '/budget',      icon: Wallet,  label: 'Anggaran Makan' },
            { to: '/preferences', icon: Heart,   label: 'Preferensi & Pantangan' },
        ]
    },
    {
        label: 'Dapur',
        items: [
            { to: '/inventory', icon: Package,         label: 'Stok Bahan' },
            { to: '/equipment', icon: Wrench,          label: 'Peralatan Masak' },
            { to: '/recipes',   icon: UtensilsCrossed, label: 'Katalog Resep' },
        ]
    },
    {
        label: 'Perencanaan',
        items: [
            { to: '/recommendation', icon: Lightbulb,    label: 'Buat Meal Plan' },
            { to: '/meal-plans',     icon: CalendarDays, label: 'Jadwal Tersimpan' },
            { to: '/shopping',       icon: ShoppingCart, label: 'Daftar Belanja' },
        ]
    },
    {
        label: 'Analitik',
        items: [
            { to: '/nutrition', icon: Activity,  label: 'Tracker Nutrisi' },
            { to: '/analytics', icon: BarChart3, label: 'Laporan' },
            { to: '/history',   icon: History,   label: 'Riwayat' },
        ]
    },
];

const ADMIN_GROUP = {
    label: 'Admin',
    items: [
        { to: '/admin',              icon: BarChart3,    label: 'Panel Admin' },
        { to: '/admin/users',        icon: UserCog,      label: 'Pengguna' },
        { to: '/admin/ingredients',  icon: Package,      label: 'Data Bahan' },
        { to: '/admin/recipes',      icon: ChefHat,      label: 'Data Resep' },
        { to: '/data-center',        icon: Database,     label: 'Data Center' },
        { to: '/admin/optimization', icon: FlaskConical, label: 'Log Optimasi' },
    ]
};


const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    const groups = user?.role === 'ADMIN'
        ? [...NAV_GROUPS, ADMIN_GROUP]
        : NAV_GROUPS;

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Brand */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div style={{
                        width: 32, height: 32,
                        borderRadius: 8,
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Leaf size={18} color="white" strokeWidth={2.5} />
                    </div>
                    <span className="sidebar-brand-name">Fatrur</span>
                </div>
            </div>

            <div className="sidebar-divider" />

            {/* Navigation */}
            <nav className="sidebar-nav">
                {groups.map(group => (
                    <div key={group.label} className="nav-section">
                        <div className="nav-section-label">{group.label}</div>
                        {group.items.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/dashboard'}
                                onClick={onClose}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            >
                                <Icon size={16} strokeWidth={2} className="nav-icon" />
                                {label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div className="sidebar-footer">
                <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    style={{ marginBottom: 8 }}
                >
                    <Settings size={16} strokeWidth={2} className="nav-icon" />
                    Pengaturan
                </NavLink>

                <div className="user-row">
                    <div className="user-avatar">{initials}</div>
                    <div className="user-info">
                        <div className="user-name">{user?.name || 'Pengguna'}</div>
                        <div className="user-role">
                            {user?.role === 'ADMIN' ? 'Administrator' : 'Anggota'}
                        </div>
                    </div>
                    <button
                        className="btn-logout"
                        onClick={handleLogout}
                        title="Keluar"
                    >
                        <LogOut size={15} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
