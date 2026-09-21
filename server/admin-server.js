/**
 * Servidor local del panel de administración (/admin en `npm run dev`).
 * Escribe markdowns (content/) e imágenes (public/images/) directamente en el
 * repo; Vite recompila el contenido al vuelo. Luego se commitea.
 * NO se despliega: solo escucha en localhost.
 *
 *   npm run dev:full      levanta este servidor + vite
 *   ADMIN_USER / ADMIN_PASS  credenciales (por defecto admin / coredump)
 */
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { toWebp } from './images.js';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3002;
const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'coredump';
// Token por sesión de servidor: al reiniciar hay que volver a loguearse.
const TOKEN = randomBytes(24).toString('hex');

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => cb(null, ALLOWED_MIME.includes(file.mimetype)),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const CONTENT = path.join(ROOT, 'content');

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const res = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(res);
    else if (d.name.endsWith('.md')) yield res;
  }
}

/** Frontmatter de todo content/ (posts y docs). */
const readContent = () => [...walk(CONTENT)].map(file => ({
  file: path.relative(ROOT, file).split(path.sep).join('/'),
  ...matter.read(file).data,
}));

/** Resuelve `content/...md` asegurando que queda dentro de content/. */
const safeContentPath = (rel) => {
  if (typeof rel !== 'string' || !rel.endsWith('.md')) return null;
  const abs = path.resolve(ROOT, rel);
  return abs.startsWith(CONTENT + path.sep) ? abs : null;
};

/** Frontmatter a partir del formulario; omite campos vacíos y normaliza date. */
const frontmatterFrom = ({ title, date, category, tags, author, abstract, image, draft, comments }) =>
  Object.fromEntries(
    Object.entries({
      title,
      date: date || new Date().toISOString().slice(0, 10),
      category, tags, author, abstract, image,
      draft: draft ? true : undefined,
      comments: comments === false ? false : undefined,
    }).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );

const slugify = (text) => text
  .toLowerCase()
  .normalize('NFD').replace(/\p{M}/gu, '')
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
  res.json([...new Set(readContent().map(a => a.category).filter(Boolean))]);
});

app.get('/api/articles', authGuard, (req, res) => {
  res.json(readContent());
});

// Crea content/posts/{año}/{slug}.md con frontmatter serializado por gray-matter
// (títulos con comillas o resúmenes con ":" no rompen el YAML).
app.post('/api/articles', authGuard, (req, res) => {
  const { title, content, year } = req.body ?? {};
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios' });
  }

  const articleYear = safeYear(year);
  const slug = slugify(title);
  if (!slug) return res.status(400).json({ error: 'El título no genera un slug válido' });

  const dir = path.join(CONTENT, 'posts', articleYear);
  const filePath = path.join(dir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: 'Ya existe un artículo con ese slug', slug });
  }

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, matter.stringify(content.trim() + '\n', frontmatterFrom(req.body)), 'utf-8');
    res.json({
      success: true,
      slug: `/articles/${articleYear}/${slug}`,
      filePath: `content/posts/${articleYear}/${slug}.md`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear artículo', details: err.message });
  }
});

// Un artículo existente (frontmatter + cuerpo) para editarlo.
app.get('/api/article', authGuard, (req, res) => {
  const abs = safeContentPath(req.query.file);
  if (!abs || !fs.existsSync(abs)) return res.status(404).json({ error: 'Archivo no encontrado' });
  const { data, content } = matter.read(abs);
  res.json({ file: req.query.file, data, content });
});

// Sobrescribe un artículo existente (mismo archivo; el slug/URL no cambia).
app.put('/api/article', authGuard, (req, res) => {
  const { file, content } = req.body ?? {};
  const abs = safeContentPath(file);
  if (!abs || !fs.existsSync(abs)) return res.status(404).json({ error: 'Archivo no encontrado' });
  if (!req.body?.title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios' });
  }
  try {
    // Conserva campos del frontmatter que el panel no gestiona (slug, order…)
    const MANAGED = ['title', 'date', 'category', 'tags', 'author', 'abstract', 'image', 'draft', 'comments'];
    const rest = Object.fromEntries(Object.entries(matter.read(abs).data).filter(([k]) => !MANAGED.includes(k)));
    fs.writeFileSync(abs, matter.stringify(content.trim() + '\n', { ...rest, ...frontmatterFrom(req.body) }), 'utf-8');
    res.json({ success: true, file });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar', details: err.message });
  }
});

app.delete('/api/article', authGuard, (req, res) => {
  const abs = safeContentPath(req.query.file);
  if (!abs || !fs.existsSync(abs)) return res.status(404).json({ error: 'Archivo no encontrado' });
  fs.unlinkSync(abs);
  res.json({ success: true });
});

// Sube una imagen a public/images/{año}. PNG/JPG se convierten a WebP con
// variantes para srcset, igual que `npm run images`; GIF/SVG/WebP tal cual.
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
      await toWebp(req.file.buffer, path.join(dir, filename));
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
      .filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f) && !/-(480|960)\.webp$/i.test(f));
    res.json(files.map(f => `/images/${year}/${f}`));
  } catch {
    res.json([]);
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Admin server: http://localhost:${PORT}  (panel en http://localhost:3000/admin)`);
  console.log(`  Login: ${ADMIN_USER} / ${ADMIN_PASS}\n`);
});
