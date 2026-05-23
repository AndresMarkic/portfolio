import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProjects, saveProjects } from '@/lib/projects';

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/projects/[id]'>) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json();
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  projects[idx] = {
    ...projects[idx],
    ...body,
    tags:     Array.isArray(body.tags)     ? body.tags     : (body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    imagenes: Array.isArray(body.imagenes) ? body.imagenes.filter(Boolean) : (projects[idx].imagenes ?? []),
    id,
  };
  saveProjects(projects);
  return NextResponse.json(projects[idx]);
}

export async function DELETE(_: NextRequest, ctx: RouteContext<'/api/projects/[id]'>) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await ctx.params;
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
  return NextResponse.json({ ok: true });
}
