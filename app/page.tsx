import { getProjects } from '@/lib/projects';
import PortfolioHome from './PortfolioHome';

export default function Home() {
  const projects = getProjects().sort((a, b) => a.orden - b.orden);
  return <PortfolioHome projects={projects} />;
}
