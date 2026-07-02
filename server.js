const express = require('express');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables with IF NOT EXISTS
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_negocio TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  subdominio TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  category TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// Add role column if it doesn't exist (migration for old databases)
try { db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"'); } catch (e) {}

// Seed admin user
const adminEmail = 'admin@aldia.com';
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existing) {
  const hashed = bcrypt.hashSync('Admin123!', 10);
  db.prepare('INSERT INTO users (nombre_negocio, email, password, subdominio, role) VALUES (?, ?, ?, ?, ?)').run(
    'Administrador', adminEmail, hashed, 'admin-aldia', 'admin'
  );
  console.log('Admin user created: admin@aldia.com / Admin123!');
} else {
  // Ensure admin has role
  db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', adminEmail);
  console.log('Admin user exists: admin@aldia.com / Admin123!');
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No autorizado.' });
  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ message: 'Sesión inválida.' });
  req.userId = session.user_id;
  next();
}

// ----- AUTH -----
app.post('/api/registro', (req, res) => {
  const { nombre_negocio, email, password, password_confirmation, subdominio } = req.body;
  if (!nombre_negocio || !email || !password || !subdominio) {
    return res.status(422).json({ message: 'Todos los campos son obligatorios.' });
  }
  if (password !== password_confirmation) {
    return res.status(422).json({ message: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 8) {
    return res.status(422).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ? OR subdominio = ?').get(email, subdominio);
  if (exists) return res.status(422).json({ message: 'El email o subdominio ya está registrado.' });
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (nombre_negocio, email, password, subdominio) VALUES (?, ?, ?, ?)').run(
    nombre_negocio, email, hashed, subdominio
  );
  res.status(201).json({ message: 'Cuenta creada exitosamente.' });
});

app.get('/api/check-subdominio', (req, res) => {
  const slug = (req.query.subdominio || '').toLowerCase().trim();
  if (!slug || slug.length < 3) return res.json({ disponible: false, motivo: 'corto' });
  const exists = db.prepare('SELECT id FROM users WHERE subdominio = ?').get(slug);
  const reservados = ['admin', 'api', 'www', 'mail', 'ftp', 'app', 'demo', 'test', 'ayuda', 'soporte', 'blog', 'login', 'registro', 'panel', 'dashboard'];
  if (exists) return res.json({ disponible: false, motivo: 'ocupado' });
  if (reservados.includes(slug)) return res.json({ disponible: false, motivo: 'reservado' });
  res.json({ disponible: true });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(422).json({ message: 'Email y contraseña requeridos.' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (user_id, token) VALUES (?, ?)').run(user.id, token);
  res.json({ token, user: { id: user.id, nombre_negocio: user.nombre_negocio, email: user.email, role: user.role } });
});

// ----- PRODUCTS -----
app.get('/api/products', requireAuth, (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(products);
});

app.post('/api/products', requireAuth, (req, res) => {
  const { name, description, price, stock, category } = req.body;
  if (!name || price === undefined) return res.status(422).json({ message: 'Nombre y precio requeridos.' });
  const r = db.prepare('INSERT INTO products (user_id, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)').run(
    req.userId, name, description || '', parseFloat(price), parseInt(stock) || 0, category || ''
  );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json(product);
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!p) return res.status(404).json({ message: 'Producto no encontrado.' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Producto eliminado.' });
});

app.listen(PORT, () => {
  console.log('ALDIA server running at http://localhost:' + PORT);
});
