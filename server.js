const express = require('express');
const bcrypt = require('bcryptjs');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let db;

function saveDb() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

initSqlJs().then(function(SQL) {
  var data;
  try { data = fs.readFileSync(dbPath); } catch (e) { data = null; }
  db = new SQL.Database(data);

  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre_negocio TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, subdominio TEXT UNIQUE NOT NULL, role TEXT DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT '', price REAL NOT NULL, stock INTEGER DEFAULT 0, category TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");

  try { db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"'); } catch (e) {}

  var adminEmail = 'admin@aldia.com';
  var existing = db.exec('SELECT id FROM users WHERE email = \'' + adminEmail.replace(/'/g, "''") + '\'');
  if (!existing.length || !existing[0].values.length) {
    var hashed = bcrypt.hashSync('Admin123!', 10);
    db.run("INSERT INTO users (nombre_negocio, email, password, subdominio, role) VALUES (?, ?, ?, ?, ?)", ['Administrador', adminEmail, hashed, 'admin-aldia', 'admin']);
    saveDb();
    console.log('Admin user created: admin@aldia.com / Admin123!');
  } else {
    db.run("UPDATE users SET role = ? WHERE email = ?", ['admin', adminEmail]);
    saveDb();
    console.log('Admin user exists: admin@aldia.com / Admin123!');
  }

  app.listen(PORT, function() {
    console.log('ALDIA server running at http://localhost:' + PORT);
  });
});

function query(sql, params) {
  if (!params) params = [];
  var stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  var rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params) {
  var rows = query(sql, params);
  return rows.length ? rows[0] : null;
}

function run(sql, params) {
  if (!params) params = [];
  db.run(sql, params);
  saveDb();
}

function requireAuth(req, res, next) {
  var token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No autorizado.' });
  var session = queryOne('SELECT user_id FROM sessions WHERE token = ?', [token]);
  if (!session) return res.status(401).json({ message: 'Sesión inválida.' });
  req.userId = session.user_id;
  next();
}

app.post('/api/registro', function(req, res) {
  var nombre_negocio = req.body.nombre_negocio;
  var email = req.body.email;
  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;
  var subdominio = req.body.subdominio;
  if (!nombre_negocio || !email || !password || !subdominio) {
    return res.status(422).json({ message: 'Todos los campos son obligatorios.' });
  }
  if (password !== password_confirmation) {
    return res.status(422).json({ message: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 8) {
    return res.status(422).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  var exists = queryOne('SELECT id FROM users WHERE email = ? OR subdominio = ?', [email, subdominio]);
  if (exists) return res.status(422).json({ message: 'El email o subdominio ya está registrado.' });
  var hashed = bcrypt.hashSync(password, 10);
  run('INSERT INTO users (nombre_negocio, email, password, subdominio) VALUES (?, ?, ?, ?)', [nombre_negocio, email, hashed, subdominio]);
  res.status(201).json({ message: 'Cuenta creada exitosamente.' });
});

app.get('/api/check-subdominio', function(req, res) {
  var slug = (req.query.subdominio || '').toLowerCase().trim();
  if (!slug || slug.length < 3) return res.json({ disponible: false, motivo: 'corto' });
  var exists = queryOne('SELECT id FROM users WHERE subdominio = ?', [slug]);
  var reservados = ['admin', 'api', 'www', 'mail', 'ftp', 'app', 'demo', 'test', 'ayuda', 'soporte', 'blog', 'login', 'registro', 'panel', 'dashboard'];
  if (exists) return res.json({ disponible: false, motivo: 'ocupado' });
  if (reservados.indexOf(slug) !== -1) return res.json({ disponible: false, motivo: 'reservado' });
  res.json({ disponible: true });
});

app.post('/api/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) return res.status(422).json({ message: 'Email y contraseña requeridos.' });
  var user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
  }
  var token = crypto.randomBytes(32).toString('hex');
  run('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [user.id, token]);
  res.json({ token: token, user: { id: user.id, nombre_negocio: user.nombre_negocio, email: user.email, role: user.role } });
});

app.get('/api/products', requireAuth, function(req, res) {
  var products = query('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
  res.json(products);
});

app.post('/api/products', requireAuth, function(req, res) {
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.price;
  var stock = req.body.stock;
  var category = req.body.category;
  if (!name || price === undefined) return res.status(422).json({ message: 'Nombre y precio requeridos.' });
  run('INSERT INTO products (user_id, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)', [req.userId, name, description || '', parseFloat(price), parseInt(stock) || 0, category || '']);
  var products2 = query('SELECT * FROM products WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
  var product = products2.length ? products2[0] : null;
  res.status(201).json(product);
});

app.delete('/api/products/:id', requireAuth, function(req, res) {
  var p = queryOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!p) return res.status(404).json({ message: 'Producto no encontrado.' });
  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Producto eliminado.' });
});
