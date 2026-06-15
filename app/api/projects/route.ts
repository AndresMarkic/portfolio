import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProjects, saveProjects, Project } from '@/lib/projects';

export async function GET() {
  return NextResponse.json(await getProjects());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const projects = await getProjects();
  const newProject: Project = {
    id:          body.id || Date.now().toString(),
    nombre:      body.nombre,
    descripcion: body.descripcion,
    emoji:       body.emoji || '🌐',
    url:         body.url || '',
    github:      body.github || '',
    tags:        Array.isArray(body.tags) ? body.tags : (body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    status:      body.status || 'dev',
    featured:    body.featured || false,
    orden:       body.orden || projects.length + 1,
    createdAt:   new Date().toISOString().split('T')[0],
    imagen:      body.imagen || '',
    imagenes:    Array.isArray(body.imagenes) ? body.imagenes.filter(Boolean) : [],
  };
  projects.push(newProject);
  await saveProjects(projects);
  return NextResponse.json(newProject, { status: 201 });
}
