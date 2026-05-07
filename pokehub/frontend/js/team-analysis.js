(function () {
  const TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
  ];

  const TYPE_COLORS = {
    normal: '#cdbf9e', fire: '#e74c3c', water: '#3a9fe6', electric: '#f0cf2f',
    grass: '#4caf50', ice: '#8de0ea', fighting: '#b66a52', poison: '#7b4cb5',
    ground: '#c79a4a', flying: '#77aee9', psychic: '#d66ada', bug: '#9fb61b',
    rock: '#9e7844', ghost: '#4f4a85', dragon: '#5266ff', dark: '#3f3f48',
    steel: '#a7b4bf', fairy: '#eba8df',
  };

  const CHART = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  };

  const DEFENSIVE_ABILITIES = {
    Levitate: { immunity: ['ground'] },
    'Earth Eater': { immunity: ['ground'] },
    'Flash Fire': { immunity: ['fire'] },
    'Well-Baked Body': { immunity: ['fire'] },
    'Water Absorb': { immunity: ['water'] },
    'Storm Drain': { immunity: ['water'] },
    'Dry Skin': { immunity: ['water'], weak: ['fire'] },
    'Volt Absorb': { immunity: ['electric'] },
    'Lightning Rod': { immunity: ['electric'] },
    'Motor Drive': { immunity: ['electric'] },
    'Sap Sipper': { immunity: ['grass'] },
    'Thick Fat': { resist: ['fire', 'ice'] },
    Heatproof: { resist: ['fire'] },
    'Water Bubble': { resist: ['fire'] },
    'Fluffy': { weak: ['fire'] },
  };

  const state = Array.from({ length: 6 }, () => ({
    query: '',
    formId: '',
    ability: 'auto',
    suggestions: [],
  }));

  function t(es, en) {
    return window.LANG === 'en' ? en : es;
  }

  function pokemonData() {
    if (typeof SD_POKEMON !== 'undefined') return SD_POKEMON;
    return window.SD_POKEMON || {};
  }

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '');
  }

  function isSupportedForm(entry) {
    if (!entry?.id) return false;
    const id = entry.id;
    return ![
      'mega', 'gmax', 'totem', 'starter', 'primal', 'eternamax', 'school',
      'tera', 'burst', 'mode', 'ash', 'complete', 'crowned', 'origin',
    ].some((part) => id.includes(part));
  }

  function allEntries() {
    return Object.values(pokemonData()).filter(isSupportedForm);
  }

  function getEntry(id) {
    return pokemonData()[id] || null;
  }

  function translatedName(entry) {
    const translated = window.getName ? window.getName(entry.id, 'pokemon') : '';
    return translated && translated !== entry.id ? translated : entry.name;
  }

  function secondaryName(entry) {
    const secondary = window.getSecName ? window.getSecName(entry.id, 'pokemon') : '';
    return secondary || '';
  }

  function getDisplayName(entry) {
    const primary = translatedName(entry);
    const secondary = secondaryName(entry);
    return secondary ? `${primary} / ${secondary}` : primary;
  }

  function spriteUrl(entry) {
    return `https://play.pokemonshowdown.com/sprites/gen5/${entry.id}.png`;
  }

  function getFormFamily(entry) {
    if (!entry) return [];
    return allEntries()
      .filter((candidate) => candidate.num === entry.num)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function formLabel(entry) {
    const parts = entry.name.split('-');
    if (parts.length === 1) return t('Forma base', 'Base form');
    return `${t('Forma', 'Form')} ${parts.slice(1).join(' ')}`;
  }

  function findSuggestions(query) {
    const key = normalize(query);
    if (key.length < 2) return [];
    return allEntries()
      .filter((entry) => {
        const es = translatedName(entry);
        const en = entry.name;
        return normalize(es).includes(key) || normalize(en).includes(key) || entry.id.includes(key);
      })
      .slice(0, 8);
  }

  function getCurrentEntry(row) {
    return row.formId ? getEntry(row.formId) : null;
  }

  function typeEffect(attackType, defenseTypes) {
    return defenseTypes.reduce((total, defenseType) => total * (((CHART[attackType] || {})[defenseType]) ?? 1), 1);
  }

  function applyAbilityModifier(multiplier, attackType, abilityName) {
    const rules = DEFENSIVE_ABILITIES[abilityName];
    if (!rules) return multiplier;
    if (rules.immunity?.includes(attackType)) return 0;
    let finalValue = multiplier;
    if (rules.resist?.includes(attackType)) finalValue *= 0.5;
    if (rules.weak?.includes(attackType)) finalValue *= 1.25;
    return finalValue;
  }

  function defensiveMultiplier(entry, abilityName, attackType) {
    const baseValue = typeEffect(attackType, entry.types || []);
    if (!abilityName || abilityName === 'auto') return baseValue;
    return applyAbilityModifier(baseValue, attackType, abilityName);
  }

  function cellLabel(value) {
    if (value === 0) return t('Immune', 'Immune');
    if (value === 0.25) return '¼';
    if (value === 0.5) return '½';
    if (value === 2) return '2×';
    if (value === 4) return '4×';
    return '';
  }

  function cellClass(value) {
    if (value === 0) return 'immune';
    if (value < 1) return 'resist';
    if (value > 1) return 'weak';
    return 'neutral';
  }

  function typeLabel(type) {
    return window.getTypeName ? window.getTypeName(type) : type;
  }

  function buildRowEditor(row, idx) {
    const entry = getCurrentEntry(row);
    const forms = entry ? getFormFamily(entry) : [];
    const abilities = entry?.abilities || [];

    return `
      <div class="analysis-row" data-analysis-row="${idx}">
        <div class="analysis-row-label">${t('Pokemon', 'Pokemon')} ${idx + 1}:</div>
        <div class="analysis-search-wrap">
          <input
            class="analysis-input"
            id="analysis-input-${idx}"
            value="${entry ? translatedName(entry) : row.query}"
            placeholder="${window.t ? window.t('Elige tu Pokemón...') : t('Escribe un Pokemon...', 'Type a Pokemon...')}"
            autocomplete="off"
          />
          <div id="analysis-suggest-${idx}" class="analysis-suggestions"></div>
        </div>
        <select class="analysis-select" id="analysis-form-${idx}" ${!entry ? 'disabled' : ''}>
          ${entry
            ? forms.map((form) => `<option value="${form.id}" ${form.id === row.formId ? 'selected' : ''}>${formLabel(form)}</option>`).join('')
            : `<option value="">${window.t ? window.t('forma regional') : t('Forma', 'Form')}</option>`}
        </select>
        <select class="analysis-select" id="analysis-ability-${idx}" ${!entry ? 'disabled' : ''}>
          <option value="auto" ${row.ability === 'auto' ? 'selected' : ''}>${window.t ? window.t('habilidad') : t('Auto', 'Auto')}</option>
          ${abilities.map((ability) => `<option value="${ability}" ${row.ability === ability ? 'selected' : ''}>${ability}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function renderEditor() {
    const mount = document.getElementById('analysis-team-editor');
    if (!mount) return;
    mount.innerHTML = state.map(buildRowEditor).join('');

    state.forEach((row, idx) => {
      const input = document.getElementById(`analysis-input-${idx}`);
      const form = document.getElementById(`analysis-form-${idx}`);
      const ability = document.getElementById(`analysis-ability-${idx}`);
      const suggestions = document.getElementById(`analysis-suggest-${idx}`);

      input?.addEventListener('input', (event) => {
        row.query = event.target.value;
        row.suggestions = findSuggestions(row.query);
        renderSuggestions(idx);
      });

      input?.addEventListener('focus', () => {
        row.suggestions = findSuggestions(row.query);
        renderSuggestions(idx);
      });

      input?.addEventListener('blur', () => {
        setTimeout(() => {
          row.suggestions = [];
          renderSuggestions(idx);
        }, 120);
      });

      form?.addEventListener('change', (event) => {
        row.formId = event.target.value;
        renderAll();
      });

      ability?.addEventListener('change', (event) => {
        row.ability = event.target.value;
        renderTable();
      });

      suggestions?.addEventListener('mousedown', (event) => {
        const item = event.target.closest('[data-analysis-pick]');
        if (!item) return;
        const picked = getEntry(item.dataset.analysisPick);
        if (!picked) return;
        row.formId = picked.id;
        row.query = translatedName(picked);
        row.ability = 'auto';
        row.suggestions = [];
        renderAll();
      });
    });
  }

  function renderSuggestions(idx) {
    const mount = document.getElementById(`analysis-suggest-${idx}`);
    const row = state[idx];
    if (!mount || !row) return;
    if (!row.suggestions.length) {
      mount.innerHTML = '';
      mount.classList.remove('is-open');
      return;
    }
    mount.classList.add('is-open');
    mount.innerHTML = row.suggestions.map((entry) => `
      <button type="button" class="analysis-suggestion" data-analysis-pick="${entry.id}">
        <img class="analysis-suggestion-sprite" src="${spriteUrl(entry)}" alt="${entry.name}" />
        <span class="analysis-suggestion-main">${translatedName(entry)}</span>
        <span class="analysis-suggestion-sub">${entry.name}</span>
      </button>
    `).join('');
  }

  function renderTable() {
    const mount = document.getElementById('analysis-table-wrap');
    if (!mount) return;

    const entries = state.map((row) => getCurrentEntry(row));
    const hasAtLeastOne = entries.some(Boolean);

    if (!hasAtLeastOne) {
      mount.innerHTML = `<div class="analysis-empty">${t('Anade al menos un Pokemon para empezar el analisis.', 'Add at least one Pokemon to start the analysis.')}</div>`;
      return;
    }

    const headCells = state.map((row, idx) => {
      const entry = getCurrentEntry(row);
      if (!entry) {
        return `<th class="analysis-mon-head"><div class="analysis-mon-name">-</div></th>`;
      }
      return `
        <th class="analysis-mon-head">
          <img class="analysis-mon-sprite" src="${spriteUrl(entry)}" alt="${entry.name}" />
          <div class="analysis-mon-name">${translatedName(entry)}</div>
        </th>
      `;
    }).join('');

    const bodyRows = TYPES.map((attackType) => {
      let weakCount = 0;
      let resistCount = 0;
      const cells = state.map((row) => {
        const entry = getCurrentEntry(row);
        if (!entry) return `<td class="analysis-cell neutral"></td>`;
        const abilityName = row.ability === 'auto' ? '' : row.ability;
        const value = defensiveMultiplier(entry, abilityName, attackType);
        if (value > 1) weakCount += 1;
        if (value < 1) resistCount += 1;
        return `<td class="analysis-cell ${cellClass(value)}">${cellLabel(value)}</td>`;
      }).join('');

      return `
        <tr>
          <th class="analysis-type-cell">
            <span class="analysis-type-pill" style="--type:${TYPE_COLORS[attackType]}">${typeLabel(attackType)}</span>
          </th>
          ${cells}
          <td class="analysis-total weak">${weakCount || ''}</td>
          <td class="analysis-total resist">${resistCount || ''}</td>
        </tr>
      `;
    }).join('');

    mount.innerHTML = `
      <table class="analysis-table">
        <thead>
          <tr>
            <th class="analysis-top-left">${window.t ? window.t('analysis.attacker') : t('Ataq.', 'Atk.')} ↓</th>
            ${headCells}
            <th class="analysis-summary-head">${window.t ? window.t('analysis.weak') : t('Total debil', 'Total weak')}</th>
            <th class="analysis-summary-head">${window.t ? window.t('analysis.resist') : t('Total resist', 'Total resist')}</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    `;
  }

  function renderTexts() {
    const map = {
      'analysis-badge': t('Cobertura del equipo', 'Team coverage'),
      'analysis-title': t('Analisis de equipo', 'Team analysis'),
      'analysis-text': t(
        'Estudia la cobertura defensiva de tus seis Pokemon, compara formas, prueba habilidades clave y detecta debilidades repetidas antes de exportar el equipo.',
        'Study the defensive coverage of your six Pokemon, compare forms, test key abilities, and spot repeated weaknesses before you export the team.'
      ),
      'analysis-use-builder': t('Usar equipo del constructor', 'Use builder team'),
      'analysis-clear-team': t('Limpiar analisis', 'Clear analysis'),
      'analysis-builder-title': t('Aporte del equipo', 'Team contribution'),
      'analysis-builder-text': t(
        'Elige hasta 6 Pokemon para ver como responde tu equipo frente a cada tipo atacante.',
        'Choose up to 6 Pokemon to see how your team responds to every attacking type.'
      ),
      'analysis-table-title': t('Cobertura defensiva', 'Defensive coverage'),
      'analysis-table-text': t(
        'Cada fila es un tipo atacante. Cada columna te dice si ese Pokemon resiste, recibe dano neutro, es debil o inmune.',
        'Each row is an attacking type. Each column shows whether that Pokemon resists, takes neutral damage, is weak, or is immune.'
      ),
    };
    Object.entries(map).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    });
  }

  function renderAll() {
    renderTexts();
    renderEditor();
    renderTable();
  }

  function useBuilderTeam() {
    const builderTeam = typeof window.getBuilderTeam === 'function' ? window.getBuilderTeam() : [];
    state.forEach((row, idx) => {
      const builderSlot = builderTeam[idx];
      if (!builderSlot?.id) {
        row.query = '';
        row.formId = '';
        row.ability = 'auto';
        row.suggestions = [];
        return;
      }
      row.query = builderSlot.name_es || builderSlot.name_en || '';
      const resolvedId = typeof builderSlot.id === 'string'
        ? builderSlot.id
        : normalize(builderSlot.name_en || builderSlot.name_es || '');
      row.formId = resolvedId;
      const entry = getEntry(resolvedId);
      row.ability = entry?.abilities?.includes(builderSlot.ability) ? builderSlot.ability : 'auto';
      row.suggestions = [];
    });
    renderAll();
    window.showToast?.(t('Equipo del constructor cargado.', 'Builder team loaded.'));
  }

  function clearAnalysis() {
    state.forEach((row) => {
      row.query = '';
      row.formId = '';
      row.ability = 'auto';
      row.suggestions = [];
    });
    renderAll();
    window.showToast?.(t('Analisis reiniciado.', 'Analysis reset.'));
  }

  function bindActions() {
    document.getElementById('analysis-use-builder')?.addEventListener('click', useBuilderTeam);
    document.getElementById('analysis-clear-team')?.addEventListener('click', clearAnalysis);
  }

  function init() {
    if (!document.getElementById('analysis-team-editor')) return;
    renderAll();
    bindActions();
  }

  window.buildTeamAnalysisSection = renderAll;

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('langchange', renderAll);
})();
