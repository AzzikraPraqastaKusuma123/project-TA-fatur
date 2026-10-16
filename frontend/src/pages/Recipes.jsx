import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Search, Filter, Clock, Users, Flame } from 'lucide-react';

const DIFFICULTY_CONFIG = {
    EASY:   { label: 'Mudah',   color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
    MEDIUM: { label: 'Sedang',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    HARD:   { label: 'Sulit',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const MEAL_TYPE_LABEL = {
    ANY:       'Semua Waktu',
    BREAKFAST: 'Sarapan',
    LUNCH:     'Makan Siang',
    DINNER:    'Makan Malam',
};

const fmt = n => `Rp${Number(n || 0).toLocaleString('id-ID')}`;

/* ─── Recipe Card ─────────────────────────────────────────── */
const RecipeCard = ({ recipe, onClick }) => {
    const diff = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG.MEDIUM;
    return (
        <button
            type="button"
            onClick={() => onClick(recipe)}
            style={{
                display: 'flex', flexDirection: 'column',
                padding: '16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-surface)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                gap: 10,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx-1)', lineHeight: 1.3, marginBottom: 4 }}>
                        {recipe.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--tx-3)', lineHeight: 1.4 }}>
                        {recipe.description}
                    </div>
                </div>
                <span style={{
                    flexShrink: 0,
                    padding: '3px 8px', borderRadius: 12,
                    fontSize: 10, fontWeight: 700,
                    color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`,
                }}>
                    {diff.label}
                </span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--tx-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {recipe.cooking_time || 0} mnt
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} /> {recipe.servings || 1} porsi
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={11} /> {Math.round(recipe.total_calories || 0)} kkal
                </span>
            </div>

            {/* Nutrition mini-bar */}
            <div style={{ display: 'flex', gap: 6 }}>
                {[
                    { label: 'P', val: recipe.total_protein,  color: '#3b82f6' },
                    { label: 'L', val: recipe.total_fat,       color: '#f59e0b' },
                    { label: 'K', val: recipe.total_carbs,     color: '#10b981' },
                ].map(n => (
                    <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--tx-3)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                        {n.label}: {Number(n.val || 0).toFixed(1)}g
                    </div>
                ))}
            </div>

            {/* Category + Meal type */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {recipe.category && (
                    <span style={{
                        padding: '2px 7px', borderRadius: 10,
                        fontSize: 10, fontWeight: 600,
                        background: 'var(--bg-hover)', color: 'var(--tx-2)',
                        border: '1px solid var(--border-color)',
                    }}>
                        {recipe.category}
                    </span>
                )}
                {recipe.meal_type && recipe.meal_type !== 'ANY' && (
                    <span style={{
                        padding: '2px 7px', borderRadius: 10,
                        fontSize: 10, fontWeight: 600,
                        background: 'var(--blue-bg, #eff6ff)', color: 'var(--blue, #1d4ed8)',
                        border: '1px solid var(--blue-border, #bfdbfe)',
                    }}>
                        {MEAL_TYPE_LABEL[recipe.meal_type]}
                    </span>
                )}
            </div>
        </button>
    );
};

/* ─── Recipe Detail Modal ─────────────────────────────────── */
const RecipeModal = ({ recipe, onClose }) => {
    if (!recipe) return null;
    const diff = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG.MEDIUM;
    const ingredients = (recipe.ingredients_list || '').split('|').filter(Boolean).map(s => {
        const [name, qty, unit] = s.split(':');
        return { name, qty: parseFloat(qty), unit };
    });
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }}>
                <div className="modal-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}>
                    <span className="modal-title">{recipe.name}</span>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {/* Description */}
                    {recipe.description && (
                        <p style={{ fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.6, marginBottom: 20 }}>
                            {recipe.description}
                        </p>
                    )}

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Waktu masak', value: `${recipe.cooking_time || 0} menit` },
                            { label: 'Porsi',        value: `${recipe.servings || 1} orang` },
                            { label: 'Tingkat',      value: diff.label },
                            { label: 'Jenis',        value: MEAL_TYPE_LABEL[recipe.meal_type] || recipe.meal_type },
                        ].map(m => (
                            <div key={m.label}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
                                    {m.label}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)' }}>{m.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Nutrition */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
                        {[
                            { label: 'Kalori', val: Math.round(recipe.total_calories || 0), unit: 'kkal', color: '#ef4444' },
                            { label: 'Protein', val: Number(recipe.total_protein || 0).toFixed(1), unit: 'g', color: '#3b82f6' },
                            { label: 'Lemak',   val: Number(recipe.total_fat || 0).toFixed(1), unit: 'g', color: '#f59e0b' },
                            { label: 'Karbo',   val: Number(recipe.total_carbs || 0).toFixed(1), unit: 'g', color: '#10b981' },
                        ].map(n => (
                            <div key={n.label} style={{
                                padding: '10px 12px',
                                background: 'var(--bg-root)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--r-sm)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: n.color }}>{n.val}</div>
                                <div style={{ fontSize: 9.5, color: 'var(--tx-3)', marginTop: 2 }}>{n.unit} {n.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Ingredients */}
                    {ingredients.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Bahan-bahan ({ingredients.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {ingredients.map((ing, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        padding: '7px 12px',
                                        background: 'var(--bg-root)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--r-xs)',
                                        fontSize: 13,
                                    }}>
                                        <span style={{ color: 'var(--tx-1)', fontWeight: 500 }}>{ing.name}</span>
                                        <span style={{ color: 'var(--tx-3)' }}>{ing.qty} {ing.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Equipment */}
                    {recipe.equipment_list && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Peralatan
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {recipe.equipment_list.split(',').map(eq => (
                                    <span key={eq} style={{
                                        padding: '4px 10px', borderRadius: 12,
                                        fontSize: 12, fontWeight: 500,
                                        background: 'var(--bg-hover)',
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
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Cara Memasak
                            </div>
                            <div style={{
                                fontSize: 13.5, color: 'var(--tx-2)', lineHeight: 1.8,
                                whiteSpace: 'pre-line',
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

/* ─── Main Page ───────────────────────────────────────────── */
const Recipes = () => {
    const [recipes, setRecipes]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [mealType, setMealType]   = useState('ALL');
    const [category, setCategory]   = useState('ALL');
    const [selected, setSelected]   = useState(null);

    useEffect(() => {
        api.get('/recipes')
            .then(r => setRecipes(r.data.data || []))
            .finally(() => setLoading(false));
    }, []);

    const categories = ['ALL', ...new Set(recipes.map(r => r.category).filter(Boolean))];

    const filtered = recipes.filter(r => {
        const matchSearch   = r.name?.toLowerCase().includes(search.toLowerCase()) ||
                              r.description?.toLowerCase().includes(search.toLowerCase());
        const matchMealType = mealType === 'ALL' || r.meal_type === mealType || r.meal_type === 'ANY';
        const matchCategory = category === 'ALL' || r.category === category;
        return matchSearch && matchMealType && matchCategory;
    });

    return (
        <Layout
            title="Katalog Resep"
            subtitle={`${recipes.length} resep tersedia dalam database`}
        >
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx-3)' }} />
                    <input
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: 32 }}
                        placeholder="Cari resep..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: 5 }}>
                    {[['ALL', 'Semua'], ['BREAKFAST', 'Sarapan'], ['LUNCH', 'Makan Siang'], ['DINNER', 'Makan Malam']].map(([val, label]) => (
                        <button
                            key={val}
                            type="button"
                            className="btn btn-sm"
                            style={{
                                background: mealType === val ? 'var(--tx-1)' : 'var(--bg-hover)',
                                color:      mealType === val ? 'var(--tx-inverse)' : 'var(--tx-2)',
                                border:     mealType === val ? 'none' : '1px solid var(--border-color)',
                            }}
                            onClick={() => setMealType(val)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {categories.length > 2 && (
                    <select
                        className="form-control"
                        style={{ width: 'auto', minWidth: 130 }}
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c === 'ALL' ? 'Semua Kategori' : c}</option>
                        ))}
                    </select>
                )}

                <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginLeft: 'auto', flexShrink: 0 }}>
                    {filtered.length} resep
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--r-sm)' }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">🍳</div>
                        <h3>Resep tidak ditemukan</h3>
                        <p>Coba ubah kata kunci pencarian atau filter yang dipilih.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {filtered.map(r => (
                        <RecipeCard key={r.id} recipe={r} onClick={setSelected} />
                    ))}
                </div>
            )}

            {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}
        </Layout>
    );
};

export default Recipes;
