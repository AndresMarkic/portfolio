import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

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

/*
 * Persistencia dual:
 *  - Con BLOB_READ_WRITE_TOKEN (Vercel)  → guarda en Vercel Blob (cloud, editable desde la web).
 *  - Sin token (tu compu, npm run dev)   → guarda en data/projects.json (filesystem).
 * El archivo del repo sirve de semilla la primera vez que se despliega con Blob.
 */
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_PATH = 'data/projects.json';
const FILE = path.join(process.cwd(), 'data', 'projects.json');

function readLocal(): Project[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf-8')) as Project[];
  } catch {
    return [];
  }
}

async function readBlob(): Promise<Project[] | null> {
  const { blobs } = await list({ prefix: BLOB_PATH, token: BLOB_TOKEN });
  const hit = blobs.find((b) => b.pathname === BLOB_PATH);
  if (!hit) return null;
  const res = await fetch(hit.url, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as Project[];
}

async function writeBlob(projects: Project[]): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(projects, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0, // sin caché → las lecturas ven siempre lo último
    token: BLOB_TOKEN,
  });
}

export async function getProjects(): Promise<Project[]> {
  if (!BLOB_TOKEN) return readLocal();
  try {
    const data = await readBlob();
    if (data) return data;
    // Primer arranque en la nube: sembramos con el archivo del repo.
    const seed = readLocal();
    if (seed.length) await writeBlob(seed);
    return seed;
  } catch {
    return readLocal();
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  if (BLOB_TOKEN) {
    await writeBlob(projects);
    return;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(projects, null, 2), 'utf-8');
}
