import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    Database, Upload, RefreshCw, AlertTriangle, CheckCircle,
    Clock, ExternalLink, FileText, ChevronRight, Search,
    Download, Eye, FlaskConical, Tag, GitMerge, Layers, Info
} from 'lucide-react';

// ── Status badge config ──────────────────────────────────────
const SOURCE_STATUS = {
    NOT_IMPORTED:      { label: 'Belum Diimpor',    cls: 'badge-default' },
    IMPORTED:          { label: 'Sudah Diimpor',    cls: 'badge-green'   },
    PARTIALLY_IMPORTED:{ label: 'Sebagian Diimpor', cls: 'badge-amber'   },
    FAILED:            { label: 'Gagal Diimpor',    cls: 'badge-red'     },
    ACTIVE:            { label: 'Aktif Digunakan',  cls: 'badge-primary' },
};

const TYPE_INFO = {
    RECIPES:   { icon: Layers,      label: 'Resep',      color: 'var(--primary)' },
    NUTRITION: { icon: FlaskConical,label: 'Nutrisi',    color: 'var(--info)'    },
    PRICES:    { icon: Tag,         label: 'Harga Pasar',color: 'var(--warning)' },
    EQUIPMENT: { icon: Database,    label: 'Peralatan',  color: 'var(--success)' },
    OTHER:     { icon: FileText,    label: 'Lainnya',    color: 'var(--tx-3)'    },
};

// ── Komponen Stat Card sederhana ─────────────────────────────
const StatBadge = ({ label, value, color = 'var(--tx-1)', sub }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px', lineHeight: 1 }}>
            {value ?? '—'}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 10, color: 'var(--tx-4)', marginTop: 2 }}>{sub}</div>}
    </div>
);

// ── Upload Modal ─────────────────────────────────────────────
const UploadModal = ({ source, onClose, onSuccess }) => {
    const [file, setFile]         = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState('');

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('source_id', source.id);
            const res = await api.post('/dataset/import/recipes', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload gagal. Coba lagi.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Upload size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                        Upload Dataset
                    </div>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, color: 'var(--tx-1)', marginBottom: 4 }}>{source.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--tx-3)' }}>{source.description}</div>
                    </div>

                    {!result ? (
                        <>
                            <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 12 }}>
                                <Info size={14} />
                                <div>
                                    Format yang diterima: <strong>CSV</strong>. Gunakan kolom:
                                    <code style={{ display: 'block', marginTop: 4, fontFamily: 'monospace', fontSize: 11, background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: 4 }}>
                                        name, category, meal_type, servings, cooking_time, instructions, ingredients, calories, protein, fat, carbs
                                    </code>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pilih File CSV <span className="req">*</span></label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="form-control"
                                    style={{ paddingTop: 8 }}
                                />
                                {file && (
                                    <div className="form-hint">
                                        {file.name} — {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                )}
                            </div>

                            {error && <div className="alert alert-danger" style={{ fontSize: 12 }}>{error}</div>}
                        </>
                    ) : (
                        <div className="alert alert-success">
                            <CheckCircle size={16} />
                            <div>
                                <strong>Impor dimulai!</strong>
                                <div style={{ fontSize: 12, marginTop: 4 }}>Job ID: <strong>{result.job_id}</strong>. Cek status di Riwayat Job.</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    {!result ? (
                        <>
                            <a href="/api/dataset/template/recipes" download className="btn btn-ghost btn-sm">
                                <Download size={14} /> Unduh Template
                            </a>
                            <button className="btn btn-outline btn-sm" onClick={onClose}>Batal</button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleUpload}
                                disabled={!file || uploading}
                            >
                                {uploading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Mengunggah...</> : <><Upload size={14} /> Mulai Impor</>}
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary btn-sm" onClick={onClose}>Selesai</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Source Card ──────────────────────────────────────────────
const SourceCard = ({ source, onUpload }) => {
    const statusCfg  = SOURCE_STATUS[source.status] || SOURCE_STATUS.NOT_IMPORTED;
    const typeCfg    = TYPE_INFO[source.type]       || TYPE_INFO.OTHER;
    const TypeIcon   = typeCfg.icon;
    const canUpload  = ['NOT_IMPORTED','PARTIALLY_IMPORTED','FAILED'].includes(source.status)
                       && source.type === 'RECIPES';

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <TypeIcon size={18} color={typeCfg.color} strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--tx-1)', marginBottom: 3 }}>
                            {source.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span className={`badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                            <span className="badge badge-default">{typeCfg.label}</span>
                            {source.version && (
                                <span style={{ fontSize: 10, color: 'var(--tx-4)', fontWeight: 500 }}>
                                    v{source.version}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-color)', flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--tx-2)', lineHeight: 1.6, marginBottom: 12 }}>
                    {source.description}
                </p>

                {/* Stats row */}
                {source.record_count > 0 && (
                    <div style={{
                        display: 'flex', gap: 20, padding: '10px 14px',
                        background: 'var(--bg-muted)', borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border-color)',
                        marginBottom: 12,
                    }}>
                        <StatBadge label="Total" value={source.record_count} />
                        <StatBadge label="Valid" value={source.valid_count} color="var(--success)" />
                        <StatBadge label="Review" value={source.review_count} color="var(--warning)" />
                        <StatBadge label="Invalid" value={source.invalid_count} color="var(--danger)" />
                    </div>
                )}

                {/* License & source */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {source.license && (
                        <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>
                            📄 Lisensi: <strong>{source.license}</strong>
                        </div>
                    )}
                    {source.last_imported_at && (
                        <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>
                            🕒 Terakhir diimpor: {new Date(source.last_imported_at).toLocaleDateString('id-ID')}
                        </div>
                    )}
                </div>

                {source.notes && (
                    <div className="alert alert-warning" style={{ marginTop: 10, fontSize: 11, padding: '8px 12px' }}>
                        <Info size={12} />
                        <span>{source.notes}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {source.source_url && (
                    <a
                        href={source.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                    >
                        <ExternalLink size={13} /> Sumber Asli
                    </a>
                )}
                {canUpload && (
                    <button className="btn btn-outline btn-sm" onClick={() => onUpload(source)}>
                        <Upload size={13} /> Upload File
                    </button>
                )}
                {source.status === 'ACTIVE' && (
                    <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
                        <CheckCircle size={11} /> Digunakan Optimizer
                    </span>
                )}
            </div>
        </div>
    );
};

// ── Job Row ──────────────────────────────────────────────────
const JOB_STATUS_STYLE = {
    COMPLETED:  { cls: 'badge-green',   icon: CheckCircle },
    PROCESSING: { cls: 'badge-blue',    icon: RefreshCw   },
    FAILED:     { cls: 'badge-red',     icon: AlertTriangle },
    PENDING:    { cls: 'badge-default', icon: Clock       },
    ROLLED_BACK:{ cls: 'badge-amber',   icon: AlertTriangle },
};

const JobRow = ({ job }) => {
    const stCfg = JOB_STATUS_STYLE[job.status] || JOB_STATUS_STYLE.PENDING;
    const StIcon = stCfg.icon;
    return (
        <tr>
            <td>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{job.filename || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--tx-3)' }}>{job.source_name}</div>
            </td>
            <td>
                <span className={`badge ${stCfg.cls}`}>
                    <StIcon size={11} /> {job.status}
                </span>
            </td>
            <td style={{ fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{job.valid_rows}</span>
                {' / '}
                <span style={{ color: 'var(--warning)' }}>{job.review_rows}</span>
                {' / '}
                <span style={{ color: 'var(--danger)' }}>{job.invalid_rows}</span>
                <div style={{ fontSize: 10, color: 'var(--tx-4)' }}>Valid / Review / Invalid</div>
            </td>
            <td style={{ fontSize: 11, color: 'var(--tx-3)' }}>
                {job.created_at ? new Date(job.created_at).toLocaleString('id-ID') : '—'}
            </td>
            <td style={{ fontSize: 11, color: 'var(--tx-3)' }}>{job.triggered_by_name || '—'}</td>
        </tr>
    );
};

// ── Mapping Row ──────────────────────────────────────────────
const MappingRow = ({ mapping, onResolve }) => (
    <tr>
        <td>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{mapping.source_name}</div>
            <div style={{ fontSize: 10, color: 'var(--tx-4)' }}>{mapping.source_name}</div>
        </td>
        <td style={{ fontSize: 'var(--text-sm)', color: 'var(--tx-2)' }}>
            {mapping.mapped_name || <em style={{ color: 'var(--tx-4)' }}>Belum dipetakan</em>}
        </td>
        <td>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 100,
                background: mapping.confidence >= 0.9 ? 'var(--success-bg)' : mapping.confidence >= 0.7 ? 'var(--warning-bg)' : 'var(--danger-bg)',
                color: mapping.confidence >= 0.9 ? 'var(--success)' : mapping.confidence >= 0.7 ? 'var(--warning)' : 'var(--danger)',
                fontSize: 11, fontWeight: 700,
            }}>
                {((mapping.confidence || 0) * 100).toFixed(0)}%
            </div>
        </td>
        <td>
            <div style={{ display: 'flex', gap: 6 }}>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onResolve(mapping.id, 'APPROVED', mapping.mapped_ingredient_id)}
                >
                    Setujui
                </button>
                <button
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => onResolve(mapping.id, 'REJECTED')}
                >
                    Tolak
                </button>
            </div>
        </td>
    </tr>
);

// ── MAIN PAGE ────────────────────────────────────────────────
const DataCenter = () => {
    const [activeTab,  setActiveTab]  = useState('overview');
    const [stats,      setStats]      = useState(null);
    const [sources,    setSources]    = useState([]);
    const [jobs,       setJobs]       = useState([]);
    const [mappings,   setMappings]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [uploadSrc,  setUploadSrc]  = useState(null);

    const Sk = ({ h = 16, w = '100%', r = 6 }) => (
        <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
    );

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, sourcesRes, jobsRes, mappingsRes] = await Promise.all([
                api.get('/dataset/stats'),
                api.get('/dataset/sources'),
                api.get('/dataset/jobs'),
                api.get('/dataset/mappings/pending'),
            ]);
            setStats(statsRes.data.data);
            setSources(sourcesRes.data.data || []);
            setJobs(jobsRes.data.data || []);
            setMappings(mappingsRes.data.items || []);
        } catch (err) {
            console.error('DataCenter load error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleResolveMapping = async (id, decision, ingredientId = null) => {
        try {
            await api.post(`/dataset/mappings/${id}/resolve`, { decision, ingredient_id: ingredientId });
            setMappings(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert('Gagal menyimpan keputusan: ' + err.message);
        }
    };

    const TABS = [
        { id: 'overview', label: 'Ringkasan',      icon: Database },
        { id: 'sources',  label: 'Sumber Data',    icon: Layers   },
        { id: 'jobs',     label: 'Riwayat Import', icon: Clock    },
        { id: 'mappings', label: `Pemetaan Bahan${mappings.length > 0 ? ` (${mappings.length})` : ''}`, icon: GitMerge },
    ];

    return (
        <Layout
            title="Data Center"
            subtitle="Manajemen dataset, kualitas data, dan pipeline impor Fatrur"
            actions={
                <button className="btn btn-outline btn-sm" onClick={loadAll}>
                    <RefreshCw size={14} /> Refresh
                </button>
            }
        >
            {/* Tab Bar */}
            <div style={{
                display: 'flex', gap: 2,
                borderBottom: '1px solid var(--border-color)',
                marginBottom: 24,
            }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '9px 16px',
                            fontSize: 'var(--text-sm)', fontWeight: 600,
                            fontFamily: 'var(--font)',
                            border: 'none', background: 'none', cursor: 'pointer',
                            borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === id ? 'var(--primary)' : 'var(--tx-3)',
                            marginBottom: -1,
                            transition: 'color var(--t-fast)',
                        }}
                    >
                        <Icon size={15} strokeWidth={2} />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                        {loading ? [1,2,3,4].map(i => <div key={i} className="card" style={{ padding: 20 }}><Sk h={32} w="50%" /><div style={{marginTop:8}}><Sk h={12} w="70%" /></div></div>) : [
                            { label: 'Total Resep', value: stats?.recipes?.total, color: 'var(--primary)' },
                            { label: 'Siap Optimizer', value: stats?.recipes?.optimizer_ready, color: 'var(--success)', sub: 'Lengkap nutrisi & harga' },
                            { label: 'Perlu Review', value: stats?.recipes?.needs_review, color: 'var(--warning)' },
                            { label: 'Total Bahan', value: stats?.ingredients?.total, color: 'var(--info)' },
                        ].map(({ label, value, color, sub }) => (
                            <div key={label} className="card" style={{ padding: '20px 22px' }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.5px', lineHeight: 1 }}>
                                    {value ?? '—'}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx-3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {label}
                                </div>
                                {sub && <div style={{ fontSize: 10, color: 'var(--tx-4)', marginTop: 2 }}>{sub}</div>}
                            </div>
                        ))}
                    </div>

                    {/* Data Quality overview */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Status Kualitas Data</div>
                            <div className="card-subtitle">Semua angka berasal dari database aktual</div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[1,2,3].map(i => <Sk key={i} h={40} r={8} />)}
                                </div>
                            ) : stats ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {[
                                        { label: 'Resep valid & aktif',          value: stats.recipes.valid,            total: stats.recipes.total, color: 'var(--success)' },
                                        { label: 'Resep perlu review',           value: stats.recipes.needs_review,     total: stats.recipes.total, color: 'var(--warning)' },
                                        { label: 'Resep tanpa data nutrisi',     value: stats.recipes.missing_nutrition,total: stats.recipes.total, color: 'var(--danger)'  },
                                        { label: 'Resep tanpa data harga',       value: stats.recipes.missing_price,    total: stats.recipes.total, color: 'var(--accent)'  },
                                        { label: 'Record nutrisi bahan',         value: stats.nutrition_records,        total: null,                color: 'var(--info)'    },
                                        { label: 'Record harga bahan',           value: stats.price_records,            total: null,                color: 'var(--info)'    },
                                    ].map(({ label, value, total, color }) => (
                                        <div key={label} style={{ padding: '12px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-muted)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--text-sm)' }}>
                                                <span style={{ color: 'var(--tx-2)', fontWeight: 500 }}>{label}</span>
                                                <strong style={{ color }}>{value ?? 0}{total ? ` / ${total}` : ''}</strong>
                                            </div>
                                            {total > 0 && (
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${Math.min(100, ((value || 0) / total) * 100)}%`, background: color }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">Gagal memuat statistik.</div>
                            )}
                        </div>
                    </div>

                    {/* Ketentuan Penggunaan Data */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Aturan Integritas Data</div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { type: 'danger',  text: 'Nutrisi NULL tidak pernah diubah menjadi 0. Resep dengan data nutrisi hilang ditandai missing_nutrition.' },
                                { type: 'danger',  text: 'Harga NULL tidak berarti gratis. Bahan tanpa harga ditandai missing_price. MILP tidak menggunakan resep ini untuk menghitung biaya.' },
                                { type: 'warning', text: 'Bahan yang belum terpetakan ke Master Ingredient masuk antrian "Pemetaan Bahan" untuk review manual.' },
                                { type: 'success', text: 'Hanya resep berstatus SEED/VALID/IMPORTED dengan nutrition_completeness ≠ MISSING dan price_completeness ≠ MISSING yang dipakai oleh MILP Optimizer.' },
                                { type: 'info',    text: 'Alergi dan pantangan keras tidak dapat diabaikan meskipun jumlah resep yang lolos filter menjadi sangat sedikit.' },
                            ].map((r, i) => (
                                <div key={i} className={`alert alert-${r.type}`} style={{ fontSize: 12 }}>
                                    <Info size={13} /> {r.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Sources ── */}
            {activeTab === 'sources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="card" style={{ height: 160 }}><div className="card-body"><Sk h={20} w="50%" /><div style={{marginTop:12}}><Sk h={12} w="80%" /></div></div></div>)
                    ) : sources.length === 0 ? (
                        <div className="empty-state card" style={{ padding: 48 }}>
                            <div className="empty-icon"><Database size={20} /></div>
                            <h3>Belum ada dataset</h3>
                            <p>Jalankan migration untuk memuat katalog dataset.</p>
                        </div>
                    ) : sources.map(src => (
                        <SourceCard
                            key={src.id}
                            source={src}
                            onUpload={setUploadSrc}
                        />
                    ))}
                </div>
            )}

            {/* ── Tab: Jobs ── */}
            {activeTab === 'jobs' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Riwayat Impor Data</div>
                        <div className="card-subtitle">{jobs.length} job terakhir</div>
                    </div>
                    {loading ? (
                        <div className="card-body"><Sk h={200} /></div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state" style={{ padding: 48 }}>
                            <div className="empty-icon"><Clock size={20} /></div>
                            <h3>Belum ada impor</h3>
                            <p>Mulai upload file dataset dari tab Sumber Data.</p>
                        </div>
                    ) : (
                        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>File & Sumber</th>
                                        <th>Status</th>
                                        <th>Hasil</th>
                                        <th>Waktu</th>
                                        <th>Oleh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map(job => <JobRow key={job.id} job={job} />)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Mappings ── */}
            {activeTab === 'mappings' && (
                <div>
                    <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
                        <GitMerge size={15} />
                        <div>
                            <strong>Pemetaan Bahan</strong> — Bahan dari file sumber yang perlu dicocokkan ke Master Bahan Fatrur.
                            Pemetaan yang tidak disetujui <em>tidak akan digunakan</em> oleh system rekomendasi.
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Menunggu Review</div>
                            <span className="badge badge-amber">{mappings.length} bahan</span>
                        </div>
                        {loading ? (
                            <div className="card-body"><Sk h={200} /></div>
                        ) : mappings.length === 0 ? (
                            <div className="empty-state" style={{ padding: 48 }}>
                                <div className="empty-icon"><CheckCircle size={20} /></div>
                                <h3>Semua bahan sudah dipetakan</h3>
                                <p>Tidak ada antrian pemetaan bahan yang perlu direview.</p>
                            </div>
                        ) : (
                            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nama di Sumber</th>
                                            <th>Cocok dengan</th>
                                            <th>Kepercayaan</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mappings.map(m => (
                                            <MappingRow key={m.id} mapping={m} onResolve={handleResolveMapping} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {uploadSrc && (
                <UploadModal
                    source={uploadSrc}
                    onClose={() => setUploadSrc(null)}
                    onSuccess={() => { loadAll(); setUploadSrc(null); }}
                />
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 1024px) {
                    .dashboard-stat-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 640px) {
                    .dashboard-stat-grid { grid-template-columns: 1fr 1fr !important; }
                }
            `}</style>
        </Layout>
    );
};

export default DataCenter;
