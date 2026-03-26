/* =========================================
   DATA/GLOSSARY.JS — Términos competitivos
   ========================================= */

const GLOSSARY = [
  // ---- Mecánicas básicas ----
  {
    term: "STAB",
    category: "Mecánica",
    definition: "Same Type Attack Bonus. Bonus del 50% de daño cuando un Pokémon usa un movimiento del mismo tipo que él. Por ejemplo, Charizard (Fuego/Volador) recibe STAB con lanzallamas."
  },
  {
    term: "EV",
    category: "Estadísticas",
    definition: "Effort Values (Puntos de Esfuerzo). Puntos que se ganan al derrotar Pokémon y que aumentan las estadísticas. Máximo 510 en total, 252 en una sola stat. Son el entrenamiento de tu Pokémon."
  },
  {
    term: "IV",
    category: "Estadísticas",
    definition: "Individual Values (Valores Individuales). Valores genéticos de 0 a 31 por stat que vienen de nacimiento. Un IV de 31 es perfecto. Se heredan mediante breeding."
  },
  {
    term: "Nature",
    category: "Estadísticas",
    definition: "Naturaleza del Pokémon. Aumenta un 10% una stat y reduce otro 10% otra stat. Por ejemplo, Adamant sube Ataque y baja Ataque Especial. Existen 25 natures, 5 son neutras."
  },
  {
    term: "Base Stat Total (BST)",
    category: "Estadísticas",
    definition: "La suma de todas las estadísticas base de un Pokémon (HP, Atk, Def, SpAtk, SpDef, Spe). No determina por sí solo si un Pokémon es bueno, pero da una idea de su potencial."
  },
  {
    term: "Stat",
    category: "Estadísticas",
    definition: "Estadística de un Pokémon: HP (salud), Ataque, Defensa, Ataque Especial, Defensa Especial y Velocidad. Cada una determina una parte del comportamiento en combate."
  },

  // ---- Roles ----
  {
    term: "Sweeper",
    category: "Rol",
    definition: "Pokémon ofensivo diseñado para eliminar al equipo rival una vez que sus counters han sido debilitados. Puede ser físico (Physical Sweeper) o especial (Special Sweeper)."
  },
  {
    term: "Wall",
    category: "Rol",
    definition: "Pokémon muy defensivo que aguanta muchos golpes. Un Physical Wall aguanta ataques físicos; un Special Wall, especiales. Un Pokémon que aguanta ambos se llama Specially Defensive o Physically Defensive."
  },
  {
    term: "Pivot",
    category: "Rol",
    definition: "Pokémon que entra, hace presión y sale para traer un compañero de forma segura. Usan movimientos como Volt Switch, U-turn o Teleport para mantener el momentum del equipo."
  },
  {
    term: "Wallbreaker",
    category: "Rol",
    definition: "Pokémon con muchísimo poder ofensivo cuyo objetivo es romper los Pokémon defensivos rivales, dejando el camino libre para que el sweeper del equipo acabe el trabajo."
  },
  {
    term: "Revenge Killer",
    category: "Rol",
    definition: "Pokémon muy rápido (o con movimientos de prioridad) que entra después de que un compañero haya caído para KO al rival que lo mató, sin necesidad de aguantar un golpe."
  },
  {
    term: "Cleric",
    category: "Rol",
    definition: "Pokémon de soporte que cura estados alterados del equipo con movimientos como Aromatherapy o Heal Bell. Muy valioso en equipos donde el burn o la parálisis son un problema."
  },
  {
    term: "Hazard Setter",
    category: "Rol",
    definition: "Pokémon cuya función principal es colocar trampas de entrada (entry hazards) en el campo rival. Su valor es indirecto: debilita al equipo rival cada vez que cambia de Pokémon."
  },
  {
    term: "Spinner / Defogger",
    category: "Rol",
    definition: "Pokémon que elimina las entry hazards del campo propio. Rapid Spin solo limpia las tuyas; Defog limpia ambos campos. Esenciales en equipos que cambian mucho."
  },
  {
    term: "Lead",
    category: "Rol",
    definition: "El Pokémon con el que empiezas la batalla. Generalmente un Hazard Setter rápido o un Pokémon que puede hacer presión inmediata desde el turno 1."
  },

  // ---- Hazards ----
  {
    term: "Entry Hazards",
    category: "Hazards",
    definition: "Trampas de entrada que dañan o penalizan al Pokémon rival cuando entra al campo. Las principales son Stealth Rock, Spikes (1-3 capas) y Toxic Spikes (1-2 capas)."
  },
  {
    term: "Stealth Rock",
    category: "Hazards",
    definition: "La entry hazard más importante del competitivo. Fragmentos de roca que dañan a los Pokémon rivales al entrar según su debilidad a Roca (12.5%, 25%, 50% o el doble). Destroza a Pokémon como Charizard o Ho-Oh."
  },
  {
    term: "Spikes",
    category: "Hazards",
    definition: "Pinchos en el suelo que dañan a Pokémon que no vuelan ni tienen levitación al entrar. 1 capa = 12.5%, 2 capas = 16.7%, 3 capas = 25% de daño."
  },
  {
    term: "Toxic Spikes",
    category: "Hazards",
    definition: "1 capa envenena al rival al entrar; 2 capas aplican envenenamiento grave (Toxic). Los Pokémon Veneno que pisen las Toxic Spikes las absorben y las eliminan del campo."
  },
  {
    term: "Sticky Web",
    category: "Hazards",
    definition: "Tela pegajosa que reduce 1 nivel de Velocidad a los Pokémon rivales que entran. Muy usada en equipos lentos para compensar la diferencia de velocidad."
  },

  // ---- Estrategia ----
  {
    term: "Momentum",
    category: "Estrategia",
    definition: "Ventaja táctica de tener el control de los cambios. Un equipo con momentum elige siempre el matchup favorable. Los Pokémon Pivot son clave para mantenerlo."
  },
  {
    term: "Matchup",
    category: "Estrategia",
    definition: "Enfrentamiento entre un Pokémon tuyo y uno del rival. Un buen matchup significa que tu Pokémon tiene ventaja por tipo, stats o moveset."
  },
  {
    term: "Counter",
    category: "Estrategia",
    definition: "Pokémon que puede entrar con seguridad ante otro y vencerlo fácilmente, aguantando sus ataques y respondiendo con KO o mucho daño."
  },
  {
    term: "Check",
    category: "Estrategia",
    definition: "Parecido al counter, pero necesita condiciones concretas para funcionar (por ejemplo, entrar cuando el rival está debilitado). Menos fiable que un counter pero más flexible."
  },
  {
    term: "Predict",
    category: "Estrategia",
    definition: "Anticipar el movimiento del rival para sacar ventaja. Por ejemplo, predecir que van a cambiar y usar un ataque en vez de bajar stats, o viceversa."
  },
  {
    term: "Mindgame",
    category: "Estrategia",
    definition: "Guerra psicológica entre ambos jugadores al predecir mutuamente sus acciones. Es una de las capas más profundas del competitivo a alto nivel."
  },
  {
    term: "Safe Switch",
    category: "Estrategia",
    definition: "Cambio de Pokémon que no arriesga recibir daño porque el rival no puede hacer nada efectivo contra el que entra. Fundamental para mantener el control."
  },
  {
    term: "Scouting",
    category: "Estrategia",
    definition: "Proceso de descubrir el moveset del Pokémon rival sin revelar el propio. Se hace cambiando o usando un movimiento no definitivo para ver qué hace el rival."
  },

  // ---- Tiers ----
  {
    term: "Tier",
    category: "Tiers",
    definition: "Categoría en la que Smogon clasifica los Pokémon según su uso en el competitivo. Determina en qué formato puedes usarlos. Va de Uber (más fuerte) hasta PU (menos usado)."
  },
  {
    term: "Uber",
    category: "Tiers",
    definition: "El tier más alto de Smogon. Pokémon demasiado poderosos para OU: legendarios como Mewtwo, Zacian o Arceus. Es el tier sin restricciones (excepto algunos Pokémon baneados)."
  },
  {
    term: "OU",
    category: "Tiers",
    definition: "OverUsed. El tier principal y más jugado del competitivo de Smogon. Incluye los Pokémon más usados que no son lo suficientemente rotos para estar en Uber."
  },
  {
    term: "UU",
    category: "Tiers",
    definition: "UnderUsed. El segundo tier de Smogon. Pokémon que no alcanzan el umbral de uso de OU pero son demasiado fuertes para RU. Tiene su propio meta muy activo."
  },
  {
    term: "RU",
    category: "Tiers",
    definition: "RarelyUsed. Tercer tier de Smogon. Pokémon usables pero que no destacan en UU. Suele tener metas interesantes con Pokémon menos conocidos."
  },
  {
    term: "NU",
    category: "Tiers",
    definition: "NeverUsed. Cuarto tier de Smogon. No significa que sean malos, simplemente no se usan en los tiers superiores. Muchos Pokémon favoritos de los fans están aquí."
  },
  {
    term: "PU",
    category: "Tiers",
    definition: "El tier más bajo de Smogon. Pokémon con muy poco uso incluso en NU. Aun así, tiene su comunidad y torneos activos."
  },
  {
    term: "Banlist",
    category: "Tiers",
    definition: "Lista de Pokémon, movimientos o habilidades prohibidos en un tier. Se actualiza periódicamente por votación de la comunidad de Smogon cuando algo resulta demasiado dominante."
  },

  // ---- Estados y condiciones ----
  {
    term: "Burn (Quemadura)",
    category: "Estado",
    definition: "Estado que hace perder 1/16 del HP por turno y reduce el Ataque físico a la mitad. Muy efectivo para inutilizar sweepers físicos. Inmunes los Pokémon Fuego."
  },
  {
    term: "Paralysis (Parálisis)",
    category: "Estado",
    definition: "Reduce la velocidad al 25% y tiene un 25% de probabilidad de no poder actuar cada turno. Devastadora para sweepers rápidos. Inmunes los Pokémon Eléctrico."
  },
  {
    term: "Toxic (Envenenamiento grave)",
    category: "Estado",
    definition: "El veneno más peligroso. El daño aumenta cada turno: 1/16, 2/16, 3/16... hasta 1/2 del HP. Usado para KO Pokémon defensivos que de otro modo serían imposibles de derrotar."
  },
  {
    term: "Sleep (Sueño)",
    category: "Estado",
    definition: "El rival no puede actuar durante 1-3 turnos. Muy poderoso pero limitado por la Sleep Clause en Smogon: solo puedes dormir a 1 Pokémon rival a la vez."
  },

  // ---- Términos de daño ----
  {
    term: "OHKO",
    category: "Daño",
    definition: "One Hit Knock Out. Dejar KO a un Pokémon de un solo golpe. Muy valorado en el análisis de daño: '¿puede este movimiento OHKO al rival?'"
  },
  {
    term: "2HKO",
    category: "Daño",
    definition: "Two Hit Knock Out. Dejar KO al rival en dos golpes. En los cálculos de daño se indica si algo 2HKO después de Stealth Rock o algún chip damage previo."
  },
  {
    term: "Chip Damage",
    category: "Daño",
    definition: "Pequeñas cantidades de daño acumuladas a lo largo del combate. Puede venir de entry hazards, clima, contacto con Rocky Helmet o movimientos de estado. Muy relevante para facilitar KOs."
  },
  {
    term: "Calc",
    category: "Daño",
    definition: "Cálculo de daño. Herramienta (como el Damage Calculator de Smogon) usada para saber exactamente cuánto daño hace un movimiento. Imprescindible para construir equipos."
  },

  // ---- Objetos y habilidades clave ----
  {
    term: "Choice Band / Specs / Scarf",
    category: "Objeto",
    definition: "Objetos que multiplican Ataque (Band), Ataque Especial (Specs) o Velocidad (Scarf) por 1.5x, pero limitan al Pokémon a usar solo 1 movimiento hasta que cambie. Muy usados en ofensiva."
  },
  {
    term: "Leftovers",
    category: "Objeto",
    definition: "Objeto que recupera 1/16 del HP máximo cada turno. El objeto defensivo por excelencia. Permite a los Pokémon walls aguantar más tiempo y neutralizar el chip damage."
  },
  {
    term: "Rocky Helmet",
    category: "Objeto",
    definition: "Objeto que inflige 1/6 del HP al rival cuando hace contacto físico. Muy útil en Pokémon defensivos para castigar a sweepers físicos que usan U-turn o ataques de contacto."
  },
  {
    term: "Heavy-Duty Boots",
    category: "Objeto",
    definition: "Botas que hacen inmune al portador a las entry hazards. Revolucionó el meta al introducirse en Gen 8, permitiendo usar Pokémon frágiles ante Stealth Rock sin problemas."
  },
  {
    term: "Speed Tier",
    category: "Mecánica",
    definition: "La velocidad exacta de un Pokémon con una nature, EVs y IVs concretos. Determina quién actúa primero. Saber los speed tiers clave del meta es fundamental para construir bien."
  },
  {
    term: "Priority",
    category: "Mecánica",
    definition: "Movimientos con prioridad actúan antes que los normales independientemente de la velocidad. Ejemplos: Extreme Speed (+2), Quick Attack (+1), Bullet Punch (+1), Sucker Punch (+1)."
  },
  {
    term: "Weather",
    category: "Mecánica",
    definition: "Condición climática (Sol, Lluvia, Granizo, Tormenta de Arena) que afecta al campo. Potencia ciertos tipos de ataques y habilidades. Los equipos 'Weather Teams' se construyen alrededor de ella."
  },
  {
    term: "Terrain",
    category: "Mecánica",
    definition: "Terreno activo (Eléctrico, Hierba, Niebla, Psíquico) que beneficia a Pokémon en tierra. Cada terreno dura 5 turnos y puede activar habilidades como Surge Surfer o Psychic Surge."
  }
];
