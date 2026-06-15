'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { Project } from '@/lib/projects';
import Lightbox from './Lightbox';

/* ── scroll state for nav ── */
function useScrolled() {
  const [s, setS] = useState(false);
  useEffect(() => {
    const fn = () => setS(window.scrollY > 30);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return s;
}

/* ── reveal-on-scroll for elements with class .reveal ── */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const STATUS_LABEL: Record<Project['status'], string> = {
  live: 'En producción',
  dev: 'En desarrollo',
  archived: 'Caso de estudio',
};

/* ── project screenshots carousel (feeds the Lightbox) ── */
function ImageCarousel({ imagenes, emoji, nombre }: { imagenes: string[]; emoji: string; nombre: string }) {
  const imgs = imagenes.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  if (imgs.length === 0) {
    return (
      <div className="car-empty">
        <span className="em">{emoji}</span>
        <span className="lbl">{nombre.trim()}</span>
      </div>
    );
  }

  return (
    <>
      <div
        style={{ position: 'relative', width: '100%', height: '100%', minHeight: 220, aspectRatio: '16/10', cursor: 'zoom-in' }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        title="Click para ampliar"
      >
        <img src={imgs[idx]} alt={`${nombre} — ${idx + 1}`} className="car-img" />

        <span className="car-zoom">⤢ Ver detalle</span>

        {imgs.length > 1 && <span className="car-count mono">{String(idx + 1).padStart(2, '0')} / {String(imgs.length).padStart(2, '0')}</span>}

        {imgs.length > 1 && (
          <>
            <button className="car-btn" style={{ left: 12 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx((i) => (i - 1 + imgs.length) % imgs.length); }}>‹</button>
            <button className="car-btn" style={{ right: 12 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx((i) => (i + 1) % imgs.length); }}>›</button>
          </>
        )}

        {imgs.length > 1 && (
          <div className="car-dots">
            {imgs.map((_, i) => (
              <button key={i} className="car-dot"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 22 : 8, background: i === idx ? 'var(--ember)' : 'rgba(237,235,227,0.4)' }} />
            ))}
          </div>
        )}
      </div>

      {open && <Lightbox imagenes={imgs} idxInicial={idx} nombreProyecto={nombre} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ── tech stack, grouped — no emojis ── */
const STACK: [string, string[]][] = [
  ['Frontend', ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Framer Motion']],
  ['Backend', ['Node.js', 'API Routes', 'Prisma ORM', 'PostgreSQL', 'SQLite', 'Socket.IO']],
  ['Mobile', ['Capacitor', 'Android (APK)', 'iOS (IPA)', 'Mapbox GL', 'GPS / Realtime']],
  ['Auth & Infra', ['NextAuth', 'JWT / OAuth', 'Nginx', 'PM2', 'VPS / SSL', 'Git · CI/CD']],
];

export default function PortfolioHome({ projects }: { projects: Project[] }) {
  const scrolled = useScrolled();
  useReveal();
  const heroRef = useRef<HTMLDivElement>(null);

  const live = projects.filter((p) => p.status === 'live').length;
  // El destacado va a ocupar el card grande → preferimos uno con capturas reales.
  const hasImgs = (p: Project) => (p.imagenes?.filter(Boolean).length ?? 0) > 0;
  const withImgs = projects.filter(hasImgs);
  const featured =
    withImgs.find((p) => p.featured) ??
    withImgs.find((p) => p.status === 'live') ??
    withImgs[0] ??
    projects[0];
  const rest = projects.filter((p) => p.id !== featured?.id);

  const navItems: [string, string][] = [
    ['#trabajo', 'Trabajo'],
    ['#stack', 'Stack'],
    ['#contacto', 'Contacto'],
  ];

  const marqueeItems = ['Next.js', 'TypeScript', 'React', 'Socket.IO', 'Prisma', 'Mapbox', 'Capacitor', 'PostgreSQL', 'NextAuth', 'Tailwind'];

  const renderCard = (p: Project, n: number, wide: boolean) => (
    <article key={p.id} className={`card${wide ? ' wide' : ''} reveal`} style={{ '--d': `${(n % 4) * 70}ms` } as React.CSSProperties}>
      <div className="card-media">
        <ImageCarousel imagenes={p.imagenes ?? []} emoji={p.emoji} nombre={p.nombre} />
      </div>
      <div className="card-body">
        <div className="card-ix">
          <span>{p.emoji}</span>
          <span>PROYECTO {String(n + 1).padStart(2, '0')}</span>
          <span className="bar" />
        </div>

        {p.tags.length > 0 && (
          <div className="tags">
            {p.tags.slice(0, wide ? 6 : 4).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}

        <h3>{p.nombre.trim()}</h3>
        <p className="desc">{wide ? p.descripcion : p.descripcion.split('\n')[0].slice(0, 160)}{!wide && p.descripcion.length > 160 ? '…' : ''}</p>

        <div className="card-foot">
          <span className={`status ${p.status}`}>
            <span className="s" />
            {STATUS_LABEL[p.status]}
          </span>
          <div className="card-links">
            {p.url && (
              <a className="iconlink" href={p.url} target="_blank" rel="noopener noreferrer" title="Ver en vivo" onClick={(e) => e.stopPropagation()}>↗</a>
            )}
            {p.github && (
              <a className="iconlink" href={p.github} target="_blank" rel="noopener noreferrer" title="Código" onClick={(e) => e.stopPropagation()}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <>
      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <a href="#top" className="brand">
            <b>Andres Markic</b>
            <span className="tld">/dev</span>
          </a>
          <div className="nav-links">
            {navItems.map(([href, label], i) => (
              <a key={href} href={href} className="nav-link">
                <span className="ix">{String(i + 1).padStart(2, '0')}</span>{label}
              </a>
            ))}
            <Link href="/admin/dashboard" className="btn">Admin →</Link>
          </div>
        </div>
      </nav>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap" ref={heroRef}>
            <div className="avail">
              <span className="dot" />
              Disponible para nuevos proyectos · 2026
            </div>

            <h1 className="display">
              <span className="ln"><span>Construyo software</span></span>
              <span className="ln"><span>que <em>sale a</em> producción</span></span>
              <span className="ln"><span><span className="accent">—</span> web &amp; mobile.</span></span>
            </h1>

            <p className="hero-lead">
              Desarrollador <b>full-stack</b>. Diseño y construyo productos digitales completos
              — del <b>frontend</b> al <b>backend</b>, apps nativas y deploy en producción.
              No maquetas: cosas reales que la gente usa.
            </p>

            <div className="hero-cta">
              <a href="#trabajo" className="btn btn-fill">Ver el trabajo ↓</a>
              <a href="#contacto" className="btn">Hablemos</a>
            </div>

            <div className="hero-meta">
              <div>
                <div className="n">{String(projects.length).padStart(2, '0')}<span className="u">+</span></div>
                <div className="l">Proyectos</div>
              </div>
              <div>
                <div className="n">{String(live).padStart(2, '0')}</div>
                <div className="l">En producción</div>
              </div>
              <div>
                <div className="n">Full<span className="u">·</span></div>
                <div className="l">Stack + mobile</div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((m, i) => (
              <span key={i} className="marquee-item">{m}</span>
            ))}
          </div>
        </div>

        {/* TRABAJO */}
        <section id="trabajo" className="sec">
          <div className="wrap">
            <div className="sec-head reveal">
              <div>
                <span className="sec-num">(01) — SELECTED WORK</span>
                <h2 className="sec-title">Cosas que <em>construí</em></h2>
              </div>
              <p className="sec-sub">Productos reales en producción y casos de estudio. Cada uno con capturas — hacé click para verlas en detalle.</p>
            </div>

            <div className="proj-grid">
              {featured && renderCard(featured, 0, true)}
              {rest.map((p, i) => renderCard(p, i + 1, false))}
            </div>
          </div>
        </section>

        {/* STACK */}
        <section id="stack" className="sec" style={{ background: 'var(--ink-2)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
          <div className="wrap">
            <div className="sec-head reveal">
              <div>
                <span className="sec-num">(02) — TOOLING</span>
                <h2 className="sec-title">Stack <em>técnico</em></h2>
              </div>
              <p className="sec-sub">Las herramientas con las que llevo una idea desde el primer commit hasta el dominio en producción.</p>
            </div>

            <div className="stack-grid">
              {STACK.map(([cat, items], i) => (
                <div key={cat} className="stack-row reveal" style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
                  <div className="stack-cat">{cat}</div>
                  <div className="stack-items">
                    {items.map((it) => (
                      <span key={it} className="stack-chip">{it}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="sec">
          <div className="wrap">
            <div className="contact-box reveal">
              <span className="contact-eyebrow">(03) — Contacto</span>
              <h2 className="contact-title display">¿Tenés una <em>idea</em>?<br />La construyo.</h2>
              <p className="contact-sub">Aplicaciones web y móviles completas, de punta a punta. Contame qué necesitás y lo armamos.</p>
              <div className="contact-cta">
                <a className="btn btn-fill" href="https://wa.me/5492966579625?text=Hola%20Andres%2C%20vi%20tu%20portfolio%20y%20me%20interesa%20hablar%20sobre%20un%20proyecto." target="_blank" rel="noopener noreferrer">
                  Escribime al WhatsApp →
                </a>
                <a className="btn" href="https://github.com/AndresMarkic" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="wrap">
          <footer className="foot">
            <span className="c">© 2026 Andres Markic — full-stack & mobile</span>
            <div className="foot-links">
              <a href="#trabajo">Trabajo</a>
              <a href="#stack">Stack</a>
              <a href="https://github.com/AndresMarkic" target="_blank" rel="noopener noreferrer">GitHub</a>
              <Link href="/admin/dashboard">Admin</Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
