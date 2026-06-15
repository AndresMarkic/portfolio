import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProjects } from '@/lib/projects';
import AdminAuth from './AdminAuth';
import AdminDashboard from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Panel — Andres Markic',
  robots: { index: false, follow: false }, // el panel no se indexa
};

// Siempre evaluado en cada request (depende de la sesión).
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <AdminAuth />;

  const projects = getProjects().sort((a, b) => a.orden - b.orden);
  return <AdminDashboard projects={projects} />;
}
