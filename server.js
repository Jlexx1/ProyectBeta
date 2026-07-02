const express = require('express');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_negocio TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    subdominio TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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
  if (exists) {
    return res.status(422).json({ message: 'El email o subdominio ya está registrado.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (nombre_negocio, email, password, subdominio) VALUES (?, ?, ?, ?)').run(
    nombre_negocio, email, hashed, subdominio
  );

  res.status(201).json({ message: 'Cuenta creada exitosamente.', redirect: '/' });
});

app.get('/api/check-subdominio', (req, res) => {
  const slug = (req.query.subdominio || '').toLowerCase().trim();

  if (!slug || slug.length < 3) {
    return res.json({ disponible: false, motivo: 'corto' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE subdominio = ?').get(slug);
  const reservados = ['admin', 'api', 'www', 'mail', 'ftp', 'app', 'demo', 'test', 'ayuda', 'soporte', 'blog', 'login', 'registro', 'panel', 'dashboard'];

  if (exists) {
    return res.json({ disponible: false, motivo: 'ocupado' });
  }
  if (reservados.includes(slug)) {
    return res.json({ disponible: false, motivo: 'reservado' });
  }

  res.json({ disponible: true });
});

app.listen(PORT, () => {
  console.log(`ALDIA server running at http://localhost:${PORT}`);
});
