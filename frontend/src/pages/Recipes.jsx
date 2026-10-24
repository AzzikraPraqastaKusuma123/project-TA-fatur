import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import PageFeatureGuide from '../components/PageFeatureGuide';
import { PAGE_GUIDES } from '../data/featureGuidesData';
import api from '../services/api';
import {
    Search, Clock, Users, Flame, ChefHat, X,
    Dumbbell, Wheat, Droplets, BookOpen, UtensilsCrossed,
    SlidersHorizontal, Coffee, Sun, Moon, Soup
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

/* ── Recipe Card ─────────────────────────────────────────────── */
const RecipeCard = ({ recipe, onClick }) => {
    const diff = DIFFICULTY[recipe.difficulty] || DIFFICULTY.MEDIUM;
    const [hov, setHov] = useState(false);

    return (
        <button
            type="button"
            onClick={() => onClick(recipe)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', flexDirection: 'column',
                padding: 0, border: `1px solid ${hov ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 14, background: 'var(--bg-surface)',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                transform: hov ? 'translateY(-2px)' : 'none',
                overflow: 'hidden',
            }}
        >
            {/* Color accent top bar */}
            <div style={{
                height: 3,
                background: diff.color,
                opacity: 0.7,
            }} />

            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                        fontWeight: 700, fontSize: 14, color: 'var(--tx-1)',
                        lineHeight: 1.35, flex: 1,
                    }}>
                        {recipe.name}
                    </div>
                    <span style={{
                        flexShrink: 0, padding: '3px 8px', borderRadius: 20,
                        fontSize: 10, fontWeight: 700,
                        color: diff.color, background: diff.bg,
                        border: `1px solid ${diff.border}`,
                    }}>
                        {diff.label}
                    </span>
                </div>

                {/* Description */}
                {recipe.description && (
                    <div style={{
                        fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {recipe.description}
                    </div>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--tx-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} color="var(--tx-4)" /> {recipe.cooking_time || 0} mnt
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={12} color="var(--tx-4)" /> {recipe.servings || 1} porsi
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Flame size={12} color="#ef4444" />
                        <strong style={{ color: 'var(--tx-1)', fontWeight: 700 }}>
                            {Math.round(recipe.total_calories || 0)}
                        </strong> kkal
                    </span>
                </div>

                {/* Nutrition mini pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                        { label: 'P', val: recipe.total_protein, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'L', val: recipe.total_fat,     color: '#f59e0b', bg: '#fffbeb' },
                        { label: 'K', val: recipe.total_carbs,   color: '#10b981', bg: '#f0fdf4' },
                    ].map(n => (
                        <span key={n.label} style={{
                            padding: '2px 8px', borderRadius: 20,
                            fontSize: 10.5, fontWeight: 700,
                            color: n.color, background: n.bg,
                        }}>
                            {n.label}: {Number(n.val || 0).toFixed(1)}g
                        </span>
                    ))}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 'auto' }}>
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
    const ingredients = (recipe.ingredients_list || '').split('|').filter(Boolean).map(s => {
        const [name, qty, unit] = s.split(':');
        return { name, qty: parseFloat(qty), unit };
    });

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{ backdropFilter: 'blur(4px)' }}
        >
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 640, maxHeight: '88vh', overflowY: 'auto', borderRadius: 20, padding: 0 }}
            >
                {/* Modal Header */}
                <div style={{
                    position: 'sticky', top: 0,
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '18px 24px',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                    zIndex: 10,
                    borderRadius: '20px 20px 0 0',
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--tx-1)', lineHeight: 1.2, marginBottom: 6 }}>
                            {recipe.name}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '3px 10px', borderRadius: 20,
                                fontSize: 11, fontWeight: 700,
                                color: diff.color, background: diff.bg,
                                border: `1px solid ${diff.border}`,
                            }}>
                                {diff.label}
                            </span>
                            {recipe.category && (
                                <span style={{
                                    padding: '3px 8px', borderRadius: 20,
                                    fontSize: 11, fontWeight: 600,
                                    background: 'var(--bg-muted)', color: 'var(--tx-3)',
                                    border: '1px solid var(--border-color)',
                                }}>
                                    {recipe.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 34, height: 34, borderRadius: 10,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--tx-3)', flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Description */}
                    {recipe.description && (
                        <p style={{ fontSize: 13.5, color: 'var(--tx-2)', lineHeight: 1.7, marginBottom: 24 }}>
                            {recipe.description}
                        </p>
                    )}

                    {/* Meta grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                        {[
                            { label: 'Waktu', value: `${recipe.cooking_time || 0} mnt`, icon: Clock },
                            { label: 'Porsi', value: `${recipe.servings || 1} org`, icon: Users },
                            { label: 'Tingkat', value: diff.label, icon: ChefHat },
                            { label: 'Estimasi', value: recipe.estimated_cost > 0 ? fmt(recipe.estimated_cost) : '—', icon: null },
                        ].map(m => (
                            <div key={m.label} style={{
                                padding: '10px 12px', borderRadius: 10,
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                                    {m.label}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)' }}>
                                    {m.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Nutrition */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                            Informasi Gizi
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {NUTRIENT_CONFIG.map(n => {
                                const Icon = n.icon;
                                return (
                                    <div key={n.key} style={{
                                        padding: '12px', borderRadius: 10, textAlign: 'center',
                                        background: n.color + '10',
                                        border: `1px solid ${n.color}25`,
                                    }}>
                                        <Icon size={16} color={n.color} style={{ marginBottom: 6 }} />
                                        <div style={{ fontSize: 16, fontWeight: 800, color: n.color, lineHeight: 1 }}>
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

                    {/* Ingredients */}
                    {ingredients.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                                Bahan-bahan ({ingredients.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {ingredients.map((ing, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '9px 14px',
                                        background: i % 2 === 0 ? 'var(--bg-muted)' : 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8, fontSize: 13,
                                    }}>
                                        <span style={{ color: 'var(--tx-1)', fontWeight: 500 }}>
                                            {ing.name}
                                        </span>
                                        <span style={{
                                            color: 'var(--tx-3)', fontWeight: 600,
                                            background: 'var(--bg-surface)',
                                            padding: '2px 8px', borderRadius: 20,
                                            fontSize: 11, border: '1px solid var(--border-color)',
                                        }}>
                                            {ing.qty} {ing.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Equipment */}
                    {recipe.equipment_list && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                                Peralatan
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {recipe.equipment_list.split(',').map(eq => (
                                    <span key={eq} style={{
                                        padding: '4px 12px', borderRadius: 20,
                                        fontSize: 12, fontWeight: 500,
                                        background: 'var(--bg-muted)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--tx-2)',
                                    }}>
                                        {eq.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {recipe.instructions && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                                Cara Memasak
                            </div>
                            <div style={{
                                fontSize: 13.5, color: 'var(--tx-2)', lineHeight: 1.8,
                                whiteSpace: 'pre-line',
                                background: 'var(--bg-muted)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 10, padding: '14px 16px',
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
            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search
                        size={15}
                        style={{
                            position: 'absolute', left: 14, top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--tx-3)',
                            pointerEvents: 'none',
                        }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: 38, paddingRight: search ? 38 : 14, fontSize: 14, height: 44 }}
                        placeholder="Cari nama atau deskripsi resep..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                border: 'none', background: 'none', cursor: 'pointer',
                                color: 'var(--tx-3)', display: 'flex', padding: 2,
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Meal type tabs */}
                    <div style={{
                        display: 'flex', gap: 4,
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 10, padding: 4,
                    }}>
                        {MEAL_TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setMealTab(key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', borderRadius: 7,
                                    border: 'none', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 600,
                                    transition: 'all 0.15s ease',
                                    background: mealTab === key ? 'var(--bg-surface)' : 'transparent',
                                    color: mealTab === key ? 'var(--primary)' : 'var(--tx-3)',
                                    boxShadow: mealTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                }}
                            >
                                <Icon size={13} />
                                <span className="recipe-tab-label">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Category pills */}
                    {categories.length > 2 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {categories.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    style={{
                                        padding: '6px 12px', borderRadius: 20,
                                        border: `1px solid ${category === c ? 'var(--primary)' : 'var(--border-color)'}`,
                                        background: category === c ? 'var(--primary)' : 'transparent',
                                        color: category === c ? '#fff' : 'var(--tx-3)',
                                        fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="skeleton" style={{ height: 220, borderRadius: 14 }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ padding: '60px 24px' }}>
                    <div className="empty-state">
                        <div className="empty-icon"><UtensilsCrossed size={22} /></div>
                        <h3>Resep tidak ditemukan</h3>
                        <p>Coba ubah kata kunci atau filter yang aktif.</p>
                        {(search || mealTab !== 'ALL' || category !== 'ALL') && (
                            <button
                                className="btn btn-outline btn-sm"
                                style={{ marginTop: 12 }}
                                onClick={() => { setSearch(''); setMealTab('ALL'); setCategory('ALL'); }}
                            >
                                <X size={13} /> Hapus Filter
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
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
