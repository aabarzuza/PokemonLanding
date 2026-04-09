(function () {
  // Estado principal del módulo de batalla.
  const BC = {
    ws: null,
    roomId: null,
    slot: null,
    myRequest: null,
    waiting: false,
    myTeam: [],
    savedTeams: [],
    pendingTurn: null,
    pendingSwitch: null,
    pendingPreview: [],
    activeTool: '',
    compactToolTab: 'pokemon',
    protocolQueue: [],
    protocolTimer: null,
    sim: {
      p1: { name: 'Jugador 1', active: [], team: [] },
      p2: { name: 'Jugador 2', active: [], team: [] },
    },
  };

  // Colores de tipos para botones y etiquetas.
  const TYPE_COLORS = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC',
  };

  // Iconos de categoría.
  const CATEGORY_ICONS = {
    physical: 'https://play.pokemonshowdown.com/sprites/categories/Physical.png',
    special: 'https://play.pokemonshowdown.com/sprites/categories/Special.png',
    status: 'https://play.pokemonshowdown.com/sprites/categories/Status.png',
  };

  const QUICK_TYPES = ['normal','fighting','flying','poison','ground','rock','bug','ghost','steel','fire','water','grass','electric','psychic','ice','dragon','dark','fairy'];
  const QUICK_CHART = {normal:{rock:.5,ghost:0,steel:.5},fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},bug:{fire:.5,grass:2,fighting:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},ghost:{normal:0,psychic:2,ghost:2,dark:.5},dragon:{dragon:2,steel:.5,fairy:0},dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}};

  // Equipo de respaldo si el usuario no tiene uno cargado.
  const FALLBACK_TEAM = [
    { id: 'dragonite', moves: ['Dragon Dance', 'Extreme Speed', 'Earthquake', 'Fire Punch'], item: 'Heavy-Duty Boots', ability: 'Multiscale', nature: 'Adamant', evs: { hp: 252, atk: 252, def: 4 } },
    { id: 'gholdengo', moves: ['Make It Rain', 'Shadow Ball', 'Nasty Plot', 'Recover'], item: 'Leftovers', ability: 'Good as Gold', nature: 'Timid', evs: { hp: 4, spa: 252, spe: 252 } },
    { id: 'greattusk', moves: ['Earthquake', 'Close Combat', 'Rapid Spin', 'Ice Spinner'], item: 'Booster Energy', ability: 'Protosynthesis', nature: 'Jolly', evs: { atk: 252, def: 4, spe: 252 } },
    { id: 'kingambit', moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance'], item: 'Black Glasses', ability: 'Supreme Overlord', nature: 'Adamant', evs: { hp: 124, atk: 252, spd: 132 } },
    { id: 'corviknight', moves: ['Brave Bird', 'U-turn', 'Roost', 'Defog'], item: 'Rocky Helmet', ability: 'Mirror Armor', nature: 'Impish', evs: { hp: 252, def: 168, spd: 88 } },
    { id: 'primarina', moves: ['Moonblast', 'Surf', 'Ice Beam', 'Calm Mind'], item: 'Leftovers', ability: 'Torrent', nature: 'Modest', evs: { hp: 172, spa: 252, spd: 84 } },
  ];

  const RANDOM_TEAM_POOL = [
    { id: 'dragonite', moves: ['Dragon Dance', 'Extreme Speed', 'Earthquake', 'Fire Punch'], item: 'Heavy-Duty Boots', ability: 'Multiscale', nature: 'Adamant', evs: { hp: 252, atk: 252, spe: 4 } },
    { id: 'gholdengo', moves: ['Make It Rain', 'Shadow Ball', 'Recover', 'Nasty Plot'], item: 'Leftovers', ability: 'Good as Gold', nature: 'Timid', evs: { hp: 4, spa: 252, spe: 252 } },
    { id: 'greattusk', moves: ['Headlong Rush', 'Close Combat', 'Rapid Spin', 'Ice Spinner'], item: 'Booster Energy', ability: 'Protosynthesis', nature: 'Jolly', evs: { atk: 252, def: 4, spe: 252 } },
    { id: 'kingambit', moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance'], item: 'Black Glasses', ability: 'Supreme Overlord', nature: 'Adamant', evs: { hp: 124, atk: 252, spd: 132 } },
    { id: 'corviknight', moves: ['Brave Bird', 'Body Press', 'Roost', 'U-turn'], item: 'Rocky Helmet', ability: 'Mirror Armor', nature: 'Impish', evs: { hp: 252, def: 168, spd: 88 } },
    { id: 'primarina', moves: ['Moonblast', 'Surf', 'Ice Beam', 'Calm Mind'], item: 'Leftovers', ability: 'Torrent', nature: 'Modest', evs: { hp: 172, spa: 252, spd: 84 } },
    { id: 'tinglu', moves: ['Earthquake', 'Ruination', 'Whirlwind', 'Stealth Rock'], item: 'Leftovers', ability: 'Vessel of Ruin', nature: 'Careful', evs: { hp: 252, def: 4, spd: 252 } },
    { id: 'ironvaliant', moves: ['Moonblast', 'Close Combat', 'Thunderbolt', 'Knock Off'], item: 'Booster Energy', ability: 'Quark Drive', nature: 'Naive', evs: { atk: 40, spa: 216, spe: 252 } },
    { id: 'gliscor', moves: ['Earthquake', 'Knock Off', 'Protect', 'Spikes'], item: 'Toxic Orb', ability: 'Poison Heal', nature: 'Impish', evs: { hp: 244, def: 184, spe: 80 } },
    { id: 'ragingbolt', moves: ['Thunderclap', 'Thunderbolt', 'Draco Meteor', 'Calm Mind'], item: 'Leftovers', ability: 'Protosynthesis', nature: 'Modest', evs: { hp: 72, spa: 252, spe: 184 } },
    { id: 'ogerponwellspring', moves: ['Ivy Cudgel', 'Power Whip', 'U-turn', 'Encore'], item: 'Wellspring Mask', ability: 'Water Absorb', nature: 'Jolly', evs: { atk: 252, spd: 4, spe: 252 } },
    { id: 'ironmoth', moves: ['Fiery Dance', 'Sludge Wave', 'Energy Ball', 'Morning Sun'], item: 'Booster Energy', ability: 'Quark Drive', nature: 'Timid', evs: { hp: 4, spa: 252, spe: 252 } },
  ];

  function q(id) { return document.getElementById(id); }
  function ownSlot() { return BC.slot || 'p1'; }
  function foeSlot() { return ownSlot() === 'p1' ? 'p2' : 'p1'; }
  function uiSide(simSide) { return simSide === ownSlot() ? 'p1' : 'p2'; }
  function getPokedex() { return typeof SD_POKEMON !== 'undefined' ? SD_POKEMON : (window.SD_POKEMON || {}); }
  function getMovedex() { return typeof SD_MOVES !== 'undefined' ? SD_MOVES : (window.SD_MOVES || {}); }

  // Normaliza texto para comparar ids y nombres.
  function normalizeText(value) {
    return (value || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  }

  // Extrae el nombre visible de especie desde el protocolo.
  function speciesName(value) {
    return ((`${value || ''}`.split(': ').pop() || '').split(',')[0] || '').trim();
  }

  function htmlToPlainText(html) {
    return `${html || ''}`.replace(/<[^>]+>/g, '').trim();
  }

  function requestIndex(ident) {
    const match = `${ident || ''}`.match(/^p[12]([abc])/);
    return match ? ({ a: 0, b: 1, c: 2 }[match[1]] ?? 0) : 0;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Interpreta strings tipo "321/321 brn" o "0 fnt".
  function parseCondition(value) {
    const text = `${value || ''}`.trim();
    if (!text) return { hp: null, maxhp: null, fainted: false, status: '' };
    if (text.endsWith(' fnt') || text === '0 fnt') return { hp: 0, maxhp: 100, fainted: true, status: '' };

    const [hpText, status = ''] = text.split(' ');
    if (hpText.includes('/')) {
      const [hp, maxhp] = hpText.split('/');
      return { hp: Number(hp) || 0, maxhp: Number(maxhp) || 100, fainted: false, status };
    }
    if (hpText.endsWith('%')) {
      return { hp: Number(hpText.replace('%', '')) || 0, maxhp: 100, fainted: false, status };
    }
    return { hp: null, maxhp: null, fainted: false, status };
  }

  // Busca un Pokémon del dataset por id, nombre EN o nombre ES.
  function getPokemonByName(name) {
    const key = normalizeText(name);
    if (!key) return null;
    return Object.values(getPokedex()).find((pokemon) => {
      const names = [pokemon.id, pokemon.name, window.PH_API?.helpers?.getNameEs?.('pokemon', pokemon.id, pokemon.name) || ''];
      return names.some((candidate) => normalizeText(candidate) === key);
    }) || null;
  }

  function spriteId(name, slotIndex = null) {
    const byName = getPokemonByName(name)?.id;
    if (byName) return byName;
    if (slotIndex !== null && BC.myTeam?.[slotIndex]?.id) return BC.myTeam[slotIndex].id;
    return normalizeText(name);
  }

  function spriteNumber(name, slotIndex = null) {
    const byName = getPokemonByName(name)?.num;
    if (byName) return byName;
    if (slotIndex !== null && BC.myTeam?.[slotIndex]?.id) {
      const knownPokemon = getPokedex()[BC.myTeam[slotIndex].id];
      if (knownPokemon?.num) return knownPokemon.num;
    }
    return null;
  }

  function pokemonData(name) {
    return getPokemonByName(name) || getPokedex()[normalizeText(name)] || null;
  }

  function showdownSprite(name, backSprite, slotIndex = null) {
    const folder = backSprite ? 'gen5-back' : 'gen5';
    return `https://play.pokemonshowdown.com/sprites/${folder}/${spriteId(name, slotIndex)}.png`;
  }

  function fallbackSprite(name, slotIndex = null) {
    const num = spriteNumber(name, slotIndex);
    return num ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${num}.png` : '';
  }

  function hpBarColor(percent) {
    if (percent > 50) return '#2dc76d';
    if (percent > 20) return '#f5a623';
    return '#e84545';
  }

  function statusName(status) {
    return { brn: 'Quemado', par: 'Paralizado', slp: 'Dormido', frz: 'Congelado', psn: 'Envenenado', tox: 'Tóxico' }[status] || status;
  }

  function statName(stat) {
    return { atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Vel', acc: 'Prec', eva: 'Eva' }[stat] || stat;
  }

  function statLongName(stat) {
    return { hp: 'PS', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Vel' }[stat] || stat;
  }

  // Convierte niveles de stat de Pokémon a multiplicador real.
  function statMultiplier(stage) {
    const clamped = Math.max(-6, Math.min(6, stage || 0));
    const value = clamped >= 0 ? (2 + clamped) / 2 : 2 / (2 + Math.abs(clamped));
    return Number(value.toFixed(2)).toString();
  }

  function boostedStatValue(base, stage) {
    if (!base) return null;
    return Math.round(base * Number(statMultiplier(stage)));
  }

  function pokemonTypes(name) {
    return pokemonData(name)?.types || [];
  }

  function renderTypeBadges(types = []) {
    return types.map((type) => `
      <span class="battle-inline-type" style="background:${TYPE_COLORS[(type || '').toLowerCase()] || '#8b95a7'}">
        ${typeName((type || '').toLowerCase())}
      </span>
    `).join('');
  }

  function abilityInfo(abilityName) {
    const id = normalizeText(abilityName);
    const entry = window.TRANSLATIONS_ES?.abilities?.[id];
    if (!entry) return { name: abilityName || 'Habilidad', desc: '' };
    const [es, en, desc] = Array.isArray(entry) ? entry : [entry, abilityName, ''];
    const primary = window.LANG === 'en' ? (en || es || abilityName) : (es || en || abilityName);
    const secondary = window.LANG === 'en' ? (es || '') : (en || '');
    return { name: secondary && secondary !== primary ? `${primary} / ${secondary}` : primary, desc: desc || '' };
  }

  function translationPair(category, id, fallback = '') {
    const entry = window.TRANSLATIONS_ES?.[category]?.[id];
    if (!entry) return { es: fallback || id, en: fallback || id };
    const [es, en] = Array.isArray(entry) ? entry : [entry, fallback || id];
    return { es: es || en || fallback || id, en: en || es || fallback || id };
  }

  function reverseLookup(section, value) {
    const normalized = normalizeText(value);
    const entries = Object.entries(window.TRANSLATIONS_ES?.[section] || {});
    const found = entries.find(([, entry]) => {
      const pair = Array.isArray(entry) ? entry : [entry, entry];
      return pair.some((item) => normalizeText(item) === normalized);
    });
    return found?.[0] || normalizeText(value);
  }

  function normalizeSavedTeamText(text) {
    const blocks = `${text || ''}`.trim().split(/\n\s*\n/).filter(Boolean);
    return blocks.map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return '';

      const first = lines[0];
      const atIndex = first.indexOf('@');
      const speciesPart = atIndex >= 0 ? first.slice(0, atIndex).trim() : first;
      const itemPart = atIndex >= 0 ? first.slice(atIndex + 1).trim() : '';
      const speciesMatch = speciesPart.match(/^(.*)\(([^)]+)\)$/);
      const nickname = speciesMatch ? speciesMatch[1].trim() : '';
      const rawSpecies = speciesMatch ? speciesMatch[2].trim() : speciesPart;
      const speciesId = reverseLookup('pokemon', rawSpecies);
      const itemId = itemPart ? reverseLookup('items', itemPart) : '';
      const visibleSpecies = nickname ? `${nickname} (${speciesId})` : speciesId;
      const normalizedLines = [itemId ? `${visibleSpecies} @ ${itemId}` : visibleSpecies];

      lines.slice(1).forEach((line) => {
        if (line.startsWith('Ability:')) {
          const value = line.replace('Ability:', '').trim();
          normalizedLines.push(`Ability: ${reverseLookup('abilities', value)}`);
          return;
        }
        if (line.startsWith('- ')) {
          const value = line.replace('- ', '').trim();
          normalizedLines.push(`- ${reverseLookup('moves', value)}`);
          return;
        }
        normalizedLines.push(line);
      });

      return normalizedLines.join('\n');
    }).filter(Boolean).join('\n\n');
  }

  function sidePokemon(request, index) { return request?.side?.pokemon?.[index] || null; }
  function isAlive(mon) { return !!mon && !`${mon.condition || ''}`.endsWith(' fnt'); }
  function targetTag(target) { return { ' 1': 'Rival 1', ' 2': 'Rival 2', ' -1': 'Yo', ' -2': 'Aliado' }[target] || target.trim(); }
  function moveData(move) { return getMovedex()[move?.id || normalizeText(move?.move || move)] || null; }

  function bilingualMoveNames(move) {
    const id = move?.id || normalizeText(move?.move || move);
    const data = moveData(move);
    const english = data?.name || move?.move || move || id || 'Movimiento';
    const pair = translationPair('moves', id, english);
    return pair.es !== pair.en ? { primary: pair.es, secondary: pair.en } : { primary: pair.es, secondary: '' };
  }

  function moveTooltipInfo(move) {
    const id = move?.id || normalizeText(move?.move || move);
    const data = moveData(move) || {};
    const pair = translationPair('moves', id, data.name || move?.move || id);
    const description = window.TRANSLATIONS_ES?.moves?.[id]?.[2] || 'Sin descripción.';
    const category = (data.category || '').toLowerCase();
    const categoryLabel = category === 'physical'
      ? 'Físico'
      : category === 'special'
        ? 'Especial'
        : category === 'status'
          ? 'Estado'
          : 'Movimiento';
    return {
      english: pair.en || data.name || move?.move || id,
      spanish: pair.es || pair.en || data.name || move?.move || id,
      description,
      power: data.power || '—',
      accuracy: data.accuracy || '—',
      type: (data.type || 'normal').toLowerCase(),
      category,
      categoryLabel,
      categoryIcon: CATEGORY_ICONS[category] || '',
    };
  }

  // Nombre del movimiento según el idioma actual.
  function moveName(move) {
    const names = bilingualMoveNames(move);
    return names.secondary ? `${names.primary} / ${names.secondary}` : names.primary;
  }

  function typeName(type) { return window.getTypeName ? window.getTypeName(type) : type; }
  function setAnnouncer(text) { const el = q('battle-announcer'); if (el) el.textContent = text || 'La batalla va a comenzar.'; }
  function updateStatus(message) { const el = q('battle-status-msg'); if (el) el.textContent = message; }
  function updateMoveArea(html) { const el = q('battle-move-area'); if (el) el.innerHTML = html; }
  function updateTurn(turn) { const el = q('battle-turn'); if (el) el.textContent = `Turno ${turn}`; }

  function addLog(html) {
    const log = q('battle-log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'battle-log-entry';
    entry.innerHTML = html;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    setAnnouncer(htmlToPlainText(html));
  }

  function protocolDelay(command) {
    if (command === 'move') return 750;
    if (['-damage', '-heal', '-status', '-curestatus', '-boost', '-unboost', 'faint'].includes(command)) return 500;
    if (['switch', 'drag'].includes(command)) return 550;
    if (command === 'turn') return 240;
    return 80;
  }

  async function drainProtocolQueue() {
    if (BC.protocolTimer) return;
    BC.protocolTimer = true;

    while (BC.protocolQueue.length) {
      const line = BC.protocolQueue.shift();
      const command = `${line || ''}`.split('|')[1] || '';
      applyProtocolLine(line);
      await wait(protocolDelay(command));
    }

    BC.protocolTimer = null;
  }

  function queueProtocolLine(line) {
    BC.protocolQueue.push(line);
    void drainProtocolQueue();
  }

  function ensureMetaRow(uiKey) {
    const infoBox = q(`battle-${uiKey}-poke-name`)?.closest('.battle-poke-info');
    if (!infoBox) return null;
    let row = infoBox.querySelector('.battle-meta-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'battle-meta-row';
      infoBox.appendChild(row);
    }
    return row;
  }

  function renderMeta(uiKey, activeState) {
    const row = ensureMetaRow(uiKey);
    if (!row) return;
    const pills = [];
    if (activeState?.status) pills.push(`<span class="battle-meta-pill battle-meta-status is-${activeState.status}">${statusName(activeState.status)}</span>`);
    Object.entries(activeState?.boosts || {}).forEach(([stat, stage]) => {
      pills.push(`<span class="battle-meta-pill ${stage > 0 ? 'is-up' : 'is-down'}">x${statMultiplier(stage)} ${statName(stat)}</span>`);
    });
    row.innerHTML = pills.join('');
  }

  function createBattleMon(pokemon, index) {
    const condition = parseCondition(pokemon?.condition);
    const name = speciesName(pokemon?.ident || pokemon?.details || `Slot ${index + 1}`);
    return {
      index,
      name,
      ident: pokemon?.ident || '',
      details: pokemon?.details || '',
      active: !!pokemon?.active,
      fainted: condition.fainted,
      hp: condition.hp,
      maxhp: condition.maxhp,
      status: condition.status,
      condition: pokemon?.condition || '',
      ability: pokemon?.ability || pokemon?.baseAbility || '',
      baseAbility: pokemon?.baseAbility || pokemon?.ability || '',
      stats: pokemon?.stats || null,
      types: pokemonTypes(name),
      boosts: {},
    };
  }

  function getActiveState(simSide, ident) {
    return BC.sim[simSide]?.active?.[requestIndex(ident)] || null;
  }

  function syncOwnTeam(request) {
    const side = request?.side;
    if (!side?.pokemon) return;
    BC.sim[ownSlot()].name = side.name || BC.sim[ownSlot()].name;
    BC.sim[ownSlot()].team = side.pokemon.map((pokemon, index) => {
      const previous = BC.sim[ownSlot()].team?.[index];
      const next = createBattleMon(pokemon, index);
      next.boosts = previous?.boosts || {};
      return next;
    });
    BC.sim[ownSlot()].active = BC.sim[ownSlot()].team.filter((pokemon) => pokemon.active);
    renderField();
  }

  function setActivePokemon(simSide, ident, details, conditionText) {
    const index = requestIndex(ident);
    const condition = parseCondition(conditionText);
    const name = speciesName(details || ident);
    const knownPokemon = BC.sim[simSide].team.find((pokemon) => normalizeText(pokemon?.name) === normalizeText(name)) || {};
    BC.sim[simSide].active[index] = {
      index,
      name,
      ident: ident || '',
      details: details || '',
      active: true,
      fainted: condition.fainted,
      hp: condition.hp,
      maxhp: condition.maxhp,
      status: condition.status,
      condition: conditionText || '',
      ability: knownPokemon.ability || knownPokemon.baseAbility || '',
      baseAbility: knownPokemon.baseAbility || knownPokemon.ability || '',
      stats: knownPokemon.stats || null,
      types: knownPokemon.types || pokemonTypes(name),
      boosts: {},
    };
    renderField();
    animateSprite(simSide, 'battle-switch-in');
  }

  function updateActivePokemon(simSide, ident, conditionText) {
    const activeState = getActiveState(simSide, ident);
    if (!activeState) return;
    const condition = parseCondition(conditionText);
    activeState.hp = condition.hp;
    activeState.maxhp = condition.maxhp || activeState.maxhp;
    activeState.fainted = condition.fainted;
    activeState.status = condition.status;
    activeState.condition = conditionText || activeState.condition;
    if (condition.fainted) activeState.active = false;
    renderField();
  }

  function updateBoost(simSide, ident, stat, amount) {
    const activeState = getActiveState(simSide, ident);
    if (!activeState) return;
    activeState.boosts[stat] = Math.max(-6, Math.min(6, (activeState.boosts[stat] || 0) + amount));
    if (!activeState.boosts[stat]) delete activeState.boosts[stat];
    renderField();
  }

  function clearBattleState() {
    BC.myRequest = null;
    BC.waiting = false;
    BC.pendingTurn = null;
    BC.pendingSwitch = null;
    BC.pendingPreview = [];
    BC.activeTool = '';
    BC.protocolQueue = [];
    BC.protocolTimer = null;
    BC.sim = {
      p1: { name: 'Jugador 1', active: [], team: [] },
      p2: { name: 'Jugador 2', active: [], team: [] },
    };
    setAnnouncer('La batalla va a comenzar.');
    renderBattleSideTool();
  }

  function renderMainPokemon(uiKey, activeState, ownPokemon) {
    const nameEl = q(`battle-${uiKey}-poke-name`);
    const hpTextEl = q(`battle-${uiKey}-hp-text`);
    const hpBarEl = q(`battle-${uiKey}-hp-bar`);
    const imgEl = q(`battle-${uiKey}-img`);

    if (!activeState) {
      if (nameEl) nameEl.textContent = '—';
      if (hpTextEl) hpTextEl.textContent = '—';
      if (hpBarEl) hpBarEl.style.width = '100%';
      if (imgEl) {
        imgEl.removeAttribute('src');
        imgEl.style.display = 'none';
      }
      renderSpriteTooltip(uiKey, null, ownPokemon);
      renderMeta(uiKey, null);
      return;
    }

    const percent = activeState.maxhp ? Math.max(0, Math.round(((activeState.hp || 0) / activeState.maxhp) * 100)) : 0;
    if (nameEl) {
      nameEl.innerHTML = `
        <span class="battle-name-line">${activeState.name}</span>
        <span class="battle-type-line">${renderTypeBadges(activeState.types || pokemonTypes(activeState.name))}</span>
      `;
    }
    if (hpTextEl) hpTextEl.textContent = activeState.fainted ? 'Debilitado' : `${activeState.hp ?? '?'} / ${activeState.maxhp ?? '?'}`;
    if (hpBarEl) {
      hpBarEl.style.width = `${percent}%`;
      hpBarEl.style.background = hpBarColor(percent);
    }
    if (imgEl) {
      imgEl.src = showdownSprite(activeState.name, ownPokemon, ownPokemon ? activeState.index : null);
      imgEl.alt = activeState.name;
      imgEl.onerror = () => {
        const backup = fallbackSprite(activeState.name, ownPokemon ? activeState.index : null);
        if (backup && imgEl.src !== backup) {
          imgEl.onerror = null;
          imgEl.src = backup;
          return;
        }
        imgEl.style.display = 'none';
      };
      imgEl.style.display = 'block';
    }
    renderSpriteTooltip(uiKey, activeState, ownPokemon);
    renderMeta(uiKey, activeState);
  }

  function renderSpriteTooltip(uiKey, activeState, ownPokemon) {
    const wrap = q(`battle-${uiKey}-sprite`);
    if (!wrap) return;

    let tooltip = wrap.querySelector('.battle-hover-card');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'battle-hover-card';
      wrap.appendChild(tooltip);
    }

    if (!ownPokemon || !activeState) {
      tooltip.innerHTML = '';
      tooltip.style.display = 'none';
      return;
    }

    const ability = abilityInfo(activeState.ability || activeState.baseAbility);
    const statRows = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map((stat) => {
      const base = stat === 'hp' ? (activeState.maxhp || activeState.stats?.hp || null) : (activeState.stats?.[stat] || null);
      const stage = activeState.boosts?.[stat] || 0;
      const boosted = stat === 'hp' ? base : boostedStatValue(base, stage);
      const changed = boosted && base && boosted !== base;
      const stateClass = changed ? (boosted > base ? 'is-up' : 'is-down') : '';
      return `
        <div class="battle-hover-stat ${stateClass}">
          <span>${statLongName(stat)}</span>
          <span>${stat === 'hp' ? `${activeState.hp ?? base} / ${base ?? '—'}` : (base ?? '—')}</span>
          ${changed ? `<strong>${boosted}</strong>` : ''}
        </div>
      `;
    }).join('');

    tooltip.style.display = 'block';
    tooltip.innerHTML = `
      <div class="battle-hover-title">${activeState.name}</div>
      <div class="battle-hover-types">${renderTypeBadges(activeState.types || pokemonTypes(activeState.name))}</div>
      <div class="battle-hover-ability">${ability.name}</div>
      ${ability.desc ? `<div class="battle-hover-desc">${ability.desc}</div>` : ''}
      <div class="battle-hover-stats">${statRows}</div>
    `;
  }

  function renderMiniCard(simSide, activeState, index, ownPokemon) {
    if (!activeState) return '<div class="battle-mini-card battle-mini-card-empty">Sin Pokémon</div>';

    const percent = activeState.maxhp ? Math.max(0, Math.round(((activeState.hp || 0) / activeState.maxhp) * 100)) : 0;
    const num = spriteNumber(activeState.name, ownPokemon ? activeState.index : null);
    const extras = [];

    if (activeState.status) extras.push(statusName(activeState.status));
    Object.entries(activeState.boosts || {}).forEach(([stat, value]) => {
      extras.push(`x${statMultiplier(value)} ${statName(stat)}`);
    });

    return `
      <div class="battle-mini-card ${activeState.fainted ? 'is-fainted' : ''}">
        <div class="battle-mini-card-head">
          <strong>${activeState.name}</strong>
          <span>${ownPokemon ? `Slot ${index + 1}` : simSide.toUpperCase()}</span>
        </div>
        <div class="battle-mini-card-body">
          ${num ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png" alt="${activeState.name}" class="battle-mini-sprite" />` : ''}
          <div class="battle-mini-meta">
            <div class="battle-mini-bar">
              <span style="width:${percent}%;background:${hpBarColor(percent)}"></span>
            </div>
            <div class="battle-mini-text">${activeState.fainted ? 'Debilitado' : `${activeState.hp ?? '?'} / ${activeState.maxhp ?? '?'}`}</div>
            ${extras.length ? `<div class="battle-mini-text battle-mini-tags">${extras.join(' · ')}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderField() {
    const own = BC.sim[ownSlot()];
    const foe = BC.sim[foeSlot()];

    if (q('battle-p1-name')) q('battle-p1-name').textContent = own.name || 'Tú';
    if (q('battle-p2-name')) q('battle-p2-name').textContent = foe.name || 'Rival';

    renderMainPokemon('p1', own.active[0] || own.team.find((pokemon) => pokemon.active) || own.team[0] || null, true);
    renderMainPokemon('p2', foe.active[0] || foe.team.find((pokemon) => pokemon.active) || null, false);

    if (q('battle-p1-active-strip')) {
      q('battle-p1-active-strip').innerHTML = own.active.map((pokemon, index) => renderMiniCard(ownSlot(), pokemon, index, true)).join('');
    }

    if (q('battle-p2-active-strip')) {
      q('battle-p2-active-strip').innerHTML = foe.active.map((pokemon, index) => renderMiniCard(foeSlot(), pokemon, index, false)).join('');
    }
  }

  function quickEffect(attackType, defendTypes) {
    return defendTypes.reduce((value, defendType) => value * (((QUICK_CHART[attackType] || {})[defendType]) ?? 1), 1);
  }

  function renderCompactTypeTool() {
    const panel = q('battle-side-tool-panel');
    if (!panel) return;
    BC.compactTypes = BC.compactTypes?.length ? BC.compactTypes.slice(0, 2) : ['grass', 'fairy'];

    if (window.PHTypeCalc?.mount) {
      window.PHTypeCalc.mount(panel, {
        editing: 'defense',
        defender: BC.compactTypes,
        attacker: ['flying'],
        attackMode: 1,
      }, {
        compact: true,
        onChange(nextState) {
          BC.compactTypes = [...(nextState.defender || ['grass', 'fairy'])];
        },
      });
      return;
    }

    panel.innerHTML = '<div class="battle-tool-result"><div class="battle-tool-result-sub">No se pudo cargar la calculadora de tipos.</div></div>';
  }

  function compactResultNames(result) {
    const bilingual = window.getBilingualNames ? window.getBilingualNames(result) : { es: result.name_es || result.name || result.id, en: result.name || result.id };
    return bilingual.en && bilingual.en !== bilingual.es ? `${bilingual.es} / ${bilingual.en}` : bilingual.es;
  }

  async function runCompactGlossarySearch() {
    const panel = q('battle-side-tool-panel');
    const input = q('battle-tool-search');
    if (!panel || !input) return;

    const query = input.value.trim();
    const tab = BC.compactToolTab || 'pokemon';
    if (query.length < 2) {
      const results = panel.querySelector('.battle-tool-results');
      if (results) results.innerHTML = '<div class="battle-tool-result"><div class="battle-tool-result-sub">Escribe al menos 2 letras.</div></div>';
      return;
    }

    const api = window.PH_API?.[tab];
    if (!api?.search) return;

    const response = await api.search(query, { limit: 8 });
    const results = response?.results || [];
    const resultsBox = panel.querySelector('.battle-tool-results');
    if (!resultsBox) return;

    if (!results.length) {
      resultsBox.innerHTML = '<div class="battle-tool-result"><div class="battle-tool-result-sub">Sin resultados.</div></div>';
      return;
    }

    resultsBox.innerHTML = results.map((result) => {
      if (tab === 'pokemon') {
        const types = [result.type1, result.type2].filter(Boolean).map((type) => typeName(type)).join(' · ');
        return `<button class="battle-tool-result" data-battle-tool-id="${result.id}"><div class="battle-tool-result-name">${compactResultNames(result)}</div><div class="battle-tool-result-sub">${types || 'Pokémon competitivo'}</div></button>`;
      }
      if (tab === 'moves') {
        return `<button class="battle-tool-result" data-battle-tool-id="${result.id}"><div class="battle-tool-result-name">${compactResultNames(result)}</div><div class="battle-tool-result-sub">${typeName(result.type)} · ${result.category} · Pot ${result.power || '—'}</div></button>`;
      }
      return `<button class="battle-tool-result" data-battle-tool-id="${result.id}"><div class="battle-tool-result-name">${compactResultNames(result)}</div><div class="battle-tool-result-sub">${result.description || 'Habilidad competitiva'}</div></button>`;
    }).join('');

    resultsBox.querySelectorAll('[data-battle-tool-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.battleToolId;
        const detail = await api.get(id);
        if (!detail) return;
        const resultsHtml = tab === 'pokemon'
          ? `<div class="battle-tool-result"><div class="battle-tool-result-name">${compactResultNames(detail)}</div><div class="battle-tool-result-sub">${[detail.type1, detail.type2].filter(Boolean).map((type) => typeName(type)).join(' · ')}</div><div class="battle-tool-result-sub">HP ${detail.hp || '—'} · Atk ${detail.atk || '—'} · Def ${detail.def || '—'} · SpA ${detail.spa || '—'} · SpD ${detail.spd || '—'} · Vel ${detail.spe || '—'}</div></div>`
          : tab === 'moves'
            ? `<div class="battle-tool-result"><div class="battle-tool-result-name">${compactResultNames(detail)}</div><div class="battle-tool-result-sub">${typeName(detail.type)} · ${detail.category} · Pot ${detail.power || '—'} · Prec ${detail.accuracy || '—'} · PP ${detail.pp || '—'}</div></div>`
            : `<div class="battle-tool-result"><div class="battle-tool-result-name">${compactResultNames(detail)}</div><div class="battle-tool-result-sub">${detail.description || 'Sin descripción'}</div></div>`;
        resultsBox.innerHTML = resultsHtml;
      });
    });
  }

  function renderCompactGlossaryTool() {
    const panel = q('battle-side-tool-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="battle-tool-tabs">
        <button class="battle-tool-tab ${BC.compactToolTab === 'pokemon' ? 'is-active' : ''}" data-battle-tool-tab="pokemon">Pokémon</button>
        <button class="battle-tool-tab ${BC.compactToolTab === 'moves' ? 'is-active' : ''}" data-battle-tool-tab="moves">Movs</button>
        <button class="battle-tool-tab ${BC.compactToolTab === 'abilities' ? 'is-active' : ''}" data-battle-tool-tab="abilities">Hab.</button>
      </div>
      <input id="battle-tool-search" class="battle-tool-search" type="text" placeholder="Buscar..." />
      <div class="battle-tool-results">
        <div class="battle-tool-result"><div class="battle-tool-result-sub">Escribe al menos 2 letras.</div></div>
      </div>
    `;

    panel.querySelectorAll('[data-battle-tool-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        BC.compactToolTab = button.dataset.battleToolTab;
        renderCompactGlossaryTool();
      });
    });

    q('battle-tool-search')?.addEventListener('input', () => {
      void runCompactGlossarySearch();
    });
  }

  function renderBattleSideTool() {
    const panel = q('battle-side-tool-panel');
    const glossaryBtn = q('battle-tool-glossary-btn');
    const typesBtn = q('battle-tool-types-btn');
    if (!panel || !glossaryBtn || !typesBtn) return;

    glossaryBtn.classList.toggle('is-active', BC.activeTool === 'glossary');
    typesBtn.classList.toggle('is-active', BC.activeTool === 'types');

    if (!BC.activeTool) {
      panel.style.display = 'none';
      panel.innerHTML = '';
      return;
    }

    panel.style.display = 'block';
    if (BC.activeTool === 'glossary') renderCompactGlossaryTool();
    if (BC.activeTool === 'types') renderCompactTypeTool();
  }

  function toggleBattleTool(tool) {
    BC.activeTool = BC.activeTool === tool ? '' : tool;
    renderBattleSideTool();
  }

  function animateSprite(simSide, className) {
    const el = q(`battle-${uiSide(simSide)}-sprite`);
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), 420);
  }

  function flashDamage(simSide) { animateSprite(simSide, 'battle-hit'); }
  function playAttackAnimation(simSide) { animateSprite(simSide, 'battle-attack'); }

  function connectBattle() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    BC.ws = new WebSocket(`${protocol}//${location.host}`);

    BC.ws.onopen = () => updateStatus('Conectado al servidor. Listo para combatir.');
    BC.ws.onclose = () => updateStatus('Desconectado. Recarga la página para reconectar.');
    BC.ws.onerror = () => updateStatus('Error de conexión. Comprueba el backend.');
    BC.ws.onmessage = (event) => {
      try {
        handleMessage(JSON.parse(event.data));
      } catch (error) {
        console.error('WS parse error', error);
      }
    };
  }

  function handleMessage(msg) {
    switch (msg.type) {
      case 'waiting':
        updateStatus(msg.message || 'Buscando rival...');
        setAnnouncer(msg.message || 'Buscando rival...');
        break;
      case 'match_found':
        BC.roomId = msg.roomId;
        BC.slot = msg.slot;
        BC.waiting = false;
        showArena();
        updateStatus(`Rival encontrado: ${msg.opponent}.`);
        setAnnouncer(`Te enfrentas a ${msg.opponent}.`);
        renderField();
        break;
      case 'room_created':
        BC.roomId = msg.roomId;
        BC.slot = msg.slot || 'p1';
        updateStatus(`Sala creada: ${msg.roomId}. Esperando rival...`);
        setAnnouncer(`Sala ${msg.roomId} creada.`);
        if (q('battle-room-id')) {
          q('battle-room-id').textContent = msg.roomId;
          q('battle-room-id').style.display = 'block';
        }
        break;
      case 'connected':
        BC.slot = msg.slot;
        updateStatus(`Conectado como ${msg.slot}. Esperando al otro jugador...`);
        setAnnouncer(`Conectado como ${msg.slot}.`);
        renderField();
        break;
      case 'room_update':
        if (msg.roomId === BC.roomId) {
          const readyPlayers = Object.values(msg.ready || {}).filter(Boolean).length;
          updateStatus(`Sala ${msg.roomId}: ${readyPlayers}/2 jugadores listos.`);
        }
        break;
      case 'battle_start':
        showArena();
        addLog('La batalla ha comenzado.');
        updateMoveArea('<div class="battle-waiting">Esperando primer request...</div>');
        break;
      case 'protocol':
        queueProtocolLine(msg.line);
        break;
      case 'request':
        BC.myRequest = msg.request || null;
        syncOwnTeam(BC.myRequest);
        renderRequest(BC.myRequest);
        break;
      case 'request_opponent':
        BC.waiting = true;
        setAnnouncer('Esperando la decisión del rival.');
        updateMoveArea('<div class="battle-waiting">Esperando al rival...</div>');
        break;
      case 'win':
        addLog(`<strong>${msg.winner} ha ganado la batalla.</strong>`);
        updateMoveArea(`<div class="battle-end">${msg.winner} gana.</div>`);
        break;
      case 'tie':
        addLog('<strong>Empate.</strong>');
        updateMoveArea('<div class="battle-end">Empate.</div>');
        break;
      case 'opponent_left':
        addLog('El rival se ha desconectado.');
        updateMoveArea('<div class="battle-end">El rival ha salido.</div>');
        break;
      case 'error':
        addLog(`Error: ${msg.message}`);
        updateStatus(msg.message || 'Ha ocurrido un error.');
        if ((msg.message || '').includes('Equipo ') && !BC.myRequest) showIntro();
        break;
    }
  }

  function applyProtocolLine(line) {
    if (!line || !line.startsWith('|')) return;

    const parts = line.split('|');
    const command = parts[1];

    switch (command) {
      case 'player':
        if (parts[2] && BC.sim[parts[2]]) {
          BC.sim[parts[2]].name = parts[3] || BC.sim[parts[2]].name;
          renderField();
        }
        break;
      case 'switch':
      case 'drag': {
        const ident = parts[2] || '';
        const simSide = ident.slice(0, 2);
        setActivePokemon(simSide, ident, parts[3], parts[4]);
        addLog(`${BC.sim[simSide]?.name || simSide} saca a ${speciesName(parts[3])}.`);
        break;
      }
      case 'move':
        playAttackAnimation((parts[2] || '').slice(0, 2));
        addLog(`${speciesName(parts[2])} usa <strong>${moveName({ id: normalizeText(parts[3]), move: parts[3] })}</strong>.`);
        break;
      case '-damage':
        updateActivePokemon((parts[2] || '').slice(0, 2), parts[2], parts[3]);
        addLog(`${speciesName(parts[2])} pierde vida.`);
        flashDamage((parts[2] || '').slice(0, 2));
        break;
      case '-heal':
        updateActivePokemon((parts[2] || '').slice(0, 2), parts[2], parts[3]);
        addLog(`${speciesName(parts[2])} recupera vida.`);
        break;
      case '-status': {
        const simSide = (parts[2] || '').slice(0, 2);
        const activeState = getActiveState(simSide, parts[2]);
        if (activeState) {
          activeState.status = parts[3];
          renderField();
        }
        addLog(`${speciesName(parts[2])} queda ${statusName(parts[3])}.`);
        break;
      }
      case '-curestatus': {
        const simSide = (parts[2] || '').slice(0, 2);
        const activeState = getActiveState(simSide, parts[2]);
        if (activeState) {
          activeState.status = '';
          renderField();
        }
        addLog(`${speciesName(parts[2])} se cura de ${statusName(parts[3])}.`);
        break;
      }
      case 'faint':
        updateActivePokemon((parts[2] || '').slice(0, 2), parts[2], '0 fnt');
        addLog(`${speciesName(parts[2])} se ha debilitado.`);
        break;
      case '-supereffective':
        addLog('<em>Es muy efectivo.</em>');
        break;
      case '-resisted':
        addLog('<em>No es muy efectivo.</em>');
        break;
      case '-immune':
        addLog('<em>No afecta al objetivo.</em>');
        break;
      case '-miss':
        addLog('<em>El ataque falló.</em>');
        break;
      case '-boost':
        updateBoost((parts[2] || '').slice(0, 2), parts[2], parts[3], Number(parts[4]) || 1);
        addLog(`${speciesName(parts[2])} sube ${statName(parts[3])} x${parts[4]}.`);
        break;
      case '-unboost':
        updateBoost((parts[2] || '').slice(0, 2), parts[2], parts[3], -(Number(parts[4]) || 1));
        addLog(`${speciesName(parts[2])} baja ${statName(parts[3])} x${parts[4]}.`);
        break;
      case '-clearboost':
        Object.values(BC.sim).forEach((side) => side.active.forEach((pokemon) => { if (pokemon) pokemon.boosts = {}; }));
        renderField();
        break;
      case '-weather':
        addLog(`Clima: ${parts[2]}.`);
        break;
      case '-sidestart':
        addLog(`${parts[3]} aparece en el lado de ${parts[2]}.`);
        break;
      case 'turn':
        updateTurn(Number(parts[2]) || 1);
        addLog(`<strong>Turno ${parts[2]}</strong>`);
        break;
      case 'teampreview':
        addLog('Team preview.');
        break;
      case 'win':
        addLog(`<strong>${parts[2]} ha ganado.</strong>`);
        break;
    }
  }

  function showArena() {
    if (q('battle-intro')) q('battle-intro').style.display = 'none';
    if (q('battle-arena')) q('battle-arena').style.display = 'block';
  }

  function showIntro() {
    if (q('battle-intro')) q('battle-intro').style.display = 'block';
    if (q('battle-arena')) q('battle-arena').style.display = 'none';
  }

  function resetArena() {
    clearBattleState();
    if (q('battle-log')) q('battle-log').innerHTML = '';
    updateTurn(1);
    renderField();
    updateMoveArea('<div class="battle-waiting">Esperando inicio de batalla...</div>');
  }

  function sendChoice(choice) {
    if (!BC.ws || BC.ws.readyState !== 1 || !choice) return;
    BC.waiting = true;
    BC.ws.send(JSON.stringify({ type: 'choice', choice }));
    setAnnouncer('Decisión enviada.');
    updateMoveArea('<div class="battle-waiting">Elección enviada. Esperando al rival...</div>');
  }

  function trySendPendingTurn() {
    if (!BC.pendingTurn || BC.pendingTurn.some((choice) => !choice) || BC.waiting) return;
    sendChoice(BC.pendingTurn.join(', '));
  }

  function trySendPendingSwitch(mustSwitch) {
    if (!BC.pendingSwitch || BC.waiting) return;
    if (mustSwitch.some((needed, index) => needed && !BC.pendingSwitch[index])) return;
    const choice = mustSwitch.map((needed, index) => (needed ? (BC.pendingSwitch[index] || 'pass') : 'pass')).join(', ');
    sendChoice(choice);
  }

  function renderRequest(request) {
    if (!request) {
      updateMoveArea('<div class="battle-waiting">Sin request activo.</div>');
      return;
    }
    if (request.wait) {
      BC.waiting = true;
      setAnnouncer('Esperando la decisión del rival.');
      updateMoveArea('<div class="battle-waiting">Esperando al rival...</div>');
      return;
    }

    BC.waiting = false;
    if (request.teamPreview) {
      BC.pendingPreview = [];
      renderPreview(request);
      return;
    }
    if (request.forceSwitch) {
      BC.pendingSwitch = new Array(request.forceSwitch.length).fill(null);
      renderForcedSwitch(request);
      return;
    }
    if (request.active) {
      BC.pendingTurn = new Array(request.active.length).fill(null);
      renderTurn(request);
      return;
    }
    updateMoveArea('<div class="battle-waiting">Esperando al rival...</div>');
  }

  function renderPreview(request) {
    const team = request?.side?.pokemon || [];
    const need = request.maxChosenTeamSize || team.length;
    const current = BC.pendingPreview;

    setAnnouncer('Elige el orden inicial de tu equipo.');
    updateMoveArea(`
      <div class="battle-request-card">
        <div class="battle-request-title">Team Preview</div>
        <div class="battle-request-subtitle">Elige ${need} Pokémon para el orden inicial.</div>
        <div class="battle-pick-order">
          ${current.length ? current.map((slot, index) => `<span class="battle-pick-chip">${index + 1}. ${speciesName(team[slot]?.ident || team[slot]?.details)}</span>`).join('') : '<span class="battle-waiting">Todavía no has elegido ningún Pokémon.</span>'}
        </div>
        <div class="battle-switch-grid">
          ${team.map((pokemon, index) => {
            const name = speciesName(pokemon.ident || pokemon.details || `Slot ${index + 1}`);
            const picked = current.indexOf(index);
            const num = spriteNumber(name, index);
            return `
              <button class="battle-switch-btn ${picked >= 0 ? 'is-selected' : ''}" data-team-slot="${index}">
                ${num ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png" alt="${name}" style="width:32px;height:32px;image-rendering:pixelated" />` : ''}
                <div>
                  <div style="font-size:12px;font-weight:700">${name}</div>
                  <div style="font-size:11px;color:#5b6474">${picked >= 0 ? `Elegido #${picked + 1}` : (pokemon.details || pokemon.condition || 'Listo')}</div>
                </div>
              </button>
            `;
          }).join('')}
        </div>
        <div class="battle-request-actions">
          <button class="btn-secondary" id="battle-preview-reset">Reset</button>
          <button class="btn-secondary" id="battle-preview-default">Orden por defecto</button>
          <button class="btn-primary" id="battle-preview-send" ${current.length < need ? 'disabled' : ''}>Confirmar</button>
        </div>
      </div>
    `);

    document.querySelectorAll('[data-team-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = Number(btn.dataset.teamSlot);
        const index = BC.pendingPreview.indexOf(slot);
        if (index >= 0) BC.pendingPreview.splice(index, 1);
        else if (BC.pendingPreview.length < need) BC.pendingPreview.push(slot);
        renderPreview(request);
      });
    });

    q('battle-preview-reset')?.addEventListener('click', () => {
      BC.pendingPreview = [];
      renderPreview(request);
    });
    q('battle-preview-default')?.addEventListener('click', () => {
      BC.pendingPreview = team.map((_, index) => index).slice(0, need);
      renderPreview(request);
    });
    q('battle-preview-send')?.addEventListener('click', () => {
      if (BC.pendingPreview.length < need) return;
      sendChoice(`team ${BC.pendingPreview.map((index) => index + 1).join('')}`);
    });
  }

  function renderForcedSwitch(request) {
    const team = request?.side?.pokemon || [];
    const mustSwitch = request.forceSwitch || [];

    setAnnouncer('Debes elegir un cambio.');
    updateMoveArea(`
      <div class="battle-request-card">
        <div class="battle-request-title">Cambio forzado</div>
        <div class="battle-request-subtitle">Elige relevo para cada hueco obligatorio.</div>
        <div class="battle-request-stack">
          ${mustSwitch.map((needed, activeIndex) => {
            if (!needed) {
              return `<div class="battle-request-slot"><div class="battle-request-slot-title">Hueco ${activeIndex + 1}</div><div class="battle-waiting">No necesita cambio.</div></div>`;
            }
            return `
              <div class="battle-request-slot">
                <div class="battle-request-slot-title">Hueco ${activeIndex + 1}</div>
                <div class="battle-switch-grid">
                  ${team.map((pokemon, index) => {
                    const condition = parseCondition(pokemon.condition);
                    const disabled = pokemon.active || condition.fainted;
                    const name = speciesName(pokemon.ident || pokemon.details || `Slot ${index + 1}`);
                    const num = spriteNumber(name, index);
                    const selected = BC.pendingSwitch[activeIndex] === `switch ${index + 1}`;
                    return `
                      <button class="battle-switch-btn ${selected ? 'is-selected' : ''}" data-force-active="${activeIndex}" data-force-slot="${index}" ${disabled ? 'disabled' : ''}>
                        ${num ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png" alt="${name}" style="width:32px;height:32px;image-rendering:pixelated" />` : ''}
                        <div>
                          <div style="font-size:12px;font-weight:700">${name}</div>
                          <div style="font-size:11px;color:${disabled ? '#c94a4a' : '#5b6474'}">${disabled ? 'No disponible' : pokemon.condition}</div>
                        </div>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `);

    document.querySelectorAll('[data-force-active][data-force-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const activeIndex = Number(btn.dataset.forceActive);
        const slot = Number(btn.dataset.forceSlot);
        BC.pendingSwitch[activeIndex] = `switch ${slot + 1}`;
        renderForcedSwitch(request);
        trySendPendingSwitch(mustSwitch);
      });
    });
  }

  function targetChoices(request, activeIndex, move) {
    const activeCount = request?.active?.length || 1;
    if (activeCount <= 1) return [''];

    const target = move?.target;
    const allyIndex = activeIndex ^ 1;
    const hasAlly = isAlive(sidePokemon(request, allyIndex));
    const foeTargets = [];

    for (let i = 0; i < activeCount; i++) {
      if (i !== activeIndex && isAlive(sidePokemon(request, i))) foeTargets.push(` ${i + 1}`);
    }

    if (['adjacentFoe', 'normal', 'any'].includes(target)) return foeTargets.length ? foeTargets : [''];
    if (target === 'adjacentAlly') return hasAlly ? [` -${allyIndex + 1}`] : [''];
    if (target === 'adjacentAllyOrSelf') {
      const result = [` -${activeIndex + 1}`];
      if (hasAlly) result.push(` -${allyIndex + 1}`);
      return result;
    }
    return [''];
  }

  function renderTurn(request) {
    setAnnouncer('Tu turno. Elige movimiento o cambio.');
    updateMoveArea(`
      <div class="battle-request-card">
        <div class="battle-request-title">Tu turno</div>
        <div class="battle-request-subtitle">Elige acción para cada Pokémon activo.</div>
        <div class="battle-request-stack">${request.active.map((active, index) => renderTurnSlot(request, active, index)).join('')}</div>
      </div>
    `);

    document.querySelectorAll('[data-move-active][data-move-slot][data-target-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const activeIndex = Number(btn.dataset.moveActive);
        const moveSlot = Number(btn.dataset.moveSlot);
        const target = btn.dataset.targetChoice || '';
        BC.pendingTurn[activeIndex] = `move ${moveSlot + 1}${target}`;
        renderTurn(request);
        trySendPendingTurn();
      });
    });

    document.querySelectorAll('[data-switch-active][data-switch-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const activeIndex = Number(btn.dataset.switchActive);
        const slot = Number(btn.dataset.switchSlot);
        BC.pendingTurn[activeIndex] = `switch ${slot + 1}`;
        renderTurn(request);
        trySendPendingTurn();
      });
    });
  }

  function renderTurnSlot(request, active, activeIndex) {
    const side = request?.side?.pokemon || [];
    const self = side[activeIndex];
    const selfName = speciesName(self?.ident || self?.details || `Slot ${activeIndex + 1}`);

    if (!active || self?.condition?.endsWith(' fnt') || self?.commanding) {
      BC.pendingTurn[activeIndex] = 'pass';
      return `<div class="battle-request-slot"><div class="battle-request-slot-title">${selfName}</div><div class="battle-waiting">Este hueco no requiere acción.</div></div>`;
    }

    const movesHtml = (active.moves || []).map((move, moveIndex) => {
      const fullMove = moveData(move) || {};
      const type = (fullMove.type || 'normal').toLowerCase();
      const color = TYPE_COLORS[type] || '#8b95a7';
      return targetChoices(request, activeIndex, move).map((target) => {
        const selected = BC.pendingTurn[activeIndex] === `move ${moveIndex + 1}${target}`;
        const info = moveTooltipInfo(move);
        return `
          <button class="battle-move-btn ${selected ? 'is-selected' : ''}" data-move-active="${activeIndex}" data-move-slot="${moveIndex}" data-target-choice="${target}" ${move.disabled ? 'disabled' : ''} style="border-left:4px solid ${color}">
            <div class="battle-move-name">${info.english}</div>
            <div class="battle-move-subname">${info.spanish}</div>
            <div class="battle-move-info">
              <span class="battle-move-type" style="background:${color}">${typeName(type)}</span>
              <span class="battle-move-pp">${move.pp}/${move.maxpp} PP</span>
              ${target ? `<span class="battle-choice-tag">${targetTag(target)}</span>` : ''}
            </div>
            <div class="battle-move-hover-card">
              <div class="battle-move-hover-head">
                <div>
                  <div class="battle-move-hover-en">${info.english}</div>
                  <div class="battle-move-hover-es">${info.spanish}</div>
                </div>
                <div class="battle-move-hover-pp">${move.pp}/${move.maxpp} PP</div>
              </div>
              <div class="battle-move-hover-desc">${info.description}</div>
              <div class="battle-move-hover-meta">
                <span class="battle-move-hover-tag">Potencia ${info.power}</span>
                <span class="battle-move-hover-tag">Precisión ${info.accuracy}</span>
                <span class="battle-move-hover-tag battle-move-hover-tag-type" style="background:${TYPE_COLORS[info.type] || '#8b95a7'}">${typeName(info.type)}</span>
                <span class="battle-move-hover-tag">${info.categoryIcon ? `<img src="${info.categoryIcon}" alt="" style="height:14px" />` : ''}${info.categoryLabel}</span>
              </div>
            </div>
          </button>
        `;
      }).join('');
    }).join('');

    const switchesHtml = active.trapped
      ? '<div class="battle-waiting">No puede cambiar.</div>'
      : side.map((pokemon, index) => {
          const condition = parseCondition(pokemon.condition);
          const disabled = pokemon.active || condition.fainted;
          const name = speciesName(pokemon.ident || pokemon.details || `Slot ${index + 1}`);
          const num = spriteNumber(name, index);
          const selected = BC.pendingTurn[activeIndex] === `switch ${index + 1}`;
          return `
            <button class="battle-switch-btn ${selected ? 'is-selected' : ''}" data-switch-active="${activeIndex}" data-switch-slot="${index}" ${disabled ? 'disabled' : ''}>
              ${num ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png" alt="${name}" style="width:32px;height:32px;image-rendering:pixelated" />` : ''}
              <div>
                <div style="font-size:12px;font-weight:700">${name}</div>
                <div style="font-size:11px;color:${disabled ? '#c94a4a' : '#5b6474'}">${disabled ? 'No disponible' : pokemon.condition}</div>
              </div>
            </button>
          `;
        }).join('');

    return `
      <div class="battle-request-slot">
        <div class="battle-request-slot-title">${selfName}</div>
        <div class="battle-request-section-title">Movimientos</div>
        <div class="battle-moves-grid">${movesHtml || '<div class="battle-waiting">Sin movimientos disponibles.</div>'}</div>
        <div class="battle-request-section-title">Cambios</div>
        <div class="battle-switch-grid">${switchesHtml}</div>
      </div>
    `;
  }

  async function startBattleAction(action) {
    if (!BC.ws || BC.ws.readyState !== 1) {
      updateStatus('No hay conexión con el servidor.');
      return;
    }

    const trainerName = q('battle-trainer-name')?.value || 'Entrenador';
    const format = q('battle-format')?.value || 'gen9ou';

    let teamSpec;
    try {
      teamSpec = await getBattleTeamSpec(format);
    } catch {
      return;
    }

    BC.myTeam = teamSpec.previewTeam || [];
    BC.roomId = null;
    BC.slot = null;
    resetArena();

    const payload = { action, name: trainerName, format, ...teamSpec.payload };
    if (action === 'practice_battle' && teamSpec.botPayload) Object.assign(payload, teamSpec.botPayload);

    BC.ws.send(JSON.stringify(payload));
    updateStatus(action === 'find_battle' ? 'Buscando rival...' : 'Preparando combate...');
    setAnnouncer(action === 'find_battle' ? 'Buscando rival...' : 'Preparando combate...');
  }

  function battleFindMatch() { void startBattleAction('find_battle'); }
  function battlePracticeMatch() { void startBattleAction('practice_battle'); }
  function battleCreateRoom() { void startBattleAction('create_room'); }

  async function battleJoinRoom() {
    const roomId = q('battle-join-id')?.value?.trim();
    const trainerName = q('battle-trainer-name')?.value || 'Entrenador';
    const format = q('battle-format')?.value || 'gen9ou';
    if (!roomId || !BC.ws) return;

    let teamSpec;
    try {
      teamSpec = await getBattleTeamSpec(format);
    } catch {
      return;
    }

    BC.myTeam = teamSpec.previewTeam || [];
    BC.roomId = roomId;
    BC.slot = 'p2';
    resetArena();

    BC.ws.send(JSON.stringify({
      action: 'join_room',
      roomId,
      name: trainerName,
      slot: 'p2',
      format,
      ...teamSpec.payload,
    }));

    updateStatus(`Uniéndote a la sala ${roomId}...`);
    setAnnouncer(`Uniéndote a la sala ${roomId}.`);
  }

  function buildTeamForBattle() {
    const exportedTeam = typeof TEAM === 'undefined'
      ? []
      : TEAM.filter((slot) => slot.id).map((slot) => ({
          id: slot.name_en,
          name: slot.name_es || slot.name_en,
          level: 100,
          item: slot.item || '',
          ability: slot.ability || '',
          nature: slot.nature || 'Hardy',
          moves: slot.moves.filter(Boolean),
          evs: slot.evs,
          ivs: slot.ivs,
        }));

    if (exportedTeam.length) return exportedTeam;

    return FALLBACK_TEAM.map((slot) => {
      const species = getPokedex()[slot.id];
      if (!species) return null;
      return {
        id: slot.id,
        name: window.PH_API?.helpers?.getNameEs?.('pokemon', slot.id, species.name) || species.name || slot.id,
        level: 100,
        item: slot.item,
        ability: slot.ability,
        nature: slot.nature,
        moves: slot.moves.slice(),
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(slot.evs || {}) },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      };
    }).filter(Boolean);
  }

  function cloneTeamSlot(slot) {
    return {
      ...slot,
      moves: [...(slot.moves || [])],
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(slot.evs || {}) },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...(slot.ivs || {}) },
    };
  }

  function normalizePoolSlot(slot) {
    const species = getPokedex()[slot.id];
    return {
      id: slot.id,
      name: window.PH_API?.helpers?.getNameEs?.('pokemon', slot.id, species?.name || slot.id) || species?.name || slot.id,
      level: 100,
      item: slot.item || '',
      ability: slot.ability || '',
      nature: slot.nature || 'Hardy',
      moves: [...(slot.moves || [])],
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(slot.evs || {}) },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    };
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildPseudoRandomTeam(size = 6) {
    return shuffle(RANDOM_TEAM_POOL).slice(0, size).map((slot) => normalizePoolSlot(cloneTeamSlot(slot)));
  }

  function buildPseudoRandomTeamPair(size = 6) {
    const pool = shuffle(RANDOM_TEAM_POOL);
    const first = pool.slice(0, size).map((slot) => normalizePoolSlot(cloneTeamSlot(slot)));
    const secondBase = pool.slice(size, size * 2);

    if (secondBase.length === size) {
      return {
        player: first,
        bot: secondBase.map((slot) => normalizePoolSlot(cloneTeamSlot(slot))),
      };
    }

    return {
      player: first,
      bot: buildPseudoRandomTeam(size),
    };
  }

  async function loadSavedTeams() {
    const select = q('battle-saved-team');
    if (!select) return;
    const currentValue = select.value;

    const teams = await (window.PH_API?.teams.getAll?.() || Promise.resolve([]));
    BC.savedTeams = teams || [];

    select.innerHTML = !BC.savedTeams.length
      ? '<option value="">No hay equipos guardados</option>'
      : ['<option value="">Elige un equipo guardado</option>', ...BC.savedTeams.map((team) => `<option value="${team.id}">${team.name} · ${team.format}</option>`)].join('');

    if (currentValue && BC.savedTeams.some((team) => `${team.id}` === `${currentValue}`)) {
      select.value = currentValue;
    }
  }

  function updateTeamSourceUI() {
    const source = q('battle-team-source')?.value || 'builder';
    const savedSelect = q('battle-saved-team');
    if (savedSelect) savedSelect.style.display = source === 'saved' ? 'block' : 'none';
    if (source === 'saved' && savedSelect && (!savedSelect.options.length || savedSelect.options[0]?.textContent?.includes('Cargando'))) {
      void loadSavedTeams();
    }
  }

  async function getBattleTeamSpec(format) {
    const source = q('battle-team-source')?.value || 'builder';
    const randomFormat = `${format || ''}`.includes('random');

    if (source === 'saved') {
      const id = q('battle-saved-team')?.value;
      if (!id) {
        updateStatus('Elige un equipo guardado antes de empezar.');
        throw new Error('no team');
      }
      const team = await window.PH_API?.teams.get(id);
      if (!team?.export_code) {
        updateStatus('No se pudo cargar el equipo guardado.');
        throw new Error('bad team');
      }
      const normalizedExport = normalizeSavedTeamText(team.export_code);
      return {
        payload: { teamText: normalizedExport, teamMode: 'saved' },
        previewTeam: [],
        botPayload: randomFormat ? { botTeamMode: 'random' } : null,
      };
    }

    if (source === 'random' && randomFormat) {
      return {
        payload: { teamMode: 'random' },
        previewTeam: [],
        botPayload: { botTeamMode: 'random' },
      };
    }

    if (source === 'random' && !randomFormat) {
      const { player: playerRandomTeam, bot: botRandomTeam } = buildPseudoRandomTeamPair();
      updateStatus('Para formatos estándar uso dos equipos aleatorios legales de prueba.');
      return {
        payload: { team: playerRandomTeam, teamMode: 'builder' },
        previewTeam: playerRandomTeam,
        botPayload: { botTeam: botRandomTeam, botTeamMode: 'builder' },
      };
    }

    const previewTeam = buildTeamForBattle();
    const teamText = typeof exportShowdown === 'function' ? exportShowdown() : '';

    return {
      payload: { team: previewTeam, teamText, teamMode: previewTeam.length ? 'builder' : 'random' },
      previewTeam,
      botPayload: randomFormat ? { botTeamMode: 'random' } : null,
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        if (item.dataset.section === 'combate') {
          if (!BC.ws) connectBattle();
          void loadSavedTeams();
        }
      });
    });

    q('battle-find-btn')?.addEventListener('click', battleFindMatch);
    q('battle-practice-btn')?.addEventListener('click', battlePracticeMatch);
    q('battle-create-btn')?.addEventListener('click', battleCreateRoom);
    q('battle-join-btn')?.addEventListener('click', battleJoinRoom);
    q('battle-team-source')?.addEventListener('change', updateTeamSourceUI);
    q('battle-tool-glossary-btn')?.addEventListener('click', () => toggleBattleTool('glossary'));
    q('battle-tool-types-btn')?.addEventListener('click', () => toggleBattleTool('types'));
    q('battle-forfeit-btn')?.addEventListener('click', () => {
      if (BC.ws && BC.roomId) {
        setAnnouncer('Te has rendido.');
        updateStatus('Rindiéndote...');
        BC.ws.send(JSON.stringify({ type: 'forfeit' }));
      } else {
        showIntro();
        resetArena();
        updateStatus('Combate cancelado.');
      }
    });

    document.addEventListener('langchange', () => {
      renderField();
      renderBattleSideTool();
      if (BC.myRequest) renderRequest(BC.myRequest);
    });

    updateTeamSourceUI();
    setAnnouncer('La batalla va a comenzar.');
  });
})();
