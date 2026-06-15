import { getProjects } from '@/lib/projects';
import PortfolioHome from './PortfolioHome';

// La home lee data/projects.json en cada request → refleja al instante
// lo que editás en /admin (en vez de quedar congelada en el build).
export const dynamic = 'force-dynamic';

export default function Home() {
  const projects = getProjects().sort((a, b) => a.orden - b.orden);
  return <PortfolioHome projects={projects} />;
}
