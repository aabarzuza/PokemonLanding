const express = require('express');
const router  = express.Router();
const { getDb } = require('../db/database');

/* ── GET /api/teams ── Lista todos los equipos */
router.get('/', (req, res) => {
  const db   = getDb();
  const rows = db.prepare('SELECT id, name, format, created_at FROM teams ORDER BY updated_at DESC').all();
  res.json(rows);
});

/* ── GET /api/teams/:id ── Un equipo concreto con su código */
router.get('/:id', (req, res) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM teams WHERE id = ?').get(parseInt(req.params.id));
  if (!row) return res.status(404).json({ error: 'Equipo no encontrado' });
  res.json(row);
});

/* ── POST /api/teams ── Guardar equipo nuevo */
router.post('/', (req, res) => {
  const { name, format='OU', export_code } = req.body;
  if (!name || !export_code) {
    return res.status(400).json({ error: 'Se necesita nombre y código del equipo' });
  }
  const db  = getDb();
  const result = db.prepare(
    'INSERT INTO teams (name, format, export_code) VALUES (?, ?, ?)'
  ).run(name.trim(), format.trim(), export_code.trim());
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(team);
});

/* ── PUT /api/teams/:id ── Actualizar equipo */
router.put('/:id', (req, res) => {
  const { name, format, export_code } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM teams WHERE id = ?').get(parseInt(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Equipo no encontrado' });

  db.prepare(`
    UPDATE teams SET
      name        = ?,
      format      = ?,
      export_code = ?,
      updated_at  = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name        ?? existing.name,
    format      ?? existing.format,
    export_code ?? existing.export_code,
    parseInt(req.params.id)
  );

  res.json(db.prepare('SELECT * FROM teams WHERE id = ?').get(parseInt(req.params.id)));
});

/* ── DELETE /api/teams/:id ── Eliminar equipo */
router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM teams WHERE id = ?').run(parseInt(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Equipo no encontrado' });
  res.json({ ok: true });
});

module.exports = router;
