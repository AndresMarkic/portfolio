import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

// Tipos de imagen permitidos → extensión segura en el servidor.
const ALLOWED: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });

  // Validación de tipo (no confiamos en la extensión del cliente).
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: 'Formato no permitido. Usá PNG, JPG, WebP o GIF.' }, { status: 415 });
  if (file.size === 0) return NextResponse.json({ error: 'El archivo está vacío.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'La imagen supera los 6 MB.' }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  // Nombre 100% generado por nosotros → sin path traversal ni nombres maliciosos.
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  // ── Nube (Vercel Blob) ──────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`projects/${safeName}`, buffer, {
        access: 'public',
        contentType: file.type,
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'No se pudo subir la imagen a Vercel Blob. Revisá el token BLOB_READ_WRITE_TOKEN.' }, { status: 500 });
    }
  }

  // ── Local (filesystem) ──────────────────────────────────────────
  try {
    const dir = path.join(process.cwd(), 'public', 'projects');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);
    return NextResponse.json({ url: `/projects/${safeName}` }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo guardar la imagen (filesystem de solo lectura). En Vercel, conectá un Blob store para habilitar las subidas.' },
      { status: 500 },
    );
  }
}
