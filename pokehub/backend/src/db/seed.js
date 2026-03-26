/**
 * SEED.JS
 * Lee los datos de Pokémon Showdown y los mete en SQLite.
 * Ejecutar UNA SOLA VEZ con: node src/db/seed.js
 */

const fs   = require('fs');
const path = require('path');

// Cargar traducciones ES
let TRANS_ES = { pokemon:{}, moves:{}, abilities:{}, items:{} };
let TRANS_DESC = { abilities:{}, items:{} };
const transPath = path.join(__dirname, '..', '..', '..', 'frontend', 'data', 'translations-es.js');
if (fs.existsSync(transPath)) {
  const raw = fs.readFileSync(transPath, 'utf8');
  let TRANSLATIONS_ES = {};
  eval(raw.replace('const TRANSLATIONS_ES =', 'TRANSLATIONS_ES ='));
  // Formato nuevo: { id: [es, en, desc] } o { id: [es, en] }
  // Extraer ES de cada sección
  for (const [section, entries] of Object.entries(TRANSLATIONS_ES)) {
    TRANS_ES[section] = {};
    for (const [id, val] of Object.entries(entries)) {
      if (Array.isArray(val)) {
        TRANS_ES[section][id] = val[0]; // val[0] = ES, val[1] = EN, val[2] = desc
        if ((section === 'abilities' || section === 'items') && val[2]) TRANS_DESC[section][id] = val[2];
      } else {
        TRANS_ES[section][id] = val;
      }
    }
  }
  const total = Object.values(TRANS_ES).reduce((a,b) => a + Object.values(b).filter(v=>v).length, 0);
  console.log(`✅ Traducciones ES cargadas: ${total} entradas con ES`);
}
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'showdown-data');
const DB_PATH  = path.join(__dirname, 'pokehub.db');

// Borrar BD anterior si existe
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('📦 Creando tablas...');

db.exec(`
  CREATE TABLE pokemon (
    id          TEXT PRIMARY KEY,
    num         INTEGER NOT NULL,
    name        TEXT NOT NULL,
    name_es     TEXT,
    type1       TEXT NOT NULL,
    type2       TEXT,
    hp          INTEGER, atk INTEGER, def INTEGER,
    spa         INTEGER, spd INTEGER, spe INTEGER,
    bst         INTEGER,
    ability1    TEXT, ability2 TEXT, ability_h TEXT,
    tier        TEXT,
    doubles_tier TEXT,
    prevo       TEXT,
    evos        TEXT,
    height      REAL,
    weight      REAL
  );

  CREATE TABLE moves (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    name_es     TEXT,
    type        TEXT NOT NULL,
    category    TEXT NOT NULL,
    power       INTEGER DEFAULT 0,
    accuracy    INTEGER DEFAULT 100,
    pp          INTEGER DEFAULT 0,
    priority    INTEGER DEFAULT 0,
    flags       TEXT,
    secondary   TEXT,
    drain       TEXT,
    recoil      TEXT,
    heal        TEXT,
    crit_ratio  INTEGER DEFAULT 1,
    is_z        INTEGER DEFAULT 0,
    is_max      INTEGER DEFAULT 0
  );

  CREATE TABLE abilities (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    name_es     TEXT,
    rating      REAL DEFAULT 0,
    description TEXT
  );

  CREATE TABLE items (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    name_es     TEXT,
    num         INTEGER DEFAULT 0,
    fling_power INTEGER DEFAULT 0,
    description TEXT
  );

  CREATE TABLE learnsets (
    pokemon_id  TEXT NOT NULL,
    move_id     TEXT NOT NULL,
    gen         TEXT NOT NULL,
    PRIMARY KEY (pokemon_id, move_id, gen)
  );

  CREATE TABLE teams (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    format      TEXT DEFAULT 'OU',
    export_code TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_pokemon_num    ON pokemon(num);
  CREATE INDEX idx_pokemon_type1  ON pokemon(type1);
  CREATE INDEX idx_pokemon_tier   ON pokemon(tier);
  CREATE INDEX idx_moves_type     ON moves(type);
  CREATE INDEX idx_moves_category ON moves(category);
  CREATE INDEX idx_learnsets_poke ON learnsets(pokemon_id);
  CREATE INDEX idx_pokemon_name_es ON pokemon(name_es);
  CREATE INDEX idx_moves_name_es    ON moves(name_es);
  CREATE INDEX idx_abilities_name_es ON abilities(name_es);
  CREATE INDEX idx_items_name_es    ON items(name_es);
`);

// ── Helpers de parseo ────────────────────────────────────
function readData(baseName) {
  const jsPath = path.join(DATA_DIR, `${baseName}.js`);
  const tsPath = path.join(DATA_DIR, `${baseName}.ts`);
  if (fs.existsSync(jsPath)) return fs.readFileSync(jsPath, 'utf8');
  if (fs.existsSync(tsPath)) return fs.readFileSync(tsPath, 'utf8');
  throw new Error(`No se encuentra ${baseName}.js ni ${baseName}.ts en showdown-data`);
}

function parseBlocks(raw) {
  // Divide el archivo por entradas de primer nivel
  const result = {};
  const matches = raw.matchAll(/^\t(\w+):\s*\{/gm);
  for (const m of matches) {
    const id  = m.group ? m[1] : m[1];
    const start = m.index;
    // Encontrar el cierre de esta entrada
    let depth = 0, i = start;
    while (i < raw.length) {
      if (raw[i] === '{') depth++;
      else if (raw[i] === '}') { depth--; if (depth === 0) break; }
      i++;
    }
    result[id] = raw.slice(start, i + 1);
  }
  return result;
}

function get(block, key) {
  const m = block.match(new RegExp(key + ':\\s*"([^"]+)"'));
  return m ? m[1] : null;
}
function getNum(block, key) {
  const m = block.match(new RegExp(key + ':\\s*(-?\\d+)'));
  return m ? parseInt(m[1]) : null;
}
function getFloat(block, key) {
  const m = block.match(new RegExp(key + ':\\s*([\\d.]+)'));
  return m ? parseFloat(m[1]) : null;
}
function getArr(block, key) {
  const m = block.match(new RegExp(key + ':\\s*\\[([^\\]]+)\\]'));
  if (!m) return [];
  return m[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g,'')) || [];
}

// ── POKÉMON ──────────────────────────────────────────────
console.log('🔴 Importando Pokémon...');
const pokedexRaw  = readData('pokedex');
const formatsRaw  = readData('formats-data');

// Tiers
const tierMap = {};
for (const m of formatsRaw.matchAll(/(\w+):\s*\{[^}]*tier:\s*"([^"]+)"/gs)) {
  tierMap[m[1]] = m[2];
}
const dblTierMap = {};
for (const m of formatsRaw.matchAll(/(\w+):\s*\{[^}]*doublesTier:\s*"([^"]+)"/gs)) {
  dblTierMap[m[1]] = m[2];
}

const pokeBlocks = parseBlocks(pokedexRaw);
const insertPoke = db.prepare(`
  INSERT OR IGNORE INTO pokemon
  (id,num,name,name_es,type1,type2,hp,atk,def,spa,spd,spe,bst,
   ability1,ability2,ability_h,tier,doubles_tier,prevo,evos,height,weight)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

const insertPokeMany = db.transaction(entries => {
  for (const e of entries) insertPoke.run(...e);
});

const pokeEntries = [];
for (const [id, block] of Object.entries(pokeBlocks)) {
  const num = getNum(block, 'num');
  if (!num || num <= 0 || num > 1025) continue;
  const nonst = get(block, 'isNonstandard');
  if (nonst && !['Past'].includes(nonst)) continue;

  const typesM = block.match(/types:\s*\[([^\]]+)\]/);
  const types  = typesM ? typesM[1].match(/"([^"]+)"/g)?.map(s=>s.replace(/"/g,'')) || [] : [];
  if (!types.length) continue;

  const statsM = block.match(/baseStats:\s*\{([^}]+)\}/);
  const stats  = {};
  if (statsM) {
    for (const s of statsM[1].matchAll(/(\w+):\s*(\d+)/g)) stats[s[1]] = parseInt(s[2]);
  }
  const bst = Object.values(stats).reduce((a,b)=>a+b, 0);

  const abilsM = block.match(/abilities:\s*\{([^}]+)\}/);
  const abils  = {};
  if (abilsM) {
    const a0 = abilsM[1].match(/0:\s*"([^"]+)"/);
    const a1 = abilsM[1].match(/1:\s*"([^"]+)"/);
    const aH = abilsM[1].match(/H:\s*"([^"]+)"/);
    if (a0) abils['0'] = a0[1];
    if (a1) abils['1'] = a1[1];
    if (aH) abils.H   = aH[1];
  }

  const evos = getArr(block, 'evos');
  const prevo = get(block, 'prevo') || '';

  const pokeNameEs = TRANS_ES.pokemon[id] || null;
  pokeEntries.push([
    id, num, get(block,'name')||id, pokeNameEs,
    types[0]?.toLowerCase(), types[1]?.toLowerCase() || null,
    stats.hp||null, stats.atk||null, stats.def||null,
    stats.spa||null, stats.spd||null, stats.spe||null, bst,
    abils['0']||null, abils['1']||null, abils.H||null,
    tierMap[id]||null, dblTierMap[id]||null,
    prevo, JSON.stringify(evos),
    getFloat(block,'heightm'), getFloat(block,'weightkg')
  ]);
}
insertPokeMany(pokeEntries);
console.log(`  ✓ ${pokeEntries.length} Pokémon insertados`);

// ── MOVIMIENTOS ──────────────────────────────────────────
console.log('💥 Importando movimientos...');
const movesRaw = readData('moves');
const moveBlocks = parseBlocks(movesRaw);
const insertMove = db.prepare(`
  INSERT OR IGNORE INTO moves
  (id,name,name_es,type,category,power,accuracy,pp,priority,flags,secondary,drain,recoil,heal,crit_ratio,is_z,is_max)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);
const insertMoveMany = db.transaction(entries => {
  for (const e of entries) insertMove.run(...e);
});

const STATUS_ES = {brn:'quemadura',par:'parálisis',slp:'sueño',frz:'congelación',psn:'envenenamiento',tox:'envenenamiento grave'};
const VOLATILE_ES = {confusion:'confusión',flinch:'encogimiento',attract:'atracción'};

const moveEntries = [];
for (const [id, block] of Object.entries(moveBlocks)) {
  const nonst = get(block, 'isNonstandard');
  if (nonst && ['LGPE','CAP','Custom'].includes(nonst)) continue;
  const name = get(block,'name'); if (!name) continue;
  const type = get(block,'type')?.toLowerCase(); if (!type) continue;
  const cat  = get(block,'category')?.toLowerCase(); if (!cat) continue;

  // Efectos secundarios
  let sec = null;
  const secM = block.match(/secondary:\s*\{([^}]+)\}/s);
  if (secM) {
    const s = {};
    const sc = secM[1].match(/chance:\s*(\d+)/);
    const ss = secM[1].match(/status:\s*['"](\w+)['"]/);
    const sv = secM[1].match(/volatileStatus:\s*['"](\w+)['"]/);
    const sb = secM[1].match(/boosts:\s*\{([^}]+)\}/);
    if (sc) s.chance = parseInt(sc[1]);
    if (ss) { s.status = ss[1]; s.statusEs = STATUS_ES[ss[1]] || ss[1]; }
    if (sv) { s.volatileStatus = sv[1]; s.volatileEs = VOLATILE_ES[sv[1]] || sv[1]; }
    if (sb) {
      s.boosts = {};
      for (const b of sb[1].matchAll(/(\w+):\s*(-?\d+)/g)) s.boosts[b[1]] = parseInt(b[2]);
    }
    if (Object.keys(s).length) sec = JSON.stringify(s);
  }

  const drainM  = block.match(/drain:\s*\[(\d+),\s*(\d+)\]/);
  const recoilM = block.match(/recoil:\s*\[(\d+),\s*(\d+)\]/);
  const healM   = block.match(/heal:\s*\[(\d+),\s*(\d+)\]/);
  const flagsM  = block.match(/flags:\s*\{([^}]*)\}/);
  const flags   = flagsM ? flagsM[1].replace(/\s/g,'') : '';

  moveEntries.push([
    id, name, TRANS_ES.moves[id] || null, type, cat,
    getNum(block,'basePower')||0,
    getNum(block,'accuracy')||100,
    getNum(block,'pp')||0,
    getNum(block,'priority')||0,
    flags, sec,
    drainM  ? `[${drainM[1]},${drainM[2]}]`  : null,
    recoilM ? `[${recoilM[1]},${recoilM[2]}]` : null,
    healM   ? `[${healM[1]},${healM[2]}]`     : null,
    getNum(block,'critRatio')||1,
    block.includes('isZ:') ? 1 : 0,
    block.includes('isMax:') ? 1 : 0,
  ]);
}
insertMoveMany(moveEntries);
console.log(`  ✓ ${moveEntries.length} movimientos insertados`);

// ── HABILIDADES ──────────────────────────────────────────
console.log('✨ Importando habilidades...');
const abilRaw    = readData('abilities');
const abilBlocks = parseBlocks(abilRaw);
const insertAbil = db.prepare(`INSERT OR IGNORE INTO abilities (id,name,name_es,rating,description) VALUES (?,?,?,?,?)`); 
const insertAbilMany = db.transaction(entries => { for (const e of entries) insertAbil.run(...e); });
const abilEntries = [];
for (const [id, block] of Object.entries(abilBlocks)) {
  const name = get(block,'name'); if (!name) continue;
  const nonst = get(block,'isNonstandard');
  if (nonst && ['CAP','Custom'].includes(nonst)) continue;
  abilEntries.push([id, name, TRANS_ES.abilities[id] || null, getFloat(block,'rating')||0, TRANS_DESC.abilities[id] || get(block,'shortDesc') || get(block,'desc') || null]);
}
insertAbilMany(abilEntries);
console.log(`  ✓ ${abilEntries.length} habilidades insertadas`);

// ── OBJETOS ──────────────────────────────────────────────
console.log('🎒 Importando objetos...');
const itemsRaw    = readData('items');
const itemBlocks  = parseBlocks(itemsRaw);
const insertItem  = db.prepare(`INSERT OR IGNORE INTO items (id,name,name_es,num,fling_power,description) VALUES (?,?,?,?,?,?)`);
const insertItemMany = db.transaction(entries => { for (const e of entries) insertItem.run(...e); });
const itemEntries = [];
for (const [id, block] of Object.entries(itemBlocks)) {
  const name = get(block,'name'); if (!name) continue;
  const num = getNum(block,'num')||0;
  if (num < 0) continue;
  const nonst = get(block,'isNonstandard');
  if (nonst && ['LGPE','CAP','Custom','Unobtainable'].includes(nonst)) continue;
  const flingM = block.match(/fling:\s*\{[^}]*basePower:\s*(\d+)/);
  itemEntries.push([id, name, TRANS_ES.items[id] || null, num, flingM ? parseInt(flingM[1]) : 0, TRANS_DESC.items[id] || get(block,'shortDesc') || get(block,'desc') || null]);
}
insertItemMany(itemEntries);
console.log(`  ✓ ${itemEntries.length} objetos insertados`);

// ── LEARNSETS ────────────────────────────────────────────
console.log('📚 Importando learnsets...');
const learnRaw = readData('learnsets');
const insertLearn = db.prepare(`INSERT OR IGNORE INTO learnsets (pokemon_id, move_id, gen) VALUES (?,?,?)`);
const insertLearnMany = db.transaction(entries => { for (const e of entries) insertLearn.run(...e); });

const learnEntries = [];
// Parsear entradas del learnset: pokeid: { learnset: { moveid: ['9M', '8L1', ...] } }
for (const m of learnRaw.matchAll(/^\t(\w+):\s*\{[^}]*learnset:\s*\{([^}]+)\}/gms)) {
  const pokeid = m[1];
  const learnBlock = m[2];
  for (const ml of learnBlock.matchAll(/(\w+):\s*\[([^\]]+)\]/g)) {
    const moveid = ml[1];
    const gens = new Set();
    for (const g of ml[2].matchAll(/"(\d)/g)) gens.add(g[1]);
    for (const gen of gens) learnEntries.push([pokeid, moveid, gen]);
  }
}
// Insertar en chunks para no sobrepasar límites
const CHUNK = 5000;
for (let i = 0; i < learnEntries.length; i += CHUNK) {
  insertLearnMany(learnEntries.slice(i, i + CHUNK));
}
console.log(`  ✓ ${learnEntries.length} entradas de learnset insertadas`);

// ── TEAM DE EJEMPLO ──────────────────────────────────────
db.prepare(`
  INSERT INTO teams (name, format, export_code) VALUES (?, ?, ?)
`).run(
  'Equipo OU de ejemplo',
  'OU',
  `Garchomp @ Rocky Helmet\nAbility: Rough Skin\nEVs: 252 HP / 64 Def / 192 Spe\nImpish Nature\n- Stealth Rock\n- Earthquake\n- Dragon Tail\n- Fire Blast\n\nKingambit @ Leftovers\nAbility: Defiant\nEVs: 252 HP / 252 Atk / 4 Def\nAdamant Nature\n- Swords Dance\n- Iron Head\n- Sucker Punch\n- Kowtow Cleave`
);

db.close();
console.log('\n✅ Base de datos creada en src/db/pokehub.db');
console.log('   Ahora ejecuta: npm start');
