import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import Login       from './pages/Login';
import Register    from './pages/Register';

// User pages
import Dashboard      from './pages/Dashboard';
import Family         from './pages/Family';
import Budget         from './pages/Budget';
import Inventory      from './pages/Inventory';
import Equipment      from './pages/Equipment';
import Preferences    from './pages/Preferences';
import Recipes        from './pages/Recipes';
import MealPlans      from './pages/MealPlans';
import Shopping       from './pages/Shopping';
import Recommendation from './pages/Recommendation';
import Settings       from './pages/Settings';

// Admin pages
import AdminUsers  from './pages/admin/AdminUsers';
import DataCenter  from './pages/DataCenter';

// New feature pages
import Nutrition   from './pages/Nutrition';
import Analytics   from './pages/Analytics';
import HistoryPage from './pages/History';

// Layout
import Layout from './components/Layout';

/* ─── Guards ─────────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
    return children;
};

/* ─── Coming Soon placeholder ────────────────────────────────── */
const ComingSoon = ({ title, desc }) => (
    <Layout title={title}>
        <div className="card">
            <div className="empty-state" style={{ padding: '64px 24px' }}>
                <div className="empty-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                    </svg>
                </div>
                <h3>Segera Hadir</h3>
                <p>{desc || `Halaman ${title} sedang dalam pengembangan.`}</p>
            </div>
        </div>
    </Layout>
);

/* ─── App ────────────────────────────────────────────────────── */
function App() {
    return (
        <Routes>
            {/* ── Public ── */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Protected: User ── */}
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/family"       element={<ProtectedRoute><Family /></ProtectedRoute>} />
            <Route path="/budget"       element={<ProtectedRoute><Budget /></ProtectedRoute>} />
            <Route path="/inventory"    element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/recommendation" element={<ProtectedRoute><Recommendation /></ProtectedRoute>} />
            <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* ── Fully Implemented ── */}
            <Route path="/equipment"  element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
            <Route path="/recipes"    element={<ProtectedRoute><Recipes /></ProtectedRoute>} />

            {/* ── Coming Soon ── */}
            <Route path="/meal-plans" element={<ProtectedRoute><MealPlans /></ProtectedRoute>} />
            <Route path="/shopping"   element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
            <Route path="/nutrition"  element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/analytics"  element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/history"    element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

            {/* ── Protected: Admin ── */}
            <Route path="/admin"        element={<AdminRoute><ComingSoon title="Panel Admin"  desc="Dashboard admin dengan statistik sistem." /></AdminRoute>} />
            <Route path="/admin/users"  element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/ingredients"  element={<AdminRoute><ComingSoon title="Data Bahan"  /></AdminRoute>} />
            <Route path="/admin/recipes"      element={<AdminRoute><ComingSoon title="Data Resep"  /></AdminRoute>} />
            <Route path="/admin/optimization" element={<AdminRoute><ComingSoon title="Log Optimasi" /></AdminRoute>} />
            <Route path="/data-center"        element={<AdminRoute><DataCenter /></AdminRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
