const express = require('express');
const router  = express.Router();
const { getDb } = require('../db/database');

/* ── GET /api/moves?q=earthquake&type=ground&category=physical&limit=20 ── */
router.get('/', (req, res) => {
  const db = getDb();
  const { q='', type='', category='', limit=20, offset=0 } = req.query;
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const safeOffset = Math.max(0, parseInt(offset) || 0);
  const search = q.toLowerCase().trim();

  let sql    = 'SELECT * FROM moves WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(id) LIKE ? OR LOWER(COALESCE(name_es, \'\')) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (type)     { sql += ' AND type = ?';     params.push(type.toLowerCase()); }
  if (category) { sql += ' AND category = ?'; params.push(category.toLowerCase()); }

  // Excluir movimientos Z y Max por defecto
  sql += ' AND is_z = 0 AND is_max = 0';

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = db.prepare(countSql).get(...params)?.total || 0;

  sql += ' ORDER BY CASE WHEN LOWER(id) = ? THEN 0 WHEN LOWER(name) = ? THEN 1 WHEN LOWER(COALESCE(name_es, \'\')) = ? THEN 2 WHEN LOWER(name) LIKE ? THEN 3 WHEN LOWER(COALESCE(name_es, \'\')) LIKE ? THEN 4 ELSE 5 END, name ASC LIMIT ? OFFSET ?';
  params.push(search, search, search, `${search}%`, `${search}%`, safeLimit, safeOffset);

  const rows = db.prepare(sql).all(...params);
  res.json({ total, results: rows.map(formatMove) });
});

/* ── GET /api/moves/:id ── */
router.get('/:id', (req, res) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM moves WHERE id = ?').get(req.params.id.toLowerCase());
  if (!row) return res.status(404).json({ error: 'Movimiento no encontrado' });

  // Pokémon que aprenden este movimiento (gen 9)
  const learnedBy = db.prepare(`
    SELECT DISTINCT p.id, p.num, p.name, p.name_es, p.type1, p.type2, p.tier
    FROM learnsets l JOIN pokemon p ON l.pokemon_id = p.id
    WHERE l.move_id = ? AND l.gen = '9'
    ORDER BY p.num ASC
    LIMIT 50
  `).all(req.params.id.toLowerCase());

  res.json({ ...formatMove(row), learnedBy });
});

function formatMove(row) {
  return {
    ...row,
    secondary: row.secondary ? JSON.parse(row.secondary) : null,
    drain:     row.drain     ? JSON.parse(row.drain)     : null,
    recoil:    row.recoil    ? JSON.parse(row.recoil)    : null,
    heal:      row.heal      ? JSON.parse(row.heal)      : null,
  };
}

module.exports = router;
