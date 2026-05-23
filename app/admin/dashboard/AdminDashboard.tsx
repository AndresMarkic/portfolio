'use client';
import { useState, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, ExternalLink, GitBranch,
  LogOut, LayoutDashboard, Save, X, Loader2,
  CheckCircle, Clock, Archive, Star, ImagePlus, Globe,
} from 'lucide-react';
import type { Project } from '@/lib/projects';

const TAG_COLORS = ['rgba(99,102,241,0.15)','rgba(16,185,129,0.12)','rgba(245,158,11,0.12)','rgba(139,92,246,0.12)','rgba(236,72,153,0.12)','rgba(239,68,68,0.12)'];
const TAG_TEXT   = ['#818CF8','#34D399','#FCD34D','#C4B5FD','#F9A8D4','#FCA5A5'];
const STATUS_MAP = {
  live:     { label: 'En producción', color: '#10B981', icon: <CheckCircle size={13} /> },
  dev:      { label: 'En desarrollo', color: '#F59E0B', icon: <Clock size={13} /> },
  archived: { label: 'Archivado',     color: '#475569', icon: <Archive size={13} /> },
};

type FormData = Omit<Project, 'id' | 'createdAt'>;
const EMPTY: FormData = {
  nombre: '', descripcion: '', emoji: '🌐', url: '', github: '',
  tags: [], status: 'dev', featured: false, orden: 0,
  imagen: '', imagenes: [],
};

/* ── Emoji Picker ── */
const EMOJI_CATS = [
  { label: 'Web & Apps', emojis: ['🌐','💻','📱','🖥️','⚡','🚀','🔥','✨','💡','🎯','🛠️','⚙️','🔧','🔌','📡','🗺️','📍','🧭','🔐','🛡️'] },
  { label: 'Negocios',   emojis: ['📊','📈','📉','💼','🏢','💰','💳','🏦','📋','📝','🗂️','📁','📂','🗃️','📌','📎','✏️','🖊️','📏','🔖'] },
  { label: 'Diseño',     emojis: ['🎨','🖌️','🎭','🖼️','📐','📏','✂️','🎬','📷','📸','🎥','🎞️','🖍️','💎','🌈','🎪','🎠','🎡','🎢','🎟️'] },
  { label: 'Comida',     emojis: ['🛒','🛍️','🏪','🍔','☕','🧁','🍕','🌮','🥗','🍱','🛺','🚗','🚕','🚌','✈️','🚀','⛵','🏎️','🚁','🛸'] },
  { label: 'Naturaleza', emojis: ['🌿','🌱','🌲','🌊','🏔️','🌸','🌺','🍀','🌻','🌙','⭐','☀️','🌤️','❄️','🔵','🟢','🟡','🔴','🟠','🟣'] },
  { label: 'Educación',  emojis: ['📚','🎓','🏫','🔬','🔭','🧬','🧪','🧫','📖','📓','✏️','🖊️','📐','🧮','🏆','🥇','🎖️','🏅','🎗️','🎫'] },
];

function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(0);

  return (
    <div style={{ position: 'relative' }}>
      <label style={lbl}>Emoji del proyecto</label>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '10px 12px', borderRadius: 8,
        background: '#0A0E17', border: `1px solid ${open ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
        color: 'white', fontSize: 26, cursor: 'pointer', textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <span>{value}</span>
        <span style={{ fontSize: 12, color: '#64748B' }}>▼ Elegir</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 200,
          background: '#111827', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Categorías */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            {EMOJI_CATS.map((c, i) => (
              <button key={i} type="button" onClick={() => setCat(i)} style={{
                padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                background: cat === i ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: cat === i ? '#818CF8' : '#64748B',
                borderBottom: cat === i ? '2px solid #6366F1' : '2px solid transparent',
              }}>
                {c.label}
              </button>
            ))}
          </div>
          {/* Emojis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2, padding: 10, maxHeight: 180, overflowY: 'auto' }}>
            {EMOJI_CATS[cat].emojis.map(e => (
              <button key={e} type="button" onClick={() => { onChange(e); setOpen(false); }} style={{
                fontSize: 22, padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: value === e ? 'rgba(99,102,241,0.2)' : 'transparent',
                transition: 'background 0.1s',
              }}
                onMouseEnter={el => (el.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={el => (el.currentTarget.style.background = value === e ? 'rgba(99,102,241,0.2)' : 'transparent')}>
                {e}
              </button>
            ))}
          </div>
          {/* Input manual */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#64748B', flexShrink: 0 }}>O escribí:</span>
            <input value={value} onChange={e => onChange(e.target.value)} maxLength={4}
              style={{ flex: 1, padding: '6px 10px', borderRadius: 7, background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 18, outline: 'none', textAlign: 'center' }} />
            <button type="button" onClick={() => setOpen(false)} style={{ padding: '6px 12px', borderRadius: 7, background: '#6366F1', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Componente de 4 imágenes con upload ── */
function ImagenesEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const imgs = [...value, '', '', '', ''].slice(0, 4);
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [uploading, setUploading] = useState<number | null>(null);

  async function uploadFile(idx: number, file: File) {
    setUploading(idx);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        const next = [...imgs];
        next[idx] = data.url;
        onChange(next.filter((_, i) => i < 4));
      }
    } finally { setUploading(null); }
  }

  function setUrl(idx: number, url: string) {
    const next = [...imgs];
    next[idx] = url;
    onChange(next.filter((_, i) => i < 4));
  }

  function removeImg(idx: number) {
    const next = [...imgs];
    next[idx] = '';
    onChange(next.filter((_, i) => i < 4));
  }

  return (
    <div>
      <label style={lbl}>Screenshots / Imágenes (hasta 4)</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {imgs.map((img, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            {/* Preview o placeholder */}
            <div style={{
              width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden',
              background: '#0A0E17', border: `1px dashed ${img ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              {img ? (
                <>
                  <img src={img} alt={`img ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImg(idx)} style={{
                    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.9)', border: 'none', color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  }}>✕</button>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#475569' }}>
                  {uploading === idx
                    ? <Loader2 size={20} style={{ color: '#818CF8', animation: 'spin 1s linear infinite' }} />
                    : <ImagePlus size={20} />}
                  <p style={{ fontSize: 10, marginTop: 4 }}>Imagen {idx + 1}</p>
                </div>
              )}
            </div>

            {/* Botones bajo la imagen */}
            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
              <input
                type="text" placeholder="URL de imagen..."
                value={img} onChange={e => setUrl(idx, e.target.value)}
                style={{ ...inp, flex: 1, fontSize: 11, padding: '6px 8px' }}
              />
              <button
                onClick={() => fileRefs[idx].current?.click()}
                title="Subir archivo"
                style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ↑
              </button>
              <input
                ref={fileRefs[idx]} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(idx, f); }}
              />
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
        Podés pegar una URL o subir un archivo PNG/JPG desde tu PC
      </p>
    </div>
  );
}

export default function AdminDashboard({ projects: initial }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm]       = useState<FormData>({ ...EMPTY });
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter]   = useState<'all' | 'live' | 'dev' | 'archived'>('all');

  function openAdd() {
    setForm({ ...EMPTY, orden: projects.length + 1, imagenes: [] });
    setTagsInput(''); setEditing(null); setModal('add');
  }
  function openEdit(p: Project) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion, emoji: p.emoji, url: p.url, github: p.github, tags: p.tags, status: p.status, featured: p.featured, orden: p.orden, imagen: p.imagen || '', imagenes: p.imagenes ?? [] });
    setTagsInput(p.tags.join(', ')); setEditing(p); setModal('edit');
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (modal === 'add') {
        const res     = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await res.json();
        setProjects(p => [...p, created]);
      } else if (editing) {
        const res = await fetch(`/api/projects/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const updated = await res.json();
        setProjects(p => p.map(x => x.id === editing.id ? updated : x));
      }
      setModal(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    setDeleting(id);
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(p => p.filter(x => x.id !== id));
    setDeleting(null);
  }

  async function toggleFeatured(p: Project) {
    const updated = { ...p, featured: !p.featured };
    await fetch(`/api/projects/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
    setProjects(prev => prev.map(x => x.id === p.id ? updated : x));
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);
  const stats = { total: projects.length, live: projects.filter(p => p.status === 'live').length, dev: projects.filter(p => p.status === 'dev').length, featured: projects.filter(p => p.featured).length };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E17', fontFamily: 'system-ui, sans-serif', color: '#F1F5F9' }}>

      {/* Sidebar */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontWeight: 900, fontSize: 16, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</p>
          <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Portfolio Manager</p>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            <LayoutDashboard size={15} /> Dashboard
          </div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, textDecoration: 'none', color: '#64748B', fontSize: 13, fontWeight: 500 }}>
            <Globe size={15} /> Ver portfolio
          </Link>
        </nav>
        <div style={{ padding: 12 }}>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', color: '#EF4444', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Proyectos</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Gestioná todos tus proyectos del portfolio</p>
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: '#6366F1', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Nuevo proyecto
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total', val: stats.total, color: '#818CF8', bg: 'rgba(99,102,241,0.08)' },
            { label: 'En producción', val: stats.live, color: '#34D399', bg: 'rgba(16,185,129,0.08)' },
            { label: 'En desarrollo', val: stats.dev, color: '#FCD34D', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Destacados', val: stats.featured, color: '#F9A8D4', bg: 'rgba(236,72,153,0.08)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 14, padding: '16px 20px' }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</p>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['all','live','dev','archived'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: filter === f ? '#6366F1' : 'rgba(255,255,255,0.05)', color: filter === f ? 'white' : '#64748B' }}>
              {f === 'all' ? 'Todos' : STATUS_MAP[f]?.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Proyecto','Imágenes','Tags','Estado','Destacado','Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const st = STATUS_MAP[p.status] ?? STATUS_MAP.dev;
                const imgs = p.imagenes ?? [];
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {/* Proyecto */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>{p.emoji}</span>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14 }}>{p.nombre}</p>
                          <p style={{ fontSize: 12, color: '#475569', marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</p>
                        </div>
                      </div>
                    </td>
                    {/* Imágenes */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {imgs.length > 0 ? imgs.slice(0, 4).map((img, ii) => (
                          <div key={ii} style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                        )) : (
                          <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ImagePlus size={13} /> Sin imágenes
                          </span>
                        )}
                        {imgs.length > 0 && <span style={{ fontSize: 11, color: '#475569', alignSelf: 'center' }}>{imgs.filter(Boolean).length}/4</span>}
                      </div>
                    </td>
                    {/* Tags */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 180 }}>
                        {p.tags.slice(0, 3).map((t, ti) => (
                          <span key={t} style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: TAG_COLORS[ti % TAG_COLORS.length], color: TAG_TEXT[ti % TAG_TEXT.length] }}>{t}</span>
                        ))}
                        {p.tags.length > 3 && <span style={{ fontSize: 11, color: '#475569' }}>+{p.tags.length - 3}</span>}
                      </div>
                    </td>
                    {/* Estado */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: st.color, fontSize: 12, fontWeight: 600 }}>{st.icon} {st.label}</div>
                    </td>
                    {/* Destacado */}
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => toggleFeatured(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Star size={18} fill={p.featured ? '#F59E0B' : 'transparent'} style={{ color: p.featured ? '#F59E0B' : '#475569' }} />
                      </button>
                    </td>
                    {/* Acciones */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {deleting === p.id ? <Loader2 size={13} /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Sin proyectos en esta categoría</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: '#111827', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
              {modal === 'add' ? '+ Nuevo proyecto' : `Editar: ${editing?.nombre}`}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nombre */}
              <div>
                <label style={lbl}>Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Mi Proyecto" style={inp} />
              </div>

              {/* Emoji Picker */}
              <EmojiPicker value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e}))} />

              {/* Descripción */}
              <div>
                <label style={lbl}>Descripción *</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} rows={3} placeholder="Describí el proyecto..." style={{...inp, resize: 'vertical'}} />
              </div>

              {/* ── 4 IMÁGENES ── */}
              <ImagenesEditor
                value={form.imagenes ?? []}
                onChange={imgs => setForm(f => ({ ...f, imagenes: imgs }))}
              />

              {/* URL + GitHub */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>URL del sitio</label>
                  <input value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="https://..." style={inp} />
                </div>
                <div>
                  <label style={lbl}>GitHub</label>
                  <input value={form.github} onChange={e => setForm(f => ({...f, github: e.target.value}))} placeholder="https://github.com/..." style={inp} />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={lbl}>Tecnologías (separadas por coma)</label>
                <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Next.js, TypeScript, Prisma" style={inp} />
              </div>

              {/* Status + Featured + Orden */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
                <div>
                  <label style={lbl}>Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as any}))} style={inp}>
                    <option value="live">En producción</option>
                    <option value="dev">En desarrollo</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Destacado</label>
                  <select value={form.featured ? 'true' : 'false'} onChange={e => setForm(f => ({...f, featured: e.target.value === 'true'}))} style={inp}>
                    <option value="false">No</option>
                    <option value="true">⭐ Sí</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Orden</label>
                  <input type="number" value={form.orden} onChange={e => setForm(f => ({...f, orden: +e.target.value}))} style={inp} />
                </div>
              </div>

              {/* Guardar */}
              <button onClick={handleSave} disabled={saving || !form.nombre || !form.descripcion} style={{
                padding: 13, borderRadius: 10, background: saving ? 'rgba(99,102,241,0.6)' : '#6366F1',
                color: 'white', fontWeight: 700, fontSize: 14, border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
              }}>
                {saving ? <><Loader2 size={14} /> Guardando…</> : <><Save size={14} /> {modal === 'add' ? 'Crear proyecto' : 'Guardar cambios'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, background: '#0A0E17', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' };
