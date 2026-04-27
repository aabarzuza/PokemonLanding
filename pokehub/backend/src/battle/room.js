/**
 * room.js
 *
 * Este archivo representa UNA batalla concreta.
 * Su trabajo es:
 * - recibir jugadores o bots
 * - preparar sus equipos
 * - arrancar el simulador real de Pokemon Showdown
 * - reenviar al frontend los eventos de la batalla
 * - aceptar decisiones del jugador (mover, cambiar, rendirse...)
 */

// Importamos las herramientas del simulador real de Showdown.
const {
  BattleStream,
  getPlayerStreams,
  Teams,
  TeamValidator,
  Dex,
} = require('pokemon-showdown');
// BattleStream = flujo de mensajes del simulador.
// Teams = utilidades para importar, exportar o generar equipos.
// TeamValidator = comprueba si un equipo es legal.
// Dex = base de datos de Showdown con Pokemon, movimientos, tipos, etc.

// Genera una semilla aleatoria para formatos random battle.
function createRandomSeed() {
  // map recorre los 4 huecos del array y crea 4 numeros aleatorios.
  return [0, 0, 0, 0].map(() => Math.floor(Math.random() * 65536));
}

// Si el formato no es random, devolvemos su random correspondiente.
function resolveRandomFormat(format) {
  if ((format || '').includes('random')) {
    return format;
  }

  // match busca algo como "gen9" y extrae solo el numero.
  const generation = (format || '').match(/gen(\d+)/)?.[1] || '9';
  return `gen${generation}randombattle`;
}

// Convierte un slot simple de nuestro frontend a un set que entienda Showdown.
function toPokemonSet(slot) {
  return {
    name: slot.name || slot.id,
    species: slot.species || slot.id || slot.name,
    item: slot.item || '',
    ability: slot.ability || '',
    moves: (slot.moves || []).filter(Boolean),
    nature: slot.nature || 'Hardy',
    gender: slot.gender || '',
    level: slot.level || 100,
    // EVs = puntos de entrenamiento que mejoran stats.
    evs: {
      hp: 0,
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
      ...(slot.evs || {}),
    },
    // IVs = valores base internos de cada estadistica.
    ivs: {
      hp: 31,
      atk: 31,
      def: 31,
      spa: 31,
      spd: 31,
      spe: 31,
      ...(slot.ivs || {}),
    },
  };
}

// Equipo de respaldo para el modo práctica, por si el usuario manda uno ilegal.
function buildFallbackPracticeTeam() {
  return [
    toPokemonSet({
      id: 'dragonite',
      moves: ['Dragon Dance', 'Extreme Speed', 'Earthquake', 'Fire Punch'],
      item: 'Heavy-Duty Boots',
      ability: 'Multiscale',
      nature: 'Adamant',
      evs: { hp: 252, atk: 252, def: 4 },
    }),
    toPokemonSet({
      id: 'gholdengo',
      moves: ['Make It Rain', 'Shadow Ball', 'Nasty Plot', 'Recover'],
      item: 'Leftovers',
      ability: 'Good as Gold',
      nature: 'Timid',
      evs: { hp: 4, spa: 252, spe: 252 },
    }),
    toPokemonSet({
      id: 'greattusk',
      moves: ['Earthquake', 'Close Combat', 'Rapid Spin', 'Ice Spinner'],
      item: 'Booster Energy',
      ability: 'Protosynthesis',
      nature: 'Jolly',
      evs: { atk: 252, def: 4, spe: 252 },
    }),
    toPokemonSet({
      id: 'kingambit',
      moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance'],
      item: 'Black Glasses',
      ability: 'Supreme Overlord',
      nature: 'Adamant',
      evs: { hp: 124, atk: 252, spd: 132 },
    }),
    toPokemonSet({
      id: 'corviknight',
      moves: ['Brave Bird', 'U-turn', 'Roost', 'Defog'],
      item: 'Rocky Helmet',
      ability: 'Mirror Armor',
      nature: 'Impish',
      evs: { hp: 252, def: 168, spd: 88 },
    }),
    toPokemonSet({
      id: 'primarina',
      moves: ['Moonblast', 'Surf', 'Ice Beam', 'Calm Mind'],
      item: 'Leftovers',
      ability: 'Torrent',
      nature: 'Modest',
      evs: { hp: 172, spa: 252, spd: 84 },
    }),
  ];
}

function buildFallbackPracticeTeamAlt() {
  return [
    toPokemonSet({
      id: 'samurotthisui',
      moves: ['Ceaseless Edge', 'Knock Off', 'Aqua Jet', 'Swords Dance'],
      item: 'Focus Sash',
      ability: 'Sharpness',
      nature: 'Jolly',
      evs: { atk: 252, spd: 4, spe: 252 },
    }),
    toPokemonSet({
      id: 'gliscor',
      moves: ['Earthquake', 'Knock Off', 'Protect', 'Spikes'],
      item: 'Toxic Orb',
      ability: 'Poison Heal',
      nature: 'Impish',
      evs: { hp: 244, def: 184, spe: 80 },
    }),
    toPokemonSet({
      id: 'ironvaliant',
      moves: ['Moonblast', 'Close Combat', 'Thunderbolt', 'Knock Off'],
      item: 'Booster Energy',
      ability: 'Quark Drive',
      nature: 'Naive',
      evs: { atk: 40, spa: 216, spe: 252 },
    }),
    toPokemonSet({
      id: 'heatran',
      moves: ['Magma Storm', 'Earth Power', 'Taunt', 'Stealth Rock'],
      item: 'Leftovers',
      ability: 'Flash Fire',
      nature: 'Calm',
      evs: { hp: 248, spd: 252, spe: 8 },
    }),
    toPokemonSet({
      id: 'ragingbolt',
      moves: ['Thunderclap', 'Thunderbolt', 'Draco Meteor', 'Calm Mind'],
      item: 'Leftovers',
      ability: 'Protosynthesis',
      nature: 'Modest',
      evs: { hp: 72, spa: 252, spe: 184 },
    }),
    toPokemonSet({
      id: 'ogerponwellspring',
      moves: ['Ivy Cudgel', 'Power Whip', 'U-turn', 'Encore'],
      item: 'Wellspring Mask',
      ability: 'Water Absorb',
      nature: 'Jolly',
      evs: { atk: 252, spd: 4, spe: 252 },
    }),
  ];
}

// Según el payload recibido, devuelve un equipo listo para Showdown.
function normalizeTeamPayload(payload, format) {
  // Si no hay payload o se ha pedido random, generamos equipo random.
  if (!payload || payload.teamMode === 'random') {
    // Teams.generate crea un equipo aleatorio siguiendo el formato.
    return Teams.generate(resolveRandomFormat(format));
  }

  // Si el usuario mandó texto estilo Showdown, lo importamos.
  if (payload.teamText) {
    // Teams.import convierte el texto estilo Showdown a objetos utilizables.
    const importedTeam = Teams.import(payload.teamText);
    if (importedTeam?.length) {
      return importedTeam;
    }
  }

  // Si el usuario mandó un array de sets, lo convertimos.
  if (Array.isArray(payload.team) && payload.team.length) {
    return payload.team.map(toPokemonSet);
  }

  // Último recurso: equipo random.
  return Teams.generate(resolveRandomFormat(format));
}

// Construye el objeto final que Showdown necesita para registrar un jugador.
function buildPlayerSpec(playerName, payload, format) {
  // Dex.formats.get busca la informacion oficial del formato elegido.
  const formatData = Dex.formats.get(format);

  // En formatos random, no mandamos team empaquetado.
  if (formatData.team) {
    return {
      spec: {
        name: playerName,
        seed: createRandomSeed(),
      },
      team: null,
    };
  }

  // En formatos normales, empaquetamos el equipo.
  const team = normalizeTeamPayload(payload, format);

  return {
    spec: {
      name: playerName,
        // Teams.pack comprime el equipo en el formato interno de Showdown.
        team: Teams.pack(team),
    },
    team,
  };
}

// Comprueba si una condición marca a un Pokémon como debilitado.
function isFainted(condition) {
  return `${condition || ''}`.endsWith(' fnt');
}

function shuffleList(list) {
  // [...list] = copia del array para no modificar el original.
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scoreBotMove(move) {
  // move.id es el nombre interno del movimiento, por ejemplo "earthquake".
  const moveData = Dex.moves.get(move.id || move.move || '');
  if (!moveData || !moveData.exists) return 1;
  if (moveData.category === 'Status') {
    if (moveData.boosts || moveData.self?.boosts || moveData.heal || moveData.status) return 45;
    return 15;
  }
  const power = moveData.basePower || 40;
  const priorityBonus = (moveData.priority || 0) * 12;
  const accuracyFactor = typeof moveData.accuracy === 'number' ? (moveData.accuracy / 100) : 1;
  return Math.round((power + priorityBonus) * accuracyFactor);
}

// Para dobles, elegimos un objetivo simple para el bot.
function pickFirstTarget(request, activeIndex, move) {
  // target = a quien puede apuntar legalmente este movimiento.
  const target = move?.target;
  const activeCount = request?.active?.length || 1;

  // Si no hay dobles, no hace falta objetivo extra.
  if (activeCount <= 1) {
    return '';
  }

  // Si el movimiento apunta a rival cercano, elegimos el primer rival vivo.
  if (['adjacentFoe', 'normal', 'any'].includes(target)) {
    for (let i = 0; i < activeCount; i++) {
      if (i !== activeIndex && !isFainted(request.side?.pokemon?.[i]?.condition)) {
        return ` ${i + 1}`;
      }
    }
    return '';
  }

  // Si el movimiento apunta al aliado.
  if (target === 'adjacentAlly') {
    const allyIndex = activeIndex ^ 1;
    return !isFainted(request.side?.pokemon?.[allyIndex]?.condition)
      ? ` -${allyIndex + 1}`
      : '';
  }

  // Si puede apuntar a sí mismo o al aliado, usamos al propio Pokémon.
  if (target === 'adjacentAllyOrSelf') {
    return ` -${activeIndex + 1}`;
  }

  return '';
}

// IA muy simple para el bot de práctica.
function chooseBotAction(request) {
  // Si no hay request o hay que esperar, no hacemos nada.
  if (!request || request.wait) {
    return null;
  }

  const team = request.side?.pokemon || [];

  // Si estamos en team preview, elegimos el orden por defecto.
  if (request.teamPreview) {
    // maxChosenTeamSize = cuantos Pokemon permite elegir el formato al empezar.
    const size = request.maxChosenTeamSize || team.length;
    return `team ${shuffleList(team.map((_, index) => index + 1)).slice(0, size).join('')}`;
  }

  // Si el simulador obliga a cambiar, buscamos huecos libres vivos.
  if (request.forceSwitch) {
    const usedSlots = new Set();
    const availableSlots = shuffleList(team.map((pokemon, index) => ({ pokemon, index })));

    const choices = request.forceSwitch.map((needed) => {
      if (!needed) {
        return 'pass';
      }

      const slot = availableSlots.find(({ pokemon, index }) => {
        return !pokemon.active && !isFainted(pokemon.condition) && !usedSlots.has(index);
      })?.index ?? -1;

      if (slot < 0) {
        return 'pass';
      }

      usedSlots.add(slot);
      return `switch ${slot + 1}`;
    });

    return choices.join(', ');
  }

  // Si estamos en turno normal, usamos el primer movimiento legal.
  if (request.active) {
    const usedSwitches = new Set();

    const choices = request.active.map((active, activeIndex) => {
      const self = team[activeIndex];

      if (!active || !self || isFainted(self.condition) || self.commanding) {
        return 'pass';
      }

      const usableMoves = shuffleList((active.moves || []).filter((move) => !move.disabled));

      if (usableMoves.length) {
        const scoredMoves = usableMoves
          .map((move) => ({ move, score: scoreBotMove(move) }))
          .sort((a, b) => b.score - a.score);
        const bestScore = scoredMoves[0]?.score ?? 0;
        const bestMoves = scoredMoves.filter((entry) => entry.score >= bestScore - 10);
        const move = bestMoves[Math.floor(Math.random() * bestMoves.length)]?.move || usableMoves[0];
        const moveSlot = (active.moves || []).indexOf(move) + 1;
        return `move ${moveSlot}${pickFirstTarget(request, activeIndex, move)}`;
      }

      if (active.trapped) {
        return 'pass';
      }

      const switchSlot = shuffleList(team.map((pokemon, index) => ({ pokemon, index }))).find(({ pokemon, index }) => {
        return !pokemon.active && !isFainted(pokemon.condition) && !usedSwitches.has(index);
      })?.index ?? -1;

      if (switchSlot < 0) {
        return 'pass';
      }

      usedSwitches.add(switchSlot);
      return `switch ${switchSlot + 1}`;
    });

    return choices.join(', ');
  }

  return null;
}

// Clase principal de una sala de batalla.
class BattleRoom {
  constructor(roomId, format = 'gen9ou') {
    // Id único de la sala.
    this.roomId = roomId;

    // Formato actual: gen9ou, gen9randombattle, etc.
    this.format = format;

    // WebSockets reales de los jugadores.
    // Objeto clave -> valor donde guardamos los sockets reales de p1 y p2.
    this.players = {};

    // Nombre visible de cada lado.
    this.names = { p1: 'Jugador 1', p2: 'Jugador 2' };

    // Payload original recibido para montar el equipo.
    // payload = paquete de datos que trae el equipo, modo de equipo y texto importado.
    this.payloads = { p1: null, p2: null };

    // Qué lados están listos.
    this.ready = { p1: false, p2: false };

    // Fecha de creación, útil para limpieza automática.
    this.createdAt = Date.now();

    // Indica si la batalla ya empezó.
    this.battleStarted = false;

    // Stream principal del simulador.
    // battleStream = "tuberia" principal por donde Showdown saca eventos.
    this.battleStream = null;

    // Streams por jugador y omnisciente.
    this.streams = null;

    // Marca si un lado es controlado por bot.
    this.bots = { p1: false, p2: false };

    // Evita aplicar dos veces el fallback de práctica.
    this.practiceFallbackUsed = false;
  }

  // Añade un jugador humano a la sala.
  addPlayer(slot, ws, name, payload = null) {
    this.players[slot] = ws;
    this.names[slot] = name || this.names[slot];
    this.payloads[slot] = payload || null;
    this.ready[slot] = true;

    // Escuchamos mensajes del socket de ese jugador.
    // ws.on('message') escucha lo que manda ese jugador.
    ws.on('message', (data) => {
      try {
        // JSON.parse convierte texto JSON en objeto JavaScript.
        const message = JSON.parse(data);
        this.handleMessage(slot, message);
      } catch (error) {
        this.send(slot, { type: 'error', code: 'bad_socket_message', message: error.message || 'Invalid message' });
      }
    });

    // Si se desconecta, avisamos al rival y forzamos derrota si la batalla ya empezó.
    ws.on('close', () => {
      const opponentSlot = slot === 'p1' ? 'p2' : 'p1';
      this.send(opponentSlot, { type: 'opponent_left' });

      if (this.battleStarted && this.streams?.omniscient) {
        // omniscient = stream "que lo ve todo", usado para dar ordenes globales.
        void this.streams.omniscient.write(`>forcelose ${slot}`);
      }
    });

    // Avisamos al jugador de que ya está conectado.
    this.send(slot, { type: 'connected', slot, roomId: this.roomId });

    // Avisamos a todos de cuántos jugadores hay listos.
    this.broadcast({
      type: 'room_update',
      roomId: this.roomId,
      ready: this.ready,
      players: Object.keys(this.players),
    });

    // Si ya están los dos lados listos, arrancamos la batalla.
    if (this.ready.p1 && this.ready.p2 && !this.battleStarted) {
      this.startBattle();
    }
  }

  // Añade un bot como si fuera un jugador más.
  addBot(slot, name, payload = null) {
    this.players[slot] = null;
    this.names[slot] = name || this.names[slot];
    this.payloads[slot] = payload || null;
    this.ready[slot] = true;
    this.bots[slot] = true;

    if (this.ready.p1 && this.ready.p2 && !this.battleStarted) {
      this.startBattle();
    }
  }

  // Lee continuamente lo que escupe el simulador para un lado.
  async consumeStream(slot, stream) {
    try {
      // for await ... of = va leyendo poco a poco lo que produce el simulador.
      for await (const chunk of stream) {
        this.forwardSimulatorChunk(slot, chunk);
      }
    } catch (error) {
      this.send(slot, { type: 'error', code: 'simulator_error', message: error.message || 'Simulator error' });
    }
  }

  // Convierte lo que llega de Showdown a mensajes que entienda nuestro frontend.
  forwardSimulatorChunk(slot, chunk) {
    // split('\\n') separa cada bloque de texto en lineas individuales.
    for (const line of `${chunk}`.split('\n')) {
      if (!line) {
        continue;
      }

      // Las requests van como JSON y sirven para pedir decisiones al jugador.
      if (line.startsWith('|request|')) {
        try {
          // slice(9) quita el prefijo "|request|" para quedarnos solo con el JSON.
          const request = JSON.parse(line.slice(9));

          if (this.bots[slot]) {
            const botChoice = chooseBotAction(request);
            if (botChoice) {
              // write envia la decision del bot al simulador.
              void this.streams[slot].write(botChoice);
            }
          } else {
            this.send(slot, { type: 'request', request });
          }
        } catch {
          this.send(slot, { type: 'error', code: 'invalid_request', message: 'Invalid simulator request' });
        }

        continue;
      }

      // Los errores del simulador los reenviamos tal cual.
      if (line.startsWith('|error|')) {
        this.send(slot, { type: 'error', code: 'simulator_error', message: line.slice(7) });
        continue;
      }

      // Si alguien gana, avisamos a todos.
      if (line.startsWith('|win|')) {
        this.broadcast({ type: 'win', winner: line.slice(5) });
      }

      // Si hay empate, avisamos a todos.
      if (line.startsWith('|tie|')) {
        this.broadcast({ type: 'tie' });
      }

      // El resto de líneas se mandan como protocolo bruto al cliente.
      this.send(slot, { type: 'protocol', line });
    }
  }

  // Intenta arrancar la batalla real.
  startBattle() {
    // Si ya estaba iniciada, no hacemos nada.
    if (this.battleStarted) {
      return;
    }

    let p1Spec;
    let p2Spec;
    let p1Team;
    let p2Team;

    try {
      // Preparamos el lado p1.
      ({ spec: p1Spec, team: p1Team } = buildPlayerSpec(this.names.p1, this.payloads.p1, this.format));

      // Preparamos el lado p2.
      ({ spec: p2Spec, team: p2Team } = buildPlayerSpec(this.names.p2, this.payloads.p2, this.format));

      // Si ambos equipos son normales y no random, los validamos.
      if (p1Team && p2Team) {
        // validator = comprobador oficial de legalidad del equipo en ese formato.
        const validator = TeamValidator.get(this.format);

        const p1Problems = validator.validateTeam(p1Team);
        const p2Problems = validator.validateTeam(p2Team);

        if (p1Problems?.length) {
          throw new Error(`Team 1 invalid: ${p1Problems[0]}`);
        }

        if (p2Problems?.length) {
          throw new Error(`Team 2 invalid: ${p2Problems[0]}`);
        }
      }
    } catch (error) {
      // Si es una práctica contra bot y falla la validación, usamos un equipo legal de prueba.
      if (this.bots.p2 && !this.practiceFallbackUsed) {
        this.practiceFallbackUsed = true;
        this.payloads.p1 = { team: buildFallbackPracticeTeam(), teamMode: 'builder' };
        this.payloads.p2 = { team: buildFallbackPracticeTeamAlt(), teamMode: 'builder' };

        this.send('p1', {
          type: 'error',
          code: 'practice_team_fallback',
          message: 'Practice fallback team applied.',
        });

        this.startBattle();
        return;
      }

      this.broadcast({
        type: 'error',
        code: 'team_invalid',
        message: error.message || 'The teams could not be validated',
      });
      return;
    }

    // Creamos el stream real de la batalla.
    // keepAlive ayuda a mantener el flujo activo mientras la batalla sigue abierta.
    this.battleStream = new BattleStream({ keepAlive: true });

    // Obtenemos los streams por jugador.
    // getPlayerStreams separa la salida del simulador en lado p1, lado p2 y vista total.
    this.streams = getPlayerStreams(this.battleStream);

    // Marcamos que la batalla ya comenzó.
    this.battleStarted = true;

    // Empezamos a escuchar lo que genere Showdown para cada jugador.
    void this.consumeStream('p1', this.streams.p1);
    void this.consumeStream('p2', this.streams.p2);

    // Preparamos el mensaje inicial para Showdown.
    // startSpec = datos minimos con los que se inicia el formato.
    const startSpec = {
      formatid: Dex.formats.get(this.format).id || this.format,
    };

    // JSON.stringify convierte objetos a texto JSON para mandarlos a Showdown.
    const initMessage = [
      `>start ${JSON.stringify(startSpec)}`,
      `>player p1 ${JSON.stringify(p1Spec)}`,
      `>player p2 ${JSON.stringify(p2Spec)}`,
    ].join('\n');

    // Lo mandamos al simulador.
    void this.streams.omniscient.write(initMessage);

    // Avisamos a los clientes de que la batalla empezó.
    this.broadcast({ type: 'battle_start' });
  }

  // Procesa mensajes que mandan los clientes.
  handleMessage(player, msg) {
    if (!this.streams) {
      return;
    }

    // msg.type decide que accion ha pedido el frontend.
    switch (msg.type) {
      case 'choice':
        if (typeof msg.choice === 'string' && msg.choice.trim()) {
          // trim quita espacios sobrantes al principio y final del texto.
          void this.streams[player].write(msg.choice.trim());
        }
        break;

      case 'move':
        void this.streams[player].write(`move ${Number(msg.move) + 1}`);
        break;

      case 'switch':
        void this.streams[player].write(`switch ${Number(msg.slot) + 1}`);
        break;

      case 'forfeit':
        void this.streams.omniscient.write(`>forcelose ${player}`);
        break;

      case 'join':
        // Ya no usamos este caso, pero lo dejamos vacío por compatibilidad.
        break;
    }
  }

  // Envía un mensaje solo a un lado.
  send(player, data) {
    const ws = this.players[player];
    // readyState === 1 significa que el socket sigue abierto.
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  }

  // Envía un mensaje a todos los jugadores humanos de la sala.
  broadcast(data) {
    for (const ws of Object.values(this.players)) {
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(data));
      }
    }
  }
}

// Exportamos la clase para que manager.js pueda crear salas.
module.exports = { BattleRoom };
