/* =========================================
   API.JS - Cliente del backend PokéHub
   Todas las llamadas al servidor pasan por aquí.
   Si el backend no está disponible, cae al
   modo offline con SD_POKEMON/SD_MOVES/SD_ITEMS.
   ========================================= */

const API_BASE = '/api';

async function apiFetch(path, params = {}) {
  const url = new URL(API_BASE + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function getTranslationEntry(section, id) {
  return window.TRANSLATIONS_ES?.[section]?.[id] || null;
}

function getNameEs(section, id, fallback = '') {
  const entry = getTranslationEntry(section, id);
  if (!entry) return fallback;
  return Array.isArray(entry) ? (entry[0] || entry[1] || fallback) : entry;
}

function getNameEn(section, id, fallback = '') {
  const entry = getTranslationEntry(section, id);
  if (!entry) return fallback;
  return Array.isArray(entry) ? (entry[1] || entry[0] || fallback) : entry;
}

function buildOfflineAbilities() {
  const map = window.TRANSLATIONS_ES?.abilities || {};
  return Object.entries(map).map(([id, value]) => {
    const name_es = Array.isArray(value) ? (value[0] || value[1] || id) : value;
    const name = Array.isArray(value) ? (value[1] || value[0] || id) : value;
    const description = Array.isArray(value) ? (value[2] || '') : '';
    return { id, name, name_es, description, rating: 0 };
  });
}

async function apiSearchPokemon(q, { type = '', tier = '', limit = 12, offset = 0 } = {}) {
  try {
    return await apiFetch('/pokemon', { q, type, tier, limit, offset });
  } catch {
    const all = Object.values(window.SD_POKEMON || {});
    const nq = norm(q);
    const results = all
      .filter(p => {
        const nameEs = getNameEs('pokemon', p.id, p.name);
        return (
          (!nq || norm(p.name).includes(nq) || norm(p.id).includes(nq) || norm(nameEs).includes(nq)) &&
          (!type || p.types.includes(type)) &&
          (!tier || p.tier === tier)
        );
      })
      .slice(offset, offset + limit)
      .map(p => ({
        id: p.id,
        num: p.num,
        name: p.name,
        name_es: getNameEs('pokemon', p.id, p.name),
        type1: p.types?.[0] || null,
        type2: p.types?.[1] || null,
        tier: p.tier || null,
      }));
    return { total: results.length, results };
  }
}

async function apiGetPokemon(id) {
  try {
    return await apiFetch(`/pokemon/${id}`);
  } catch {
    const p = (window.SD_POKEMON || {})[id];
    if (!p) return null;
    return {
      id: p.id,
      num: p.num,
      name: p.name,
      name_es: getNameEs('pokemon', p.id, p.name),
      type1: p.types?.[0] || null,
      type2: p.types?.[1] || null,
      hp: p.baseStats?.hp || null,
      atk: p.baseStats?.atk || null,
      def: p.baseStats?.def || null,
      spa: p.baseStats?.spa || null,
      spd: p.baseStats?.spd || null,
      spe: p.baseStats?.spe || null,
      ability1: p.abilities?.[0] || null,
      ability2: p.abilities?.[1] || null,
      ability_h: p.abilities?.[2] || null,
      tier: p.tier || null,
      evos: p.evos || [],
      learnset: [],
    };
  }
}

async function apiSearchMoves(q, { type = '', category = '', limit = 12, offset = 0 } = {}) {
  try {
    return await apiFetch('/moves', { q, type, category, limit, offset });
  } catch {
    const all = Object.values(window.SD_MOVES || {});
    const nq = norm(q);
    const results = all
      .filter(m => {
        const nameEs = getNameEs('moves', m.id, m.name);
        return (
          (!nq || norm(m.name).includes(nq) || norm(m.id).includes(nq) || norm(nameEs).includes(nq)) &&
          (!type || m.type === type) &&
          (!category || m.category === category)
        );
      })
      .slice(offset, offset + limit)
      .map(m => ({
        id: m.id,
        name: m.name,
        name_es: getNameEs('moves', m.id, m.name),
        type: m.type,
        category: m.category,
        power: m.power,
        accuracy: m.accuracy,
        pp: m.pp,
        priority: m.priority || 0,
      }));
    return { total: results.length, results };
  }
}

async function apiGetMove(id) {
  try {
    return await apiFetch(`/moves/${id}`);
  } catch {
    const move = (window.SD_MOVES || {})[id];
    if (!move) return null;
    return {
      ...move,
      name_es: getNameEs('moves', move.id, move.name),
    };
  }
}

async function apiSearchAbilities(q, { limit = 12, offset = 0 } = {}) {
  try {
    return await apiFetch('/abilities', { q, limit, offset });
  } catch {
    const all = buildOfflineAbilities();
    const nq = norm(q);
    const results = all
      .filter(a => !nq || norm(a.name).includes(nq) || norm(a.id).includes(nq) || norm(a.name_es).includes(nq))
      .slice(offset, offset + limit);
    return { total: results.length, results };
  }
}

async function apiGetAbility(id) {
  try {
    return await apiFetch(`/abilities/${id}`);
  } catch {
    const ability = buildOfflineAbilities().find(a => a.id === id);
    return ability ? { ...ability, pokemon: [] } : null;
  }
}

async function apiSearchItems(q, { limit = 12, offset = 0 } = {}) {
  try {
    return await apiFetch('/items', { q, limit, offset });
  } catch {
    const all = Object.values(window.SD_ITEMS || {});
    const nq = norm(q);
    const results = all
      .filter(i => {
        const nameEs = getNameEs('items', i.id, i.name);
        return !nq || norm(i.name || '').includes(nq) || norm(i.id || '').includes(nq) || norm(nameEs).includes(nq);
      })
      .slice(offset, offset + limit)
      .map(i => ({
        ...i,
        name_es: getNameEs('items', i.id, i.name),
      }));
    return { total: results.length, results };
  }
}

async function apiGetItem(id) {
  try {
    return await apiFetch(`/items/${id}`);
  } catch {
    const item = (window.SD_ITEMS || {})[id];
    return item ? { ...item, name_es: getNameEs('items', item.id, item.name) } : null;
  }
}

async function apiGetTeams() {
  try { return await apiFetch('/teams'); }
  catch { return []; }
}

async function apiGetTeam(id) {
  try { return await apiFetch(`/teams/${id}`); }
  catch { return null; }
}

async function apiSaveTeam(name, format, export_code) {
  try {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, format, export_code }),
    });
    if (!res.ok) throw new Error('Error guardando equipo');
    return res.json();
  } catch (e) {
    console.warn('Backend no disponible, equipo no guardado en servidor:', e.message);
    return null;
  }
}

async function apiUpdateTeam(id, data) {
  try {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

async function apiDeleteTeam(id) {
  try {
    const res = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiStatus() {
  try { return await apiFetch('/status'); }
  catch { return null; }
}

window.PH_API = {
  pokemon:   { search: apiSearchPokemon,   get: apiGetPokemon },
  moves:     { search: apiSearchMoves,     get: apiGetMove },
  abilities: { search: apiSearchAbilities, get: apiGetAbility },
  items:     { search: apiSearchItems,     get: apiGetItem },
  teams:     { getAll: apiGetTeams, get: apiGetTeam, save: apiSaveTeam, update: apiUpdateTeam, delete: apiDeleteTeam },
  status:    apiStatus,
  helpers:   { norm, getNameEs, getNameEn },
};
