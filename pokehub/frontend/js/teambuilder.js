/* =========================================
   TEAMBUILDER.JS
   - 6 slots editables desde cero
   - Importar/Exportar formato Showdown
   - Modal solo se abre al pulsar el botón
   - Panel lateral: tabla tipos / info / ninguno
   ========================================= */

/* Backend API usado para todas las búsquedas */

/* ------ Estado del equipo ------ */
let TEAM = [];
for (let i = 0; i < 6; i++) {
  TEAM.push(emptySlot(i));
}

function emptySlot(idx) {
  return {
    idx,
    name_en: '', name_es: '', id: null, sprite: '', types: [],
    item: '', ability: '', nature: '',
    moves: ['', '', '', ''],
    evs: { hp:0, atk:0, def:0, spa:0, spd:0, spe:0 },
    ivs: { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 },
  };
}

const NATURES = [
  'Adamant','Bashful','Bold','Brave','Calm','Careful','Docile','Gentle',
  'Hardy','Hasty','Impish','Jolly','Lax','Lonely','Mild','Modest',
  'Naive','Naughty','Quiet','Quirky','Rash','Relaxed','Sassy','Serious','Timid'
];
const STAT_KEYS   = ['hp','atk','def','spa','spd','spe'];
const STAT_LABELS = { hp:'HP', atk:'Ataque', def:'Defensa', spa:'Atk.Esp', spd:'Def.Esp', spe:'Velocidad' };

const TYPE_COLORS_TB = {
  normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
  grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
  ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
  rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
  steel:'#B8B8D0', fairy:'#EE99AC'
};
const TYPE_ES_TB = {
  normal:'Normal', fire:'Fuego', water:'Agua', electric:'Eléctrico',
  grass:'Planta', ice:'Hielo', fighting:'Lucha', poison:'Veneno',
  ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
  rock:'Roca', ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro',
  steel:'Acero', fairy:'Hada'
};

/* ======================================================
   GRID DE SLOTS
   ====================================================== */
function renderGrid() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  grid.innerHTML = '';
  TEAM.forEach((slot, i) => {
    const div = document.createElement('div');
    div.className = 'team-slot' + (slot.id ? ' filled' : ' empty');
    div.dataset.idx = i;

    if (slot.id) {
      div.innerHTML = `
        <img class="slot-sprite" src="${slot.sprite}" alt="${slot.name_es}" />
        <div class="slot-info">
          <div class="slot-name">${slot.name_es || slot.name_en}</div>
          <div class="slot-sub">${slot.item || 'Sin objeto'}</div>
          <div class="slot-types">${slot.types.map(t =>
            `<span class="type-badge-sm" style="background:${TYPE_COLORS_TB[t]||'#888'}">${TYPE_ES_TB[t]||t}</span>`
          ).join('')}</div>
        </div>
        <button class="slot-remove" data-idx="${i}" title="Eliminar">✕</button>`;
    } else {
      div.innerHTML = `
        <div class="slot-empty-icon">+</div>
        <div class="slot-empty-text">Añadir Pokémon</div>`;
    }

    div.addEventListener('click', e => {
      if (e.target.classList.contains('slot-remove')) return;
      openEditor(i);
    });

    const removeBtn = div.querySelector('.slot-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        TEAM[i] = emptySlot(i);
        renderGrid();
        refreshTypePanelIfOpen();
        if (currentEditIdx === i) closeEditor();
      });
    }

    grid.appendChild(div);
  });
}

/* ======================================================
   EDITOR DE SLOT
   ====================================================== */
let currentEditIdx = null;

function openEditor(idx) {
  currentEditIdx = idx;
  // Marcar slot activo
  document.querySelectorAll('.team-slot').forEach(s => s.classList.remove('active-slot'));
  document.querySelector(`.team-slot[data-idx="${idx}"]`)?.classList.add('active-slot');

  const editor = document.getElementById('slot-editor');
  editor.classList.remove('hidden');
  buildEditor(idx);
  refreshTypePanelIfOpen();
  editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeEditor() {
  currentEditIdx = null;
  document.getElementById('slot-editor')?.classList.add('hidden');
  document.querySelectorAll('.team-slot').forEach(s => s.classList.remove('active-slot'));
  refreshTypePanelIfOpen();
}

function buildEditor(idx) {
  const slot   = TEAM[idx];
  const editor = document.getElementById('slot-editor');

  const evTotal = Object.values(slot.evs).reduce((a,b) => a+b, 0);

  editor.innerHTML = `
    <div class="editor-header">
      <h3 class="editor-title">Editando Slot ${idx + 1}${slot.name_es ? ' — ' + slot.name_es : ''}</h3>
      <button class="icon-btn" id="btn-close-editor" title="Cerrar">✕</button>
    </div>

    <div class="editor-section">
      <label class="editor-label">Pokémon</label>
      <div class="editor-poke-row">
        ${slot.sprite
          ? `<img class="editor-poke-sprite" src="${slot.sprite}" alt="${slot.name_es}" />`
          : `<div class="editor-poke-placeholder">?</div>`}
        <div class="editor-poke-search-wrap" style="flex:1;position:relative;">
          <input type="text" id="ed-poke-input" class="editor-input"
            placeholder="Busca en español o inglés..." value="${slot.name_es || slot.name_en}"
            autocomplete="off" />
          <div id="ed-poke-sugg" class="editor-suggestions"></div>
        </div>
      </div>
    </div>

    <div class="editor-row-3">
      <div class="editor-section" style="position:relative;">
        <label class="editor-label">Objeto</label>
        <input type="text" id="ed-item" class="editor-input" placeholder="Busca un objeto..." value="${slot.item}" autocomplete="off" />
        <div id="ed-item-sugg" class="editor-suggestions"></div>
      </div>
      <div class="editor-section" style="position:relative;">
        <label class="editor-label">Habilidad</label>
        <input type="text" id="ed-ability" class="editor-input" placeholder="Busca una habilidad..." value="${slot.ability}" autocomplete="off" />
        <div id="ed-ability-sugg" class="editor-suggestions"></div>
      </div>
      <div class="editor-section">
        <label class="editor-label">Nature</label>
        <select id="ed-nature" class="editor-select">
          <option value="">— Elige —</option>
          ${NATURES.map(n => `<option value="${n}"${slot.nature===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="editor-section">
      <label class="editor-label">Movimientos</label>
      <div class="editor-moves-grid">
        ${slot.moves.map((m, i) => `
          <div class="editor-move-wrap" style="position:relative;">
            <input type="text" id="ed-move-${i}" class="editor-input"
              placeholder="Movimiento ${i+1}" value="${m}" data-move="${i}" autocomplete="off" />
            <div id="ed-move-sugg-${i}" class="editor-suggestions editor-move-sugg"></div>
          </div>`).join('')}
      </div>
    </div>

    <div class="editor-section">
      <label class="editor-label">
        EVs
        <span id="ev-total-label" style="font-weight:400;color:var(--text-hint);font-size:11px;margin-left:6px;">(${evTotal}/510)</span>
      </label>
      <div class="editor-stats-grid">
        ${STAT_KEYS.map(k => `
          <div class="editor-stat-row">
            <label class="editor-stat-label">${STAT_LABELS[k]}</label>
            <input type="number" id="ev-${k}" class="editor-stat-input"
              min="0" max="252" step="4" value="${slot.evs[k]}"
              data-stat="${k}" data-type="ev" />
          </div>`).join('')}
      </div>
    </div>

    <div class="editor-section">
      <label class="editor-label">IVs</label>
      <div class="editor-stats-grid">
        ${STAT_KEYS.map(k => `
          <div class="editor-stat-row">
            <label class="editor-stat-label">${STAT_LABELS[k]}</label>
            <input type="number" id="iv-${k}" class="editor-stat-input"
              min="0" max="31" value="${slot.ivs[k]}"
              data-stat="${k}" data-type="iv" />
          </div>`).join('')}
      </div>
    </div>

    <div class="editor-actions">
      <button class="btn-secondary" id="btn-close-editor-2">Cerrar editor</button>
    </div>`;

  /* ---- Eventos del editor ---- */

  // Cerrar
  document.getElementById('btn-close-editor').addEventListener('click', closeEditor);
  document.getElementById('btn-close-editor-2').addEventListener('click', closeEditor);

  // Buscar Pokémon
  let searchTimer;
  document.getElementById('ed-poke-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchPokeInEditor(e.target.value, idx), 300);
  });

  // Objeto → búsqueda en vivo
  let itemTimer;
  document.getElementById('ed-item').addEventListener('input', e => {
    clearTimeout(itemTimer);
    itemTimer = setTimeout(() => searchItemInEditor(e.target.value, idx), 300);
  });
  document.getElementById('ed-item').addEventListener('blur', e => {
    setTimeout(() => {
      TEAM[idx].item = e.target.value;
      refreshSlotMini(idx);
      const s = document.getElementById('ed-item-sugg');
      if(s) s.innerHTML = '';
    }, 200);
  });

  // Habilidad → búsqueda en vivo
  let abilTimer;
  document.getElementById('ed-ability').addEventListener('input', e => {
    clearTimeout(abilTimer);
    abilTimer = setTimeout(() => searchAbilityInEditor(e.target.value, idx), 300);
  });
  document.getElementById('ed-ability').addEventListener('blur', e => {
    setTimeout(() => {
      TEAM[idx].ability = e.target.value;
      const s = document.getElementById('ed-ability-sugg');
      if(s) s.innerHTML = '';
    }, 200);
  });

  // Nature
  document.getElementById('ed-nature').addEventListener('change', e => { TEAM[idx].nature = e.target.value; });

  // Movimientos → búsqueda en vivo con mini resumen
  for (let mi = 0; mi < 4; mi++) {
    let moveTimer;
    const moveInp = document.getElementById(`ed-move-${mi}`);
    if (!moveInp) continue;
    moveInp.addEventListener('input', e => {
      clearTimeout(moveTimer);
      const mIdx = mi;
      moveTimer = setTimeout(() => searchMoveInEditor(e.target.value, idx, mIdx), 300);
    });
    moveInp.addEventListener('blur', e => {
      setTimeout(() => {
        TEAM[idx].moves[mi] = e.target.value;
        const s = document.getElementById(`ed-move-sugg-${mi}`);
        if(s) s.innerHTML = '';
      }, 200);
    });
  }

  // EVs e IVs
  document.querySelectorAll('.editor-stat-input').forEach(inp => {
    inp.addEventListener('input', e => {
      const type = e.target.dataset.type;
      const stat = e.target.dataset.stat;
      const max  = type === 'ev' ? 252 : 31;
      const val  = Math.max(0, Math.min(max, parseInt(e.target.value) || 0));
      TEAM[idx][type + 's'][stat] = val;
      e.target.value = val;

      if (type === 'ev') {
        const total = Object.values(TEAM[idx].evs).reduce((a,b) => a+b, 0);
        const lbl = document.getElementById('ev-total-label');
        if (lbl) {
          lbl.textContent = `(${total}/510)`;
          lbl.style.color = total > 510 ? 'var(--danger)' : 'var(--text-hint)';
        }
      }
    });
  });
}

/* ------ Búsqueda de Pokémon en el editor ------ */
async function searchPokeInEditor(query, slotIdx) {
  const sugg = document.getElementById('ed-poke-sugg');
  if (!sugg) return;
  if (!query || query.length < 2) { sugg.innerHTML = ''; return; }

  sugg.innerHTML = '<div style="padding:6px 12px;font-size:12px;color:var(--text-hint);">Buscando...</div>';

  try {
    // Usar backend
    const res  = await fetch(`/api/pokemon?q=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    const results = data.results || [];

    if (!results.length) { sugg.innerHTML = '<div style="padding:6px 12px;font-size:12px;color:var(--text-hint);">Sin resultados</div>'; return; }

    sugg.innerHTML = results.map(p =>
      `<button class="editor-sugg-item" data-en="${p.id}" data-id="${p.num}" data-name="${p.name}" data-es="${p.name_es || p.name}">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png"
             class="editor-sugg-sprite" alt="" onerror="this.style.display='none'" />
        <span class="sug-names">
          <span class="sug-name-es">${p.name_es || p.name}</span>
          <span class="sug-name-en">${p.name || p.id}</span>
        </span>
        ${p.tier ? `<span style="font-size:10px;color:#4a6cf7;font-weight:700;margin-left:auto">${p.tier}</span>` : ''}
      </button>`
    ).join('');

    sugg.querySelectorAll('.editor-sugg-item').forEach(btn => {
      btn.addEventListener('click', () => {
        sugg.innerHTML = '';
        selectPokemonFromBackend(btn.dataset.en, parseInt(btn.dataset.id), btn.dataset.es || btn.dataset.name, slotIdx);
      });
    });
  } catch(e) {
    // Fallback a datos estáticos
    const normFn = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const nq = normFn(query);
    const all = Object.values(window.SD_POKEMON || {});
    const results = all.filter(p => normFn(p.name).includes(nq) || normFn(p.id).includes(nq))
      .sort((a,b) => normFn(a.name).startsWith(nq)?-1:1).slice(0,8);
    if (!results.length) { sugg.innerHTML = '<div style="padding:6px 12px;font-size:12px;color:var(--text-hint);">Sin resultados</div>'; return; }
    sugg.innerHTML = results.map(p =>
      `<button class="editor-sugg-item" data-en="${p.id}" data-id="${p.num}" data-name="${p.name}" data-es="${window.PH_API?.helpers?.getNameEs?.('pokemon', p.id, p.name) || p.name}">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png"
             class="editor-sugg-sprite" alt="" onerror="this.style.display='none'" />
        <span class="sug-names">
          <span class="sug-name-es">${window.PH_API?.helpers?.getNameEs?.('pokemon', p.id, p.name) || p.name}</span>
          <span class="sug-name-en">${p.name || p.id}</span>
        </span>
      </button>`
    ).join('');
    sugg.querySelectorAll('.editor-sugg-item').forEach(btn => {
      btn.addEventListener('click', () => {
        sugg.innerHTML = '';
        selectPokemonFromBackend(btn.dataset.en, parseInt(btn.dataset.id), btn.dataset.es || btn.dataset.name, slotIdx);
      });
    });
  }
}

async function selectPokemonFromBackend(nameEn, id, nameEs, slotIdx) {
  try {
    // Cargar datos completos del backend
    let pData;
    try {
      const res = await fetch(`/api/pokemon/${nameEn}`);
      pData = await res.json();
    } catch {
      // Fallback a datos estáticos
      const sdp = (window.SD_POKEMON||{})[nameEn] || {};
      pData = { id: nameEn, num: id, name: nameEs || nameEn,
        type1: sdp.types?.[0], type2: sdp.types?.[1],
        ability1: sdp.abilities?.[0] };
    }

    TEAM[slotIdx].name_en  = pData.id || nameEn;
    TEAM[slotIdx].name_es  = pData.name || nameEs;
    TEAM[slotIdx].id       = pData.num || id;
    TEAM[slotIdx].sprite   = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pData.num||id}.png`;
    TEAM[slotIdx].types    = [pData.type1, pData.type2].filter(Boolean);
    if (!TEAM[slotIdx].ability && pData.ability1) TEAM[slotIdx].ability = pData.ability1;

    renderGrid();
    openEditor(slotIdx);
    refreshTypePanelIfOpen();
  } catch(e) { console.error('Error al seleccionar Pokémon:', e); }
}

// Mantener alias por si se llama desde otros sitios
async function selectPokemon(nameEn, id, slotIdx) {
  await selectPokemonFromBackend(nameEn, id, nameEn, slotIdx);
}

function refreshSlotMini(idx) {
  const slotEl = document.querySelector(`.team-slot[data-idx="${idx}"] .slot-sub`);
  if (slotEl) slotEl.textContent = TEAM[idx].item || 'Sin objeto';
}

/* ======================================================
   BÚSQUEDA EN EDITOR: OBJETO, HABILIDAD, MOVIMIENTO
   ====================================================== */

const TYPE_COLORS_MOVE = {
  normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
  grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
  ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
  rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
  steel:'#B8B8D0', fairy:'#EE99AC'
};
const TYPE_ES_MOVE = {
  normal:'Normal', fire:'Fuego', water:'Agua', electric:'Eléctrico',
  grass:'Planta', ice:'Hielo', fighting:'Lucha', poison:'Veneno',
  ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
  rock:'Roca', ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro',
  steel:'Acero', fairy:'Hada'
};
const CAT_ES_TB = { physical:'Físico', special:'Especial', status:'Estado' };
function getCatSprite(cat) {
  const api = window.POKE_SEARCH_API;
  if (api && api.CAT_SPRITE && api.CAT_SPRITE[cat]) {
    return `<img class="sug-cat-sprite" src="${api.CAT_SPRITE[cat]}" alt="${api.CAT_ES[cat]||cat}" title="${api.CAT_ES[cat]||cat}" />`;
  }
  // fallback si aún no cargó el API
  const icons = { physical:'⚔️', special:'🔮', status:'💤' };
  return `<span>${icons[cat]||''}</span>`;
}

function normTB(str) {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
}

/* Búsqueda en backend con fallback estático */
async function tbBackendSearch(endpoint, q) {
  const url = `${endpoint}?q=${encodeURIComponent(q)}&limit=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return (await res.json()).results || [];
}

/* Fallback estático normalizado */
function tbStaticSearch(type, query) {
  const nq = normTB(query);
  if (type === 'items') {
    return Object.values(window.SD_ITEMS||{})
      .filter(i => normTB(i.name||'').includes(nq) || normTB(i.id||'').includes(nq))
      .slice(0,8).map(i => ({ id: i.id, name: i.name, num: i.num }));
  }
  if (type === 'moves') {
    return Object.values(window.SD_MOVES||{})
      .filter(m => normTB(m.name||'').includes(nq) || normTB(m.id||'').includes(nq))
      .slice(0,8).map(m => ({ id: m.id, name: m.name, type: m.type, category: m.category, power: m.power, accuracy: m.accuracy, pp: m.pp }));
  }
  if (type === 'abilities') {
    const abilitiesMap = (window.TRANSLATIONS_ES && window.TRANSLATIONS_ES.abilities) || {};
    const allIds = Object.keys(abilitiesMap);
    return allIds
      .filter(id => {
        const raw = abilitiesMap[id];
        const es = Array.isArray(raw) ? (raw[0] || raw[1] || id) : raw;
        const en = Array.isArray(raw) ? (raw[1] || raw[0] || id) : raw;
        return normTB(es).includes(nq) || normTB(en).includes(nq) || normTB(id).includes(nq);
      })
      .slice(0, 8)
      .map(id => {
        const raw = abilitiesMap[id];
        return { id, name: Array.isArray(raw) ? (raw[0] || raw[1] || id) : raw };
      });
  }
  return [];
}

function renderEditorSugg(container, results, onSelect, renderItem) {
  if (!results.length) { container.innerHTML = '<div class="ed-sugg-empty">Sin resultados</div>'; return; }
  container.innerHTML = results.map((r, i) => renderItem(r, i)).join('');
  container.querySelectorAll('.ed-sugg-btn').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      onSelect(btn.dataset.name, btn.dataset.es || btn.dataset.name);
    });
  });
}

/* --- OBJETO --- */
async function searchItemInEditor(query, slotIdx) {
  const sugg = document.getElementById('ed-item-sugg');
  if (!sugg) return;
  if (!query || query.length < 2) { sugg.innerHTML = ''; return; }

  let results;
  try {
    results = await tbBackendSearch('/api/items', query);
    results = results.map(r => ({ id: r.id, name: r.name, name_es: r.name_es || r.name, num: r.num }));
  } catch { results = tbStaticSearch('items', query); }

  if (!results.length) { sugg.innerHTML = '<div class="ed-sugg-empty">Sin resultados</div>'; return; }

  sugg.innerHTML = results.map(r =>
    `<button class="ed-sugg-btn" data-name="${r.id}" data-es="${r.name_es || r.name}">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${r.id}.png"
           class="ed-sugg-item-sprite" alt="" onerror="this.style.display='none'" />
      <span class="sug-names">
        <span class="sug-name-es">${r.name_es || r.name}</span>
        <span class="sug-name-en">${r.name || r.id}</span>
      </span>
    </button>`
  ).join('');

  sugg.querySelectorAll('.ed-sugg-btn').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      document.getElementById('ed-item').value = btn.dataset.es || btn.dataset.name;
      TEAM[slotIdx].item = btn.dataset.es || btn.dataset.name;
      refreshSlotMini(slotIdx);
      sugg.innerHTML = '';
    });
  });
}

/* --- HABILIDAD --- */
async function searchAbilityInEditor(query, slotIdx) {
  const sugg = document.getElementById('ed-ability-sugg');
  if (!sugg) return;
  if (!query || query.length < 2) { sugg.innerHTML = ''; return; }

  let results;
  try {
    results = await tbBackendSearch('/api/abilities', query);
    results = results.map(r => ({ id: r.id, name: r.name, name_es: r.name_es || r.name, rating: r.rating }));
  } catch { results = tbStaticSearch('abilities', query); }

  if (!results.length) { sugg.innerHTML = '<div class="ed-sugg-empty">Sin resultados</div>'; return; }

  sugg.innerHTML = results.map(r =>
    `<button class="ed-sugg-btn" data-name="${r.id}" data-es="${r.name_es || r.name}">
      <span class="ed-sugg-icon" style="font-size:16px">✨</span>
      <span class="sug-names">
        <span class="sug-name-es">${r.name_es || r.name}</span>
        <span class="sug-name-en">${r.name || r.id}</span>
      </span>
      ${r.rating ? `<span style="font-size:10px;color:#4a6cf7;font-weight:700;margin-left:auto">★${r.rating}</span>` : ''}
    </button>`
  ).join('');

  sugg.querySelectorAll('.ed-sugg-btn').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      document.getElementById('ed-ability').value = btn.dataset.es || btn.dataset.name;
      TEAM[slotIdx].ability = btn.dataset.es || btn.dataset.name;
      sugg.innerHTML = '';
    });
  });
}

/* --- MOVIMIENTO con mini resumen --- */
async function searchMoveInEditor(query, slotIdx, moveIdx) {
  const sugg = document.getElementById(`ed-move-sugg-${moveIdx}`);
  if (!sugg) return;
  if (!query || query.length < 2) { sugg.innerHTML = ''; return; }

  sugg.innerHTML = '<div class="ed-sugg-loading">Buscando...</div>';

  let results;
  try {
    results = await tbBackendSearch('/api/moves', query);
  } catch {
    results = tbStaticSearch('moves', query);
  }

  if (!results.length) { sugg.innerHTML = '<div class="ed-sugg-empty">Sin resultados</div>'; return; }

  sugg.innerHTML = results.map(d => {
    const tc  = TYPE_COLORS_MOVE[d.type] || '#888';
    const te  = TYPE_ES_MOVE[d.type] || d.type;
    const catSprite = getCatSprite(d.category || d.cat || '');
    const pow = d.power || '—';
    const acc = d.accuracy ? d.accuracy + '%' : '—';

    // efecto secundario desde datos del backend
    let secText = '';
    if (d.secondary?.chance) {
      if (d.secondary.statusEs)    secText = `${d.secondary.chance}% ${d.secondary.statusEs}`;
      else if (d.secondary.volatileEs) secText = `${d.secondary.chance}% ${d.secondary.volatileEs}`;
    }
    if (d.drain)  secText = `Drena ${Math.round(d.drain[0]/d.drain[1]*100)}%`;
    if (d.recoil) secText = `${Math.round(d.recoil[0]/d.recoil[1]*100)}% retroceso`;

    return `<button class="ed-sugg-btn ed-sugg-move" data-name="${d.id}" data-es="${d.name}">
      <div class="ed-move-top">
        <span class="ed-move-name">${d.name}</span>
        <span class="ed-move-badges">
          ${d.type ? `<span class="ed-type-badge" style="background:${tc}">${te}</span>` : ''}
          ${catSprite}
        </span>
      </div>
      <div class="ed-move-stats">
        <span title="Potencia">⚡ ${pow}</span>
        <span title="Precisión">🎯 ${acc}</span>
        <span title="PP">PP ${d.pp ?? '—'}</span>
      </div>
      ${secText ? `<div class="ed-move-effect">${secText}</div>` : ''}
    </button>`;
  }).join('');

  sugg.querySelectorAll('.ed-sugg-move').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const nameEs = btn.dataset.es;
      const moveInput = document.getElementById(`ed-move-${moveIdx}`);
      if (moveInput) moveInput.value = nameEs;
      TEAM[slotIdx].moves[moveIdx] = nameEs;
      sugg.innerHTML = '';
    });
  });
}

/* ======================================================
   PANEL LATERAL (Tabla de tipos, etc.)
   ====================================================== */
let activeSidePanel = 'none';

function setSidePanel(panel) {
  activeSidePanel = panel;
  document.querySelectorAll('.side-panel-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.panel === panel));
  const content = document.getElementById('side-panel-content');
  if (!content) return;
  if (panel === 'none')     { content.innerHTML = ''; return; }
  if (panel === 'types')    { renderTypeChart(content); return; }
  if (panel === 'moves')    { content.innerHTML = '<div class="panel-hint">Usa la pestaña 💥 Movimientos del Glosario para buscar movimientos en detalle.</div>'; return; }
  if (panel === 'abilities'){ content.innerHTML = '<div class="panel-hint">Usa la pestaña ✨ Habilidades del Glosario para buscar habilidades en detalle.</div>'; return; }
}

/* Tabla de tipos 18x18 */
const CHART = {
  normal:{rock:.5,ghost:0,steel:.5},
  fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},
  water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},
  electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
  grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},
  ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},
  fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},
  poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},
  ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},
  flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},
  psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},
  bug:{fire:.5,grass:2,fighting:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},
  rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},
  ghost:{normal:0,psychic:2,ghost:2,dark:.5},
  dragon:{dragon:2,steel:.5,fairy:0},
  dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},
  steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},
  fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}
};
const TYPES18 = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
const TSHORT  = {normal:'NOR',fire:'FUE',water:'AGU',electric:'ELE',grass:'PLT',ice:'HIE',fighting:'LCH',poison:'VEN',ground:'TIE',flying:'VOL',psychic:'PSI',bug:'BIC',rock:'ROC',ghost:'FAN',dragon:'DRA',dark:'SIN',steel:'ACE',fairy:'HAD'};
const TYPE_PANEL_STATE = {
  mode: 'defense',
  defenseTypes: ['water'],
  attackType: 'ground',
  hoverAttack: null,
  hoverDefense: null,
};

function getTypeMultiplier(moveType, defendTypes) {
  let eff = 1;
  for (const defType of defendTypes) {
    eff *= (CHART[moveType] || {})[defType] ?? 1;
  }
  return eff;
}

function multiplierLabel(multiplier) {
  if (multiplier === 4) return '4x';
  if (multiplier === 2) return '2x';
  if (multiplier === 1) return '1x';
  if (multiplier === 0.5) return '1/2x';
  if (multiplier === 0.25) return '1/4x';
  if (multiplier === 0) return '0x';
  return `${multiplier}x`;
}

function multiplierClass(multiplier) {
  if (multiplier >= 4) return 'is-quad';
  if (multiplier >= 2) return 'is-weak';
  if (multiplier === 1) return 'is-neutral';
  if (multiplier === 0.5) return 'is-resist';
  if (multiplier === 0.25) return 'is-double-resist';
  if (multiplier === 0) return 'is-immune';
  return 'is-neutral';
}

function typeLabel(type) {
  return TYPE_ES_TB[type] || type;
}

function formatTypeCombo(types) {
  return types.map(typeLabel).join(' / ');
}

function setTypePanelMode(mode) {
  TYPE_PANEL_STATE.mode = mode;
  TYPE_PANEL_STATE.hoverAttack = null;
  TYPE_PANEL_STATE.hoverDefense = null;
  refreshTypePanelIfOpen();
}

function toggleDefenseType(type) {
  const selected = [...TYPE_PANEL_STATE.defenseTypes];
  const idx = selected.indexOf(type);

  if (idx >= 0) {
    if (selected.length === 1) {
      TYPE_PANEL_STATE.defenseTypes = [type];
    } else {
      selected.splice(idx, 1);
      TYPE_PANEL_STATE.defenseTypes = selected;
    }
  } else if (selected.length >= 2) {
    TYPE_PANEL_STATE.defenseTypes = [selected[0], type];
  } else {
    TYPE_PANEL_STATE.defenseTypes = [...selected, type];
  }

  TYPE_PANEL_STATE.hoverAttack = null;
  TYPE_PANEL_STATE.hoverDefense = type;
  refreshTypePanelIfOpen();
}

function setAttackType(type) {
  TYPE_PANEL_STATE.attackType = type;
  TYPE_PANEL_STATE.hoverAttack = type;
  TYPE_PANEL_STATE.hoverDefense = null;
  refreshTypePanelIfOpen();
}

function useCurrentSlotTypes() {
  if (currentEditIdx === null) return;
  const slot = TEAM[currentEditIdx];
  if (!slot?.types?.length) return;
  TYPE_PANEL_STATE.defenseTypes = slot.types.slice(0, 2);
  TYPE_PANEL_STATE.mode = 'defense';
  TYPE_PANEL_STATE.hoverAttack = null;
  TYPE_PANEL_STATE.hoverDefense = null;
  refreshTypePanelIfOpen();
}

function getDefenseSummary(types) {
  const summary = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
  TYPES18.forEach(attackType => {
    const mult = getTypeMultiplier(attackType, types);
    summary[mult].push(attackType);
  });
  return summary;
}

function getAttackSummary(attackType) {
  const summary = { 2: [], 1: [], 0.5: [], 0: [] };
  TYPES18.forEach(defendType => {
    const mult = getTypeMultiplier(attackType, [defendType]);
    summary[mult].push(defendType);
  });
  return summary;
}

function renderTypeChip(type, extraClass = '') {
  return `<button class="type-pill ${extraClass}" data-type="${type}" style="--type-color:${TYPE_COLORS_TB[type] || '#888'}">
    <span class="type-pill-label">${typeLabel(type)}</span>
  </button>`;
}

function buildTypePanelTable() {
  let h = '<div class="type-chart-wrap"><table class="type-table"><thead><tr><th class="tc-corner">ATK / DEF</th>';
  TYPES18.forEach(type => {
    const isDefenseSelected = TYPE_PANEL_STATE.defenseTypes.includes(type);
    const isHoverDefense = TYPE_PANEL_STATE.hoverDefense === type;
    h += `<th class="tc-th ${isDefenseSelected ? 'selected-axis' : ''} ${isHoverDefense ? 'hover-axis' : ''}" data-axis="defense" data-type="${type}" style="background:${TYPE_COLORS_TB[type]}">${TSHORT[type]}</th>`;
  });
  h += '</tr></thead><tbody>';

  TYPES18.forEach(attackType => {
    const isAttackSelected = TYPE_PANEL_STATE.attackType === attackType;
    const isHoverAttack = TYPE_PANEL_STATE.hoverAttack === attackType;
    h += `<tr><td class="tc-th ${isAttackSelected ? 'selected-axis' : ''} ${isHoverAttack ? 'hover-axis' : ''}" data-axis="attack" data-type="${attackType}" style="background:${TYPE_COLORS_TB[attackType]}">${TSHORT[attackType]}</td>`;

    TYPES18.forEach(defendType => {
      const mult = getTypeMultiplier(attackType, [defendType]);
      const cls = mult === 2 ? 'tc-super' : mult === 0.5 ? 'tc-half' : mult === 0 ? 'tc-zero' : 'tc-normal';
      const label = mult === 2 ? '2x' : mult === 0.5 ? '1/2' : mult === 0 ? '0' : '.';
      const isSelectedCell =
        TYPE_PANEL_STATE.mode === 'defense'
          ? TYPE_PANEL_STATE.defenseTypes.includes(defendType) && TYPE_PANEL_STATE.hoverAttack === attackType
          : TYPE_PANEL_STATE.attackType === attackType && TYPE_PANEL_STATE.hoverDefense === defendType;
      h += `<td class="tc-cell ${cls} ${isSelectedCell ? 'active-cell' : ''}" data-attack="${attackType}" data-defense="${defendType}">${label}</td>`;
    });

    h += '</tr>';
  });

  h += '</tbody></table></div>';
  return h;
}

function buildTypePanelInspector() {
  if (TYPE_PANEL_STATE.mode === 'defense') {
    const defendTypes = TYPE_PANEL_STATE.defenseTypes;
    const hoveredAttack = TYPE_PANEL_STATE.hoverAttack || TYPE_PANEL_STATE.attackType;
    const mult = getTypeMultiplier(hoveredAttack, defendTypes);
    return `
      <div class="type-inspector">
        <div class="type-inspector-label">Lectura rapida</div>
        <div class="type-inspector-main">
          <span>${typeLabel(hoveredAttack)} ataca a ${formatTypeCombo(defendTypes)}</span>
          <strong class="${multiplierClass(mult)}">${multiplierLabel(mult)}</strong>
        </div>
      </div>`;
  }

  const hoveredDefense = TYPE_PANEL_STATE.hoverDefense || TYPE_PANEL_STATE.defenseTypes[0];
  const mult = getTypeMultiplier(TYPE_PANEL_STATE.attackType, [hoveredDefense]);
  return `
    <div class="type-inspector">
      <div class="type-inspector-label">Lectura rapida</div>
      <div class="type-inspector-main">
        <span>${typeLabel(TYPE_PANEL_STATE.attackType)} golpea a ${typeLabel(hoveredDefense)}</span>
        <strong class="${multiplierClass(mult)}">${multiplierLabel(mult)}</strong>
      </div>
    </div>`;
}

function buildDefenseSummary() {
  const defendTypes = TYPE_PANEL_STATE.defenseTypes;
  const summary = getDefenseSummary(defendTypes);
  const groups = [
    { key: 4, title: 'Debilidad x4' },
    { key: 2, title: 'Debilidad x2' },
    { key: 0.5, title: 'Resistencia x1/2' },
    { key: 0.25, title: 'Resistencia x1/4' },
    { key: 0, title: 'Inmunidad' },
  ];

  return `
    <div class="type-summary-block">
      <div class="type-summary-title">Defensivo: ${formatTypeCombo(defendTypes)}</div>
      <div class="type-summary-groups">
        ${groups.map(group => `
          <div class="type-summary-group">
            <div class="type-summary-label">${group.title}</div>
            <div class="type-summary-chips">
              ${summary[group.key].length
                ? summary[group.key].map(type => renderTypeChip(type, `compact ${multiplierClass(group.key)}`)).join('')
                : '<span class="type-summary-empty">Ninguna</span>'}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function buildAttackSummary() {
  const attackType = TYPE_PANEL_STATE.attackType;
  const summary = getAttackSummary(attackType);
  const groups = [
    { key: 2, title: 'Golpea fuerte' },
    { key: 1, title: 'Neutro' },
    { key: 0.5, title: 'Resistido' },
    { key: 0, title: 'No afecta' },
  ];

  return `
    <div class="type-summary-block">
      <div class="type-summary-title">Ofensivo: ${typeLabel(attackType)}</div>
      <div class="type-summary-groups">
        ${groups.map(group => `
          <div class="type-summary-group">
            <div class="type-summary-label">${group.title}</div>
            <div class="type-summary-chips">
              ${summary[group.key].length
                ? summary[group.key].map(type => renderTypeChip(type, `compact ${multiplierClass(group.key)}`)).join('')
                : '<span class="type-summary-empty">Ninguno</span>'}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function bindTypePanelEvents(container) {
  container.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => setTypePanelMode(btn.dataset.mode));
  });

  container.querySelectorAll('.type-pill.selector').forEach(btn => {
    btn.addEventListener('click', () => {
      if (TYPE_PANEL_STATE.mode === 'defense') toggleDefenseType(btn.dataset.type);
      else setAttackType(btn.dataset.type);
    });
  });

  container.querySelector('[data-action="use-current-slot"]')?.addEventListener('click', useCurrentSlotTypes);

  container.querySelectorAll('[data-axis="attack"]').forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      TYPE_PANEL_STATE.hoverAttack = cell.dataset.type;
      refreshTypePanelIfOpen();
    });
    cell.addEventListener('click', () => {
      if (TYPE_PANEL_STATE.mode === 'defense') {
        TYPE_PANEL_STATE.hoverAttack = cell.dataset.type;
        refreshTypePanelIfOpen();
      } else {
        setAttackType(cell.dataset.type);
      }
    });
  });

  container.querySelectorAll('[data-axis="defense"]').forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      TYPE_PANEL_STATE.hoverDefense = cell.dataset.type;
      refreshTypePanelIfOpen();
    });
    cell.addEventListener('click', () => {
      if (TYPE_PANEL_STATE.mode === 'defense') {
        toggleDefenseType(cell.dataset.type);
      } else {
        TYPE_PANEL_STATE.hoverDefense = cell.dataset.type;
        refreshTypePanelIfOpen();
      }
    });
  });

  container.querySelectorAll('.tc-cell').forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      TYPE_PANEL_STATE.hoverAttack = cell.dataset.attack;
      TYPE_PANEL_STATE.hoverDefense = cell.dataset.defense;
      refreshTypePanelIfOpen();
    });
  });

  container.querySelector('.type-panel-shell')?.addEventListener('mouseleave', () => {
    TYPE_PANEL_STATE.hoverAttack = null;
    TYPE_PANEL_STATE.hoverDefense = null;
    refreshTypePanelIfOpen();
  });
}

function refreshTypePanelIfOpen() {
  if (activeSidePanel !== 'types') return;
  const content = document.getElementById('side-panel-content');
  if (content) renderTypeChart(content);
}

function renderTypeChartLegacy(container) {
  let h = '<div class="type-chart-wrap"><table class="type-table"><thead><tr><th class="tc-corner">ATK↓ DEF→</th>';
  TYPES18.forEach(t => { h += `<th class="tc-th" style="background:${TYPE_COLORS_TB[t]}">${TSHORT[t]}</th>`; });
  h += '</tr></thead><tbody>';
  TYPES18.forEach(atk => {
    h += `<tr><td class="tc-th" style="background:${TYPE_COLORS_TB[atk]}">${TSHORT[atk]}</td>`;
    TYPES18.forEach(def => {
      const e = (CHART[atk]||{})[def] ?? 1;
      const cls = e===2?'tc-super':e===.5?'tc-half':e===0?'tc-zero':'tc-normal';
      const lbl = e===2?'2×':e===.5?'½':e===0?'0':'·';
      h += `<td class="tc-cell ${cls}">${lbl}</td>`;
    });
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  container.innerHTML = h;
}

function renderTypeChart(container) {
  const slot = currentEditIdx !== null ? TEAM[currentEditIdx] : null;
  const slotHasTypes = !!slot?.types?.length;
  const selectedDefense = TYPE_PANEL_STATE.defenseTypes;

  container.innerHTML = `
    <div class="type-panel-shell">
      <div class="type-panel-header">
        <div>
          <div class="type-panel-title">Tabla de tipos interactiva</div>
          <div class="type-panel-subtitle">Inspirada en PKMN.help, adaptada al sidebar del constructor.</div>
        </div>
        <div class="type-mode-switch">
          <button class="type-mode-btn ${TYPE_PANEL_STATE.mode === 'defense' ? 'active' : ''}" data-mode="defense">Defensa</button>
          <button class="type-mode-btn ${TYPE_PANEL_STATE.mode === 'offense' ? 'active' : ''}" data-mode="offense">Ataque</button>
        </div>
      </div>

      <div class="type-panel-focus">
        <div class="type-focus-label">${TYPE_PANEL_STATE.mode === 'defense' ? 'Tipos defensivos' : 'Tipo ofensivo'}</div>
        <div class="type-focus-selected">
          ${TYPE_PANEL_STATE.mode === 'defense'
            ? selectedDefense.map(type => renderTypeChip(type, 'selected')).join('')
            : renderTypeChip(TYPE_PANEL_STATE.attackType, 'selected')}
        </div>
        <div class="type-focus-actions">
          <button class="btn-secondary type-mini-btn" data-action="use-current-slot" ${slotHasTypes ? '' : 'disabled'}>Usar slot actual</button>
          ${slotHasTypes
            ? `<span class="type-focus-slot">Slot ${currentEditIdx + 1}: ${slot.name_es || slot.name_en}</span>`
            : '<span class="type-focus-slot">Abre un slot con Pokemon para sincronizar sus tipos.</span>'}
        </div>
      </div>

      <div class="type-selector-grid">
        ${TYPES18.map(type => {
          const selected = TYPE_PANEL_STATE.mode === 'defense'
            ? selectedDefense.includes(type)
            : TYPE_PANEL_STATE.attackType === type;
          return renderTypeChip(type, `selector ${selected ? 'selected' : ''}`);
        }).join('')}
      </div>

      ${buildTypePanelInspector()}
      ${buildTypePanelTable()}
      ${TYPE_PANEL_STATE.mode === 'defense' ? buildDefenseSummary() : buildAttackSummary()}
    </div>`;

  bindTypePanelEvents(container);
}

/* ======================================================
   EXPORT — formato Showdown
   ====================================================== */
function exportShowdown() {
  const blocks = [];
  TEAM.forEach(slot => {
    if (!slot.name_en) return;
    const lines = [];
    let line = slot.name_en;
    if (slot.item) line += ' @ ' + slot.item;
    lines.push(line);
    if (slot.ability) lines.push('Ability: ' + slot.ability);

    const evParts = STAT_KEYS.filter(k => slot.evs[k] > 0)
      .map(k => `${slot.evs[k]} ${k.toUpperCase()}`);
    if (evParts.length) lines.push('EVs: ' + evParts.join(' / '));

    if (slot.nature) lines.push(slot.nature + ' Nature');

    const ivParts = STAT_KEYS.filter(k => slot.ivs[k] !== 31)
      .map(k => `${slot.ivs[k]} ${k.toUpperCase()}`);
    if (ivParts.length) lines.push('IVs: ' + ivParts.join(' / '));

    slot.moves.forEach(m => { if (m) lines.push('- ' + m); });
    blocks.push(lines.join('\n'));
  });
  return blocks.join('\n\n');
}

/* ======================================================
   IMPORT — formato Showdown
   ====================================================== */
function importShowdown(text) {
  const blocks = text.trim().split(/\n\s*\n/);
  blocks.forEach((block, i) => {
    if (i >= 6) return;
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const slot = emptySlot(i);

    // Línea 1: Nombre @ Objeto
    const first = lines[0];
    if (first.includes(' @ ')) {
      const [p, item] = first.split(' @ ');
      slot.name_en = p.trim().toLowerCase().replace(/[ ]/g,'-');
      slot.item    = item.trim();
    } else {
      slot.name_en = first.trim().toLowerCase().replace(/[ ]/g,'-');
    }
    slot.name_es = slot.name_en;

    let moveIdx = 0;
    for (let j = 1; j < lines.length; j++) {
      const l = lines[j];
      if (l.startsWith('Ability:'))      slot.ability = l.replace('Ability:','').trim();
      else if (l.startsWith('EVs:'))     parseStats(l.replace('EVs:',''), slot.evs);
      else if (l.startsWith('IVs:'))     parseStats(l.replace('IVs:',''), slot.ivs);
      else if (l.endsWith(' Nature'))    slot.nature = l.replace(' Nature','').trim();
      else if (l.startsWith('- '))       { if (moveIdx < 4) { slot.moves[moveIdx] = l.slice(2); moveIdx++; } }
    }

    TEAM[i] = slot;

    // Cargar datos del Pokémon en background
    if (slot.name_en) {
      fetch(`/api/pokemon/${slot.name_en}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          TEAM[i].id     = data.num;
          TEAM[i].sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.num}.png`;
          TEAM[i].types  = [data.type1, data.type2].filter(Boolean);
          TEAM[i].name_es = data.name || TEAM[i].name_es;
          renderGrid();
        })
        .catch(() => {});
    }
  });
  renderGrid();
}

function parseStats(str, target) {
  str.split('/').forEach(part => {
    const m = part.trim().match(/(\d+)\s+(\w+)/);
    if (m) {
      const k = m[2].toLowerCase();
      if (target[k] !== undefined) target[k] = parseInt(m[1]);
    }
  });
}

/* ======================================================
   MODAL
   ====================================================== */
let modalMode = null; // 'export' | 'import'

function openModal(mode) {
  modalMode = mode;
  const modal    = document.getElementById('io-modal');
  const title    = document.getElementById('io-title');
  const textarea = document.getElementById('io-textarea');
  const importBtn= document.getElementById('io-do-import');

  if (mode === 'export') {
    title.textContent   = 'Exportar equipo (formato Showdown)';
    textarea.value      = exportShowdown() || '(equipo vacío)';
    textarea.readOnly   = true;
    importBtn.style.display = 'none';
  } else {
    title.textContent   = 'Importar equipo desde Showdown';
    textarea.value      = '';
    textarea.readOnly   = false;
    textarea.placeholder= 'Pega aquí tu equipo en formato Showdown...';
    importBtn.style.display = '';
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('io-modal').classList.add('hidden');
  modalMode = null;
}

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();

  // Panel lateral
  document.querySelectorAll('.side-panel-btn').forEach(btn => {
    btn.addEventListener('click', () => setSidePanel(btn.dataset.panel));
  });

  // Botones Import / Export
  document.getElementById('tb-import-btn')?.addEventListener('click', () => openModal('import'));
  document.getElementById('tb-export-btn')?.addEventListener('click', () => openModal('export'));

  // Cerrar modal
  document.getElementById('io-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('io-modal-overlay')?.addEventListener('click', closeModal);

  // Copiar
  document.getElementById('io-copy-btn')?.addEventListener('click', () => {
    const ta = document.getElementById('io-textarea');
    navigator.clipboard.writeText(ta.value).then(() => {
      const btn = document.getElementById('io-copy-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ Copiado';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  });

  // Confirmar importación — SOLO al pulsar este botón
  document.getElementById('io-do-import')?.addEventListener('click', () => {
    const text = document.getElementById('io-textarea').value.trim();
    if (!text) return;
    importShowdown(text);
    closeModal();
  });
});
