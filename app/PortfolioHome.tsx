'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Project } from '@/lib/projects';
import Lightbox from './Lightbox';

const TAG_COLORS = ['rgba(99,102,241,0.15)','rgba(16,185,129,0.12)','rgba(245,158,11,0.12)','rgba(139,92,246,0.12)','rgba(236,72,153,0.12)','rgba(239,68,68,0.12)'];
const TAG_TEXT   = ['#818CF8','#34D399','#FCD34D','#C4B5FD','#F9A8D4','#FCA5A5'];

function useScrolled() {
  const [s, setS] = useState(false);
  useEffect(() => { const fn = () => setS(window.scrollY > 40); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);
  return s;
}

/* ── Carrusel de imágenes del proyecto ── */
function ImageCarousel({ imagenes, emoji, nombre }: { imagenes: string[]; emoji: string; nombre: string }) {
  const imgs = imagenes.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (imgs.length === 0) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,#0F172A,#1E293B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>
        {emoji}
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#0F172A', cursor: 'zoom-in' }}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setLightboxOpen(true); }}
        title="Click para ampliar">
        {/* Imagen activa */}
        <img
          src={imgs[idx]} alt={`${nombre} - ${idx + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
        />

        {/* Hint de ampliar (esquina superior izq, solo al hover) */}
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(6px)', borderRadius: 8, padding: '4px 9px',
                      fontSize: 11, color: 'rgba(255,255,255,0.95)', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none' }}>
          🔍 Ampliar
        </div>

        {/* Flechas (solo si hay más de 1) */}
        {imgs.length > 1 && (
          <>
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              ‹
            </button>
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              ›
            </button>
          </>
        )}

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {imgs.map((src, i) => (
              <button key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === idx ? 'white' : 'rgba(255,255,255,0.4)', padding: 0, transition: 'all 0.2s' }} />
            ))}
          </div>
        )}

        {/* Contador */}
        {imgs.length > 1 && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {idx + 1}/{imgs.length}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          imagenes={imgs}
          idxInicial={idx}
          nombreProyecto={nombre}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

export default function PortfolioHome({ projects }: { projects: Project[] }) {
  const scrolled = useScrolled();
  const live = projects.filter(p => p.status === 'live').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E17', fontFamily: 'system-ui, sans-serif', color: '#F1F5F9' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(10,14,23,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontWeight: 900, fontSize: 18, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>GM / Dev</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['#proyectos','Proyectos'],['#skills','Skills'],['#contacto','Contacto']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>{label}</a>
            ))}
            <Link href="/admin/dashboard" style={{ padding: '7px 16px', borderRadius: 8, background: '#6366F1', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Admin →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 60 }}>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', width: 600, height: 600, top: -100, left: -200, background: 'rgba(99,102,241,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', width: 400, height: 400, bottom: 0, right: -100, background: 'rgba(139,92,246,0.08)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', position: 'relative', width: '100%' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818CF8', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#818CF8', letterSpacing: '0.06em' }}>DISPONIBLE PARA PROYECTOS</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Desarrollo web &<br />
              <span style={{ background: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>aplicaciones móviles</span>
            </h1>
            <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
              Diseño y desarrollo productos digitales completos — frontend, backend, apps nativas y producción.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#proyectos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: '#6366F1', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Ver proyectos ↓</a>
              <a href="#contacto" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Contacto</a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', marginTop: 64 }}>
            {[{ val: `${projects.length}+`, label: 'Proyectos' }, { val: 'Full', label: 'Stack developer' }, { val: `${live}`, label: 'En producción' }].map(s => (
              <div key={s.label} style={{ background: '#111827', padding: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#6366F1,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROYECTOS */}
      <section id="proyectos" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.14em', display: 'block', marginBottom: 12 }}>PROYECTOS</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Lo que construí</h2>
          <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 48 }}>Proyectos reales — podés ver screenshots de cada uno.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 20 }}>
            {projects.map(p => (
              <div key={p.id}
                style={{ background: '#161D2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(99,102,241,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

                {/* Carrusel de imágenes */}
                <ImageCarousel imagenes={p.imagenes ?? []} emoji={p.emoji} nombre={p.nombre} />

                {/* Info */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {p.tags.slice(0, 4).map((t, ti) => (
                      <span key={t} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: TAG_COLORS[ti % TAG_COLORS.length], color: TAG_TEXT[ti % TAG_TEXT.length] }}>{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{p.nombre}</p>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, flex: 1 }}>{p.descripcion}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: p.status === 'live' ? '#10B981' : '#F59E0B' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.status === 'live' ? '#10B981' : '#F59E0B', display: 'inline-block', boxShadow: p.status === 'live' ? '0 0 8px rgba(16,185,129,0.6)' : 'none' }} />
                      {p.status === 'live' ? 'En producción' : 'En desarrollo'}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.url && <a href={p.url} target="_blank" onClick={e => e.stopPropagation()} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', textDecoration: 'none', fontSize: 14 }}>↗</a>}
                      {p.github && <a href={p.github} target="_blank" onClick={e => e.stopPropagation()} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', textDecoration: 'none', fontSize: 12 }}>⌥</a>}
                      {p.featured && <span style={{ fontSize: 11, color: '#F59E0B', alignSelf: 'center' }}>⭐</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.14em', display: 'block', marginBottom: 12 }}>TECNOLOGÍAS</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 48 }}>Stack técnico</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))', gap: 14 }}>
            {[['⚡','Next.js 14','App Router · SSR · API Routes'],['🔷','TypeScript','Tipado estático · Interfaces'],['🔌','Socket.IO','Tiempo real · WebSockets'],['🗃️','Prisma ORM','SQLite · PostgreSQL'],['🗺️','Mapbox GL','GPS · Navegación · Tráfico'],['📱','Capacitor','Android APK · iOS IPA'],['🔐','NextAuth','JWT · OAuth · Google'],['🎨','Tailwind CSS','UI · Responsive · Dark mode'],['📦','PM2 + Nginx','Deploy · VPS · SSL'],['🐙','Git / GitHub','CI/CD · Control de versiones']].map(([icon, name, level]) => (
              <div key={name} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
                <div><p style={{ fontSize: 14, fontWeight: 600 }}>{name}</p><p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{level}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: '56px 40px', textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.14em', display: 'block', marginBottom: 16 }}>CONTACTO</span>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>¿Tenés un proyecto?</h2>
            <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>Desarrollo aplicaciones web y móviles completas. Hablemos sobre tu idea.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/5492966579625?text=Hola%20Andres%2C%20vi%20tu%20portfolio%20y%20me%20interesa%20hablar%20sobre%20un%20proyecto." target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: '#25D366', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>💬 Escribime al WhatsApp</a>
              <a href="https://github.com/AndresMarkic" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>GitHub →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#1E293B' }}>© 2026 Andres Markic</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#proyectos" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>Proyectos</a>
            <Link href="/admin/dashboard" style={{ fontSize: 13, color: '#6366F1', textDecoration: 'none' }}>Admin</Link>
          </div>
        </footer>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
