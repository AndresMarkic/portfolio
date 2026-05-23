import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProjects } from '@/lib/projects';
import AdminDashboard from './AdminDashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  const projects = getProjects();
  return <AdminDashboard projects={projects} />;
}
