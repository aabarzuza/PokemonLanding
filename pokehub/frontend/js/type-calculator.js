(function () {
  const TYPES = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
    'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
  ];

  const TYPE_EN = {
    normal: 'Normal', fighting: 'Fighting', flying: 'Flying', poison: 'Poison',
    ground: 'Ground', rock: 'Rock', bug: 'Bug', ghost: 'Ghost', steel: 'Steel',
    fire: 'Fire', water: 'Water', grass: 'Grass', electric: 'Electric',
    psychic: 'Psychic', ice: 'Ice', dragon: 'Dragon', dark: 'Dark', fairy: 'Fairy',
  };

  const TYPE_ES = {
    normal: 'Normal', fighting: 'Lucha', flying: 'Volador', poison: 'Veneno',
    ground: 'Tierra', rock: 'Roca', bug: 'Bicho', ghost: 'Fantasma', steel: 'Acero',
    fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Electrico',
    psychic: 'Psiquico', ice: 'Hielo', dragon: 'Dragon', dark: 'Siniestro', fairy: 'Hada',
  };

  const TYPE_COLORS = {
    normal: '#b9b8b2', fighting: '#f58b15', flying: '#7ab0e5', poison: '#9c45ce',
    ground: '#a5642a', rock: '#b9af7a', bug: '#94a80d', ghost: '#8e5e93',
    steel: '#69a7c2', fire: '#ef2b2c', water: '#3884e5', grass: '#239317',
    electric: '#f3bf17', psychic: '#ef3c7d', ice: '#49c0e2', dragon: '#5867da',
    dark: '#695450', fairy: '#d863db',
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

  const DEFAULT_STATE = {
    attackMode: 1,
    editing: 'defense',
    attacker: ['flying'],
    defender: ['poison', 'grass'],
  };

  function safeTypes(list = []) {
    return list.filter((type) => TYPES.includes(type)).slice(0, 2);
  }

  function cloneState(seed = {}) {
    return {
      attackMode: seed.attackMode || DEFAULT_STATE.attackMode,
      editing: seed.editing || DEFAULT_STATE.editing,
      attacker: safeTypes(seed.attacker || DEFAULT_STATE.attacker).slice(0, seed.attackMode === 2 ? 2 : 1),
      defender: safeTypes(seed.defender || DEFAULT_STATE.defender),
    };
  }

  function typeLabel(type) {
    return window.getTypeName ? window.getTypeName(type) : (TYPE_ES[type] || TYPE_EN[type] || type);
  }

  function typeIcon(type) {
    return `https://play.pokemonshowdown.com/sprites/types/${TYPE_EN[type]}.png`;
  }

  function typeEffect(attackType, defenseTypes) {
    return defenseTypes.reduce((total, defenseType) => {
      return total * (((CHART[attackType] || {})[defenseType]) ?? 1);
    }, 1);
  }

  function attackEffect(attackTypes, defenseTypes) {
    return attackTypes.reduce((total, attackType) => total * typeEffect(attackType, defenseTypes), 1);
  }

  function selectedList(state) {
    return state.editing === 'attack' ? state.attacker : state.defender;
  }

  function maxSelectable(state) {
    return state.editing === 'attack' ? state.attackMode : 2;
  }

  function typeChip(type) {
    return `
      <span class="typecalc-chip" style="--type:${TYPE_COLORS[type]}">
        <img class="typecalc-icon" src="${typeIcon(type)}" alt="${typeLabel(type)}" />
        <span>${typeLabel(type)}</span>
      </span>
    `;
  }

  function typeButton(type, active) {
    return `
      <button class="typecalc-pick ${active ? 'active' : ''}" data-typecalc-pick="${type}" style="--type:${TYPE_COLORS[type]}">
        <img class="typecalc-icon" src="${typeIcon(type)}" alt="${typeLabel(type)}" />
        <span>${typeLabel(type)}</span>
      </button>
    `;
  }

  function resultGroup(title, types) {
    return `
      <div class="typecalc-group">
        <div class="typecalc-group-title">${title}</div>
        <div class="typecalc-group-grid">
          ${types.length
            ? types.map((type) => `
              <span class="typecalc-badge" style="--type:${TYPE_COLORS[type]}">
                <img class="typecalc-icon" src="${typeIcon(type)}" alt="${typeLabel(type)}" />
                <span>${typeLabel(type)}</span>
              </span>
            `).join('')
            : `<span class="typecalc-empty">${window.t ? window.t('typecalc.none') : 'Ninguno'}</span>`}
        </div>
      </div>
    `;
  }

  function bucketByMultiplier(multiplierList, currentTypes, attackView) {
    return TYPES.filter((type) => {
      const value = attackView ? attackEffect(currentTypes, [type]) : typeEffect(type, currentTypes);
      return multiplierList.includes(value);
    });
  }

  function resultsMarkup(state) {
    const currentTypes = selectedList(state);
    const attackView = state.editing === 'attack';
    const labels = attackView
      ? [
        [window.t ? window.t('typecalc.deals4') : 'Inflige 4x a', [4, 8]],
        [window.t ? window.t('typecalc.deals2') : 'Inflige 2x a', [2]],
        [window.t ? window.t('typecalc.deals1') : 'Inflige 1x a', [1]],
        [window.t ? window.t('typecalc.deals05') : 'Inflige 0,5x a', [0.5]],
        [window.t ? window.t('typecalc.deals025') : 'Inflige 0,25x a', [0.25]],
        [window.t ? window.t('typecalc.deals0') : 'Inflige 0x a', [0]],
      ]
      : [
        [window.t ? window.t('typecalc.takes4') : 'Sufre 4x por', [4, 8]],
        [window.t ? window.t('typecalc.takes2') : 'Sufre 2x por', [2]],
        [window.t ? window.t('typecalc.takes1') : 'Sufre 1x por', [1]],
        [window.t ? window.t('typecalc.takes05') : 'Sufre 0,5x por', [0.5]],
        [window.t ? window.t('typecalc.takes025') : 'Sufre 0,25x por', [0.25]],
        [window.t ? window.t('typecalc.takes0') : 'Sufre 0x por', [0]],
      ];

    return labels
      .map(([title, multiplierList]) => resultGroup(title, bucketByMultiplier(multiplierList, currentTypes, attackView)))
      .join('');
  }

  function buildSidebar(state, compact) {
    if (compact) {
      return `
        <aside class="typecalc-sidebar">
          <div class="typecalc-side-group">
            <div class="typecalc-side-title">${window.t ? window.t('typecalc.defense') : 'Defensa'}</div>
            <button class="typecalc-side-btn active" type="button">${window.t ? window.t('typecalc.solo') : 'Solo'}</button>
          </div>
          <div class="typecalc-side-divider"></div>
          <div class="typecalc-side-group">
            <div class="typecalc-side-title">${window.t ? window.t('typecalc.defense') : 'Defensa'}</div>
            <button class="typecalc-side-btn active" type="button">${window.t ? window.t('typecalc.editTypes') : 'Tipos'}</button>
          </div>
        </aside>
      `;
    }

    return `
      <aside class="typecalc-sidebar">
        <div class="typecalc-side-group">
          <div class="typecalc-side-title">${window.t ? window.t('typecalc.attack') : 'Ataque'}</div>
          <button class="typecalc-side-btn ${state.attackMode === 1 ? 'active' : ''}" data-typecalc-attack-mode="1" type="button">${window.t ? window.t('typecalc.single') : 'Single'}</button>
          <button class="typecalc-side-btn ${state.attackMode === 2 ? 'active' : ''}" data-typecalc-attack-mode="2" type="button">${window.t ? window.t('typecalc.dual') : 'Dual'}</button>
        </div>
        <div class="typecalc-side-divider"></div>
        <div class="typecalc-side-group">
          <div class="typecalc-side-title">${window.t ? window.t('typecalc.defense') : 'Defensa'}</div>
          <button class="typecalc-side-btn ${state.editing === 'defense' ? 'active' : ''}" data-typecalc-edit="defense" type="button">${window.t ? window.t('typecalc.solo') : 'Solo'}</button>
          <button class="typecalc-side-btn ${state.editing === 'attack' ? 'active' : ''}" data-typecalc-edit="attack" type="button">${window.t ? window.t('typecalc.attack') : 'Ataque'}</button>
        </div>
      </aside>
    `;
  }

  function renderMarkup(state, options = {}) {
    const compact = Boolean(options.compact);
    const currentTypes = selectedList(state);
    const showCopy = !compact;

    return `
      <div class="typecalc-app ${compact ? 'typecalc-app-compact' : ''}">
        ${buildSidebar(state, compact)}
        <section class="typecalc-picker">
          <div class="typecalc-panel-title">${window.t ? window.t('typecalc.chooseTypes') : 'Elige los tipos'}</div>
          <div class="typecalc-picked-row">
            ${currentTypes.map(typeChip).join('')}
          </div>
          <div class="typecalc-pick-grid">
            ${TYPES.map((type) => typeButton(type, currentTypes.includes(type))).join('')}
          </div>
          <div class="typecalc-actions">
            ${showCopy ? `<button class="typecalc-action-btn" data-typecalc-copy type="button">${window.t ? window.t('typecalc.copyLink') : 'Copiar link'}</button>` : ''}
            <button class="typecalc-action-btn" data-typecalc-clear type="button">${window.t ? window.t('typecalc.clear') : 'Limpiar'}</button>
          </div>
        </section>
        <section class="typecalc-results-pane">
          ${resultsMarkup(state)}
        </section>
      </div>
    `;
  }

  function applyToggle(state, type) {
    const listKey = state.editing === 'attack' ? 'attacker' : 'defender';
    const list = [...state[listKey]];
    const index = list.indexOf(type);

    if (index >= 0) {
      if (list.length > 1) list.splice(index, 1);
    } else if (maxSelectable(state) === 1) {
      list.splice(0, list.length, type);
    } else if (list.length < maxSelectable(state)) {
      list.push(type);
    } else {
      list.shift();
      list.push(type);
    }

    state[listKey] = list;
  }

  function serializeState(state) {
    const params = new URLSearchParams();
    params.set('edit', state.editing);
    params.set('am', String(state.attackMode));
    params.set('atk', state.attacker.join(','));
    params.set('def', state.defender.join(','));
    return params.toString();
  }

  function readStateFromHash() {
    const hash = (location.hash || '').replace(/^#/, '');
    const match = hash.match(/(?:^|&)typecalc=([^&]+)/);
    if (!match) return null;
    const params = new URLSearchParams(decodeURIComponent(match[1]));
    return cloneState({
      editing: params.get('edit') === 'attack' ? 'attack' : 'defense',
      attackMode: Number(params.get('am')) === 2 ? 2 : 1,
      attacker: (params.get('atk') || '').split(',').filter(Boolean),
      defender: (params.get('def') || '').split(',').filter(Boolean),
    });
  }

  function writeStateToHash(state) {
    const current = (location.hash || '').replace(/^#/, '').split('&').filter(Boolean).filter((part) => !part.startsWith('typecalc='));
    current.push(`typecalc=${encodeURIComponent(serializeState(state))}`);
    history.replaceState(null, '', `${location.pathname}${location.search}#${current.join('&')}`);
  }

  function mount(container, seedState = {}, options = {}) {
    if (!container) return null;
    const state = cloneState(options.persistToHash ? (readStateFromHash() || seedState) : seedState);
    const compact = Boolean(options.compact);

    function rerender() {
      container.innerHTML = renderMarkup(state, options);

      container.querySelectorAll('[data-typecalc-pick]').forEach((button) => {
        button.addEventListener('click', () => {
          applyToggle(state, button.dataset.typecalcPick);
          rerender();
        });
      });

      container.querySelectorAll('[data-typecalc-attack-mode]').forEach((button) => {
        button.addEventListener('click', () => {
          state.attackMode = Number(button.dataset.typecalcAttackMode) || 1;
          if (state.attackMode === 1 && state.attacker.length > 1) {
            state.attacker = [state.attacker[0]];
          }
          rerender();
        });
      });

      container.querySelectorAll('[data-typecalc-edit]').forEach((button) => {
        button.addEventListener('click', () => {
          state.editing = button.dataset.typecalcEdit || 'defense';
          rerender();
        });
      });

      container.querySelector('[data-typecalc-clear]')?.addEventListener('click', () => {
        if (state.editing === 'attack') {
          state.attacker = ['flying'];
        } else {
          state.defender = ['poison', 'grass'];
        }
        rerender();
      });

      container.querySelector('[data-typecalc-copy]')?.addEventListener('click', async () => {
        writeStateToHash(state);
        try {
          await navigator.clipboard.writeText(location.href);
          const button = container.querySelector('[data-typecalc-copy]');
          if (button) {
            const original = button.textContent;
            button.textContent = window.t ? window.t('typecalc.copied') : 'Link copiado';
            setTimeout(() => { button.textContent = original; }, 1200);
          }
        } catch (error) {
          console.error('copy typecalc link error', error);
        }
      });

      if (options.persistToHash) {
        writeStateToHash(state);
      }

      if (typeof options.onChange === 'function') {
        options.onChange(cloneState(state), compact);
      }
    }

    rerender();
    return state;
  }

  function buildTypeCalculatorSection() {
    const section = document.getElementById('type-calc-section');
    if (!section) return;
    try {
      mount(section, DEFAULT_STATE, { compact: false, persistToHash: true });
    } catch (error) {
      console.error('type calculator render error', error);
      section.innerHTML = '<div class="battle-end">No se pudo cargar la calculadora de tipos.</div>';
    }
  }

  window.PHTypeCalc = {
    TYPES,
    TYPE_COLORS,
    TYPE_EN,
    TYPE_ES,
    cloneState,
    typeLabel,
    typeIcon,
    mount,
    buildTypeCalculatorSection,
  };

  document.addEventListener('DOMContentLoaded', () => setTimeout(buildTypeCalculatorSection, 60));
  document.addEventListener('langchange', () => setTimeout(buildTypeCalculatorSection, 0));
  window.buildTypeCalculatorSection = buildTypeCalculatorSection;
})();
