const express = require('express');
const router  = express.Router();
const { getDb } = require('../db/database');

/* ── GET /api/pokemon?q=pikachu&type=electric&tier=OU&limit=20&offset=0 ── */
router.get('/', (req, res) => {
  const db = getDb();
  const { q='', type='', tier='', limit=20, offset=0 } = req.query;
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const safeOffset = Math.max(0, parseInt(offset) || 0);
  const search = q.toLowerCase().trim();

  let sql    = 'SELECT * FROM pokemon WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(id) LIKE ? OR LOWER(COALESCE(name_es, \'\')) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (type) {
    sql += ' AND (type1 = ? OR type2 = ?)';
    params.push(type.toLowerCase(), type.toLowerCase());
  }
  if (tier) {
    sql += ' AND tier = ?';
    params.push(tier);
  }

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = db.prepare(countSql).get(...params)?.total || 0;

  sql += ' ORDER BY CASE WHEN LOWER(id) = ? THEN 0 WHEN LOWER(name) = ? THEN 1 WHEN LOWER(COALESCE(name_es, \'\')) = ? THEN 2 WHEN LOWER(name) LIKE ? THEN 3 WHEN LOWER(COALESCE(name_es, \'\')) LIKE ? THEN 4 ELSE 5 END, num ASC LIMIT ? OFFSET ?';
  params.push(search, search, search, `${search}%`, `${search}%`, safeLimit, safeOffset);

  const rows = db.prepare(sql).all(...params);
  res.json({ total, results: rows.map(formatPokemon) });
});

/* ── GET /api/pokemon/:id ── */
router.get('/:id', (req, res) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM pokemon WHERE id = ?').get(req.params.id.toLowerCase());
  if (!row) return res.status(404).json({ error: 'Pokémon no encontrado' });

  // Learnset del Pokémon (gen 9)
  const learnset = db.prepare(`
    SELECT DISTINCT m.id, m.name, m.name_es, m.type, m.category, m.power, m.accuracy, m.pp
    FROM learnsets l JOIN moves m ON l.move_id = m.id
    WHERE l.pokemon_id = ? AND l.gen = '9'
    ORDER BY m.name
  `).all(req.params.id.toLowerCase());

  res.json({ ...formatPokemon(row), learnset });
});

function formatPokemon(row) {
  return {
    ...row,
    evos: row.evos ? JSON.parse(row.evos) : [],
  };
}

module.exports = router;
