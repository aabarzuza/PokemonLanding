const express = require('express');
const router  = express.Router();
const { getDb } = require('../db/database');

/* ── GET /api/abilities?q=intimidate&limit=20 ── */
router.get('/', (req, res) => {
  const db = getDb();
  const { q='', limit=20, offset=0 } = req.query;
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const safeOffset = Math.max(0, parseInt(offset) || 0);
  const search = q.toLowerCase().trim();

  let sql = 'SELECT * FROM abilities WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(id) LIKE ? OR LOWER(COALESCE(name_es, \'\')) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(sql.replace('SELECT *','SELECT COUNT(*) as total')).get(...params)?.total || 0;
  sql += ' ORDER BY CASE WHEN LOWER(id) = ? THEN 0 WHEN LOWER(name) = ? THEN 1 WHEN LOWER(COALESCE(name_es, \'\')) = ? THEN 2 WHEN LOWER(name) LIKE ? THEN 3 WHEN LOWER(COALESCE(name_es, \'\')) LIKE ? THEN 4 ELSE 5 END, name ASC LIMIT ? OFFSET ?';
  params.push(search, search, search, `${search}%`, `${search}%`, safeLimit, safeOffset);

  const rows = db.prepare(sql).all(...params);
  res.json({ total, results: rows });
});

/* ── GET /api/abilities/:id ── */
router.get('/:id', (req, res) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM abilities WHERE id = ?').get(req.params.id.toLowerCase());
  if (!row) return res.status(404).json({ error: 'Habilidad no encontrada' });

  // Pokémon con esta habilidad
  const pokemon = db.prepare(`
    SELECT id, num, name, name_es, type1, type2, tier
    FROM pokemon
    WHERE ability1 = ? OR ability2 = ? OR ability_h = ?
    ORDER BY num ASC
  `).all(row.name, row.name, row.name);

  res.json({ ...row, pokemon });
});

module.exports = router;
