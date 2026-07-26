const express = require('express');
const bcrypt = require('bcryptjs');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database.sqlite');

var transporter = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    console.log('SMTP configured for email delivery');
  } else {
    console.log('No SMTP configured — 2FA codes will be logged to console only');
  }
} catch (e) {
  console.log('SMTP not available — 2FA codes will be logged to console');
}

function enviarCodigo(email, codigo) {
  console.log('========== 2FA CODE ==========');
  console.log(' Para: ' + email);
  console.log(' Código: ' + codigo);
  console.log('===============================');
  if (transporter) {
    transporter.sendMail({
      from: process.env.SMTP_FROM || '"ALDIA" <noreply@aldia.com>',
      to: email,
      subject: 'Tu código de verificación ALDIA',
      html: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px"><div style="font-size:24px;font-weight:800;margin-bottom:16px">ALDIA<span style="color:#2563EB">.</span></div><p style="color:#374151;font-size:15px">Usá este código para iniciar sesión:</p><div style="background:#f1f5f9;padding:16px;border-radius:8px;text-align:center;font-size:32px;font-weight:800;letter-spacing:8px;color:#2563EB;font-family:monospace;margin:16px 0">' + codigo + '</div><p style="color:#64748b;font-size:13px">Vence en 10 minutos. Si no solicitaste este código, ignorá este mensaje.</p></div>'
    }).catch(function(e) { console.log('Email send failed:', e.message); });
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(function(err, req, res, next) {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

let db;

function saveDb() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

initSqlJs().then(function(SQL) {
  var data;
  try { data = fs.readFileSync(dbPath); } catch (e) { data = null; }
  db = new SQL.Database(data);

  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre_negocio TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, subdominio TEXT UNIQUE NOT NULL, role TEXT DEFAULT 'user', twofa_enabled INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT '', price REAL NOT NULL, stock INTEGER DEFAULT 0, category TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS twofa_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, code TEXT NOT NULL, temp_token TEXT NOT NULL, expires_at DATETIME, used INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS reset_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, code TEXT NOT NULL, expires_at DATETIME, used INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS corporate_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE NOT NULL, razon_social TEXT DEFAULT '', cuit TEXT DEFAULT '', direccion TEXT DEFAULT '', telefono TEXT DEFAULT '', email_contacto TEXT DEFAULT '', sitio_web TEXT DEFAULT '', descripcion TEXT DEFAULT '', industria TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");
  db.run("CREATE TABLE IF NOT EXISTS sucursales (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, nombre TEXT NOT NULL, direccion TEXT DEFAULT '', ciudad TEXT DEFAULT '', provincia TEXT DEFAULT '', pais TEXT DEFAULT 'Argentina', latitud REAL, longitud REAL, telefono TEXT DEFAULT '', email TEXT DEFAULT '', horarios TEXT DEFAULT '', activo INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");

  try { db.run('ALTER TABLE users ADD COLUMN twofa_enabled INTEGER DEFAULT 0'); } catch (e) {}
  try { db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"'); } catch (e) {}
  try { db.run('ALTER TABLE corporate_profiles ADD COLUMN industria TEXT DEFAULT ""'); } catch (e) {}
  try { db.run('ALTER TABLE sucursales ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP'); } catch (e) {}
  try { db.run('ALTER TABLE products ADD COLUMN codigo_barras TEXT DEFAULT ""'); } catch (e) {}
  db.run("CREATE TABLE IF NOT EXISTS ventas (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, items TEXT NOT NULL, total REAL NOT NULL, metodo_pago TEXT DEFAULT 'efectivo', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))");

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

  var existingProducts = db.exec('SELECT COUNT(*) as cnt FROM products WHERE user_id = 1');
  if (!existingProducts.length || !existingProducts[0].values.length || existingProducts[0].values[0][0] === 0) {
    var defaultProducts = [
      ['Coca Cola 500ml', 'Gaseosa coca cola 500ml x24', 3.50, 60, 'Bebidas', '7791234500001'],
      ['Sprite 500ml', '', 3.20, 40, 'Bebidas', '7791234500002'],
      ['Fanta Naranja 500ml', '', 3.20, 35, 'Bebidas', '7791234500003'],
      ['Agua Mineral 1.5L', '', 1.80, 50, 'Bebidas', '7791234500004'],
      ['Fernet Branca 750ml', '', 18.00, 20, 'Bebidas', '7791234500005'],
      ['Jugo Cepita Naranja 1L', '', 4.50, 25, 'Bebidas', '7791234500006'],
      ['Papas Lays', '', 2.40, 200, 'Comida', '7791234500007'],
      ['Alfajor Jorgito Triple', '', 2.80, 80, 'Comida', '7791234500008'],
      ['Chocolate Águila 50g', '', 3.50, 60, 'Comida', '7791234500009'],
      ['Galletitas Oreo 144g', '', 4.20, 45, 'Comida', '7791234500010'],
      ['Caramelos Menta Halls x12', '', 2.00, 100, 'Comida', '7791234500011'],
      ['Bizcochos Don Satur x10', '', 1.80, 90, 'Comida', '7791234500012'],
      ['Arroz Gallo 1kg', '', 4.80, 30, 'Alimento', '7791234500013'],
      ['Fideos Spaghetti Matarazzo 500g', '', 3.20, 45, 'Alimento', '7791234500014'],
      ['Harina 0000 Pureza 1kg', '', 2.90, 40, 'Alimento', '7791234500015'],
      ['Aceite Natura 900ml', '', 5.50, 35, 'Alimento', '7791234500016'],
      ['Yerba Mate Playadito 1kg', '', 7.20, 28, 'Alimento', '7791234500017'],
      ['Papel Higiénico x24', '', 6.50, 60, 'Aseo del Hogar', '7791234500018'],
      ['Jabón en Polvo Ala 800g', '', 8.50, 20, 'Aseo del Hogar', '7791234500019'],
      ['Lavandina Ayudín 1L', '', 2.80, 40, 'Aseo del Hogar', '7791234500020'],
      ['Detergente Magistral 500ml', '', 4.20, 35, 'Aseo del Hogar', '7791234500021'],
      ['Esponja Scotch Brite', '', 1.50, 60, 'Aseo del Hogar', '7791234500022'],
      ['Shampoo Sedal 400ml', '', 6.80, 25, 'Limpieza Personal', '7791234500023'],
      ['Jabón de Tocador Rexona', '', 2.40, 50, 'Limpieza Personal', '7791234500024'],
      ['Desodorante Axe 150ml', '', 7.50, 20, 'Limpieza Personal', '7791234500025'],
      ['Cepillo Dental Colgate', '', 4.90, 30, 'Limpieza Personal', '7791234500026'],
      ['Pasta Dental Colgate 90g', '', 5.20, 35, 'Limpieza Personal', '7791234500027'],
      ['Chifles DonBenito 60mg', '', 10.00, 20, 'Alimento', '7791234500028']
    ];
    var stmt = db.prepare('INSERT INTO products (user_id, name, description, price, stock, category, codigo_barras) VALUES (?, ?, ?, ?, ?, ?, ?)');
    defaultProducts.forEach(function(p) { stmt.bind([1].concat(p)); stmt.step(); stmt.reset(); });
    stmt.free();
    saveDb();
    console.log('Productos por defecto creados: ' + defaultProducts.length);
  } else {
    console.log('Productos existentes: ' + existingProducts[0].values[0][0]);
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
  var user = queryOne('SELECT id, nombre_negocio, email, role, twofa_enabled FROM users WHERE email = ?', [email]);
  var token = crypto.randomBytes(32).toString('hex');
  run('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [user.id, token]);
  res.status(201).json({ message: 'Cuenta creada exitosamente.', token: token, user: { id: user.id, nombre_negocio: user.nombre_negocio, email: user.email, role: user.role } });
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

function generarCodigo2fa() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function crearTempToken() {
  return 'tmp_' + crypto.randomBytes(24).toString('hex');
}

app.post('/api/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) return res.status(422).json({ message: 'Email y contraseña requeridos.' });
  var user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
  }

  if (user.twofa_enabled) {
    var codigo = generarCodigo2fa();
    var tempToken = crearTempToken();
    run('INSERT INTO twofa_codes (user_id, code, temp_token, expires_at) VALUES (?, ?, ?, datetime("now", "+10 minutes"))', [user.id, codigo, tempToken]);
    enviarCodigo(user.email, codigo);
    return res.json({ requires_2fa: true, temp_token: tempToken, email: user.email });
  }

  var token = crypto.randomBytes(32).toString('hex');
  run('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [user.id, token]);
  res.json({ token: token, user: { id: user.id, nombre_negocio: user.nombre_negocio, email: user.email, role: user.role } });
});

app.post('/api/send-2fa-code', function(req, res) {
  var tempToken = req.body.temp_token;
  if (!tempToken) return res.status(422).json({ message: 'Token requerido.' });
  var codeRecord = queryOne('SELECT * FROM twofa_codes WHERE temp_token = ? AND used = 0 AND expires_at > datetime("now")', [tempToken]);
  if (!codeRecord) return res.status(400).json({ message: 'Token inválido o expirado. Iniciá sesión de nuevo.' });
  var user = queryOne('SELECT * FROM users WHERE id = ?', [codeRecord.user_id]);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
  var codigo = generarCodigo2fa();
  var nuevoToken = crearTempToken();
  run('UPDATE twofa_codes SET used = 1 WHERE temp_token = ?', [tempToken]);
  run('INSERT INTO twofa_codes (user_id, code, temp_token, expires_at) VALUES (?, ?, ?, datetime("now", "+10 minutes"))', [user.id, codigo, nuevoToken]);
  enviarCodigo(user.email, codigo);
  res.json({ message: 'Código reenviado.', temp_token: nuevoToken });
});

app.post('/api/verify-2fa-code', function(req, res) {
  var tempToken = req.body.temp_token;
  var code = req.body.code;
  if (!tempToken || !code) return res.status(422).json({ message: 'Código y token requeridos.' });
  var codeRecord = queryOne('SELECT * FROM twofa_codes WHERE temp_token = ? AND code = ? AND used = 0 AND expires_at > datetime("now")', [tempToken, code]);
  if (!codeRecord) return res.status(401).json({ message: 'Código incorrecto o expirado.' });
  run('UPDATE twofa_codes SET used = 1 WHERE id = ?', [codeRecord.id]);
  var user = queryOne('SELECT * FROM users WHERE id = ?', [codeRecord.user_id]);
  var token = crypto.randomBytes(32).toString('hex');
  run('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [user.id, token]);
  res.json({ token: token, user: { id: user.id, nombre_negocio: user.nombre_negocio, email: user.email, role: user.role } });
});

app.post('/api/setup-2fa', requireAuth, function(req, res) {
  var enabled = req.body.enabled ? 1 : 0;
  run('UPDATE users SET twofa_enabled = ? WHERE id = ?', [enabled, req.userId]);
  if (enabled) {
    run('DELETE FROM sessions WHERE user_id = ? AND token != ?', [req.userId, req.headers.authorization]);
  }
  res.json({ message: enabled ? '2FA activado' : '2FA desactivado', twofa_enabled: !!enabled });
});

app.get('/api/2fa-status', requireAuth, function(req, res) {
  var user = queryOne('SELECT twofa_enabled FROM users WHERE id = ?', [req.userId]);
  res.json({ twofa_enabled: !!(user && user.twofa_enabled) });
});

app.get('/api/products', requireAuth, function(req, res) {
  var q = req.query.q;
  var barcode = req.query.barcode;
  var sql, params;
  if (barcode) {
    sql = 'SELECT * FROM products WHERE user_id = ? AND codigo_barras = ? ORDER BY name';
    params = [req.userId, barcode];
  } else if (q && q.trim()) {
    var like = '%' + q.trim() + '%';
    sql = 'SELECT * FROM products WHERE user_id = ? AND (name LIKE ? OR codigo_barras LIKE ? OR category LIKE ?) ORDER BY name LIMIT 50';
    params = [req.userId, like, like, like];
  } else {
    sql = 'SELECT * FROM products WHERE user_id = ? ORDER BY name';
    params = [req.userId];
  }
  var products = query(sql, params);
  res.json(products);
});

app.post('/api/products', requireAuth, function(req, res) {
  var name = req.body.name;
  var description = req.body.description;
  var price = req.body.price;
  var stock = req.body.stock;
  var category = req.body.category;
  var codigo_barras = req.body.codigo_barras;
  if (!name || price === undefined) return res.status(422).json({ message: 'Nombre y precio requeridos.' });
  run('INSERT INTO products (user_id, name, description, price, stock, category, codigo_barras) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.userId, name, description || '', parseFloat(price), parseInt(stock) || 0, category || '', codigo_barras || '']);
  var products2 = query('SELECT * FROM products WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
  var product = products2.length ? products2[0] : null;
  res.status(201).json(product);
});

app.get('/api/data', requireAuth, function(req, res) {
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Solo administradores.' });
  var users = query('SELECT id, nombre_negocio, email, subdominio, role, created_at FROM users ORDER BY id');
  var products = query('SELECT * FROM products ORDER BY id');
  res.json({ users: users, products: products });
});

app.get('/api/users', requireAuth, function(req, res) {
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Solo administradores.' });
  var users = query('SELECT id, nombre_negocio, email, subdominio, role, twofa_enabled, created_at FROM users ORDER BY id');
  res.json(users);
});

app.post('/api/users', requireAuth, function(req, res) {
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Solo administradores.' });
  var nombre_negocio = req.body.nombre_negocio;
  var email = req.body.email;
  var password = req.body.password;
  var subdominio = req.body.subdominio;
  var role = req.body.role || 'user';
  if (!nombre_negocio || !email || !password || !subdominio) {
    return res.status(422).json({ message: 'Nombre, email, contraseña y subdominio son obligatorios.' });
  }
  if (password.length < 8) return res.status(422).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  var exists = queryOne('SELECT id FROM users WHERE email = ? OR subdominio = ?', [email, subdominio]);
  if (exists) return res.status(422).json({ message: 'El email o subdominio ya está registrado.' });
  var hashed = bcrypt.hashSync(password, 10);
  run('INSERT INTO users (nombre_negocio, email, password, subdominio, role) VALUES (?, ?, ?, ?, ?)', [nombre_negocio, email, hashed, subdominio, role]);
  var created = queryOne('SELECT id, nombre_negocio, email, subdominio, role, created_at FROM users WHERE email = ?', [email]);
  res.status(201).json(created);
});

app.put('/api/users/:id', requireAuth, function(req, res) {
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Solo administradores.' });
  var target = queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!target) return res.status(404).json({ message: 'Usuario no encontrado.' });
  var nombre_negocio = req.body.nombre_negocio !== undefined ? req.body.nombre_negocio : target.nombre_negocio;
  var email = req.body.email !== undefined ? req.body.email : target.email;
  var subdominio = req.body.subdominio !== undefined ? req.body.subdominio : target.subdominio;
  var role = req.body.role !== undefined ? req.body.role : target.role;
  if (email !== target.email || subdominio !== target.subdominio) {
    var dupes = query('SELECT id FROM users WHERE (email = ? OR subdominio = ?) AND id != ?', [email, subdominio, target.id]);
    if (dupes.length) return res.status(422).json({ message: 'El email o subdominio ya está en uso.' });
  }
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(422).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    var hashed = bcrypt.hashSync(req.body.password, 10);
    run('UPDATE users SET nombre_negocio=?, email=?, password=?, subdominio=?, role=? WHERE id=?', [nombre_negocio, email, hashed, subdominio, role, target.id]);
  } else {
    run('UPDATE users SET nombre_negocio=?, email=?, subdominio=?, role=? WHERE id=?', [nombre_negocio, email, subdominio, role, target.id]);
  }
  var updated = queryOne('SELECT id, nombre_negocio, email, subdominio, role, created_at FROM users WHERE id = ?', [target.id]);
  res.json(updated);
});

app.delete('/api/users/:id', requireAuth, function(req, res) {
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Solo administradores.' });
  var target = queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!target) return res.status(404).json({ message: 'Usuario no encontrado.' });
  if (parseInt(target.id) === parseInt(req.userId)) return res.status(422).json({ message: 'No podés eliminar tu propio usuario.' });
  run('DELETE FROM sessions WHERE user_id = ?', [target.id]);
  run('DELETE FROM products WHERE user_id = ?', [target.id]);
  run('DELETE FROM twofa_codes WHERE user_id = ?', [target.id]);
  run('DELETE FROM reset_codes WHERE user_id = ?', [target.id]);
  run('DELETE FROM corporate_profiles WHERE user_id = ?', [target.id]);
  run('DELETE FROM sucursales WHERE user_id = ?', [target.id]);
  run('DELETE FROM users WHERE id = ?', [target.id]);
  res.json({ message: 'Usuario eliminado.' });
});

app.get('/api/corporate-profile', requireAuth, function(req, res) {
  var profile = queryOne('SELECT * FROM corporate_profiles WHERE user_id = ?', [req.userId]);
  if (!profile) return res.json(null);
  res.json(profile);
});

app.post('/api/corporate-profile', requireAuth, function(req, res) {
  var existing = queryOne('SELECT id FROM corporate_profiles WHERE user_id = ?', [req.userId]);
  if (existing) {
    run('UPDATE corporate_profiles SET razon_social=?, cuit=?, direccion=?, telefono=?, email_contacto=?, sitio_web=?, descripcion=?, industria=?, updated_at=datetime("now") WHERE user_id=?',
      [req.body.razon_social || '', req.body.cuit || '', req.body.direccion || '', req.body.telefono || '', req.body.email_contacto || '', req.body.sitio_web || '', req.body.descripcion || '', req.body.industria || '', req.userId]);
  } else {
    run('INSERT INTO corporate_profiles (user_id, razon_social, cuit, direccion, telefono, email_contacto, sitio_web, descripcion, industria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, req.body.razon_social || '', req.body.cuit || '', req.body.direccion || '', req.body.telefono || '', req.body.email_contacto || '', req.body.sitio_web || '', req.body.descripcion || '', req.body.industria || '']);
  }
  var profile = queryOne('SELECT * FROM corporate_profiles WHERE user_id = ?', [req.userId]);
  res.json(profile);
});

app.get('/api/corporate-profiles', requireAuth, function(req, res) {
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Solo administradores.' });
  var profiles = query('SELECT cp.*, u.nombre_negocio, u.email FROM corporate_profiles cp LEFT JOIN users u ON cp.user_id = u.id ORDER BY u.nombre_negocio');
  res.json(profiles);
});

app.get('/api/sucursales', requireAuth, function(req, res) {
  var sucursales = query('SELECT * FROM sucursales WHERE user_id = ? ORDER BY nombre', [req.userId]);
  res.json(sucursales);
});

app.post('/api/sucursales', requireAuth, function(req, res) {
  var nombre = req.body.nombre;
  if (!nombre) return res.status(422).json({ message: 'El nombre de la sucursal es obligatorio.' });
  run('INSERT INTO sucursales (user_id, nombre, direccion, ciudad, provincia, pais, latitud, longitud, telefono, email, horarios, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.userId, nombre, req.body.direccion || '', req.body.ciudad || '', req.body.provincia || '', req.body.pais || 'Argentina', req.body.latitud || null, req.body.longitud || null, req.body.telefono || '', req.body.email || '', req.body.horarios || '', req.body.activo !== undefined ? (req.body.activo ? 1 : 0) : 1]);
  var created = queryOne('SELECT * FROM sucursales WHERE id = (SELECT MAX(id) FROM sucursales WHERE user_id = ?)', [req.userId]);
  res.status(201).json(created);
});

app.put('/api/sucursales/:id', requireAuth, function(req, res) {
  var s = queryOne('SELECT * FROM sucursales WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!s) return res.status(404).json({ message: 'Sucursal no encontrada.' });
  run('UPDATE sucursales SET nombre=?, direccion=?, ciudad=?, provincia=?, pais=?, latitud=?, longitud=?, telefono=?, email=?, horarios=?, activo=?, updated_at=datetime("now") WHERE id=?',
    [req.body.nombre || s.nombre, req.body.direccion !== undefined ? req.body.direccion : s.direccion, req.body.ciudad !== undefined ? req.body.ciudad : s.ciudad, req.body.provincia !== undefined ? req.body.provincia : s.provincia, req.body.pais !== undefined ? req.body.pais : s.pais, req.body.latitud !== undefined ? req.body.latitud : s.latitud, req.body.longitud !== undefined ? req.body.longitud : s.longitud, req.body.telefono !== undefined ? req.body.telefono : s.telefono, req.body.email !== undefined ? req.body.email : s.email, req.body.horarios !== undefined ? req.body.horarios : s.horarios, req.body.activo !== undefined ? (req.body.activo ? 1 : 0) : s.activo, req.params.id]);
  var updated = queryOne('SELECT * FROM sucursales WHERE id = ?', [req.params.id]);
  res.json(updated);
});

app.delete('/api/sucursales/:id', requireAuth, function(req, res) {
  var s = queryOne('SELECT * FROM sucursales WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!s) return res.status(404).json({ message: 'Sucursal no encontrada.' });
  run('DELETE FROM sucursales WHERE id = ?', [req.params.id]);
  res.json({ message: 'Sucursal eliminada.' });
});

app.get('/api/stats', requireAuth, function(req, res) {
  var totalProducts = query('SELECT COUNT(*) as count FROM products WHERE user_id = ?', [req.userId])[0].count;
  var lowStock = query('SELECT COUNT(*) as count FROM products WHERE user_id = ? AND stock > 0 AND stock <= 5', [req.userId])[0].count;
  var outOfStock = query('SELECT COUNT(*) as count FROM products WHERE user_id = ? AND (stock IS NULL OR stock = 0)', [req.userId])[0].count;
  var user = queryOne('SELECT role FROM users WHERE id = ?', [req.userId]);
  var totalUsers = 0;
  if (user && user.role === 'admin') {
    totalUsers = query('SELECT COUNT(*) as count FROM users')[0].count;
  }
  res.json({ totalProducts: totalProducts, lowStock: lowStock, outOfStock: outOfStock, totalUsers: totalUsers });
});

app.put('/api/products/:id', requireAuth, function(req, res) {
  var p = queryOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!p) return res.status(404).json({ message: 'Producto no encontrado.' });
  var name = req.body.name !== undefined ? req.body.name : p.name;
  var description = req.body.description !== undefined ? req.body.description : p.description;
  var price = req.body.price !== undefined ? parseFloat(req.body.price) : p.price;
  var stock = req.body.stock !== undefined ? parseInt(req.body.stock) : p.stock;
  var category = req.body.category !== undefined ? req.body.category : p.category;
  var codigo_barras = req.body.codigo_barras !== undefined ? req.body.codigo_barras : p.codigo_barras;
  run('UPDATE products SET name=?, description=?, price=?, stock=?, category=?, codigo_barras=? WHERE id=?', [name, description, price, stock, category, codigo_barras, req.params.id]);
  var updated = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(updated);
});

app.delete('/api/products/:id', requireAuth, function(req, res) {
  var p = queryOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!p) return res.status(404).json({ message: 'Producto no encontrado.' });
  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Producto eliminado.' });
});

app.post('/api/forgot-password', function(req, res) {
  var email = req.body.email;
  if (!email) return res.status(422).json({ message: 'Email requerido.' });
  var user = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) return res.json({ message: 'Si el email existe, recibirás un código de verificación.' });
  var codigo = String(Math.floor(100000 + Math.random() * 900000));
  run('INSERT INTO reset_codes (user_id, code, expires_at) VALUES (?, ?, datetime("now", "+10 minutes"))', [user.id, codigo]);
  console.log('========== RESET CODE ==========');
  console.log(' Para: ' + email);
  console.log(' Código: ' + codigo);
  console.log('=================================');
  if (transporter) {
    transporter.sendMail({
      from: process.env.SMTP_FROM || '"ALDIA" <noreply@aldia.com>',
      to: email,
      subject: 'Código para restablecer tu contraseña',
      html: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px"><div style="font-size:24px;font-weight:800;margin-bottom:16px">ALDIA<span style="color:#2563EB">.</span></div><p style="color:#374151;font-size:15px">Usá este código para restablecer tu contraseña:</p><div style="background:#f1f5f9;padding:16px;border-radius:8px;text-align:center;font-size:32px;font-weight:800;letter-spacing:8px;color:#2563EB;font-family:monospace;margin:16px 0">' + codigo + '</div><p style="color:#64748b;font-size:13px">Vence en 10 minutos. Si no solicitaste esto, ignorá este mensaje.</p></div>'
    }).catch(function(e) { console.log('Email send failed:', e.message); });
  }
  res.json({ message: 'Si el email existe, recibirás un código de verificación.' });
});

app.post('/api/reset-password', function(req, res) {
  var email = req.body.email;
  var code = req.body.code;
  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;
  if (!email || !code || !password) return res.status(422).json({ message: 'Todos los campos son obligatorios.' });
  if (password !== password_confirmation) return res.status(422).json({ message: 'Las contraseñas no coinciden.' });
  if (password.length < 8) return res.status(422).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
  var user = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
  var record = queryOne('SELECT * FROM reset_codes WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime("now")', [user.id, code]);
  if (!record) return res.status(401).json({ message: 'Código incorrecto o expirado.' });
  run('UPDATE reset_codes SET used = 1 WHERE id = ?', [record.id]);
  var hashed = bcrypt.hashSync(password, 10);
  run('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
  run('DELETE FROM sessions WHERE user_id = ?', [user.id]);
  res.json({ message: 'Contraseña restablecida exitosamente.' });
});

app.post('/api/ventas', requireAuth, function(req, res) {
  var items = req.body.items;
  var total = req.body.total;
  var metodo_pago = req.body.metodo_pago || 'efectivo';
  if (!items || !items.length) return res.status(422).json({ message: 'Carrito vacío.' });
  if (total === undefined || total <= 0) return res.status(422).json({ message: 'Total inválido.' });
  run('INSERT INTO ventas (user_id, items, total, metodo_pago) VALUES (?, ?, ?, ?)', [req.userId, JSON.stringify(items), parseFloat(total), metodo_pago]);
  items.forEach(function(item) {
    if (item.id) {
      db.run('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ? AND user_id = ?', [item.cantidad, item.id, req.userId]);
    }
  });
  saveDb();
  var venta = queryOne('SELECT * FROM ventas WHERE id = (SELECT MAX(id) FROM ventas WHERE user_id = ?)', [req.userId]);
  res.status(201).json(venta);
});

app.get('/api/ventas', requireAuth, function(req, res) {
  var ventas = query('SELECT * FROM ventas WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.userId]);
  res.json(ventas);
});

app.get('/api/ventas/:id', requireAuth, function(req, res) {
  var venta = queryOne('SELECT * FROM ventas WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!venta) return res.status(404).json({ message: 'Venta no encontrada.' });
  venta.items = JSON.parse(venta.items || '[]');
  res.json(venta);
});
