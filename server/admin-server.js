/**
 * Servidor local del panel de administración (/admin en `npm run dev`).
 * Escribe markdowns e imágenes directamente en el repo; luego se commitea.
 * NO se despliega: solo escucha en localhost.
 *
 *   npm run dev:full      levanta este servidor + vite
 *   ADMIN_USER / ADMIN_PASS  credenciales (por defecto admin / coredump)
 */
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3002;
const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'coredump';
// Token por sesión de servidor: al reiniciar hay que volver a loguearse.
const TOKEN = randomBytes(24).toString('hex');

const IMAGE_MAX_WIDTH = 1600;
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => cb(null, ALLOWED_MIME.includes(file.mimetype)),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const readJson = (rel, fallback = []) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf-8'));
  } catch {
    return fallback;
  }
};

const slugify = (text) => text
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const safeYear = (year) => /^\d{4}$/.test(year) ? year : String(new Date().getFullYear());

function authGuard(req, res, next) {
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: TOKEN, user: ADMIN_USER });
  }
  res.status(401).json({ error: 'Credenciales inválidas' });
});

app.get('/api/categories', authGuard, (req, res) => {
  const db = readJson('src/database/db.json');
  res.json([...new Set(db.map(a => a.metadata?.category).filter(Boolean))]);
});

app.get('/api/authors', authGuard, (req, res) => {
  res.json(readJson('src/database/authors.json'));
});

app.get('/api/articles', authGuard, (req, res) => {
  res.json(readJson('src/database/db.json'));
});

// Crea public/markdowns/{año}/{slug}.md con frontmatter serializado por gray-matter
// (títulos con comillas o resúmenes con ":" no rompen el YAML).
app.post('/api/articles', authGuard, (req, res) => {
  const { title, date, category, tags, author, abstract, image, content, year } = req.body ?? {};
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios' });
  }

  const articleYear = safeYear(year);
  const slug = slugify(title);
  if (!slug) return res.status(400).json({ error: 'El título no genera un slug válido' });

  const dir = path.join(ROOT, 'public', 'markdowns', articleYear);
  const filePath = path.join(dir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: 'Ya existe un artículo con ese slug', slug });
  }

  const data = Object.fromEntries(
    Object.entries({
      title,
      date: date || new Date().toISOString().slice(0, 10),
      category, tags, author, abstract, image,
    }).filter(([, v]) => v)
  );

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, matter.stringify(content.trim() + '\n', data), 'utf-8');
    res.json({
      success: true,
      slug: `/articles/${articleYear}/${slug}`,
      filePath: `public/markdowns/${articleYear}/${slug}.md`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear artículo', details: err.message });
  }
});

// Sube una imagen a public/images/{año}. PNG/JPG se convierten a WebP
// (máx. 1600 px) igual que `npm run images`; GIF/SVG/WebP se guardan tal cual.
app.post('/api/upload/:year', authGuard, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen válida' });

  const year = safeYear(req.params.year);
  const dir = path.join(ROOT, 'public', 'images', year);
  fs.mkdirSync(dir, { recursive: true });

  const { name, ext } = path.parse(req.file.originalname);
  const base = slugify(name) || `imagen-${Date.now()}`;

  try {
    let filename;
    if (['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      filename = `${base}.webp`;
      await sharp(req.file.buffer)
        .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(dir, filename));
    } else {
      filename = `${base}${ext.toLowerCase()}`;
      fs.writeFileSync(path.join(dir, filename), req.file.buffer);
    }
    res.json({ success: true, path: `/images/${year}/${filename}`, filename });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la imagen', details: err.message });
  }
});

app.get('/api/images/:year', authGuard, (req, res) => {
  const year = safeYear(req.params.year);
  try {
    const files = fs.readdirSync(path.join(ROOT, 'public', 'images', year))
      .filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));
    res.json(files.map(f => `/images/${year}/${f}`));
  } catch {
    res.json([]);
  }
});

app.post('/api/rebuild-db', authGuard, async (req, res) => {
  try {
    const { stdout } = await promisify(execFile)('node', ['src/scripts/db-generator.js'], { cwd: ROOT });
    res.json({ success: true, output: stdout });
  } catch (err) {
    res.status(500).json({ error: 'Error ejecutando db-generator', details: err.stderr || err.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Admin server: http://localhost:${PORT}  (panel en http://localhost:3000/admin)`);
  console.log(`  Login: ${ADMIN_USER} / ${ADMIN_PASS}\n`);
});
