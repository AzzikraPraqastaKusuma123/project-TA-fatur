import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    Search, Clock, Users, Flame, ChefHat, X,
    Dumbbell, Wheat, Droplets, BookOpen, UtensilsCrossed,
    Coffee, Sun, Moon, Soup, Star, TrendingUp, Award
} from 'lucide-react';

/* ── Config ─────────────────────────────────────────────────── */
const DIFFICULTY = {
    EASY:   { label: 'Mudah',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    MEDIUM: { label: 'Sedang', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    HARD:   { label: 'Sulit',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const MEAL_TABS = [
    { key: 'ALL',       label: 'Semua',      icon: Soup    },
    { key: 'BREAKFAST', label: 'Sarapan',    icon: Coffee  },
    { key: 'LUNCH',     label: 'Makan Siang',icon: Sun     },
    { key: 'DINNER',    label: 'Makan Malam',icon: Moon    },
];

const NUTRIENT_CONFIG = [
    { key: 'total_calories', label: 'Kalori',  unit: 'kkal', color: '#ef4444', icon: Flame    },
    { key: 'total_protein',  label: 'Protein', unit: 'g',    color: '#3b82f6', icon: Dumbbell },
    { key: 'total_fat',      label: 'Lemak',   unit: 'g',    color: '#f59e0b', icon: Droplets },
    { key: 'total_carbs',    label: 'Karbo',   unit: 'g',    color: '#10b981', icon: Wheat    },
];

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

/* ── Food Emoji Map ──────────────────────────────────────────── */
const FOOD_EMOJI = {
    'Ayam Goreng':        '🍗',
    'Ayam Kecap':         '🍖',
    'Capcay':             '🥦',
    'Ikan Teri Kacang':   '🐟',
    'Mie Goreng':         '🍜',
    'Nasi Goreng Spesial':'🍳',
    'Nasi Putih':         '🍚',
    'Oatmeal Pisang':     '🍌',
    'Opor Ayam':          '🍲',
    'Perkedel Kentang':   '🥔',
    'Sayur Bayam':        '🥬',
    'Sayur Sop':          '🥣',
    'Semur Daging':       '🥩',
    'Soto Ayam':          '🍜',
    'Tahu Sayur':         '🫘',
    'Telur Balado':       '🥚',
    'Telur Dadar':        '🍳',
    'Tempe Goreng':       '🫘',
    'Tumis Bayam Tahu':   '🥬',
    'Tumis Kangkung':     '🌿',
    'Rendang Daging':     '🥩',
    'Gado-Gado Spesial':  '🥗',
    'Sayur Asem Jakarta': '🥣',
    'Rawon Sapi Surabaya':'🍲',
    'Ayam Bakar Madu':    '🍗',
    'Nasi Uduk Gurih':    '🍚',
    'Bihun Goreng Spesial':'🍜',
    'Bakso Sapi Kuah':    '🍲',
    'Tumis Buncis Jagung Manis': '🌽',
    'Bubur Ayam Komplit': '🥣',
};

/* ── Local Food Image Map (Guaranteed Accurate & Offline) ───── */
const FOOD_IMAGES = {
    'Ayam Goreng':        '/images/recipes/ayam-goreng.jpg',
    'Ayam Kecap':         '/images/recipes/ayam-kecap.jpg',
    'Capcay':             '/images/recipes/capcay.jpg',
    'Ikan Teri Kacang':   '/images/recipes/ikan-teri-kacang.jpg',
    'Mie Goreng':         '/images/recipes/mie-goreng.jpg',
    'Nasi Goreng Spesial':'/images/recipes/nasi-goreng-spesial.jpg',
    'Nasi Putih':         '/images/recipes/nasi-putih.jpg',
    'Oatmeal Pisang':     '/images/recipes/oatmeal-pisang.jpg',
    'Opor Ayam':          '/images/recipes/opor-ayam.jpg',
    'Perkedel Kentang':   '/images/recipes/perkedel-kentang.jpg',
    'Sayur Bayam':        '/images/recipes/sayur-bayam.jpg',
    'Sayur Sop':          '/images/recipes/sayur-sop.jpg',
    'Semur Daging':       '/images/recipes/semur-daging.jpg',
    'Soto Ayam':          '/images/recipes/soto-ayam.jpg',
    'Tahu Sayur':         '/images/recipes/tahu-sayur.jpg',
    'Telur Balado':       '/images/recipes/telur-balado.jpg',
    'Telur Dadar':        '/images/recipes/telur-dadar.jpg',
    'Tempe Goreng':       '/images/recipes/tempe-goreng.jpg',
    'Tumis Bayam Tahu':   '/images/recipes/tumis-bayam-tahu.jpg',
    'Tumis Kangkung':     '/images/recipes/tumis-kangkung.jpg',
    'Rendang Daging':     '/images/recipes/semur-daging.jpg',
    'Gado-Gado Spesial':  '/images/recipes/capcay.jpg',
    'Sayur Asem Jakarta': '/images/recipes/sayur-bayam.jpg',
    'Rawon Sapi Surabaya':'/images/recipes/soto-ayam.jpg',
    'Ayam Bakar Madu':    '/images/recipes/ayam-goreng.jpg',
    'Nasi Uduk Gurih':    '/images/recipes/nasi-putih.jpg',
    'Bihun Goreng Spesial':'/images/recipes/mie-goreng.jpg',
    'Bakso Sapi Kuah':    '/images/recipes/sayur-sop.jpg',
    'Tumis Buncis Jagung Manis': '/images/recipes/tumis-kangkung.jpg',
    'Bubur Ayam Komplit': '/images/recipes/soto-ayam.jpg',
};

const CATEGORY_GRADIENTS = {
    'Lauk':       ['#ff9a3c', '#ff6b35'],
    'Sayur':      ['#56ab2f', '#a8e063'],
    'Mie':        ['#f7971e', '#ffd200'],
    'Nasi':       ['#11998e', '#38ef7d'],
    'Karbohidrat':['#834d9b', '#d04ed6'],
    'Sarapan':    ['#ed8936', '#ecc94b'],
    'Sup':        ['#4facfe', '#00f2fe'],
    'default':    ['#667eea', '#764ba2'],
};

function getGradient(category) {
    const colors = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;
    return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

/* ── Recipe Card ─────────────────────────────────────────────── */
const RecipeCard = ({ recipe, onClick }) => {
    const diff = DIFFICULTY[recipe.difficulty] || DIFFICULTY.MEDIUM;
    const [hov, setHov] = useState(false);
    const [imgErr, setImgErr] = useState(false);

    const imgUrl = recipe.image_url || FOOD_IMAGES[recipe.name];
    const emoji  = FOOD_EMOJI[recipe.name] || '🍽️';

    return (
        <button
            type="button"
            onClick={() => onClick(recipe)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', flexDirection: 'column',
                padding: 0,
                border: `1.5px solid ${hov ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 16, background: 'var(--bg-surface)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: hov ? '0 10px 30px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                transform: hov ? 'translateY(-3px)' : 'none',
                overflow: 'hidden',
            }}
        >
            {/* ── Food Image / Hero ── */}
            <div style={{
                position: 'relative',
                width: '100%', height: 160,
                overflow: 'hidden', flexShrink: 0,
            }}>
                {imgUrl && !imgErr ? (
                    <img
                        src={imgUrl}
                        alt={recipe.name}
                        onError={() => setImgErr(true)}
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            transform: hov ? 'scale(1.06)' : 'scale(1)',
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        background: getGradient(recipe.category),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 56,
                        transition: 'transform 0.3s ease',
                        transform: hov ? 'scale(1.06)' : 'scale(1)',
                    }}>
                        {emoji}
                    </div>
                )}

                {/* Overlay gradient bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 60,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                }} />

                {/* Difficulty Badge */}
                <span style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '3px 9px', borderRadius: 20,
                    fontSize: 10, fontWeight: 700,
                    color: diff.color, background: 'rgba(255,255,255,0.92)',
                    border: `1px solid ${diff.border}`,
                    backdropFilter: 'blur(4px)',
                }}>
                    {diff.label}
                </span>

                {/* Calorie badge */}
                <span style={{
                    position: 'absolute', bottom: 10, left: 10,
                    padding: '3px 8px', borderRadius: 20,
                    fontSize: 10.5, fontWeight: 700,
                    color: '#fff',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <Flame size={10} color="#f97316" />
                    {Math.round(recipe.total_calories || 0)} kkal
                </span>
            </div>

            {/* ── Card Body ── */}
            <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx-1)', lineHeight: 1.35 }}>
                    {recipe.name}
                </div>

                {recipe.description && (
                    <div style={{
                        fontSize: 11.5, color: 'var(--tx-3)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {recipe.description}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--tx-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} color="var(--tx-4)" /> {recipe.cooking_time || 0} mnt
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={11} color="var(--tx-4)" /> {recipe.servings || 1} porsi
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {[
                        { label: 'P', val: recipe.total_protein, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'L', val: recipe.total_fat,     color: '#f59e0b', bg: '#fffbeb' },
                        { label: 'K', val: recipe.total_carbs,   color: '#10b981', bg: '#f0fdf4' },
                    ].map(n => (
                        <span key={n.label} style={{
                            padding: '2px 7px', borderRadius: 20,
                            fontSize: 10, fontWeight: 700,
                            color: n.color, background: n.bg,
                        }}>
                            {n.label}: {Number(n.val || 0).toFixed(1)}g
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 'auto', alignItems: 'center' }}>
                    {recipe.category && (
                        <span style={{
                            padding: '2px 8px', borderRadius: 20,
                            fontSize: 10, fontWeight: 600,
                            background: 'var(--bg-muted)', color: 'var(--tx-3)',
                            border: '1px solid var(--border-color)',
                        }}>
                            {recipe.category}
                        </span>
                    )}
                    {recipe.estimated_cost > 0 && (
                        <span style={{
                            padding: '2px 8px', borderRadius: 20,
                            fontSize: 10, fontWeight: 600,
                            background: '#f0fdf4', color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            marginLeft: 'auto',
                        }}>
                            {fmt(recipe.estimated_cost)}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

/* ── Recipe Detail Modal ─────────────────────────────────────── */
const RecipeModal = ({ recipe, onClose }) => {
    if (!recipe) return null;
    const diff = DIFFICULTY[recipe.difficulty] || DIFFICULTY.MEDIUM;
    const [imgErr, setImgErr] = useState(false);
    const ingredients = (recipe.ingredients_list || '').split('|').filter(Boolean).map(s => {
        const [name, qty, unit] = s.split(':');
        return { name, qty: parseFloat(qty), unit };
    });

    const imgUrl = recipe.image_url || FOOD_IMAGES[recipe.name];
    const emoji  = FOOD_EMOJI[recipe.name] || '🍽️';

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{ backdropFilter: 'blur(4px)' }}
        >
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', borderRadius: 20, padding: 0 }}
            >
                {/* Hero Image */}
                <div style={{ position: 'relative', width: '100%', height: 220, flexShrink: 0 }}>
                    {imgUrl && !imgErr ? (
                        <img
                            src={imgUrl}
                            alt={recipe.name}
                            onError={() => setImgErr(true)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: getGradient(recipe.category),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 80,
                        }}>
                            {emoji}
                        </div>
                    )}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)',
                    }} />
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 14, right: 14,
                            width: 34, height: 34, borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)',
                        }}
                    >
                        <X size={16} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 16, left: 20, right: 60 }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                            {recipe.name}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '3px 10px', borderRadius: 20,
                                fontSize: 11, fontWeight: 700,
                                color: diff.color, background: 'rgba(255,255,255,0.92)',
                                border: `1px solid ${diff.border}`,
                            }}>
                                {diff.label}
                            </span>
                            {recipe.category && (
                                <span style={{
                                    padding: '3px 8px', borderRadius: 20,
                                    fontSize: 11, fontWeight: 600,
                                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(4px)',
                                }}>
                                    {recipe.category}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    {recipe.description && (
                        <p style={{ fontSize: 13.5, color: 'var(--tx-2)', lineHeight: 1.7, marginBottom: 24 }}>
                            {recipe.description}
                        </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                        {[
                            { label: 'Waktu', value: `${recipe.cooking_time || 0} mnt`, icon: Clock, color: '#6366f1' },
                            { label: 'Porsi', value: `${recipe.servings || 1} org`, icon: Users, color: '#0ea5e9' },
                            { label: 'Tingkat', value: diff.label, icon: ChefHat, color: diff.color },
                            { label: 'Estimasi', value: recipe.estimated_cost > 0 ? fmt(recipe.estimated_cost) : '—', icon: null, color: '#10b981' },
                        ].map(m => (
                            <div key={m.label} style={{
                                padding: '12px', borderRadius: 12, textAlign: 'center',
                                background: 'var(--bg-muted)', border: '1px solid var(--border-color)',
                            }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                                    {m.label}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: m.color || 'var(--tx-1)' }}>
                                    {m.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                            📊 Informasi Gizi
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {NUTRIENT_CONFIG.map(n => {
                                const Icon = n.icon;
                                return (
                                    <div key={n.key} style={{
                                        padding: '14px 10px', borderRadius: 12, textAlign: 'center',
                                        background: n.color + '10', border: `1px solid ${n.color}25`,
                                    }}>
                                        <Icon size={18} color={n.color} style={{ marginBottom: 6 }} />
                                        <div style={{ fontSize: 18, fontWeight: 800, color: n.color, lineHeight: 1 }}>
                                            {n.key === 'total_calories'
                                                ? Math.round(recipe[n.key] || 0)
                                                : Number(recipe[n.key] || 0).toFixed(1)
                                            }
                                        </div>
                                        <div style={{ fontSize: 9.5, color: 'var(--tx-4)', marginTop: 3, fontWeight: 600 }}>
                                            {n.unit} {n.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {ingredients.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                                🧺 Bahan-bahan ({ingredients.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {ingredients.map((ing, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', padding: '9px 14px',
                                        background: i % 2 === 0 ? 'var(--bg-muted)' : 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8, fontSize: 13,
                                    }}>
                                        <span style={{ color: 'var(--tx-1)', fontWeight: 500 }}>{ing.name}</span>
                                        <span style={{
                                            color: 'var(--tx-3)', fontWeight: 600,
                                            background: 'var(--bg-surface)', padding: '2px 8px',
                                            borderRadius: 20, fontSize: 11, border: '1px solid var(--border-color)',
                                        }}>
                                            {ing.qty} {ing.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recipe.equipment_list && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                                🍳 Peralatan
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {recipe.equipment_list.split(',').map(eq => (
                                    <span key={eq} style={{
                                        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                        background: 'var(--bg-muted)', border: '1px solid var(--border-color)', color: 'var(--tx-2)',
                                    }}>
                                        {eq.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {recipe.instructions && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                                📝 Cara Memasak
                            </div>
                            <div style={{
                                fontSize: 13.5, color: 'var(--tx-2)', lineHeight: 1.8,
                                whiteSpace: 'pre-line', background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px 16px',
                            }}>
                                {recipe.instructions}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Stats Bar ───────────────────────────────────────────────── */
const StatsBar = ({ recipes }) => {
    const total      = recipes.length;
    const avgCal     = total ? Math.round(recipes.reduce((s, r) => s + (r.total_calories || 0), 0) / total) : 0;
    const easyCount  = recipes.filter(r => r.difficulty === 'EASY').length;
    const categories = new Set(recipes.map(r => r.category).filter(Boolean)).size;

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10, marginBottom: 20,
        }}>
            {[
                { icon: BookOpen,   label: 'Total Resep',      value: total,           color: '#6366f1', bg: '#f5f3ff' },
                { icon: Star,       label: 'Resep Mudah',      value: easyCount,        color: '#16a34a', bg: '#f0fdf4' },
                { icon: Flame,      label: 'Rata-rata Kalori',  value: `${avgCal} kkal`, color: '#ef4444', bg: '#fef2f2' },
                { icon: TrendingUp, label: 'Kategori',         value: categories,       color: '#0ea5e9', bg: '#f0f9ff' },
            ].map(s => (
                <div key={s.label} style={{
                    padding: '14px 16px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, background: s.bg, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <s.icon size={18} color={s.color} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>
                            {s.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ── Main Page ──────────────────────────────────────────────── */
const Recipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [mealTab, setMealTab] = useState('ALL');
    const [category, setCategory] = useState('ALL');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        api.get('/recipes')
            .then(r => setRecipes(r.data.data || []))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() =>
        ['ALL', ...new Set(recipes.map(r => r.category).filter(Boolean))],
        [recipes]
    );

    const filtered = useMemo(() => recipes.filter(r => {
        const q = search.toLowerCase();
        const matchSearch   = !q || r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
        const matchMealType = mealTab === 'ALL' || r.meal_type === mealTab || r.meal_type === 'ANY';
        const matchCategory = category === 'ALL' || r.category === category;
        return matchSearch && matchMealType && matchCategory;
    }), [recipes, search, mealTab, category]);

    return (
        <Layout
            title="Katalog Resep"
            subtitle={`${recipes.length} resep tersedia dalam database`}
        >
            {!loading && recipes.length > 0 && <StatsBar recipes={recipes} />}

            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--tx-3)', pointerEvents: 'none',
                    }} />
                    <input
                        type="text" className="form-control"
                        style={{ paddingLeft: 38, paddingRight: search ? 38 : 14, fontSize: 14, height: 44 }}
                        placeholder="Cari nama atau deskripsi resep..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            border: 'none', background: 'none', cursor: 'pointer', color: 'var(--tx-3)', display: 'flex', padding: 2,
                        }}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex', gap: 4, background: 'var(--bg-muted)',
                        border: '1px solid var(--border-color)', borderRadius: 10, padding: 4,
                    }}>
                        {MEAL_TABS.map(({ key, label, icon: Icon }) => (
                            <button key={key} type="button" onClick={() => setMealTab(key)} style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 7,
                                border: 'none', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, transition: 'all 0.15s ease',
                                background: mealTab === key ? 'var(--bg-surface)' : 'transparent',
                                color: mealTab === key ? 'var(--primary)' : 'var(--tx-3)',
                                boxShadow: mealTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            }}>
                                <Icon size={13} />
                                <span className="recipe-tab-label">{label}</span>
                            </button>
                        ))}
                    </div>

                    {categories.length > 2 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {categories.map(c => (
                                <button key={c} type="button" onClick={() => setCategory(c)} style={{
                                    padding: '6px 12px', borderRadius: 20,
                                    border: `1px solid ${category === c ? 'var(--primary)' : 'var(--border-color)'}`,
                                    background: category === c ? 'var(--primary)' : 'transparent',
                                    color: category === c ? '#fff' : 'var(--tx-3)',
                                    fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                                }}>
                                    {c === 'ALL' ? 'Semua' : c}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--tx-4)', fontWeight: 600, flexShrink: 0 }}>
                        {filtered.length} dari {recipes.length} resep
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div className="skeleton" style={{ height: 16, borderRadius: 4 }} />
                                <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '70%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ padding: '60px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-icon"><UtensilsCrossed size={22} /></div>
                        <h3>Resep tidak ditemukan</h3>
                        <p>Coba ubah kata kunci atau filter yang aktif.</p>
                        {(search || mealTab !== 'ALL' || category !== 'ALL') && (
                            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }}
                                onClick={() => { setSearch(''); setMealTab('ALL'); setCategory('ALL'); }}>
                                <X size={13} /> Hapus Filter
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {filtered.map(r => (
                        <RecipeCard key={r.id} recipe={r} onClick={setSelected} />
                    ))}
                </div>
            )}

            {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}
            <PageFeatureGuide guide={PAGE_GUIDES['/recipes']} />

            <style>{`
                @media (max-width: 640px) {
                    .recipe-tab-label { display: none; }
                }
            `}</style>
        </Layout>
    );
};

export default Recipes;
