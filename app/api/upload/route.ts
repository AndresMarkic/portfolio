import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const dir = path.join(process.cwd(), 'public', 'projects');

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);
  } catch {
    // En hosts con filesystem de solo lectura (p. ej. Vercel) la escritura falla.
    return NextResponse.json(
      { error: 'No se pudo guardar la imagen en el servidor (filesystem de solo lectura). Subí imágenes corriendo el panel en local.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: `/projects/${safeName}` }, { status: 201 });
}
