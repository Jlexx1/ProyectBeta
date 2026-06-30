/*
  Archivo: database.js
  Descripción: Inicialización y configuración de la base de datos SQLite para ALDIA.
  Fecha de última modificación: 2026-06-27
  Autor: Antigravity
*/

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'aldia.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite aldia.db');
        inicializarBaseDatos();
    }
});

function inicializarBaseDatos() {
    // Crear tabla de usuarios
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error al crear tabla users:', err.message);
        } else {
            // Insertar usuario administrador por defecto
            db.run(`
                INSERT OR IGNORE INTO users (username, password, role)
                VALUES ('admin', 'admin123', 'admin')
            `);
        }
    });

    // Crear tabla de productos de inventario
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error al crear tabla products:', err.message);
        }
    });
}

module.exports = db;
