'use client';
import { useEffect, useState, useCallback } from 'react';

interface Props {
  imagenes: string[];
  idxInicial: number;
  nombreProyecto: string;
  onClose: () => void;
}

export default function Lightbox({ imagenes, idxInicial, nombreProyecto, onClose }: Props) {
  const [idx, setIdx] = useState(idxInicial);

  const prev = useCallback(() => setIdx(i => (i - 1 + imagenes.length) % imagenes.length), [imagenes.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % imagenes.length), [imagenes.length]);

  // Teclado: ESC cierra, ← y → navegan
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')    onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  if (imagenes.length === 0) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,8,15,0.94)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        display: 'flex', flexDirection: 'column',
        animation: 'lbFade 0.18s ease-out',
      }}>

      {/* Header con nombre + contador + cerrar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 padding: '18px 24px', color: '#F1F5F9', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em',
                         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {nombreProyecto}
          </span>
          {imagenes.length > 1 && (
            <span style={{ fontSize: 12, color: 'rgba(241,245,249,0.55)',
                           background: 'rgba(255,255,255,0.08)', padding: '4px 10px',
                           borderRadius: 100, fontVariantNumeric: 'tabular-nums' }}>
              {idx + 1} / {imagenes.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{ width: 40, height: 40, borderRadius: 12, border: 'none',
                   background: 'rgba(255,255,255,0.08)', color: '#F1F5F9',
                   cursor: 'pointer', fontSize: 22, lineHeight: 1,
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
          ✕
        </button>
      </div>

      {/* Área de imagen */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                 padding: '0 56px 16px', position: 'relative', minHeight: 0 }}>

        {/* Flecha izquierda */}
        {imagenes.length > 1 && (
          <button
            onClick={prev}
            aria-label="Imagen anterior"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                     width: 48, height: 48, borderRadius: '50%',
                     background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                     border: '1px solid rgba(255,255,255,0.18)', color: '#F1F5F9',
                     fontSize: 24, cursor: 'pointer', display: 'flex',
                     alignItems: 'center', justifyContent: 'center', zIndex: 2,
                     transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}>
            ‹
          </button>
        )}

        {/* Imagen */}
        <img
          key={imagenes[idx]}
          src={imagenes[idx]}
          alt={`${nombreProyecto} — ${idx + 1}`}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                   borderRadius: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                   animation: 'lbSlide 0.2s ease-out' }}
        />

        {/* Flecha derecha */}
        {imagenes.length > 1 && (
          <button
            onClick={next}
            aria-label="Imagen siguiente"
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                     width: 48, height: 48, borderRadius: '50%',
                     background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                     border: '1px solid rgba(255,255,255,0.18)', color: '#F1F5F9',
                     fontSize: 24, cursor: 'pointer', display: 'flex',
                     alignItems: 'center', justifyContent: 'center', zIndex: 2,
                     transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}>
            ›
          </button>
        )}
      </div>

      {/* Thumbnails al pie */}
      {imagenes.length > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', gap: 8, justifyContent: 'center', overflowX: 'auto',
                   padding: '0 24px 24px', flexShrink: 0 }}>
          {imagenes.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 8,
                       overflow: 'hidden', cursor: 'pointer',
                       border: i === idx ? '2px solid #818CF8' : '2px solid transparent',
                       boxShadow: i === idx ? '0 0 0 3px rgba(99,102,241,0.25)' : 'none',
                       padding: 0, background: 'transparent',
                       opacity: i === idx ? 1 : 0.55,
                       transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = i === idx ? '1' : '0.55')}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Hint inferior con shortcuts */}
      <div style={{ position: 'absolute', bottom: 12, left: 24, fontSize: 11,
                    color: 'rgba(241,245,249,0.35)', pointerEvents: 'none',
                    display: imagenes.length > 1 ? 'block' : 'none' }}>
        ← → navegar  ·  esc cerrar
      </div>

      <style>{`
        @keyframes lbFade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbSlide { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
