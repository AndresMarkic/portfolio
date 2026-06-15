'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function TermMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="62" height="62" rx="15" fill="#141416" />
      <rect x="1.5" y="1.5" width="61" height="61" rx="14.5" stroke="#EDEBE3" strokeOpacity="0.16" />
      <circle cx="15" cy="15" r="2.6" fill="#FF5D38" />
      <circle cx="24" cy="15" r="2.6" fill="#EDEBE3" fillOpacity="0.18" />
      <circle cx="33" cy="15" r="2.6" fill="#EDEBE3" fillOpacity="0.18" />
      <path d="M19 30 L31 39 L19 48" stroke="#FF5D38" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="35" y="44.5" width="14" height="5" rx="2.5" fill="#EDEBE3" />
    </svg>
  );
}

export default function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Credenciales incorrectas. Probá de nuevo.');
      setLoading(false);
      return;
    }
    // Recarga el server component → ahora hay sesión → muestra el panel.
    window.location.href = '/admin';
  }

  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <div className="adm-login-mark"><TermMark /></div>

        <span className="adm-kicker">Acceso privado</span>
        <h1>Panel del portfolio</h1>
        <p className="sub">Ingresá para gestionar y publicar tus proyectos.</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="adm-label" htmlFor="email">Email</label>
            <input
              id="email" className="adm-input" type="email" autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="admin@portfolio.com"
            />
          </div>
          <div>
            <label className="adm-label" htmlFor="password">Contraseña</label>
            <input
              id="password" className="adm-input" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="••••••••••••"
            />
          </div>

          {error && <div className="adm-err">{error}</div>}

          <button type="submit" className="adm-save" disabled={loading}>
            {loading ? <><Loader2 size={15} className="adm-spin" /> Entrando…</> : 'Ingresar al panel  →'}
          </button>
        </form>

        <p className="foot">Sólo administradores · sesión cifrada (JWT)</p>
        <Link href="/" className="adm-back">← Volver al sitio</Link>
      </div>
    </main>
  );
}
