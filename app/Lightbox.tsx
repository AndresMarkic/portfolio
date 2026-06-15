'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  imagenes: string[];
  idxInicial: number;
  nombreProyecto: string;
  onClose: () => void;
}

const ZOOM_LEVEL = 2.5;

export default function Lightbox({ imagenes, idxInicial, nombreProyecto, onClose }: Props) {
  const [idx, setIdx]     = useState(idxInicial);
  const [zoom, setZoom]   = useState(1);
  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const draggingRef       = useRef(false);
  const lastPointerRef    = useRef({ x: 0, y: 0 });

  // Portal: solo después del mount (evita error SSR — document no existe en server)
  useEffect(() => { setMounted(true); }, []);

  const prev = useCallback(() => {
    setZoom(1); setPan({ x: 0, y: 0 });
    setIdx(i => (i - 1 + imagenes.length) % imagenes.length);
  }, [imagenes.length]);

  const next = useCallback(() => {
    setZoom(1); setPan({ x: 0, y: 0 });
    setIdx(i => (i + 1) % imagenes.length);
  }, [imagenes.length]);

  const toggleZoom = useCallback((e?: { clientX?: number; clientY?: number }) => {
    if (zoom === 1) {
      setZoom(ZOOM_LEVEL);
      // Si el usuario hizo click en un punto específico, centrar el zoom ahí
      if (e?.clientX != null && e?.clientY != null) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        setPan({ x: (cx - e.clientX) * (ZOOM_LEVEL - 1) / ZOOM_LEVEL, y: (cy - e.clientY) * (ZOOM_LEVEL - 1) / ZOOM_LEVEL });
      } else {
        setPan({ x: 0, y: 0 });
      }
    } else {
      setZoom(1); setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     { if (zoom > 1) { setZoom(1); setPan({ x: 0, y: 0 }); } else onClose(); }
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === ' ')          { e.preventDefault(); toggleZoom(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next, toggleZoom, zoom]);

  // Bloquear scroll del body
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Reset zoom al cambiar imagen
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [idx]);

  // Pan con drag cuando hay zoom
  function onPointerDown(e: React.PointerEvent) {
    if (zoom === 1) return;
    draggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }
  function onPointerUp(e: React.PointerEvent) {
    draggingRef.current = false;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }

  // Wheel zoom in/out
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    if (e.deltaY < 0) { // zoom in
      if (zoom < 4) setZoom(z => Math.min(4, z + 0.3));
    } else {
      if (zoom > 1) setZoom(z => Math.max(1, z - 0.3));
      else if (zoom <= 1) { setZoom(1); setPan({ x: 0, y: 0 }); }
    }
  }

  if (imagenes.length === 0 || !mounted) return null;

  const ui = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5,8,15,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        animation: 'lbFade 0.18s ease-out',
      }}>

      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 padding: '14px 16px', color: '#F1F5F9', flexShrink: 0,
                 background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)',
                 position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em',
                         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50vw' }}>
            {nombreProyecto}
          </span>
          {imagenes.length > 1 && (
            <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.7)',
                           background: 'rgba(255,255,255,0.10)', padding: '3px 9px',
                           borderRadius: 100, fontVariantNumeric: 'tabular-nums' }}>
              {idx + 1} / {imagenes.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Zoom toggle */}
          <button onClick={() => toggleZoom()}
            title={zoom > 1 ? 'Reducir' : 'Ampliar (clic en la imagen o espacio)'}
            style={{ width: 38, height: 38, borderRadius: 10, border: 'none',
                     background: zoom > 1 ? 'rgba(255,93,56,0.85)' : 'rgba(255,255,255,0.10)',
                     color: '#F1F5F9', cursor: 'pointer', fontSize: 18,
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {zoom > 1 ? '−' : '+'}
          </button>
          {/* Abrir original */}
          <a href={imagenes[idx]} target="_blank" rel="noopener noreferrer"
            title="Abrir tamaño original en pestaña nueva"
            style={{ width: 38, height: 38, borderRadius: 10, textDecoration: 'none',
                     background: 'rgba(255,255,255,0.10)', color: '#F1F5F9',
                     fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ↗
          </a>
          {/* Cerrar */}
          <button onClick={onClose} aria-label="Cerrar"
            style={{ width: 38, height: 38, borderRadius: 10, border: 'none',
                     background: 'rgba(255,255,255,0.10)', color: '#F1F5F9',
                     cursor: 'pointer', fontSize: 20, lineHeight: 1,
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}>
            ✕
          </button>
        </div>
      </div>

      {/* Área de imagen */}
      <div
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        onWheel={onWheel}
        style={{ flex: 1, position: 'relative', overflow: 'hidden',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 minHeight: 0 }}>

        {/* Wrapper para zoom/pan */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            cursor: zoom > 1 ? (draggingRef.current ? 'grabbing' : 'grab') : 'zoom-in',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: draggingRef.current ? 'none' : 'transform 0.22s ease-out',
            transformOrigin: 'center center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%',
            userSelect: 'none', touchAction: 'none',
          }}
          onClick={e => { if (zoom === 1) toggleZoom({ clientX: e.clientX, clientY: e.clientY }); }}>
          <img
            key={imagenes[idx]}
            src={imagenes[idx]}
            alt={`${nombreProyecto} — ${idx + 1}`}
            draggable={false}
            style={{
              width: 'auto', height: 'auto',
              maxWidth: 'min(98vw, 1800px)', maxHeight: 'calc(100vh - 140px)',
              minWidth: 'min(70vw, 700px)',   // fuerza tamaño mínimo grande aunque la original sea chica
              objectFit: 'contain',
              imageRendering: zoom > 2 ? 'crisp-edges' : 'auto',
              borderRadius: 6,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'lbSlide 0.22s ease-out',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />
        </div>

        {/* Flecha izquierda */}
        {imagenes.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            aria-label="Imagen anterior"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                     width: 52, height: 52, borderRadius: '50%',
                     background: 'rgba(15,20,30,0.7)', backdropFilter: 'blur(8px)',
                     border: '1px solid rgba(255,255,255,0.15)', color: '#F1F5F9',
                     fontSize: 26, cursor: 'pointer', display: 'flex',
                     alignItems: 'center', justifyContent: 'center', zIndex: 4,
                     transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,93,56,0.85)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,20,30,0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}>
            ‹
          </button>
        )}

        {/* Flecha derecha */}
        {imagenes.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            aria-label="Imagen siguiente"
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                     width: 52, height: 52, borderRadius: '50%',
                     background: 'rgba(15,20,30,0.7)', backdropFilter: 'blur(8px)',
                     border: '1px solid rgba(255,255,255,0.15)', color: '#F1F5F9',
                     fontSize: 26, cursor: 'pointer', display: 'flex',
                     alignItems: 'center', justifyContent: 'center', zIndex: 4,
                     transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,93,56,0.85)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,20,30,0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}>
            ›
          </button>
        )}
      </div>

      {/* Thumbnails al pie */}
      {imagenes.length > 1 && (
        <div
          style={{ display: 'flex', gap: 8, justifyContent: 'center', overflowX: 'auto',
                   padding: '10px 16px 16px', flexShrink: 0, zIndex: 3,
                   background: 'linear-gradient(0deg, rgba(0,0,0,0.6), transparent)' }}>
          {imagenes.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 8,
                       overflow: 'hidden', cursor: 'pointer',
                       border: i === idx ? '2px solid #FF5D38' : '2px solid rgba(255,255,255,0.10)',
                       boxShadow: i === idx ? '0 0 0 3px rgba(255,93,56,0.3)' : 'none',
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

      {/* Hint inferior */}
      <div style={{ position: 'absolute', bottom: imagenes.length > 1 ? 84 : 14, left: 16,
                    fontSize: 11, color: 'rgba(241,245,249,0.4)',
                    pointerEvents: 'none', userSelect: 'none' }}>
        click = zoom · arrastrar = mover · scroll = más zoom{imagenes.length > 1 ? ' · ← → cambiar' : ''} · esc = cerrar
      </div>

      <style>{`
        @keyframes lbFade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbSlide { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );

  // Renderizar en document.body para escapar de cualquier transform/overflow del card.
  // Necesario porque las tarjetas tienen translateY(-4px) en hover, lo que
  // atrapa los position:fixed adentro del card por especificación CSS.
  return createPortal(ui, document.body);
}
