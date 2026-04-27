/* =========================================
   POKEDEX-SEARCH.JS
   Todas las búsquedas usan el backend API.
   Fallback a datos estáticos si el servidor
   no está disponible.
   Mismo diseño visual, datos completos.
   ========================================= */

const POKE_API_EXTERNAL = 'https://pokeapi.co/api/v2';

/* ── Sprites de categoría oficial ── */
const CAT_SPRITE = {
  physical: 'https://play.pokemonshowdown.com/sprites/categories/Physical.png',
  special:  'https://play.pokemonshowdown.com/sprites/categories/Special.png',
  status:   'https://play.pokemonshowdown.com/sprites/categories/Status.png',
};
const CAT_ES = { physical:'Físico', special:'Especial', status:'Estado' };

const TYPE_ES = {
  normal:'Normal', fire:'Fuego', water:'Agua', electric:'Eléctrico',
  grass:'Planta', ice:'Hielo', fighting:'Lucha', poison:'Veneno',
  ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
  rock:'Roca', ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro',
  steel:'Acero', fairy:'Hada'
};
const TYPE_COLORS = {
  normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
  grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
  ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
  rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
  steel:'#B8B8D0', fairy:'#EE99AC'
};

const TIER_COLORS = {
  'Uber':'#e84545','OU':'#4a6cf7','UUBL':'#6a4cf7','UU':'#2dc76d',
  'RUBL':'#22a05a','RU':'#f5a623','NUBL':'#d08010','NU':'#888888',
  'PUBL':'#666666','PU':'#999999','LC':'#cc44cc','NFE':'#aa88aa',
  'ZU':'#aaaaaa',
};

/* ── Normalización ── */
function norm(str) {
  return (str||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}

/* ── Llamada al backend con fallback a datos estáticos ── */
async function backendSearch(endpoint, params = {}) {
  const url = new URL(endpoint, window.location.origin);
  Object.entries(params).forEach(([k,v]) => { if (v !== '' && v !== undefined) url.searchParams.set(k, v); });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ── Fallback con datos estáticos ── */
function staticSearch(type, query, filters = {}) {
  const nq = norm(query);
  // Buscar también en translations ES
  const T = window.TRANSLATIONS_ES || {};
  if (type === 'pokemon') {
    const all = Object.values(window.SD_POKEMON || {});
    return all.filter(p => {
      const nameEs = T.pokemon?.[p.id]?.[0] || '';
      const nameEn = T.pokemon?.[p.id]?.[1] || p.name || '';
      return (norm(nameEs).includes(nq) || norm(nameEn).includes(nq)) &&
      (!filters.type || p.types?.includes(filters.type)) &&
      (!filters.tier || p.tier === filters.tier)
    }).sort((a,b) => a.num - b.num).slice(0, parseInt(filters.limit)||12)
    .map(p => ({ id: p.id, num: p.num, name: p.name, type1: p.types?.[0], type2: p.types?.[1], tier: p.tier,
      hp: p.baseStats?.hp, atk: p.baseStats?.atk, def: p.baseStats?.def,
      spa: p.baseStats?.spa, spd: p.baseStats?.spd, spe: p.baseStats?.spe,
      ability1: p.abilities?.[0], ability2: p.abilities?.[1], ability_h: p.abilities?.[2] }));
  }
  if (type === 'moves') {
    const all = Object.values(window.SD_MOVES || {});
    return all.filter(m =>
      (norm(m.name).includes(nq) || norm(m.id).includes(nq)) &&
      (!filters.type     || m.type === filters.type) &&
      (!filters.category || m.category === filters.category)
    ).slice(0, parseInt(filters.limit)||12);
  }
  if (type === 'abilities') {
    const all = Object.entries(window.TRANSLATIONS_ES?.abilities || {}).map(([id, value]) => ({
      id,
      name: Array.isArray(value) ? (value[1] || value[0] || id) : value,
      name_es: Array.isArray(value) ? (value[0] || value[1] || id) : value,
      description: Array.isArray(value) ? (value[2] || '') : '',
      rating: 0,
    }));
    return all.filter(a => norm(a.name || '').includes(nq) || norm(a.name_es || '').includes(nq) || norm(a.id).includes(nq)).slice(0, 12);
  }
  if (type === 'items') {
    const all = Object.values(window.SD_ITEMS || {});
    return all.filter(i => {
      const translated = window.PH_API?.helpers?.getNameEs?.('items', i.id, i.name) || '';
      return norm(i.name||'').includes(nq) || norm(i.id||'').includes(nq) || norm(translated).includes(nq);
    }).slice(0, 12).map(i => ({
      ...i,
      name_es: window.PH_API?.helpers?.getNameEs?.('items', i.id, i.name) || i.name,
    }));
  }
  return [];
}

/* ── UI helpers ── */
function setContent(el, html) { el.innerHTML = html; }
function showLoading(el) { setContent(el, `<div class="api-loading"><div class="api-spinner"></div><span>${window.t ? window.t('glossary.searching') : 'Buscando...'}</span></div>`); }
function showHint(el, msg) { setContent(el, `<div class="api-hint">${msg}</div>`); }
function showEmpty(el) { setContent(el, `<div class="api-empty">${window.t ? window.t('glossary.noResults') : 'Sin resultados.'}</div>`); }
function showError(el, msg) { setContent(el, `<div class="api-error">❌ ${msg}</div>`); }

function orderedNames(entry) {
  return window.getOrderedNames
    ? window.getOrderedNames(entry)
    : { primary: entry.name_es || entry.name || entry.id, secondary: entry.name || '' };
}

/* ── Botón volver ── */
function addBackButton(container, label, onBack) {
  const btn = document.createElement('button');
  btn.className = 'back-btn';
  btn.textContent = `← ${window.t ? window.t('common.back') : 'Volver'}${label ? ` "${label}"` : ''}`;
  btn.addEventListener('click', onBack);
  container.prepend(btn);
}

/* ── Sprite por tipo ── */
function getSpriteHtml(entry, entryType) {
  const num = entry.num || entry.id;
  if (entryType === 'pokemon' && num) {
    return `<img class="sug-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png" alt="" onerror="this.style.display='none'" />`;
  }
  if (entryType === 'items') {
    return `<img class="sug-sprite sug-sprite-item" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${entry.id}.png" alt="" onerror="this.style.display='none'" />`;
  }
  if (entryType === 'moves')     return '<span class="sug-icon">💥</span>';
  if (entryType === 'abilities') return '<span class="sug-icon">✨</span>';
  return '<span class="sug-icon">?</span>';
}

/* ── Renderizar lista de sugerencias ── */
function renderSuggestions(container, results, onSelect, entryType = 'pokemon') {
  if (!results.length) { showEmpty(container); return; }
  const items = results.map(r => {
    const sprite   = getSpriteHtml(r, entryType);
    const names = orderedNames(r);
    const tier     = r.tier ? `<span style="font-size:10px;color:${TIER_COLORS[r.tier]||'#888'};margin-left:auto;font-weight:700">${r.tier}</span>` : '';

    let typeBadges = '';
    if (entryType === 'moves' && r.type) {
      const tc = TYPE_COLORS[r.type]||'#888';
      const catSrc = CAT_SPRITE[r.category]||'';
      typeBadges = `<span style="display:flex;align-items:center;gap:4px;margin-left:auto">
        <span style="background:${tc};color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px">${TYPE_ES[r.type]||r.type}</span>
        ${catSrc ? `<img src="${catSrc}" style="height:14px">` : ''}
        ${r.power ? `<span style="font-size:10px;color:var(--text-hint)">${r.power}</span>` : ''}
      </span>`;
    }

    return `<button class="suggestion-item" data-id="${r.id}">
      ${sprite}
        <span class="sug-names">
        <span class="sug-name-es">${names.primary}</span>
        ${names.secondary && names.secondary !== names.primary ? `<span class="sug-name-en">${names.secondary}</span>` : ''}
      </span>
      ${tier}${typeBadges}
    </button>`;
  }).join('');
  setContent(container, `<div class="suggestion-list">${items}</div>`);
  container.querySelectorAll('.suggestion-item').forEach(btn => {
    btn.addEventListener('click', () => onSelect(btn.dataset.id, container));
  });
}

/* ==========================================
   POKÉMON — usa /api/pokemon
   ========================================== */
async function handlePokemonSearch(query, container) {
  if (!query || query.length < 2) { showHint(container, `${window.t ? window.t('glossary.searchHint') : 'Escribe al menos 2 letras.'} Ej: "pikac", "Drago", "char"`); return; }
  showLoading(container);
  try {
    const data = await backendSearch('/api/pokemon', { q: query, limit: 12 });
    const results = (data.results || []).map(p => ({
      id: p.id, num: p.num, name: p.name,
      tier: p.tier, type1: p.type1, type2: p.type2
    }));
    renderSuggestions(container, results, (id) => loadPokemonDetail(id, container, query), 'pokemon');
  } catch {
    // Fallback estático
    const results = staticSearch('pokemon', query, { limit: 12 });
    renderSuggestions(container, results, (id) => loadPokemonDetail(id, container, query), 'pokemon');
  }
}

async function loadPokemonDetail(id, container, prevQuery) {
  showLoading(container);
  try {
    // Intentar backend primero
    let p, learnset = [];
    try {
      const data = await backendSearch(`/api/pokemon/${id}`);
      p = data;
      learnset = data.learnset || [];
    } catch {
      // Fallback a PokéAPI externa
      const res  = await fetch(`${POKE_API_EXTERNAL}/pokemon/${id}`);
      const raw  = await res.json();
      const specR = await fetch(raw.species.url);
      const spec  = await specR.json();
      const nameEs = spec.names?.find(n => n.language.name==='es')?.name || raw.name;
      p = {
        id: raw.name, num: raw.id, name: nameEs,
        type1: raw.types[0]?.type.name, type2: raw.types[1]?.type.name || null,
        hp: raw.stats[0]?.base_stat, atk: raw.stats[1]?.base_stat,
        def: raw.stats[2]?.base_stat, spa: raw.stats[3]?.base_stat,
        spd: raw.stats[4]?.base_stat, spe: raw.stats[5]?.base_stat,
        ability1: raw.abilities[0]?.ability.name,
        ability2: raw.abilities[1]?.ability.name || null,
        ability_h: raw.abilities.find(a=>a.is_hidden)?.ability.name || null,
        tier: null,
        desc: spec.flavor_text_entries?.find(e=>e.language.name==='es')?.flavor_text?.replace(/\f|\n/g,' ') || '',
      };
    }

    const types = [p.type1, p.type2].filter(Boolean);
    const bst = (p.hp||0)+(p.atk||0)+(p.def||0)+(p.spa||0)+(p.spd||0)+(p.spe||0);
    const wikidexUrl = `https://www.wikidex.net/wiki/${encodeURIComponent(p.name.replace(/ /g,'_'))}`;

    setContent(container, `
      <div class="poke-card">
        <div class="poke-card-left">
          <img class="poke-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.num}.png"
               onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png'" alt="${p.name}" />
          <div class="poke-types">${types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]||'#888'}">${TYPE_ES[t]||t}</span>`).join('')}</div>
          ${p.tier ? `<span style="font-size:12px;font-weight:700;color:${TIER_COLORS[p.tier]||'#888'}">${p.tier}</span>` : ''}
          <a href="${wikidexUrl}" target="_blank" class="wikidex-btn">${window.LANG === 'en' ? 'View on WikiDex →' : 'Ver en WikiDex →'}</a>
        </div>
        <div class="poke-card-right">
          <div class="poke-header">
            <span class="poke-number">#${String(p.num).padStart(3,'0')}</span>
            <span class="poke-name">${window.getPreferredName ? window.getPreferredName(p) : p.name}</span>
            <span class="poke-name-en">${window.getSecondaryName ? window.getSecondaryName(p) : p.id}</span>
          </div>
          ${p.desc ? `<p class="poke-desc">${p.desc}</p>` : ''}
          <div class="poke-stats">
            ${[['HP',p.hp],['Ataque',p.atk],['Defensa',p.def],['Atk.Esp',p.spa],['Def.Esp',p.spd],['Velocidad',p.spe]].map(([label,val])=>`
              <div class="stat-row">
                <span class="stat-name">${label}</span>
                <span class="stat-value">${val||'—'}</span>
                <div class="stat-bar-bg"><div class="stat-bar" style="width:${Math.min((val||0)/255*100,100).toFixed(0)}%;background:${statColor(val||0)}"></div></div>
              </div>`).join('')}
            <div class="stat-row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px">
              <span class="stat-name" style="font-weight:700">BST</span>
              <span class="stat-value" style="font-weight:700">${bst}</span>
              <div class="stat-bar-bg"><div class="stat-bar" style="width:${Math.min(bst/720*100,100).toFixed(0)}%;background:#4a6cf7"></div></div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:12px;color:var(--text-muted)">
            <strong>${window.LANG === 'en' ? 'Abilities:' : 'Habilidades:'}</strong>
            ${[p.ability1, p.ability2, p.ability_h ? `${p.ability_h} ${window.LANG === 'en' ? '(hidden)' : '(oculta)'}` : null].filter(Boolean).join(' · ')}
          </div>
          ${learnset.length ? `
          <div style="margin-top:10px">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:6px">${window.LANG === 'en' ? `Moves (Gen 9) — ${learnset.length} total` : `Movimientos (Gen 9) — ${learnset.length} en total`}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:120px;overflow-y:auto">
              ${learnset.slice(0,40).map(m=>`<span style="background:${TYPE_COLORS[m.type]||'#888'};color:#fff;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:700">${m.name}</span>`).join('')}
              ${learnset.length>40?`<span style="font-size:11px;color:var(--text-hint)">+${learnset.length-40} ${window.LANG === 'en' ? 'more' : 'más'}</span>`:''}
            </div>
          </div>` : ''}
        </div>
      </div>`);
    addBackButton(container, prevQuery, () => handlePokemonSearch(prevQuery, container));
  } catch(e) { showError(container, window.t ? window.t('glossary.loadError') : 'No se pudo cargar. Intenta de nuevo.'); }
}

/* ==========================================
   MOVIMIENTOS — usa /api/moves
   ========================================== */
async function handleMoveSearch(query, container, typeFilter='', catFilter='') {
  const nq = norm(query);
  const hasFilter = typeFilter || catFilter;
  if (!nq && !hasFilter) { showHint(container, window.t ? window.t('glossary.moveSearchHint') : 'Escribe un movimiento o usa los filtros.'); return; }
  if (!hasFilter && nq.length < 2) { showHint(container, window.t ? window.t('glossary.moveSearchHintShort') : 'Escribe al menos 2 letras o usa los filtros.'); return; }
  showLoading(container);
  try {
    const data = await backendSearch('/api/moves', { q: query, type: typeFilter, category: catFilter, limit: 15 });
    const results = (data.results || []).map(m => ({
      id: m.id, name: m.name, name_es: m.name_es || (window.getName ? window.getName(m.id, 'moves') : m.name), type: m.type, category: m.category,
      power: m.power, accuracy: m.accuracy, pp: m.pp
    }));
    if (!results.length) { showEmpty(container); return; }
    // Renderizar con info de tipo y categoría directo
    const items = results.map(r => {
      const tc  = TYPE_COLORS[r.type]||'#888';
      const te  = TYPE_ES[r.type]||r.type;
      const catSrc = CAT_SPRITE[r.category]||'';
      const names = orderedNames(r);
      return `<button class="suggestion-item suggestion-move-full" data-id="${r.id}">
        <span class="sug-icon">💥</span>
        <span class="sug-names"><span class="sug-name-es">${names.primary}</span>${names.secondary && names.secondary !== names.primary ? `<span class="sug-name-en">${names.secondary}</span>` : ''}</span>
        <span style="display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0">
          <span style="background:${tc};color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px">${te}</span>
          ${catSrc?`<img src="${catSrc}" style="height:14px">`:''}
          ${r.power?`<span style="font-size:10px;color:var(--text-hint)">${r.power}</span>`:''}
        </span>
      </button>`;
    }).join('');
    setContent(container, `<div class="suggestion-list">${items}</div>`);
    container.querySelectorAll('.suggestion-item').forEach(btn => {
      btn.addEventListener('click', () => loadMoveDetail(btn.dataset.id, container, query));
    });
  } catch {
    const results = staticSearch('moves', query, { type: typeFilter, category: catFilter });
    renderSuggestions(container, results, (id) => loadMoveDetail(id, container, query), 'moves');
  }
}

async function loadMoveDetail(id, container, prevQuery) {
  showLoading(container);
  try {
    let m;
    try {
      m = await backendSearch(`/api/moves/${id}`);
    } catch {
      const res = await fetch(`${POKE_API_EXTERNAL}/move/${id}`);
      const raw = await res.json();
      const nameEs = raw.names?.find(n=>n.language.name==='es')?.name || raw.name;
      const desc = raw.flavor_text_entries?.find(e=>e.language.name==='es')?.flavor_text
                || raw.effect_entries?.find(e=>e.language.name==='es')?.short_effect || '';
      m = { id: raw.name, name: nameEs, type: raw.type.name, category: raw.damage_class.name,
            power: raw.power, accuracy: raw.accuracy, pp: raw.pp, priority: raw.priority,
            secondary: null, learnedBy: [] };
    }

    const tc  = TYPE_COLORS[m.type]||'#888';
    const te  = (window.getTypeName ? window.getTypeName(m.type) : TYPE_ES[m.type]) || m.type;
    const cat = m.category;
    const catSrc = CAT_SPRITE[cat]||'';
    const pri = (m.priority||0) >= 0 ? `+${m.priority||0}` : m.priority;
    const moveNames = orderedNames({
      id: m.id,
      name: m.name,
      name_es: m.name_es || (window.getName ? window.getName(m.id, 'moves') : m.name),
      name_en: m.name,
    });

    // Texto de efecto secundario
    let secText = '';
    if (m.secondary?.chance) {
      if (m.secondary.statusEs) secText = `${m.secondary.chance}% de ${m.secondary.statusEs}`;
      else if (m.secondary.volatileEs) secText = `${m.secondary.chance}% de ${m.secondary.volatileEs}`;
      else if (m.secondary.boosts) {
        const b = Object.entries(m.secondary.boosts).map(([k,v])=>`${v>0?'+':''}${v} ${k}`).join(', ');
        secText = `${m.secondary.chance}% ${b}`;
      }
    }
    if (m.drain)  secText = window.LANG === 'en' ? `Heals ${Math.round(m.drain[0]/m.drain[1]*100)}% of dealt damage` : `Drena ${Math.round(m.drain[0]/m.drain[1]*100)}% del daño`;
    if (m.recoil) secText = window.LANG === 'en' ? `${Math.round(m.recoil[0]/m.recoil[1]*100)}% recoil` : `${Math.round(m.recoil[0]/m.recoil[1]*100)}% de retroceso`;

    // Pokémon que lo aprenden
    const learnedByHtml = m.learnedBy?.length ? `
      <div style="margin-top:12px">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:6px">${window.LANG === 'en' ? `Pokemon that learn it in Gen 9 (${m.learnedBy.length}):` : `Pokémon que lo aprenden en Gen 9 (${m.learnedBy.length}):`}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;max-height:100px;overflow-y:auto">
          ${m.learnedBy.slice(0,24).map(p=>`
            <span class="poke-mini-chip">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png" class="poke-mini-sprite" alt="${p.name}"/>
              ${p.name}
            </span>`).join('')}
          ${m.learnedBy.length>24?`<span style="font-size:11px;color:var(--text-hint)">+${m.learnedBy.length-24} ${window.LANG === 'en' ? 'more' : 'más'}</span>`:''}
        </div>
      </div>` : '';

    setContent(container, `
      <div class="info-card">
        <div class="info-card-header">
          <span class="info-name">${moveNames.primary}</span>
          <span class="info-name-en">${moveNames.secondary && moveNames.secondary !== moveNames.primary ? moveNames.secondary : m.id}</span>
          <span class="type-badge" style="background:${tc}">${te}</span>
          ${catSrc?`<img class="cat-sprite-inline" src="${catSrc}" alt="${CAT_ES[cat]||cat}" title="${CAT_ES[cat]||cat}" />`:''}
        </div>
        <div class="info-stats-row">
          <div class="info-stat"><span class="info-stat-label">${window.LANG === 'en' ? 'Power' : 'Potencia'}</span><span class="info-stat-value">${m.power||'—'}</span></div>
          <div class="info-stat"><span class="info-stat-label">${window.LANG === 'en' ? 'Accuracy' : 'Precisión'}</span><span class="info-stat-value">${m.accuracy||'—'}</span></div>
          <div class="info-stat"><span class="info-stat-label">PP</span><span class="info-stat-value">${m.pp||'—'}</span></div>
          <div class="info-stat"><span class="info-stat-label">${window.LANG === 'en' ? 'Priority' : 'Prioridad'}</span><span class="info-stat-value">${pri}</span></div>
        </div>
        ${secText?`<div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">⚡ ${secText}</div>`:''}
        <a href="https://www.wikidex.net/wiki/${encodeURIComponent(m.name.replace(/ /g,'_'))}" target="_blank" class="wikidex-btn">${window.LANG === 'en' ? 'View on WikiDex →' : 'Ver en WikiDex →'}</a>
        ${learnedByHtml}
      </div>`);
    addBackButton(container, prevQuery, () => handleMoveSearch(prevQuery, container, '', ''));
  } catch(e) { showError(container, window.t ? window.t('glossary.loadError') : 'No se pudo cargar.'); }
}

/* ==========================================
   HABILIDADES — usa /api/abilities
   ========================================== */
async function handleAbilitySearch(query, container) {
  if (!query || query.length < 2) { showHint(container, `${window.t ? window.t('glossary.searchHint') : 'Escribe al menos 2 letras.'} Ej: "Intimidación", "levit", "Speed"`); return; }
  showLoading(container);
  try {
    const data = await backendSearch('/api/abilities', { q: query, limit: 12 });
    const results = (data.results || []).map(a => ({ id: a.id, name: a.name, name_es: a.name_es || a.name, rating: a.rating }));
    if (!results.length) { showEmpty(container); return; }
    renderSuggestions(container, results, (id) => loadAbilityDetail(id, container, query), 'abilities');
  } catch {
    const results = staticSearch('abilities', query);
    if (!results.length) { showEmpty(container); return; }
    renderSuggestions(container, results, (id) => loadAbilityDetail(id, container, query), 'abilities');
  }
}

async function loadAbilityDetail(id, container, prevQuery) {
  showLoading(container);
  try {
    let a;
    try {
      a = await backendSearch(`/api/abilities/${id}`);
      if (!a || (!a.description && !(a.pokemon || []).length)) throw new Error('Fallback ability detail');
    } catch {
      const res = await fetch(`${POKE_API_EXTERNAL}/ability/${id}`);
      const raw = await res.json();
      const nameEs = raw.names?.find(n=>n.language.name==='es')?.name || raw.name;
      const desc = raw.flavor_text_entries?.find(e=>e.language.name==='es')?.flavor_text
                || raw.effect_entries?.find(e=>e.language.name==='es')?.short_effect || '';
      a = { id: raw.name, name: nameEs, description: desc, pokemon: raw.pokemon.slice(0,10).map(p=>({ name: p.pokemon.name, num: p.pokemon.url.split('/').filter(Boolean).pop() })) };
    }

    const pokeChips = (a.pokemon||[]).slice(0,12).map(p => `
      <span class="poke-mini-chip">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png" class="poke-mini-sprite" alt="${p.name}"/>
        ${p.name}
      </span>`).join('');

    setContent(container, `
      <div class="info-card">
        <div class="info-card-header">
          <span class="info-name">${a.name}</span>
          <span class="info-name-en">${a.id}</span>
          ${a.rating ? `<span style="font-size:11px;color:var(--accent);font-weight:700">★ ${a.rating}/5</span>` : ''}
        </div>
        ${a.description ? `<p class="info-desc">${a.description}</p>` : ''}
        ${pokeChips ? `
        <div class="ability-pokemon-list">
          <span class="ability-pokemon-label">${window.LANG === 'en' ? 'Pokemon with this ability:' : 'Pokémon con esta habilidad:'}</span>
          <div class="ability-pokemon-chips">${pokeChips}</div>
          ${(a.pokemon||[]).length > 12 ? `<span class="ability-more">+${(a.pokemon||[]).length-12} ${window.LANG === 'en' ? 'more on WikiDex' : 'más en WikiDex'}</span>` : ''}
        </div>` : ''}
        <a href="https://www.wikidex.net/wiki/${encodeURIComponent(a.name.replace(/ /g,'_'))}" target="_blank" class="wikidex-btn">${window.LANG === 'en' ? 'View on WikiDex →' : 'Ver en WikiDex →'}</a>
      </div>`);
    addBackButton(container, prevQuery, () => handleAbilitySearch(prevQuery, container));
  } catch(e) { showError(container, window.t ? window.t('glossary.loadError') : 'No se pudo cargar.'); }
}

/* ==========================================
   OBJETOS — usa /api/items
   ========================================== */
async function handleItemSearch(query, container) {
  if (!query || query.length < 2) { showHint(container, `${window.t ? window.t('glossary.searchHint') : 'Escribe al menos 2 letras.'} Ej: "Restos", "lefto", "choice"`); return; }
  showLoading(container);
  try {
    const data = await backendSearch('/api/items', { q: query, limit: 12 });
    const results = (data.results || []).map(i => ({ id: i.id, name: i.name, num: i.num }));
    renderSuggestions(container, results, (id) => loadItemDetail(id, container, query), 'items');
  } catch {
    const results = staticSearch('items', query);
    renderSuggestions(container, results, (id) => loadItemDetail(id, container, query), 'items');
  }
}

async function loadItemDetail(id, container, prevQuery) {
  showLoading(container);
  try {
    let item;
    try {
      item = await backendSearch(`/api/items/${id}`);
      if (!item || !item.description) throw new Error('Fallback item detail');
    } catch {
      const res = await fetch(`${POKE_API_EXTERNAL}/item/${id}`);
      const raw = await res.json();
      const nameEs = raw.names?.find(n=>n.language.name==='es')?.name || raw.name;
      const desc = raw.flavor_text_versions?.find(e=>e.language.name==='es')?.text
                || raw.effect_entries?.find(e=>e.language.name==='es')?.short_effect || '';
      item = { id: raw.name, name: nameEs, description: desc, sprite: raw.sprites?.default };
    }
    const sprite = item.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${id}.png`;
    setContent(container, `
      <div class="info-card">
        <div class="info-card-header" style="align-items:center;gap:14px;">
          <img src="${sprite}" alt="${item.name}" style="width:48px;height:48px;image-rendering:pixelated;flex-shrink:0;" onerror="this.style.display='none'" />
          <div>
            <span class="info-name">${item.name}</span>
            <span class="info-name-en">${item.id}</span>
          </div>
        </div>
        ${item.description ? `<p class="info-desc">${item.description}</p>` : ''}
        <a href="https://www.wikidex.net/wiki/${encodeURIComponent(item.name.replace(/ /g,'_'))}" target="_blank" class="wikidex-btn">${window.LANG === 'en' ? 'View on WikiDex →' : 'Ver en WikiDex →'}</a>
      </div>`);
    addBackButton(container, prevQuery, () => handleItemSearch(prevQuery, container));
  } catch(e) { showError(container, window.t ? window.t('glossary.loadError') : 'No se pudo cargar.'); }
}

/* ==========================================
   HELPERS
   ========================================== */
function statColor(v) { return v<50?'#e84545':v<80?'#f5a623':v<100?'#2dc76d':'#4a6cf7'; }

/* ==========================================
   PESTAÑAS
   ========================================== */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activateGlossaryTab(btn.dataset.tab);
    });
  });
}

function activateGlossaryTab(tabName = 'terminos') {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.toggle('active', content.id === `tab-${tabName}`);
  });
}

/* ==========================================
   DEBOUNCE
   ========================================== */
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(()=>fn(...a), ms); }; }

/* ==========================================
   INIT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  if (window.PH_PENDING_GLOSSARY_TAB) {
    activateGlossaryTab(window.PH_PENDING_GLOSSARY_TAB);
    window.PH_PENDING_GLOSSARY_TAB = '';
  }

  const configs = [
    { input:'pokemon-search',  results:'pokemon-results',  handler: handlePokemonSearch,  hint: window.LANG === 'en' ? 'Type a Pokemon name in English or Spanish. Example: "pikachu", "Drago", "char"' : '✏️ Escribe un Pokémon en español o inglés. Ej: "pikachu", "Drago", "char"' },
    { input:'ability-search',  results:'ability-results',  handler: handleAbilitySearch,  hint: window.LANG === 'en' ? 'Type an ability. Example: "Intimidate", "levit", "Speed"' : '✏️ Escribe una habilidad. Ej: "Intimidación", "levit", "Speed"' },
    { input:'item-search',     results:'item-results',     handler: handleItemSearch,     hint: window.LANG === 'en' ? 'Type an item. Example: "Leftovers", "lefto", "choice"' : '✏️ Escribe un objeto. Ej: "Restos", "lefto", "choice"' },
  ];

  configs.forEach(({ input, results, handler, hint }) => {
    const inp = document.getElementById(input);
    const res = document.getElementById(results);
    if (!inp || !res) return;
    showHint(res, hint);
    inp.addEventListener('input',  debounce(e => handler(e.target.value, res), 300));
    inp.addEventListener('keydown', e => {
      if (e.key==='Enter')  handler(e.target.value, res);
      if (e.key==='Escape') { inp.value=''; showHint(res, hint); }
    });
  });

  // Movimientos con filtros
  const mvI  = document.getElementById('move-search');
  const mvR  = document.getElementById('move-results');
  const mvTF = document.getElementById('move-type-filter');
  const mvCF = document.getElementById('move-cat-filter');
  if (mvI && mvR) {
    showHint(mvR, window.LANG === 'en' ? 'Type a move or use the type and category filters.' : '✏️ Escribe un movimiento o usa los filtros de tipo y categoría.');
    const run = () => handleMoveSearch(mvI.value, mvR, mvTF?.value||'', mvCF?.value||'');
    mvI.addEventListener('input',  debounce(run, 300));
    mvI.addEventListener('keydown', e => { if(e.key==='Enter') run(); if(e.key==='Escape'){mvI.value='';showHint(mvR, window.LANG === 'en' ? 'Type a move.' : '✏️ Escribe un movimiento.');} });
    mvTF?.addEventListener('change', run);
    mvCF?.addEventListener('change', run);
  }

  // Exponer para teambuilder y calculadora
  window.POKE_SEARCH_API = { norm, CAT_SPRITE, CAT_ES,
    searchPokemon: handlePokemonSearch,
    searchMoves:   handleMoveSearch,
    searchAbility: handleAbilitySearch,
    searchItems:   handleItemSearch,
  };
});

window.activateGlossaryTab = activateGlossaryTab;

document.addEventListener('langchange', () => {
  const reruns = [
    ['pokemon-search', 'pokemon-results', handlePokemonSearch],
    ['ability-search', 'ability-results', handleAbilitySearch],
    ['item-search', 'item-results', handleItemSearch],
  ];
  reruns.forEach(([inputId, resultsId, handler]) => {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (input?.value && results) handler(input.value, results);
  });
  const moveInput = document.getElementById('move-search');
  const moveResults = document.getElementById('move-results');
  if (moveInput?.value && moveResults) {
    handleMoveSearch(
      moveInput.value,
      moveResults,
      document.getElementById('move-type-filter')?.value || '',
      document.getElementById('move-cat-filter')?.value || ''
    );
  }
});
