import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 });

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Nombre único: timestamp + nombre original saneado
  const ext      = path.extname(file.name) || '.png';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
  const dir      = path.join(process.cwd(), 'public', 'projects');
  const filePath = path.join(dir, safeName);

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/projects/${safeName}` });
}
