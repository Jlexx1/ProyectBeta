/*
  Archivo: server.js
  Descripción: Servidor Express para servir archivos estáticos y API REST de autenticación e inventario de ALDIA.
  Fecha de última modificación: 2026-06-27
  Autor: Antigravity
*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname)));

// ----------------------------------------------------
// Endpoints de Autenticación
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error del servidor' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        res.json({
            success: true,
            user: {
                username: row.username,
                role: row.role
            }
        });
    });
});

// ----------------------------------------------------
// Endpoints de Inventario (CRUD de Productos)
// ----------------------------------------------------

// Obtener todos los productos
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Crear nuevo producto
app.post('/api/products', (req, res) => {
    const { name, sku, price, stock } = req.body;
    
    if (!name || !sku || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    db.run(
        'INSERT INTO products (name, sku, price, stock) VALUES (?, ?, ?, ?)',
        [name, sku, price, stock],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'El SKU ya existe en el inventario' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                name,
                sku,
                price,
                stock
            });
        }
    );
});

// Eliminar un producto
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM products WHERE id = ?', id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ success: true, message: 'Producto eliminado del inventario' });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de ALDIA corriendo en: http://localhost:${PORT}`);
});
