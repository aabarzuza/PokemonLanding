(function () {
/* =========================================
   DAMAGE-CALC.JS
   Calculadora de daño Gen 9.
   - Búsqueda igual que el glosario (sugerencias + sprites)
   - Resultado de daño siempre visible
   - Consulta backend /api/pokemon y /api/moves
   ========================================= */

/* ── Tabla de tipos ── */
const DC_TYPE_CHART = {
  normal:   {rock:.5,ghost:0,steel:.5},
  fire:     {fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},
  water:    {fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},
  electric: {water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
  grass:    {fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},
  ice:      {fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},
  fighting: {normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},
  poison:   {grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},
  ground:   {fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},
  flying:   {electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},
  psychic:  {fighting:2,poison:2,psychic:.5,dark:0,steel:.5},
  bug:      {fire:.5,grass:2,fighting:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},
  rock:     {fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},
  ghost:    {normal:0,psychic:2,ghost:2,dark:.5},
  dragon:   {dragon:2,steel:.5,fairy:0},
  dark:     {fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},
  steel:    {fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},
  fairy:    {fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5},
};

const DC_TYPE_ES = {
  normal:'Normal',fire:'Fuego',water:'Agua',electric:'Eléctrico',grass:'Planta',
  ice:'Hielo',fighting:'Lucha',poison:'Veneno',ground:'Tierra',flying:'Volador',
  psychic:'Psíquico',bug:'Bicho',rock:'Roca',ghost:'Fantasma',dragon:'Dragón',
  dark:'Siniestro',steel:'Acero',fairy:'Hada'
};
const DC_TYPE_COLORS = {
  normal:'#A8A878',fire:'#F08030',water:'#6890F0',electric:'#F8D030',grass:'#78C850',
  ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',ground:'#E0C068',flying:'#A890F0',
  psychic:'#F85888',bug:'#A8B820',rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',
  dark:'#705848',steel:'#B8B8D0',fairy:'#EE99AC'
};
const DC_NATURES = {
  Adamant:{atk:1.1,spa:0.9},Jolly:{spe:1.1,spa:0.9},Modest:{spa:1.1,atk:0.9},
  Timid:{spe:1.1,atk:0.9},Bold:{def:1.1,atk:0.9},Calm:{spd:1.1,atk:0.9},
  Impish:{def:1.1,spa:0.9},Careful:{spd:1.1,spa:0.9},Hasty:{spe:1.1,def:0.9},
  Naive:{spe:1.1,spd:0.9},Mild:{spa:1.1,def:0.9},Rash:{spa:1.1,spd:0.9},
  Lonely:{atk:1.1,def:0.9},Naughty:{atk:1.1,spd:0.9},Brave:{atk:1.1,spe:0.9},
  Relaxed:{def:1.1,spe:0.9},Lax:{def:1.1,spd:0.9},Quiet:{spa:1.1,spe:0.9},
  Sassy:{spd:1.1,spe:0.9},Gentle:{spd:1.1,def:0.9},Hardy:{},Bashful:{},
  Docile:{},Serious:{},Quirky:{}
};
const NATURES_LIST = Object.keys(DC_NATURES).sort();
const STAT_LABELS  = {hp:'HP',atk:'Ataque',def:'Defensa',spa:'Atk.Esp',spd:'Def.Esp',spe:'Velocidad'};
const STAT_KEYS    = ['hp','atk','def','spa','spd','spe'];

const CAT_SPRITE_DC = {
  physical:'https://play.pokemonshowdown.com/sprites/categories/Physical.png',
  special: 'https://play.pokemonshowdown.com/sprites/categories/Special.png',
  status:  'https://play.pokemonshowdown.com/sprites/categories/Status.png',
};

/* ── Estado de la calc ── */
const DC = {
  atk:  { data:null, evs:{hp:0,atk:252,def:0,spa:252,spd:0,spe:252}, nature:'Hardy' },
  def:  { data:null, evs:{hp:252,atk:0,def:252,spa:0,spd:252,spe:0},  nature:'Hardy' },
  move: null,
  crit: false, weather: false,
};

/* ── Normalización ── */
function dcNorm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

/* ── Buscar Pokémon (backend + fallback) ── */
async function dcSearchPokemon(query, suggEl, side) {
  if (!query || query.length < 2) { suggEl.innerHTML = ''; return; }
  const nq = dcNorm(query);
  try {
    const url = `/api/pokemon?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url);
    const data = await res.json();
    dcRenderPokesugg(data.results || [], suggEl, side, nq);
  } catch {
    const all = Object.values(window.SD_POKEMON || {});
    const results = all.filter(p => dcNorm(p.name).includes(nq) || dcNorm(p.id).includes(nq))
      .sort((a,b) => dcNorm(a.name).startsWith(nq)?-1:1).slice(0,10)
      .map(p => ({id:p.id,num:p.num,name:p.name,tier:p.tier,type1:p.types?.[0],type2:p.types?.[1]}));
    dcRenderPokesugg(results, suggEl, side, nq);
  }
}

function dcRenderPokesugg(results, suggEl, side, nq) {
  if (!results.length) { suggEl.innerHTML = '<div class="ed-sugg-empty">Sin resultados</div>'; return; }
  suggEl.innerHTML = results.map(p =>
    `<button class="ed-sugg-btn" data-id="${p.id}">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png"
           class="editor-sugg-sprite" alt="" onerror="this.style.display='none'" />
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--color-text-primary);text-transform:capitalize">${p.name}</span>
      ${p.type1 ? `<span style="background:${DC_TYPE_COLORS[p.type1]||'#888'};color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px">${DC_TYPE_ES[p.type1]||p.type1}</span>` : ''}
      ${p.tier  ? `<span style="font-size:10px;color:#4a6cf7;font-weight:700;margin-left:4px">${p.tier}</span>` : ''}
    </button>`
  ).join('');
  suggEl.querySelectorAll('.ed-sugg-btn').forEach(btn => {
    btn.addEventListener('mousedown', async e => {
      e.preventDefault();
      suggEl.innerHTML = '';
      await dcSelectPokemon(btn.dataset.id, side);
    });
  });
}

async function dcSelectPokemon(id, side) {
  try {
    let p;
    try {
      const res = await fetch(`/api/pokemon/${id}`);
      p = await res.json();
    } catch {
      const sdp = (window.SD_POKEMON||{})[id] || {};
      p = { id, num: sdp.num, name: sdp.name || id,
        type1: sdp.types?.[0], type2: sdp.types?.[1],
        hp: sdp.baseStats?.hp, atk: sdp.baseStats?.atk, def: sdp.baseStats?.def,
        spa: sdp.baseStats?.spa, spd: sdp.baseStats?.spd, spe: sdp.baseStats?.spe,
        ability1: sdp.abilities?.[0], tier: sdp.tier };
    }
    DC[side].data = p;
    document.getElementById(`calc-${side}-input`).value = p.name;
    dcRenderSidePreview(side);
    dcRunCalc();
  } catch(e) { console.error(e); }
}

/* ── Buscar movimiento ── */
async function dcSearchMove(query, suggEl) {
  if (!query || query.length < 2) { suggEl.innerHTML = ''; return; }
  const nq = dcNorm(query);
  try {
    const res  = await fetch(`/api/moves?q=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    dcRenderMoveSugg(data.results || [], suggEl, nq);
  } catch {
    const all = Object.values(window.SD_MOVES || {});
    const results = all.filter(m => dcNorm(m.name).includes(nq) || dcNorm(m.id).includes(nq))
      .slice(0, 10);
    dcRenderMoveSugg(results, suggEl, nq);
  }
}

function dcRenderMoveSugg(results, suggEl, nq) {
  if (!results.length) { suggEl.innerHTML = '<div class="ed-sugg-empty">Sin resultados</div>'; return; }
  suggEl.innerHTML = results.map(m => {
    const tc  = DC_TYPE_COLORS[m.type]||'#888';
    const te  = DC_TYPE_ES[m.type]||m.type;
    const catSrc = CAT_SPRITE_DC[m.category]||'';
    return `<button class="ed-sugg-btn" data-id="${m.id}">
      <span class="sug-icon" style="font-size:16px">💥</span>
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--color-text-primary);text-transform:capitalize">${m.name}</span>
      <span style="display:flex;align-items:center;gap:4px;margin-left:auto">
        <span style="background:${tc};color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px">${te}</span>
        ${catSrc?`<img src="${catSrc}" style="height:14px">`:''}
        ${m.power?`<span style="font-size:10px;color:var(--text-hint)">${m.power}</span>`:''}
      </span>
    </button>`;
  }).join('');
  suggEl.querySelectorAll('.ed-sugg-btn').forEach(btn => {
    btn.addEventListener('mousedown', async e => {
      e.preventDefault();
      suggEl.innerHTML = '';
      await dcSelectMove(btn.dataset.id);
    });
  });
}

async function dcSelectMove(id) {
  try {
    let m;
    try {
      const res = await fetch(`/api/moves/${id}`);
      m = await res.json();
    } catch {
      m = (window.SD_MOVES||{})[id] || { id, name: id, type:'normal', category:'physical', power:50, accuracy:100, pp:15, priority:0 };
    }
    DC.move = m;
    document.getElementById('calc-move-input').value = m.name;
    dcRenderMovePreview(m);
    dcRunCalc();
  } catch(e) { console.error(e); }
}

/* ── Renderizar preview del Pokémon ── */
function dcRenderSidePreview(side) {
  const p     = DC[side].data;
  const preEl = document.getElementById(`calc-${side}-preview`);
  if (!p || !preEl) return;
  const types = [p.type1, p.type2].filter(Boolean);
  preEl.innerHTML = `
    <div class="calc-poke-card">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.num}.png"
           class="calc-poke-sprite" alt="${p.name}" onerror="this.style.display='none'" />
      <div>
        <div style="font-weight:700;font-size:14px;text-transform:capitalize">${p.name}
          ${p.tier?`<span style="font-size:11px;color:#4a6cf7;margin-left:6px">${p.tier}</span>`:''}
        </div>
        <div style="display:flex;gap:4px;margin:4px 0">
          ${types.map(t=>`<span class="type-badge-sm" style="background:${DC_TYPE_COLORS[t]||'#888'}">${DC_TYPE_ES[t]||t}</span>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--text-muted)">
          HP:${p.hp} Atk:${p.atk} Def:${p.def} SpA:${p.spa} SpD:${p.spd} Spe:${p.spe}
        </div>
      </div>
    </div>`;

  // Campos EVs y Nature
  const fieldsEl = document.getElementById(`calc-${side}-fields`);
  if (!fieldsEl) return;
  const ev = DC[side].evs;
  const nat = DC[side].nature;
  fieldsEl.innerHTML = `
    <div style="margin-top:10px">
      <label class="editor-label">Nature</label>
      <select id="calc-${side}-nature" class="editor-select" style="width:100%;margin-bottom:8px">
        ${NATURES_LIST.map(n=>`<option value="${n}"${nat===n?' selected':''}>${n}</option>`).join('')}
      </select>
      <label class="editor-label">EVs</label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        ${STAT_KEYS.map(k=>`
          <div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px">${STAT_LABELS[k]}</div>
            <input type="number" id="calc-${side}-ev-${k}" class="editor-stat-input"
              min="0" max="252" step="4" value="${ev[k]||0}" />
          </div>`).join('')}
      </div>
    </div>`;

  document.getElementById(`calc-${side}-nature`)?.addEventListener('change', e => {
    DC[side].nature = e.target.value; dcRunCalc();
  });
  STAT_KEYS.forEach(k => {
    document.getElementById(`calc-${side}-ev-${k}`)?.addEventListener('input', e => {
      DC[side].evs[k] = Math.max(0, Math.min(252, parseInt(e.target.value)||0));
      dcRunCalc();
    });
  });
}

/* ── Renderizar preview del movimiento ── */
function dcRenderMovePreview(m) {
  const el = document.getElementById('calc-move-preview');
  if (!el) return;
  const tc  = DC_TYPE_COLORS[m.type]||'#888';
  const te  = DC_TYPE_ES[m.type]||m.type;
  const catSrc = CAT_SPRITE_DC[m.category]||'';
  const cat    = {physical:'Físico',special:'Especial',status:'Estado'}[m.category]||m.category;

  let secText = '';
  if (m.secondary?.chance) {
    if (m.secondary.statusEs)    secText = `${m.secondary.chance}% de ${m.secondary.statusEs}`;
    else if (m.secondary.volatileEs) secText = `${m.secondary.chance}% de ${m.secondary.volatileEs}`;
    else if (m.secondary.boosts) {
      const b = Object.entries(m.secondary.boosts).map(([k,v])=>`${v>0?'+':''}${v} ${k}`).join(', ');
      secText = `${m.secondary.chance}% ${b}`;
    }
  }
  if (m.drain)  secText = `Drena ${Math.round(m.drain[0]/m.drain[1]*100)}% del daño`;
  if (m.recoil) secText = `${Math.round(m.recoil[0]/m.recoil[1]*100)}% de retroceso`;

  el.innerHTML = `
    <div class="calc-move-card">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-weight:700;font-size:14px;text-transform:capitalize">${m.name}</span>
        <span style="background:${tc};color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">${te}</span>
        ${catSrc?`<img src="${catSrc}" style="height:18px" title="${cat}">`:`<span style="font-size:12px">${cat}</span>`}
      </div>
      <div style="display:flex;gap:14px;font-size:12px;color:var(--text-muted);margin-top:6px;flex-wrap:wrap">
        <span>Potencia: <strong>${m.power||'—'}</strong></span>
        <span>Precisión: <strong>${m.accuracy||'—'}</strong></span>
        <span>PP: <strong>${m.pp||'—'}</strong></span>
        <span>Prioridad: <strong>${(m.priority||0)>=0?'+':''}${m.priority||0}</strong></span>
      </div>
      ${secText?`<div style="font-size:12px;color:var(--text-muted);margin-top:4px">⚡ ${secText}</div>`:''}
    </div>`;
}

/* ── Calcular stat final ── */
function dcCalcStat(base, ev, iv=31, level=100, nature, statKey) {
  const evBonus = Math.floor(ev/4);
  let stat;
  if (statKey==='hp') {
    stat = Math.floor(((2*base+iv+evBonus)*level)/100)+level+10;
  } else {
    stat = Math.floor(((2*base+iv+evBonus)*level)/100)+5;
    const nm = DC_NATURES[nature]||{};
    if (nm[statKey]===1.1) stat=Math.floor(stat*1.1);
    if (nm[statKey]===0.9) stat=Math.floor(stat*0.9);
  }
  return stat;
}

/* ── Efectividad de tipo ── */
function dcTypeEff(moveType, defTypes) {
  let e=1;
  for (const t of defTypes) { e *= (DC_TYPE_CHART[moveType]||{})[t]??1; }
  return e;
}

/* ── Calcular y mostrar daño ── */
function dcRunCalc() {
  const resultEl = document.getElementById('calc-result');
  if (!resultEl) return;

  const atkData = DC.atk.data;
  const defData = DC.def.data;
  const mv      = DC.move;

  if (!atkData || !defData || !mv) {
    resultEl.innerHTML = '<div class="calc-hint">Selecciona atacante, defensor y movimiento para ver el resultado.</div>';
    return;
  }
  if (!mv.power || mv.category==='status') {
    resultEl.innerHTML = '<div class="calc-hint">Este movimiento no causa daño directo.</div>';
    return;
  }

  const isPhys   = mv.category==='physical';
  const atkKey   = isPhys?'atk':'spa';
  const defKey   = isPhys?'def':'spd';
  const atkTypes = [atkData.type1, atkData.type2].filter(Boolean);
  const defTypes = [defData.type1, defData.type2].filter(Boolean);

  const atkStat = dcCalcStat(atkData[atkKey]||80, DC.atk.evs[atkKey]||0, 31, 100, DC.atk.nature, atkKey);
  const defStat = dcCalcStat(defData[defKey]||80, DC.def.evs[defKey]||0, 31, 100, DC.def.nature, defKey);
  const defHP   = dcCalcStat(defData.hp||80,      DC.def.evs.hp||0,      31, 100, DC.def.nature, 'hp');

  // Tipo efectividad
  const eff = dcTypeEff(mv.type, defTypes);
  if (eff===0) {
    resultEl.innerHTML = `<div class="calc-result-immune">❌ Inmune — ${defData.name} no recibe daño de tipo ${DC_TYPE_ES[mv.type]||mv.type}</div>`;
    return;
  }

  // STAB
  const stab = atkTypes.includes(mv.type) ? 1.5 : 1;

  // Crit
  const crit = DC.crit ? 1.5 : 1;

  // Clima
  const weather = DC.weather ? 1.5 : 1;

  // Quemadura
  const burn = isPhys && DC.atk.data?.status==='brn' ? 0.5 : 1;

  // Fórmula base
  const base = Math.floor(
    Math.floor(Math.floor(2*100/5+2)*mv.power*atkStat/defStat)/50
  )+2;

  const withMods = Math.floor(base * crit * weather * stab * eff * burn);

  // Rango 85-100%
  const minDmg = Math.floor(withMods * 0.85);
  const maxDmg = withMods;
  const minPct = (minDmg/defHP*100).toFixed(1);
  const maxPct = (maxDmg/defHP*100).toFixed(1);

  const barPct    = Math.min(maxDmg/defHP*100, 100).toFixed(0);
  const barColor  = maxDmg>=defHP?'#e84545':minDmg*2>=defHP?'#f5a623':'#2dc76d';
  const ohko      = minDmg >= defHP;
  const twoHko    = minDmg * 2 >= defHP;
  const effLabel  = eff>=4?'🔥 ¡Súper efectivo! (×4)':eff>=2?'🔥 ¡Súper efectivo! (×2)':eff<=0.25?'🛡️ No muy efectivo (×0.25)':eff<=0.5?'🛡️ No muy efectivo (×½)':'';
  const stabLabel = stab>1?'+ STAB':'';
  const critLabel = crit>1?'+ Golpe crítico':'';

  resultEl.innerHTML = `
    <div class="calc-result-box">
      ${effLabel?`<div class="calc-eff-label ${eff>=2?'calc-eff-super':'calc-eff-resiste'}">${effLabel}</div>`:''}

      <div class="calc-damage-numbers">
        <span class="calc-dmg-range">${minDmg} – ${maxDmg} HP</span>
        <span class="calc-dmg-pct">(${minPct}% – ${maxPct}%)</span>
        ${stabLabel||critLabel?`<span class="calc-dmg-note">${[stabLabel,critLabel].filter(Boolean).join(' ')}</span>`:''}
      </div>

      <div class="calc-hp-bar-bg">
        <div class="calc-hp-bar" style="width:${barPct}%;background:${barColor}"></div>
      </div>

      ${ohko
        ? '<div class="calc-ko-label calc-1hko">✓ OHKO garantizado (derriba siempre de 1 golpe)</div>'
        : twoHko
          ? '<div class="calc-ko-label calc-2hko">✓ 2HKO garantizado (derriba en 2 golpes)</div>'
          : `<div class="calc-ko-label">No derriba de 1 golpe. Necesita ${Math.ceil(defHP/maxDmg)} golpes como máximo.</div>`}

      <div class="calc-stats-detail">
        ${isPhys?'Ataque':'Atk.Esp'}: ${atkStat} vs ${isPhys?'Defensa':'Def.Esp'}: ${defStat} · HP defensor: ${defHP}
        · Efectividad: ×${eff} · STAB: ${stab===1.5?'Sí':'No'}
      </div>
    </div>`;
}

/* ── Construir la UI completa ── */
function buildCalcSection() {
  const el = document.getElementById('calc-section');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  el.innerHTML = `
    <div class="calc-layout">

      <!-- Atacante -->
      <div class="calc-pokemon-panel">
        <div class="calc-panel-title">⚔️ Atacante</div>
        <div class="calc-search-wrap" style="position:relative;margin-bottom:10px">
          <input type="text" id="calc-atk-input" class="editor-input"
            placeholder="Busca Pokémon en español o inglés..." autocomplete="off" />
          <div id="calc-atk-sugg" class="editor-suggestions"></div>
        </div>
        <div id="calc-atk-preview"></div>
        <div id="calc-atk-fields"></div>
      </div>

      <!-- Movimiento -->
      <div class="calc-move-panel">
        <div class="calc-panel-title">💥 Movimiento</div>
        <div class="calc-search-wrap" style="position:relative;margin-bottom:10px">
          <input type="text" id="calc-move-input" class="editor-input"
            placeholder="Busca movimiento en español o inglés..." autocomplete="off" />
          <div id="calc-move-sugg" class="editor-suggestions"></div>
        </div>
        <div id="calc-move-preview"></div>

        <div style="margin-top:12px">
          <label class="editor-label">Modificadores</label>
          <div class="calc-mods">
            <label class="calc-mod-item"><input type="checkbox" id="calc-crit" /> Golpe crítico (×1.5 Ataque)</label>
            <label class="calc-mod-item"><input type="checkbox" id="calc-weather" /> Clima favorable (×1.5)</label>
          </div>
        </div>

        <!-- RESULTADO siempre visible aquí -->
        <div id="calc-result" class="calc-result" style="margin-top:14px">
          <div class="calc-hint">Selecciona atacante, defensor y movimiento para calcular.</div>
        </div>
      </div>

      <!-- Defensor -->
      <div class="calc-pokemon-panel">
        <div class="calc-panel-title">🛡️ Defensor</div>
        <div class="calc-search-wrap" style="position:relative;margin-bottom:10px">
          <input type="text" id="calc-def-input" class="editor-input"
            placeholder="Busca Pokémon en español o inglés..." autocomplete="off" />
          <div id="calc-def-sugg" class="editor-suggestions"></div>
        </div>
        <div id="calc-def-preview"></div>
        <div id="calc-def-fields"></div>
      </div>

    </div>`;

  /* Eventos búsqueda Pokémon */
  let atkT, defT, mvT;
  document.getElementById('calc-atk-input').addEventListener('input', e => {
    clearTimeout(atkT);
    atkT = setTimeout(() => dcSearchPokemon(e.target.value, document.getElementById('calc-atk-sugg'), 'atk'), 300);
  });
  document.getElementById('calc-def-input').addEventListener('input', e => {
    clearTimeout(defT);
    defT = setTimeout(() => dcSearchPokemon(e.target.value, document.getElementById('calc-def-sugg'), 'def'), 300);
  });
  document.getElementById('calc-move-input').addEventListener('input', e => {
    clearTimeout(mvT);
    mvT = setTimeout(() => dcSearchMove(e.target.value, document.getElementById('calc-move-sugg')), 300);
  });

  /* Cerrar sugerencias al hacer blur */
  ['calc-atk-input','calc-def-input','calc-move-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('blur', () => {
      setTimeout(() => {
        const side = id.includes('atk') ? 'atk' : id.includes('def') ? 'def' : 'move';
        const suggId = id.includes('move') ? 'calc-move-sugg' : `calc-${side}-sugg`;
        const el = document.getElementById(suggId);
        if (el) el.innerHTML = '';
      }, 200);
    });
  });

  /* Modificadores */
  document.getElementById('calc-crit')?.addEventListener('change', e => { DC.crit = e.target.checked; dcRunCalc(); });
  document.getElementById('calc-weather')?.addEventListener('change', e => { DC.weather = e.target.checked; dcRunCalc(); });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Construir cuando se navega a calculadora
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.section === 'calculadora') {
        setTimeout(buildCalcSection, 50);
      }
    });
  });
  // También si cargamos directamente en calculadora
  if (document.getElementById('calc-section')) {
    setTimeout(buildCalcSection, 100);
  }
});
window.buildCalcSection = buildCalcSection;
})();
