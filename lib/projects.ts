import fs from 'fs';
import path from 'path';

export interface Project {
  id:          string;
  nombre:      string;
  descripcion: string;
  emoji:       string;
  url:         string;
  github:      string;
  tags:        string[];
  status:      'live' | 'dev' | 'archived';
  featured:    boolean;
  orden:       number;
  createdAt:   string;
  imagen?:     string;        // legacy (primera imagen)
  imagenes:    string[];      // hasta 4 imágenes/screenshots
}

const FILE = path.join(process.cwd(), 'data', 'projects.json');

export function getProjects(): Project[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf-8')) as Project[];
  } catch { return []; }
}

export function saveProjects(projects: Project[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(projects, null, 2), 'utf-8');
}
