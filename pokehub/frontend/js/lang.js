/* =========================================
   LANG.JS - Global language system
   This file decides which language the app uses.
   It only works with Spanish and English.
   "global" = afecta a toda la web.
   "language system" = sistema que cambia textos segun el idioma elegido.
   ========================================= */

(function () {
  // IIFE = funcion que se ejecuta sola al cargarse el archivo.
  // Se usa para no dejar variables sueltas "flotando" en el navegador.

  // URL = direccion web que aparece arriba en el navegador.
  // URLSearchParams sirve para leer cosas como ?lang=es.
  const urlLang = new URLSearchParams(location.search).get('lang');
  // localStorage = memoria sencilla del navegador para guardar preferencias.
  const savedLang = localStorage.getItem('pokehub-lang');
  // window = objeto global del navegador.
  // LANG sera la variable global que dira si estamos en "es" o "en".
  // Operador ternario ? : = forma corta de escribir un if/else.
  window.LANG = urlLang === 'es' || urlLang === 'en'
    ? urlLang
    : (savedLang === 'es' || savedLang === 'en' ? savedLang : 'en');
  // Guardamos el idioma actual para la proxima visita.
  localStorage.setItem('pokehub-lang', window.LANG);

  // UI_TEXT = gran diccionario de textos de la interfaz.
  // Se divide por idioma y luego por zonas: app, home, sections, common...
  const UI_TEXT = {
    es: {
      app: {
        title: 'PokeHub Competitivo',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        inicio: 'Inicio',
        consulta: 'Wiki rápida',
        calculadora: 'Calculadora de daño',
        tipos: 'Calculadora de tipos',
        constructor: 'Constructor de equipos',
        equipos: 'Mis equipos',
        glosario: 'Glosario y guías',
      },
      home: {
        heroBadge: 'Guía de iniciación',
        heroTitle: 'Bienvenido al Pokémon competitivo',
        heroSub: 'Si acabas de llegar al competitivo, estás en el sitio correcto. Aquí aprenderás todo desde cero, paso a paso, sin saltarte nada importante.',
      },
      sections: {
        savedTeamsTitle: 'Mis equipos guardados',
        savedTeamsRefresh: 'Actualizar',
        consultTitle: 'Centro de consulta competitiva',
        consultIntro: 'Wiki rápida para consultar Pokémon, movimientos, habilidades, objetos y calculadoras mientras juegas fuera de esta web.',
        damageCalcTitle: 'Calculadora de daño',
        damageCalcIntro: 'Compara dos Pokémon, ajusta stats, objeto, habilidad y condiciones del campo para estimar daño real.',
        typeCalcTitle: 'Calculadora de tipos',
        typeCalcIntro: 'Herramienta interactiva para analizar matchups ofensivos y defensivos con uno o dos tipos.',
        glossaryTitle: 'Glosario y base de datos',
        glossaryIntro: 'Términos competitivos, Pokémon, movimientos, habilidades y objetos. Con enlace directo a WikiDex.',
      },
      consult: {
        badge: 'Wiki companion',
        title: 'Centro de consulta competitiva',
        text: 'Usa PokÃ©Hub como una wiki rÃ¡pida mientras juegas en PokÃ©mon Showdown o PokÃ©mon Champions. Todo estÃ¡ orientado a consultar datos, matchups, daÃ±o, builds y conceptos sin perder el hilo de la partida real.',
        flowTitle: 'Flujo recomendado',
        flow1: '1. Busca el PokÃ©mon, movimiento u objeto que tengas delante.',
        flow2: '2. Comprueba el daÃ±o o la cobertura de tipos.',
        flow3: '3. Ajusta tu equipo o tus notas en el builder.',
        flow4: '4. Vuelve a Showdown con la informaciÃ³n clara.',
        cardPokemonTitle: 'PokÃ©mon',
        cardPokemonText: 'Consulta tipos, stats, tiers, descripciones y learnsets para decidir cambios, coberturas y checks.',
        cardPokemonBtn: 'Abrir PokÃ©mon',
        cardMovesTitle: 'Movimientos',
        cardMovesText: 'Busca en espaÃ±ol o inglÃ©s y revisa potencia, precisiÃ³n, categorÃ­a y usuarios comunes.',
        cardMovesBtn: 'Abrir movimientos',
        cardToolsTitle: 'Habilidades y objetos',
        cardToolsText: 'Comprueba efectos, sinergias y detalles clave para entender sets y win conditions rivales.',
        cardAbilitiesBtn: 'Habilidades',
        cardItemsBtn: 'Objetos',
        cardDamageTitle: 'Calculadora de daÃ±o',
        cardDamageText: 'Estima daÃ±o real entre dos PokÃ©mon ajustando EVs, habilidades, objetos y condiciones del campo.',
        cardDamageBtn: 'Abrir calculadora',
        cardTypesTitle: 'Calculadora de tipos',
        cardTypesText: 'Analiza debilidades, resistencias, inmunidades y coberturas ofensivas con uno o dos tipos.',
        cardTypesBtn: 'Abrir tipos',
        cardBuilderTitle: 'Builder y equipos',
        cardBuilderText: 'Crea equipos, expÃ³rtalos a Showdown y guarda versiones para seguir iterando fuera de la partida.',
        cardBuilderBtn: 'Abrir builder',
        cardSavedBtn: 'Ver guardados',
        panelTitle: 'Por quÃ© este enfoque encaja mejor',
        panel1: 'La web tiene un propÃ³sito claro y fÃ¡cil de entender: consultar informaciÃ³n competitiva rÃ¡pida mientras juegas.',
        panel2: 'Las funciones principales se prueban en segundos: bÃºsquedas, calculadoras, builder y equipos guardados.',
        panel3: 'Puedes usarla de verdad al lado de Showdown sin depender de cambiar de herramienta cada minuto.',
      },
      common: {
        back: 'Volver',
        search: 'Buscar',
        searching: 'Buscando...',
        noResults: 'Sin resultados.',
        loadingTeams: 'Cargando equipos...',
        noSavedTeams: 'No tienes equipos guardados todavía.',
        createTeamFirst: 'Crea uno en el Constructor y guárdalo aquí.',
        load: 'Cargar',
        delete: 'Eliminar',
        saveTeam: 'Guardar equipo',
        emptyTeam: 'El equipo está vacío. Añade al menos un Pokémon.',
        teamNamePrompt: 'Nombre del equipo:',
        teamFormatPrompt: 'Formato (OU, UU, Doubles...)',
        teamSaved: 'Equipo guardado correctamente.',
        teamSaveError: 'No se pudo guardar. ¿Está el servidor corriendo?',
        deleteTeamConfirm: '¿Eliminar este equipo?',
        join: 'Unirse',
        createRoom: 'Crear sala',
        findOpponent: 'Buscar rival',
        practiceBot: 'Probar contra bot',
        currentBuilder: 'Usar constructor actual',
        chooseSavedTeam: 'Elegir equipo guardado',
        randomTeam: 'Equipo aleatorio',
        roomIdPlaceholder: 'ID de sala...',
      },
      glossary: {
        searchHint: 'Escribe al menos 2 letras.',
        searching: 'Buscando...',
        noResults: 'Sin resultados.',
        loadError: 'No se pudo cargar. Intenta de nuevo.',
        moveSearchHint: 'Escribe un movimiento o usa los filtros.',
        moveSearchHintShort: 'Escribe al menos 2 letras o usa los filtros.',
        terms: 'Términos',
        pokemon: 'Pokémon',
        moves: 'Movimientos',
        abilities: 'Habilidades',
        items: 'Objetos',
        pokemonPlaceholder: 'Busca un Pokémon... (ej: pikachu, charizard)',
        movePlaceholder: 'Busca en español o inglés... ej: Terremoto, dark',
        abilityPlaceholder: 'Busca una habilidad... (ej: intimidate, levitate)',
        itemPlaceholder: 'Busca un objeto... (ej: leftovers, choice-band)',
      },
      typecalc: {
        attack: 'Ataque',
        defense: 'Defensa',
        single: 'Single',
        dual: 'Dual',
        solo: 'Solo',
        chooseTypes: 'Elige los tipos',
        clear: 'Limpiar',
        copyLink: 'Copiar link',
        copied: 'Link copiado',
        takes4: 'Sufre 4x por',
        takes2: 'Sufre 2x por',
        takes1: 'Sufre 1x por',
        takes05: 'Sufre 0,5x por',
        takes025: 'Sufre 0,25x por',
        takes0: 'Sufre 0x por',
        deals4: 'Inflige 4x a',
        deals2: 'Inflige 2x a',
        deals1: 'Inflige 1x a',
        deals05: 'Inflige 0,5x a',
        deals025: 'Inflige 0,25x a',
        deals0: 'Inflige 0x a',
        none: 'Ninguno',
        editTypes: 'Tipos',
      },
    },
    en: {
      app: {
        title: 'PokeHub Competitive',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        inicio: 'Home',
        consulta: 'Quick wiki',
        calculadora: 'Damage calculator',
        tipos: 'Type calculator',
        constructor: 'Team builder',
        equipos: 'My teams',
        glosario: 'Glossary and guides',
      },
      home: {
        heroBadge: 'Starter guide',
        heroTitle: 'Welcome to competitive Pokémon',
        heroSub: 'If you are just getting into competitive play, you are in the right place. Here you will learn everything from scratch, step by step, without skipping the important parts.',
      },
      sections: {
        savedTeamsTitle: 'My saved teams',
        savedTeamsRefresh: 'Refresh',
        consultTitle: 'Competitive reference hub',
        consultIntro: 'Quick wiki to check Pokémon, moves, abilities, items, and calculators while you play outside this website.',
        damageCalcTitle: 'Damage calculator',
        damageCalcIntro: 'Compare two Pokémon, adjust stats, item, ability, and field conditions to estimate real damage.',
        typeCalcTitle: 'Type calculator',
        typeCalcIntro: 'Interactive tool to analyze offensive and defensive matchups with one or two types.',
        glossaryTitle: 'Glossary and database',
        glossaryIntro: 'Competitive terms, Pokémon, moves, abilities, and items. With direct WikiDex link.',
      },
      consult: {
        badge: 'Wiki companion',
        title: 'Competitive reference hub',
        text: 'Use PokÃ©Hub as a quick wiki while you play on PokÃ©mon Showdown or PokÃ©mon Champions. Everything is focused on checking data, matchups, damage, builds, and concepts without losing the flow of your real match.',
        flowTitle: 'Recommended flow',
        flow1: '1. Look up the PokÃ©mon, move, or item you are facing.',
        flow2: '2. Check the damage or the type coverage.',
        flow3: '3. Adjust your team or your notes in the builder.',
        flow4: '4. Go back to Showdown with the information clear.',
        cardPokemonTitle: 'PokÃ©mon',
        cardPokemonText: 'Check types, stats, tiers, descriptions, and learnsets to decide switches, coverage, and checks.',
        cardPokemonBtn: 'Open PokÃ©mon',
        cardMovesTitle: 'Moves',
        cardMovesText: 'Search in Spanish or English and review power, accuracy, category, and common users.',
        cardMovesBtn: 'Open moves',
        cardToolsTitle: 'Abilities and items',
        cardToolsText: 'Check effects, synergies, and key details to understand opposing sets and win conditions.',
        cardAbilitiesBtn: 'Abilities',
        cardItemsBtn: 'Items',
        cardDamageTitle: 'Damage calculator',
        cardDamageText: 'Estimate real damage between two PokÃ©mon by adjusting EVs, abilities, items, and field conditions.',
        cardDamageBtn: 'Open calculator',
        cardTypesTitle: 'Type calculator',
        cardTypesText: 'Analyze weaknesses, resistances, immunities, and offensive coverage with one or two types.',
        cardTypesBtn: 'Open types',
        cardBuilderTitle: 'Builder and teams',
        cardBuilderText: 'Create teams, export them to Showdown, and save versions to keep iterating outside the match.',
        cardBuilderBtn: 'Open builder',
        cardSavedBtn: 'View saved',
        panelTitle: 'Why this approach works better',
        panel1: 'The website has a clear purpose: quickly checking competitive information while you play.',
        panel2: 'The main functions can be tested in seconds: searches, calculators, builder, and saved teams.',
        panel3: 'You can genuinely use it next to Showdown without jumping between tools every minute.',
      },
      common: {
        back: 'Back',
        search: 'Search',
        searching: 'Searching...',
        noResults: 'No results.',
        loadingTeams: 'Loading teams...',
        noSavedTeams: 'You do not have any saved teams yet.',
        createTeamFirst: 'Create one in the Team Builder and save it here.',
        load: 'Load',
        delete: 'Delete',
        saveTeam: 'Save team',
        emptyTeam: 'The team is empty. Add at least one Pokémon.',
        teamNamePrompt: 'Team name:',
        teamFormatPrompt: 'Format (OU, UU, Doubles...)',
        teamSaved: 'Team saved successfully.',
        teamSaveError: 'Could not save the team. Is the server running?',
        deleteTeamConfirm: 'Delete this team?',
        join: 'Join',
        createRoom: 'Create room',
        findOpponent: 'Find opponent',
        practiceBot: 'Practice vs bot',
        currentBuilder: 'Use current builder team',
        chooseSavedTeam: 'Choose saved team',
        randomTeam: 'Random team',
        roomIdPlaceholder: 'Room ID...',
      },
      glossary: {
        searchHint: 'Type at least 2 letters.',
        searching: 'Searching...',
        noResults: 'No results.',
        loadError: 'Could not load the data. Try again.',
        moveSearchHint: 'Type a move name or use the filters.',
        moveSearchHintShort: 'Type at least 2 letters or use the filters.',
        terms: 'Terms',
        pokemon: 'Pokemon',
        moves: 'Moves',
        abilities: 'Abilities',
        items: 'Items',
        pokemonPlaceholder: 'Search a Pokémon... (e.g. pikachu, charizard)',
        movePlaceholder: 'Search in Spanish or English... e.g. Earthquake, dark',
        abilityPlaceholder: 'Search an ability... (e.g. intimidate, levitate)',
        itemPlaceholder: 'Search an item... (e.g. leftovers, choice-band)',
      },
      typecalc: {
        attack: 'Attack',
        defense: 'Defense',
        single: 'Single',
        dual: 'Dual',
        solo: 'Single',
        chooseTypes: 'Choose types',
        clear: 'Clear',
        copyLink: 'Copy link',
        copied: 'Link copied',
        takes4: 'Takes 4x from',
        takes2: 'Takes 2x from',
        takes1: 'Takes 1x from',
        takes05: 'Takes 0.5x from',
        takes025: 'Takes 0.25x from',
        takes0: 'Takes 0x from',
        deals4: 'Deals 4x to',
        deals2: 'Deals 2x to',
        deals1: 'Deals 1x to',
        deals05: 'Deals 0.5x to',
        deals025: 'Deals 0.25x to',
        deals0: 'Deals 0x to',
        none: 'None',
        editTypes: 'Types',
      },
    },
  };

  // getText busca un texto dentro del diccionario.
  // path = "ruta" interna del texto, por ejemplo "app.combate".
  // fallback = texto de emergencia si no se encuentra nada.
  function getText(path, fallback = '') {
    // split('.') convierte "app.combate" en ["app", "combate"].
    const chunks = path.split('.');
    // current va bajando dentro del objeto hasta llegar al texto final.
    let current = UI_TEXT[window.LANG] || UI_TEXT.es;
    for (const chunk of chunks) {
      // ?. = optional chaining = "si existe, entra; si no, no rompas el codigo".
      current = current?.[chunk];
      if (current == null) return fallback || path;
    }
    return current;
  }

  // Devuelve los nombres base en espanol e ingles de una entrada.
  // entry = resultado de una busqueda, movimiento, pokemon, etc.
  function rawNames(entry) {
    if (!entry) return { es: '', en: '' };
    return {
      es: entry.name_es || entry.es || entry.name || entry.id || '',
      en: entry.name_en || entry.name || entry.id || '',
    };
  }

  // Decide que nombre va primero segun el idioma elegido.
  // Si estamos en ingles: primary = ingles, secondary = espanol.
  // Si estamos en espanol: primary = espanol, secondary = ingles.
  function orderedNames(entry) {
    const pair = rawNames(entry);
    return window.LANG === 'en'
      ? { primary: pair.en || pair.es, secondary: pair.es || '' }
      : { primary: pair.es || pair.en, secondary: pair.en || '' };
  }

  // Dejamos funciones disponibles en window para poder usarlas desde otros JS.
  window.t = getText;
  window.getRawNames = rawNames;
  window.getOrderedNames = orderedNames;
  window.pickText = function (es, en) {
    return window.LANG === 'en' ? en : es;
  };

  // Busca el nombre principal de una entrada por id y categoria.
  // Ejemplo: id = "flamethrower", category = "moves".
  window.getName = function (id, category) {
    const entry = window.TRANSLATIONS_ES?.[category]?.[id];
    if (!entry) return id;
    // Destructuring = sacar valores de un array u objeto de forma rapida.
    const [es, en] = Array.isArray(entry) ? entry : [entry, null];
    return window.LANG === 'en' ? (en || es || id) : (es || en || id);
  };

  // Devuelve el segundo nombre para mostrar formato bilingue.
  window.getSecName = function (id, category) {
    const entry = window.TRANSLATIONS_ES?.[category]?.[id];
    if (!entry) return '';
    const [es, en] = Array.isArray(entry) ? entry : [entry, null];
    return window.LANG === 'en' ? (es || '') : (en || '');
  };

  // Devuelve la descripcion si existe en la tabla de traducciones.
  window.getDesc = function (id, category) {
    const entry = window.TRANSLATIONS_ES?.[category]?.[id];
    if (!Array.isArray(entry) || entry.length < 3) return '';
    return entry[2] || '';
  };

  window.getPreferredName = function (result) {
    return orderedNames(result).primary || '';
  };

  window.getSecondaryName = function (result) {
    return orderedNames(result).secondary || '';
  };

  window.getBilingualNames = function (result) {
    return rawNames(result);
  };

  // Diccionario de tipos para mostrar su nombre traducido.
  const TYPE_NAMES_ALL = {
    es: {
      normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
      grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
      ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
      rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
      steel: 'Acero', fairy: 'Hada',
    },
    en: {
      normal: 'Normal', fire: 'Fire', water: 'Water', electric: 'Electric',
      grass: 'Grass', ice: 'Ice', fighting: 'Fighting', poison: 'Poison',
      ground: 'Ground', flying: 'Flying', psychic: 'Psychic', bug: 'Bug',
      rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon', dark: 'Dark',
      steel: 'Steel', fairy: 'Fairy',
    },
  };

  // typeEn = nombre interno del tipo en ingles, por ejemplo "fire".
  // Esta funcion devuelve "Fuego" o "Fire" segun el idioma activo.
  window.getTypeName = function (typeEn) {
    return (TYPE_NAMES_ALL[window.LANG] || TYPE_NAMES_ALL.es)[typeEn] || typeEn;
  };

  // Cambia idioma del documento HTML y titulo de la pestana del navegador.
  function updateDocumentLanguage() {
    document.documentElement.lang = window.LANG;
    document.title = getText('app.title');
  }

  // Recorre elementos estaticos de la interfaz y cambia sus textos.
  function updateStaticUI() {
    document.getElementById('sidebar-open')?.setAttribute('title', getText('app.openMenu'));
    document.getElementById('sidebar-close')?.setAttribute('title', getText('app.closeMenu'));

    // querySelectorAll devuelve una lista; forEach recorre cada elemento.
    document.querySelectorAll('.nav-item').forEach((item) => {
      // dataset.section = valor del atributo HTML data-section.
      const key = item.dataset.section;
      const label = item.querySelector('.nav-label');
      if (label && key) label.textContent = getText(`app.${key}`, label.textContent);
    });

    const activeSection = document.querySelector('.nav-item.active')?.dataset.section || 'inicio';
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = getText(`app.${activeSection}`, pageTitle.textContent);

    const heroBadge = document.querySelector('.hero-badge');
    const heroTitle = document.querySelector('.hero-title');
    const heroSub = document.querySelector('.hero-sub');
    if (heroBadge) heroBadge.textContent = getText('home.heroBadge', heroBadge.textContent);
    if (heroTitle) heroTitle.textContent = getText('home.heroTitle', heroTitle.textContent);
    if (heroSub) heroSub.textContent = getText('home.heroSub', heroSub.textContent);

    const savedTitle = document.querySelector('#section-equipos .tb-title');
    const refreshBtn = document.getElementById('btn-refresh-teams');
    if (savedTitle) savedTitle.textContent = getText('sections.savedTeamsTitle', savedTitle.textContent);
    if (refreshBtn) refreshBtn.textContent = getText('sections.savedTeamsRefresh', refreshBtn.textContent);

    const consultMap = {
      'consult-badge': 'consult.badge',
      'consult-title': 'consult.title',
      'consult-text': 'consult.text',
      'consult-flow-title': 'consult.flowTitle',
      'consult-flow-1': 'consult.flow1',
      'consult-flow-2': 'consult.flow2',
      'consult-flow-3': 'consult.flow3',
      'consult-flow-4': 'consult.flow4',
      'consult-card-pokemon-title': 'consult.cardPokemonTitle',
      'consult-card-pokemon-text': 'consult.cardPokemonText',
      'consult-card-pokemon-btn': 'consult.cardPokemonBtn',
      'consult-card-moves-title': 'consult.cardMovesTitle',
      'consult-card-moves-text': 'consult.cardMovesText',
      'consult-card-moves-btn': 'consult.cardMovesBtn',
      'consult-card-tools-title': 'consult.cardToolsTitle',
      'consult-card-tools-text': 'consult.cardToolsText',
      'consult-card-abilities-btn': 'consult.cardAbilitiesBtn',
      'consult-card-items-btn': 'consult.cardItemsBtn',
      'consult-card-damage-title': 'consult.cardDamageTitle',
      'consult-card-damage-text': 'consult.cardDamageText',
      'consult-card-damage-btn': 'consult.cardDamageBtn',
      'consult-card-types-title': 'consult.cardTypesTitle',
      'consult-card-types-text': 'consult.cardTypesText',
      'consult-card-types-btn': 'consult.cardTypesBtn',
      'consult-card-builder-title': 'consult.cardBuilderTitle',
      'consult-card-builder-text': 'consult.cardBuilderText',
      'consult-card-builder-btn': 'consult.cardBuilderBtn',
      'consult-card-saved-btn': 'consult.cardSavedBtn',
      'consult-panel-title': 'consult.panelTitle',
      'consult-panel-1': 'consult.panel1',
      'consult-panel-2': 'consult.panel2',
      'consult-panel-3': 'consult.panel3',
    };
    Object.entries(consultMap).forEach(([id, key]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = getText(key, element.textContent);
    });

    const damageTitle = document.querySelector('#section-calculadora h2');
    const damageIntro = document.querySelector('#section-calculadora p');
    if (damageTitle) damageTitle.textContent = getText('sections.damageCalcTitle', damageTitle.textContent);
    if (damageIntro) damageIntro.textContent = getText('sections.damageCalcIntro', damageIntro.textContent);

    const typeTitle = document.querySelector('#section-tipos h2');
    const typeIntro = document.querySelector('#section-tipos p');
    if (typeTitle) typeTitle.textContent = getText('sections.typeCalcTitle', typeTitle.textContent);
    if (typeIntro) typeIntro.textContent = getText('sections.typeCalcIntro', typeIntro.textContent);

    const glossaryTitle = document.querySelector('#section-glosario h2');
    const glossaryIntro = document.querySelector('#section-glosario p');
    if (glossaryTitle) glossaryTitle.textContent = getText('sections.glossaryTitle', glossaryTitle.textContent);
    if (glossaryIntro) glossaryIntro.textContent = getText('sections.glossaryIntro', glossaryIntro.textContent);

    document.getElementById('btn-refresh-teams') && (document.getElementById('btn-refresh-teams').textContent = `↻ ${getText('sections.savedTeamsRefresh')}`);
    document.getElementById('battle-find-btn') && (document.getElementById('battle-find-btn').textContent = `⚔️ ${getText('common.findOpponent')}`);
    document.getElementById('battle-practice-btn') && (document.getElementById('battle-practice-btn').textContent = getText('common.practiceBot'));
    document.getElementById('battle-create-btn') && (document.getElementById('battle-create-btn').textContent = `➕ ${getText('common.createRoom')}`);
    document.getElementById('battle-join-btn') && (document.getElementById('battle-join-btn').textContent = getText('common.join'));
    document.getElementById('battle-join-id')?.setAttribute('placeholder', getText('common.roomIdPlaceholder'));
    document.getElementById('battle-trainer-name')?.setAttribute('placeholder', 'Ash, Misty...');

    const trainerInput = document.getElementById('battle-trainer-name');
    if (trainerInput && ['Trainer', 'Entrenador'].includes(trainerInput.value)) {
      trainerInput.value = window.LANG === 'en' ? 'Trainer' : 'Entrenador';
    }

    const forfeitBtn = document.getElementById('battle-forfeit-btn');
    if (forfeitBtn) forfeitBtn.textContent = window.LANG === 'en' ? 'Forfeit' : 'Rendirse';

    const teamSource = document.getElementById('battle-team-source');
    if (teamSource?.options?.length >= 3) {
      teamSource.options[0].text = getText('common.currentBuilder');
      teamSource.options[1].text = getText('common.chooseSavedTeam');
      teamSource.options[2].text = getText('common.randomTeam');
    }

    const savedSelect = document.getElementById('battle-saved-team');
    if (savedSelect && savedSelect.options.length && !savedSelect.value) {
      savedSelect.options[0].text = getText('common.loadingTeams');
    }

    const battleWaiting = document.querySelector('#battle-move-area .battle-waiting');
    if (battleWaiting) {
      battleWaiting.textContent = window.LANG === 'en' ? 'Waiting for battle start...' : 'Esperando inicio de batalla...';
    }

    const glossaryCategory = document.getElementById('glossary-category');
    if (glossaryCategory?.options?.length) {
      glossaryCategory.options[0].text = window.LANG === 'en' ? 'All categories' : 'Todas las categorias';
    }

    document.querySelectorAll('.tab-btn').forEach((button) => {
      const key = button.dataset.tab;
      const map = {
        terminos: 'glossary.terms',
        pokemon: 'glossary.pokemon',
        movimientos: 'glossary.moves',
        habilidades: 'glossary.abilities',
        objetos: 'glossary.items',
      };
      if (map[key]) button.textContent = getText(map[key]);
    });

    document.getElementById('pokemon-search')?.setAttribute('placeholder', getText('glossary.pokemonPlaceholder'));
    document.getElementById('move-search')?.setAttribute('placeholder', getText('glossary.movePlaceholder'));
    document.getElementById('ability-search')?.setAttribute('placeholder', getText('glossary.abilityPlaceholder'));
    document.getElementById('item-search')?.setAttribute('placeholder', getText('glossary.itemPlaceholder'));

    const btnEs = document.getElementById('lang-btn-es');
    const btnEn = document.getElementById('lang-btn-en');
    if (btnEs) btnEs.classList.toggle('is-active', window.LANG === 'es');
    if (btnEn) btnEn.classList.toggle('is-active', window.LANG === 'en');
  }

  window.setLang = function (lang) {
    window.LANG = lang === 'en' ? 'en' : 'es';
    localStorage.setItem('pokehub-lang', window.LANG);
    updateDocumentLanguage();
    updateStaticUI();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: window.LANG } }));
  };

  document.addEventListener('DOMContentLoaded', () => {
    updateDocumentLanguage();
    updateStaticUI();
    document.getElementById('lang-btn-es')?.addEventListener('click', () => window.setLang('es'));
    document.getElementById('lang-btn-en')?.addEventListener('click', () => window.setLang('en'));
  });
})();
