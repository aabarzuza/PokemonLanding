// content-i18n.js
// Este archivo traduce el contenido fijo largo de la web.
// Lo separamos de lang.js para que el sistema de idioma sea más fácil de entender.

(function () {
  // Esta función devuelve el idioma actual de la web.
  function lang() {
    return window.LANG === 'es' ? 'es' : 'en';
  }

  // Estas plantillas contienen la guía completa de Inicio en ambos idiomas.
  const HOME_GUIDE = {
    en: `
      <div class="hero">
        <div class="hero-badge">Starter guide</div>
        <h2 class="hero-title">Welcome to competitive Pokemon</h2>
        <p class="hero-sub">If you are just getting into competitive play, you are in the right place. Here you will learn everything from scratch, step by step, without skipping the important parts.</p>
      </div>

      <div class="guide-index">
        <div class="guide-index-title">In this guide</div>
        <div class="guide-index-links">
          <a href="#g1" class="guide-index-link">1. What is competitive Pokemon?</a>
          <a href="#g2" class="guide-index-link">2. Pokemon Showdown</a>
          <a href="#g3" class="guide-index-link">3. Base stats</a>
          <a href="#g4" class="guide-index-link">4. IVs - Individual Values</a>
          <a href="#g5" class="guide-index-link">5. EVs - Effort Values</a>
          <a href="#g6" class="guide-index-link">6. Natures</a>
          <a href="#g7" class="guide-index-link">7. Type chart</a>
          <a href="#g8" class="guide-index-link">8. Team roles</a>
          <a href="#g9" class="guide-index-link">9. Competitive items</a>
          <a href="#g10" class="guide-index-link">10. Key abilities</a>
          <a href="#g11" class="guide-index-link">11. Tiers and Smogon</a>
          <a href="#g12" class="guide-index-link">12. Competitive clauses</a>
          <a href="#g13" class="guide-index-link">13. Your first team</a>
        </div>
      </div>

      <div class="guide-block" id="g1">
        <h3 class="guide-h3">1. What is competitive Pokemon?</h3>
        <p class="guide-p">Competitive Pokemon is a very different layer of play from the main story mode. In the story you can win with your favorite Pokemon without thinking much about numbers. In competitive play, every decision matters: which Pokemon you use, which moves they carry, which item they hold, and what you do each turn.</p>
        <p class="guide-p">The goal is to build a team of 6 Pokemon that work well together and fight other players in highly strategic turn-based battles. Matches are not only about luck, but mostly about knowledge, preparation, and reading your opponent.</p>
        <div class="guide-tip">Tip: You do not need to learn everything at once. Learn one concept at a time and play battles. Experience teaches faster than any guide.</div>
      </div>

      <div class="guide-block" id="g2">
        <h3 class="guide-h3">2. Pokemon Showdown</h3>
        <p class="guide-p"><strong>Pokemon Showdown</strong> is the most widely used online battle simulator in competitive Pokemon. It is completely free, it works in the browser, and you do not need the physical games or trained Pokemon to use it.</p>
        <p class="guide-p">You can create any team instantly with any Pokemon, EVs, IVs, moves, and items you want, then battle players from all over the world immediately. It also lets you practice against the AI.</p>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">→</span> Visit <strong>pokemonshowdown.com</strong></div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> You do not need an account to play, although it is recommended</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> A common starting format is <strong>OU (OverUsed)</strong></div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> You can use this app to build your team and export it to Showdown</div>
        </div>
      </div>

      <div class="guide-block" id="g3">
        <h3 class="guide-h3">3. Base stats</h3>
        <p class="guide-p">Every Pokemon has 6 stats that define how it behaves in battle: <strong>HP</strong>, <strong>Attack</strong>, <strong>Defense</strong>, <strong>Special Attack</strong>, <strong>Special Defense</strong>, and <strong>Speed</strong>.</p>
        <p class="guide-p">Base stats are fixed for each species. A Garchomp will always have base 130 Attack. IVs, EVs, and Natures are applied on top of those base values to calculate the final stat used in battle.</p>
        <div class="guide-example">
          <div class="guide-example-label">Example</div>
          Garchomp has 108 HP / 130 Atk / 95 Def / 80 SpA / 85 SpD / 102 Spe. Its strengths are Attack and Speed. Its weak point is Special Attack. That helps define how it should be played.
        </div>
      </div>

      <div class="guide-block" id="g4">
        <h3 class="guide-h3">4. IVs - Individual Values</h3>
        <p class="guide-p">IVs are like a Pokemon's genes. Each stat has an IV between <strong>0 and 31</strong>. An IV of 31 is perfect and gives the maximum possible value to that stat. An IV of 0 gives the minimum.</p>
        <p class="guide-p">In competitive play, players usually want 31 IVs in most stats, except in special cases. For example, some Pokemon use 0 Attack IVs to reduce confusion or Foul Play damage.</p>
        <div class="guide-tip">Tip: In Pokemon Showdown you can set IVs directly. In the official games they are obtained through breeding or Hyper Training.</div>
      </div>

      <div class="guide-block" id="g5">
        <h3 class="guide-h3">5. EVs - Effort Values</h3>
        <p class="guide-p">EVs are the training points of your Pokemon. They are gained by battling Pokemon or using certain items. At level 100, every 4 EVs in a stat add 1 point to that stat.</p>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">→</span> Maximum of <strong>252 EVs</strong> in one stat</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> Maximum of <strong>510 EVs</strong> in total</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> The most common spread is <strong>252 / 252 / 4</strong></div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> Defensive spreads can be more balanced, like 252 HP / 240 Def / 16 Spe</div>
        </div>
        <div class="guide-example">
          <div class="guide-example-label">Example</div>
          An offensive Garchomp often uses 252 Attack / 252 Speed / 4 HP with a Jolly or Adamant nature to maximize damage and speed.
        </div>
      </div>

      <div class="guide-block" id="g6">
        <h3 class="guide-h3">6. Natures</h3>
        <p class="guide-p">Natures modify two stats: they <strong>increase one stat by 10%</strong> and <strong>decrease another by 10%</strong>. There are 25 natures in total, and 5 of them are neutral.</p>
        <div class="guide-table">
          <div class="guide-table-row guide-table-head">
            <span>Nature</span><span>Raises (+10%)</span><span>Lowers (-10%)</span>
          </div>
          <div class="guide-table-row"><span>Adamant</span><span>Attack</span><span>Sp. Atk</span></div>
          <div class="guide-table-row"><span>Jolly</span><span>Speed</span><span>Sp. Atk</span></div>
          <div class="guide-table-row"><span>Modest</span><span>Sp. Atk</span><span>Attack</span></div>
          <div class="guide-table-row"><span>Timid</span><span>Speed</span><span>Attack</span></div>
          <div class="guide-table-row"><span>Bold</span><span>Defense</span><span>Attack</span></div>
          <div class="guide-table-row"><span>Calm</span><span>Sp. Def</span><span>Attack</span></div>
          <div class="guide-table-row"><span>Impish</span><span>Defense</span><span>Sp. Atk</span></div>
          <div class="guide-table-row"><span>Careful</span><span>Sp. Def</span><span>Sp. Atk</span></div>
        </div>
        <div class="guide-tip">Tip: Physical attackers often use Adamant or Jolly. Special attackers often use Modest or Timid.</div>
      </div>

      <div class="guide-block" id="g7">
        <h3 class="guide-h3">7. Type chart</h3>
        <p class="guide-p">There are 18 Pokemon types. Every type has advantages, resistances, and immunities against other types. This chart defines a huge part of the game's strategy.</p>
        <p class="guide-p">Pokemon can have one or two types. If a move is super effective against both defending types, the multiplier stacks to x4. If one type resists and the other is weak, they cancel each other out.</p>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>STAB</strong>: if a Pokemon uses a move of its own type, it gets a 50% damage boost</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> You can check the full type calculator in <strong>Type calculator</strong></div>
        </div>
        <div class="guide-example">
          <div class="guide-example-label">Example</div>
          Charizard is Fire/Flying. A Rock move deals x4 damage because Rock is super effective against both of its types.
        </div>
      </div>

      <div class="guide-block" id="g8">
        <h3 class="guide-h3">8. Team roles</h3>
        <p class="guide-p">A competitive team combines Pokemon with different functions. Understanding roles helps you build balanced teams with fewer obvious weaknesses.</p>
        <div class="guide-roles">
          <div class="guide-role-item"><div class="guide-role-name">Sweeper</div><div class="guide-role-desc">An offensive Pokemon that tries to KO the opposing team. It usually has high Speed or boosting moves.</div></div>
          <div class="guide-role-item"><div class="guide-role-name">Wall</div><div class="guide-role-desc">A defensive Pokemon that can take many hits. Its job is to stay alive and wear the opponent down.</div></div>
          <div class="guide-role-item"><div class="guide-role-name">Pivot</div><div class="guide-role-desc">A Pokemon that comes in, applies pressure, and safely brings in a teammate with U-turn or Volt Switch.</div></div>
          <div class="guide-role-item"><div class="guide-role-name">Wallbreaker</div><div class="guide-role-desc">A very strong attacker that breaks defensive cores so a sweeper can finish the game later.</div></div>
          <div class="guide-role-item"><div class="guide-role-name">Hazard setter</div><div class="guide-role-desc">A Pokemon that sets entry hazards like Stealth Rock or Spikes.</div></div>
          <div class="guide-role-item"><div class="guide-role-name">Spinner / Defogger</div><div class="guide-role-desc">A Pokemon that removes hazards from your side of the field.</div></div>
        </div>
      </div>

      <div class="guide-block" id="g9">
        <h3 class="guide-h3">9. Most important competitive items</h3>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Choice Band / Specs / Scarf</strong>: boost a stat by x1.5 but lock the user into one move</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Leftovers</strong>: recover 1/16 of max HP every turn</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Heavy-Duty Boots</strong>: ignore entry hazards</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Life Orb</strong>: 30% more damage with recoil</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Rocky Helmet</strong>: punishes contact moves</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Focus Sash</strong>: survives one hit from full HP</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Eviolite</strong>: boosts defenses of unevolved Pokemon</div>
        </div>
      </div>

      <div class="guide-block" id="g10">
        <h3 class="guide-h3">10. Key abilities</h3>
        <p class="guide-p">Abilities activate automatically in certain conditions and can completely change how a Pokemon is played.</p>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Intimidate</strong>: lowers the opponent's Attack on switch-in</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Speed Boost</strong>: raises Speed every turn</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Levitate</strong>: grants Ground immunity</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Regenerator</strong>: heals when switching out</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Magic Guard</strong>: blocks indirect damage</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Protean / Libero</strong>: changes the user's type to the move used</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Multiscale</strong>: halves damage at full HP</div>
        </div>
      </div>

      <div class="guide-block" id="g11">
        <h3 class="guide-h3">11. Tiers and Smogon</h3>
        <p class="guide-p"><strong>Smogon</strong> is the largest competitive Pokemon community. It keeps a tier system that classifies Pokemon according to real usage.</p>
        <div class="guide-table">
          <div class="guide-table-row guide-table-head"><span>Tier</span><span>Meaning</span><span>Level</span></div>
          <div class="guide-table-row"><span>Uber</span><span>Too strong for OU</span><span>Highest</span></div>
          <div class="guide-table-row"><span>OU</span><span>OverUsed, the main tier</span><span>High</span></div>
          <div class="guide-table-row"><span>UU</span><span>UnderUsed</span><span>Mid-high</span></div>
          <div class="guide-table-row"><span>RU</span><span>RarelyUsed</span><span>Mid</span></div>
          <div class="guide-table-row"><span>NU</span><span>NeverUsed</span><span>Mid-low</span></div>
          <div class="guide-table-row"><span>PU</span><span>Least used</span><span>Low</span></div>
        </div>
        <div class="guide-tip">Tip: Starting in UU or NU can be easier than OU because the metagame is usually simpler.</div>
      </div>

      <div class="guide-block" id="g12">
        <h3 class="guide-h3">12. Smogon clauses</h3>
        <p class="guide-p">Smogon adds extra rules called clauses to keep formats balanced:</p>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Sleep Clause</strong>: only one opposing Pokemon can be put to sleep at a time</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Species Clause</strong>: you cannot use two Pokemon of the same species</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Evasion Clause</strong>: moves that boost evasion are banned</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>OHKO Clause</strong>: one-hit KO moves are banned</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Moody Clause</strong>: Moody is banned</div>
          <div class="guide-list-item"><span class="guide-list-dot">→</span> <strong>Endless Battle Clause</strong>: infinite battle loops are banned</div>
        </div>
      </div>

      <div class="guide-block" id="g13">
        <h3 class="guide-h3">13. Your first team</h3>
        <p class="guide-p">Building a first team can feel overwhelming. Follow these steps to get a solid base:</p>
        <div class="guide-list">
          <div class="guide-list-item"><span class="guide-list-dot">1.</span> <strong>Pick a Pokemon you like</strong> and check its tier</div>
          <div class="guide-list-item"><span class="guide-list-dot">2.</span> <strong>Add a Stealth Rock setter</strong></div>
          <div class="guide-list-item"><span class="guide-list-dot">3.</span> <strong>Add a pivot</strong> with U-turn or Volt Switch</div>
          <div class="guide-list-item"><span class="guide-list-dot">4.</span> <strong>Include hazard control</strong> with Rapid Spin or Defog</div>
          <div class="guide-list-item"><span class="guide-list-dot">5.</span> <strong>Check type weaknesses</strong> and cover them</div>
          <div class="guide-list-item"><span class="guide-list-dot">6.</span> <strong>Test in Showdown</strong>, play, and improve the team</div>
        </div>
        <div class="guide-tip">Tip: Smogon has detailed analyses and recommended sets at <strong>smogon.com/dex</strong>.</div>
      </div>
    `,
    es: ''
  };

  // Reutilizamos el HTML original para español si el alumno quiere seguir viéndolo así.
  const ORIGINAL_HOME_HTML = {};

  // Esta función devuelve un texto según el idioma actual.
  function text(es, en) {
    return lang() === 'es' ? es : en;
  }

  // Esta función rellena la guía de inicio.
  function renderHomeGuide() {
    const container = document.querySelector('#section-inicio .section-inner');
    if (!container) return;

    if (!ORIGINAL_HOME_HTML.es) {
      ORIGINAL_HOME_HTML.es = container.innerHTML;
    }

    container.innerHTML = lang() === 'es' ? ORIGINAL_HOME_HTML.es : HOME_GUIDE.en;
  }

  // Esta función actualiza el resto de textos fijos visibles.
  function renderStaticLabels() {
    const status = document.getElementById('battle-status-msg');
    const battleTitle = document.querySelector('#battle-intro .tb-title');
    const trainerLabel = document.querySelector('label[for="battle-trainer-name"]') || document.querySelector('#battle-trainer-name')?.previousElementSibling;
    const formatLabel = document.querySelector('#battle-format')?.previousElementSibling;
    const teamLabel = document.querySelector('#battle-team-source')?.previousElementSibling;
    const setupTitles = document.querySelectorAll('.battle-setup-title');
    const setupParagraphs = document.querySelectorAll('.battle-setup-card .guide-p');
    const setupTip = document.querySelector('#battle-intro .guide-tip');
    const forfeit = document.getElementById('battle-forfeit-btn');
    const glossaryBtn = document.getElementById('battle-tool-glossary-btn');
    const typesBtn = document.getElementById('battle-tool-types-btn');
    const moveTypeFilter = document.getElementById('move-type-filter');
    const moveCatFilter = document.getElementById('move-cat-filter');
    const glossarySearch = document.getElementById('glossary-search');
    const glossaryCount = document.getElementById('glossary-count');
    const glossaryHint = document.querySelector('.glossary-hint');
    const ioTitle = document.getElementById('io-title');
    const ioHint = document.querySelector('.modal-hint');
    const ioTextarea = document.getElementById('io-textarea');
    const ioCopy = document.getElementById('io-copy-btn');
    const ioImport = document.getElementById('io-do-import');
    const exportBtn = document.getElementById('tb-export-btn');
    const importLabel = document.querySelector('.tb-import-label');
    const importBtn = document.getElementById('tb-import-btn');
    const battleWaiting = document.querySelector('.battle-waiting');

    if (status && !status.dataset.live) status.textContent = text('No conectado', 'Not connected');
    if (battleTitle) battleTitle.textContent = text('Panel de combate', 'Battle panel');
    if (trainerLabel) trainerLabel.textContent = text('Tu nombre de entrenador', 'Your trainer name');
    if (formatLabel) formatLabel.textContent = text('Formato', 'Format');
    if (teamLabel) teamLabel.textContent = text('Equipo', 'Team');
    if (setupTitles[0]) setupTitles[0].textContent = text('Buscar batalla', 'Find battle');
    if (setupTitles[1]) setupTitles[1].textContent = text('Sala privada', 'Private room');
    if (setupParagraphs[0]) setupParagraphs[0].textContent = text('Entra en cola y cuando haya otro jugador disponible empieza la batalla automáticamente.', 'Join the queue and the battle will start automatically when another player is available.');
    if (setupParagraphs[1]) setupParagraphs[1].textContent = text('Crea una sala y comparte el ID con un amigo para jugar.', 'Create a room and share its ID with a friend to play.');
    if (setupTip) setupTip.textContent = text('Puedes combatir con el equipo del constructor, con uno guardado o con uno aleatorio. Los formatos dobles también están disponibles.', 'You can battle with the current builder team, a saved team, or a random team. Doubles formats are also available.');
    if (forfeit) forfeit.textContent = text('Rendirse', 'Forfeit');
    if (glossaryBtn) glossaryBtn.textContent = text('Glosario', 'Glossary');
    if (typesBtn) typesBtn.textContent = text('Tipos', 'Types');
    if (glossarySearch) glossarySearch.placeholder = text('Busca un término... (ej: STAB, hazard, wall)', 'Search a term... (e.g. STAB, hazard, wall)');
    if (glossaryCount && glossaryCount.textContent.includes('—')) glossaryCount.textContent = text('— términos', '— terms');
    if (glossaryHint) glossaryHint.textContent = text('Pulsa Esc para limpiar', 'Press Esc to clear');
    if (ioTitle) ioTitle.textContent = text('Exportar equipo', 'Export team');
    if (ioHint) ioHint.textContent = text('Formato compatible con Pokemon Showdown.', 'Pokemon Showdown compatible format.');
    if (ioTextarea) ioTextarea.placeholder = text('Pega aquí tu equipo en formato Showdown...', 'Paste your team here in Showdown format...');
    if (ioCopy) ioCopy.textContent = text('Copiar', 'Copy');
    if (ioImport) ioImport.textContent = text('Confirmar importación', 'Confirm import');
    if (exportBtn) exportBtn.textContent = text('⬇ Exportar equipo', '⬇ Export team');
    if (importLabel) importLabel.textContent = text('¿Ya tienes un equipo hecho?', 'Already have a team?');
    if (importBtn) importBtn.textContent = text('Importar desde Showdown', 'Import from Showdown');
    if (battleWaiting && battleWaiting.textContent.includes('Esperando')) battleWaiting.textContent = text('Esperando inicio de batalla...', 'Waiting for battle start...');

    if (moveTypeFilter) {
      const first = moveTypeFilter.options[0];
      if (first) first.text = text('— Todos los tipos —', '— All types —');
      Array.from(moveTypeFilter.options).forEach((option) => {
        const value = option.value;
        if (!value || !window.getTypeName) return;
        option.text = window.getTypeName(value);
      });
    }

    if (moveCatFilter) {
      if (moveCatFilter.options[0]) moveCatFilter.options[0].text = text('— Todas las categorías —', '— All categories —');
      if (moveCatFilter.options[1]) moveCatFilter.options[1].text = text('⚔ Físico', '⚔ Physical');
      if (moveCatFilter.options[2]) moveCatFilter.options[2].text = text('🔮 Especial', '🔮 Special');
      if (moveCatFilter.options[3]) moveCatFilter.options[3].text = text('💤 Estado', '💤 Status');
    }
  }

  // Esta función vuelve a pintar todo el contenido fijo.
  function renderStaticContent() {
    renderHomeGuide();
    renderStaticLabels();
  }

  // Pintamos el contenido al cargar la página.
  document.addEventListener('DOMContentLoaded', renderStaticContent);

  // Volvemos a pintarlo si cambia el idioma desde código o URL.
  document.addEventListener('langchange', renderStaticContent);
})();
