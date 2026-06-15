'use client';
import { useState, useRef } from 'react';
import { signOut } from 'next-auth/react';
import {
  Plus, Pencil, Trash2, Save, X, Loader2, Star,
  LogOut, ImagePlus, Upload, ExternalLink,
} from 'lucide-react';
import type { Project } from '@/lib/projects';

const STATUS_LABEL: Record<Project['status'], string> = {
  live: 'En producción',
  dev: 'En desarrollo',
  archived: 'Caso de estudio',
};

type FormData = Omit<Project, 'id' | 'createdAt'>;
const EMPTY: FormData = {
  nombre: '', descripcion: '', emoji: '🌐', url: '', github: '',
  tags: [], status: 'dev', featured: false, orden: 0, imagen: '', imagenes: [],
};

/* ── Emoji picker ── */
const EMOJI_CATS = [
  { label: 'Web', emojis: ['🌐', '💻', '📱', '🖥️', '⚡', '🚀', '🔥', '✨', '💡', '🎯', '🛠️', '⚙️', '🔧', '🔌', '📡', '🗺️', '📍', '🧭', '🔐', '🛡️'] },
  { label: 'Negocios', emojis: ['📊', '📈', '📉', '💼', '🏢', '💰', '💳', '🏦', '📋', '📝', '🗂️', '📁', '📦', '🗃️', '📌', '🤝', '🧾', '🏷️', '📮', '🔖'] },
  { label: 'Diseño', emojis: ['🎨', '🖌️', '🎭', '🖼️', '📐', '📏', '✂️', '🎬', '📷', '📸', '🎥', '🎞️', '🖍️', '💎', '🌈', '🪄', '🧩', '🎟️', '🔮', '🟧'] },
  { label: 'Tiendas', emojis: ['🛒', '🛍️', '🏪', '🍔', '☕', '🧁', '🍕', '🌮', '🥗', '🍱', '🛺', '🚗', '🚕', '🚌', '✈️', '⛵', '🏎️', '🚁', '🚦', '🏬'] },
  { label: 'Varios', emojis: ['🌿', '🌱', '🌊', '🏔️', '🌸', '🍀', '🌙', '⭐', '☀️', '❄️', '📚', '🎓', '🔬', '🧪', '🏆', '🥇', '🎖️', '🎫', '🟢', '🟠'] },
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(0);
  return (
    <div style={{ position: 'relative' }}>
      <label className="adm-label">Ícono del proyecto</label>
      <button type="button" className={`adm-emoji-btn${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span>{value}</span>
        <span className="hint">▼ Elegir</span>
      </button>
      {open && (
        <div className="adm-emoji-pop">
          <div className="adm-emoji-cats">
            {EMOJI_CATS.map((c, i) => (
              <button key={c.label} type="button" className={`adm-emoji-cat${cat === i ? ' on' : ''}`} onClick={() => setCat(i)}>{c.label}</button>
            ))}
          </div>
          <div className="adm-emoji-grid">
            {EMOJI_CATS[cat].emojis.map((e, i) => (
              <button key={`${e}-${i}`} type="button" className={value === e ? 'on' : ''} onClick={() => { onChange(e); setOpen(false); }}>{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Image uploader (hasta 4) ── */
function ImagenesEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const imgs = [...value.filter(Boolean), '', '', '', ''].slice(0, 4);
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [uploading, setUploading] = useState<number | null>(null);
  const [err, setErr] = useState('');

  async function uploadFile(idx: number, file: File) {
    setErr('');
    if (!file.type.startsWith('image/')) { setErr('Solo se aceptan imágenes (PNG, JPG, WebP, GIF).'); return; }
    if (file.size > 4 * 1024 * 1024) { setErr('La imagen supera el límite de 4 MB. Comprimila o subí una más liviana.'); return; }
    setUploading(idx);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setErr(data.error || `No se pudo subir la imagen (HTTP ${res.status}).`);
        return;
      }
      const next = [...imgs];
      next[idx] = data.url;
      onChange(next.filter(Boolean));
    } catch {
      setErr('Error de red al subir la imagen. Reintentá.');
    } finally {
      setUploading(null);
    }
  }

  function setUrl(idx: number, url: string) {
    const next = [...imgs];
    next[idx] = url;
    onChange(next.filter(Boolean));
  }
  function removeImg(idx: number) {
    const next = [...imgs];
    next[idx] = '';
    onChange(next.filter(Boolean));
  }

  return (
    <div className="adm-field">
      <label className="adm-label">Screenshots — hasta 4</label>
      <div className="adm-imgs-grid">
        {imgs.map((img, idx) => (
          <div key={idx}>
            <div className="adm-imgslot" onClick={() => { if (!img) fileRefs[idx].current?.click(); }}>
              {img ? (
                <>
                  <img src={img} alt={`Imagen ${idx + 1}`} />
                  <button type="button" className="rm" onClick={(e) => { e.stopPropagation(); removeImg(idx); }} title="Quitar"><X size={13} /></button>
                </>
              ) : (
                <div className="ph">
                  {uploading === idx ? <Loader2 size={18} className="adm-spin" /> : <ImagePlus size={18} />}
                  {uploading === idx ? 'Subiendo…' : `IMAGEN ${idx + 1}`}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
              <input
                className="adm-input" style={{ fontSize: 11, padding: '7px 9px' }}
                type="text" placeholder="o pegá una URL…" value={img}
                onChange={(e) => setUrl(idx, e.target.value)}
              />
              <button type="button" className="adm-ico" title="Subir archivo" onClick={() => fileRefs[idx].current?.click()}>
                <Upload size={14} />
              </button>
              <input ref={fileRefs[idx]} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(idx, f); e.target.value = ''; }} />
            </div>
          </div>
        ))}
      </div>
      {err && <div className="adm-err">{err}</div>}
      <p className="adm-hint">Subí PNG/JPG/WebP desde tu PC, o pegá una URL. Máx 4 MB cada una.</p>
    </div>
  );
}

export default function AdminDashboard({ projects: initial }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'live' | 'dev' | 'archived'>('all');

  function openAdd() {
    setForm({ ...EMPTY, orden: projects.length + 1, imagenes: [] });
    setTagsInput(''); setEditing(null); setSaveErr(''); setModal('add');
  }
  function openEdit(p: Project) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion, emoji: p.emoji, url: p.url, github: p.github, tags: p.tags, status: p.status, featured: p.featured, orden: p.orden, imagen: p.imagen || '', imagenes: p.imagenes ?? [] });
    setTagsInput(p.tags.join(', ')); setEditing(p); setSaveErr(''); setModal('edit');
  }

  async function handleSave() {
    setSaving(true); setSaveErr('');
    const payload = { ...form, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (modal === 'add') {
        const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setProjects((p) => [...p, created]);
      } else if (editing) {
        const res = await fetch(`/api/projects/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setProjects((p) => p.map((x) => (x.id === editing.id ? updated : x)));
      }
      setModal(null);
    } catch {
      setSaveErr('No se pudo guardar. Verificá tu sesión e intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) setProjects((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  }

  async function toggleFeatured(p: Project) {
    const updated = { ...p, featured: !p.featured };
    setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    await fetch(`/api/projects/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
  }

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);
  const stats = {
    total: projects.length,
    live: projects.filter((p) => p.status === 'live').length,
    dev: projects.filter((p) => p.status === 'dev').length,
    featured: projects.filter((p) => p.featured).length,
  };

  return (
    <div className="adm">
      {/* TOP BAR */}
      <header className="adm-bar">
        <div className="wrap adm-bar-inner">
          <div className="adm-brand">
            <b>Andres Markic</b><span className="tld">/dev</span>
            <span className="pill">Panel</span>
          </div>
          <div className="adm-bar-actions">
            <a className="adm-bar-link" href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Ver sitio</a>
            <button className="adm-bar-link danger" onClick={() => signOut({ callbackUrl: '/admin' })}><LogOut size={14} /> Salir</button>
          </div>
        </div>
      </header>

      <main className="wrap adm-main">
        {/* HEAD */}
        <div className="adm-head">
          <div>
            <span className="adm-kicker">Gestor de contenido</span>
            <h1>Tus <em>proyectos</em></h1>
          </div>
          <button className="adm-save" style={{ width: 'auto', padding: '12px 20px' }} onClick={openAdd}>
            <Plus size={16} /> Nuevo proyecto
          </button>
        </div>

        {/* STATS */}
        <div className="adm-stats">
          <div className="adm-stat"><div className="n">{String(stats.total).padStart(2, '0')}</div><div className="l">Total</div></div>
          <div className="adm-stat ember"><div className="n">{String(stats.live).padStart(2, '0')}</div><div className="l">En producción</div></div>
          <div className="adm-stat"><div className="n">{String(stats.dev).padStart(2, '0')}</div><div className="l">En desarrollo</div></div>
          <div className="adm-stat"><div className="n">{String(stats.featured).padStart(2, '0')}</div><div className="l">Destacados</div></div>
        </div>

        {/* FILTERS */}
        <div className="adm-filters">
          {(['all', 'live', 'dev', 'archived'] as const).map((f) => (
            <button key={f} className={`chip${filter === f ? ' on' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Todos' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="adm-list">
          {filtered.map((p) => {
            const imgs = (p.imagenes ?? []).filter(Boolean);
            return (
              <div className="adm-row" key={p.id}>
                <div className="adm-proj">
                  <div className="adm-thumb">{imgs[0] ? <img src={imgs[0]} alt="" /> : <span>{p.emoji}</span>}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="nm">{p.nombre.trim()}</div>
                    <div className="ds">{p.descripcion.split('\n')[0]}</div>
                  </div>
                </div>

                <div className="adm-mono-cell">
                  <ImagePlus size={13} /> {imgs.length}/4
                </div>

                <div className="adm-mono-cell" style={{ flexWrap: 'wrap' }}>
                  <span className={`status ${p.status}`} style={{ fontSize: 10 }}><span className="s" />{STATUS_LABEL[p.status]}</span>
                  {p.tags.length > 0 && <span style={{ color: 'var(--faint)' }}>· {p.tags.slice(0, 2).join(', ')}{p.tags.length > 2 ? '…' : ''}</span>}
                </div>

                <div className="adm-actions">
                  <button className={`adm-ico star${p.featured ? ' on' : ''}`} title="Destacar" onClick={() => toggleFeatured(p)}>
                    <Star size={15} fill={p.featured ? 'currentColor' : 'none'} />
                  </button>
                  <button className="adm-ico" title="Editar" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                  <button className="adm-ico danger" title="Eliminar" disabled={deleting === p.id} onClick={() => handleDelete(p.id)}>
                    {deleting === p.id ? <Loader2 size={14} className="adm-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="adm-empty">— Sin proyectos en esta categoría —</div>}
        </div>
      </main>

      {/* MODAL */}
      {modal && (
        <div className="adm-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <button className="adm-close" onClick={() => setModal(null)}><X size={19} /></button>
            <h2>{modal === 'add' ? <>Nuevo <em>proyecto</em></> : <>Editar <em>proyecto</em></>}</h2>

            <div className="adm-field">
              <label className="adm-label">Nombre *</label>
              <input className="adm-input" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Mi proyecto" />
            </div>

            <div className="adm-field"><EmojiPicker value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e }))} /></div>

            <div className="adm-field">
              <label className="adm-label">Descripción *</label>
              <textarea className="adm-input" rows={3} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Contá qué es, qué resuelve y con qué lo hiciste…" />
            </div>

            <ImagenesEditor value={form.imagenes ?? []} onChange={(imgs) => setForm((f) => ({ ...f, imagenes: imgs }))} />

            <div className="adm-field adm-grid2">
              <div>
                <label className="adm-label">URL del sitio</label>
                <input className="adm-input" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" />
              </div>
              <div>
                <label className="adm-label">GitHub</label>
                <input className="adm-input" value={form.github} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))} placeholder="https://github.com/…" />
              </div>
            </div>

            <div className="adm-field">
              <label className="adm-label">Tecnologías (separadas por coma)</label>
              <input className="adm-input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Next.js, TypeScript, Prisma" />
            </div>

            <div className="adm-field adm-grid3">
              <div>
                <label className="adm-label">Estado</label>
                <select className="adm-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Project['status'] }))}>
                  <option value="live">En producción</option>
                  <option value="dev">En desarrollo</option>
                  <option value="archived">Caso de estudio</option>
                </select>
              </div>
              <div>
                <label className="adm-label">Destacado</label>
                <select className="adm-input" value={form.featured ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.value === 'true' }))}>
                  <option value="false">No</option>
                  <option value="true">★ Sí</option>
                </select>
              </div>
              <div>
                <label className="adm-label">Orden</label>
                <input className="adm-input" type="number" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: +e.target.value }))} />
              </div>
            </div>

            {saveErr && <div className="adm-err">{saveErr}</div>}

            <button className="adm-save" onClick={handleSave} disabled={saving || !form.nombre || !form.descripcion}>
              {saving ? <><Loader2 size={15} className="adm-spin" /> Guardando…</> : <><Save size={15} /> {modal === 'add' ? 'Crear proyecto' : 'Guardar cambios'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
