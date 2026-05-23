'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email,    setEmail]    = useState('admin@portfolio.com');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) { setError('Credenciales incorrectas'); setLoading(false); return; }
    window.location.href = '/admin/dashboard';
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0E17' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            <Lock size={22} color="white" />
          </div>
          <h1 style={{ fontFamily: 'system-ui', fontSize: 22, fontWeight: 800, color: 'white' }}>
            Admin Portfolio
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>
            Ingresá para gestionar tus proyectos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 14, outline: 'none' }} />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '12px', borderRadius: 10, background: '#6366F1', color: 'white',
            fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? <><Loader2 size={15} className="animate-spin" /> Entrando…</> : 'Ingresar al panel →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#1E293B', marginTop: 24 }}>
          Panel privado — solo administradores
        </p>
      </div>
    </div>
  );
}
