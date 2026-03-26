/**
 * ENGINE.JS
 * Wrapper del motor de batalla de Pokémon Showdown.
 * Ejecuta el simulador como proceso hijo (child_process)
 * para aprovechar el TypeScript compilado de Showdown.
 */

const { spawn }  = require('child_process');
const path       = require('path');
const { EventEmitter } = require('events');

// Ruta al directorio de Pokémon Showdown
const SHOWDOWN_DIR = path.join(__dirname, '..', '..', '..', '..', 'showdown-data', 'engine');

/**
 * BattleEngine
 * Maneja una batalla individual usando el motor de Showdown
 * a través de su protocolo de texto por pipes.
 */
class BattleEngine extends EventEmitter {
  constructor(battleId) {
    super();
    this.battleId  = battleId;
    this.process   = null;
    this.buffer    = '';
    this.started   = false;
    this.p1Ready   = false;
    this.p2Ready   = false;
  }

  /**
   * Parsea una línea del protocolo Showdown y emite eventos
   * que el servidor WebSocket puede enviar al cliente.
   */
  parseLine(line) {
    if (!line.startsWith('|')) return;
    const parts = line.split('|');
    const cmd   = parts[1];

    switch (cmd) {
      case 'switch':
      case 'drag':
        this.emit('message', { type: 'switch', player: parts[2], details: parts[3], hp: parts[4] });
        break;
      case 'move':
        this.emit('message', { type: 'move', player: parts[2], move: parts[3], target: parts[4] });
        break;
      case '-damage':
      case '-heal':
        this.emit('message', { type: cmd === '-damage' ? 'damage' : 'heal', target: parts[2], hp: parts[3], reason: parts[4] || '' });
        break;
      case '-status':
        this.emit('message', { type: 'status', target: parts[2], status: parts[3] });
        break;
      case '-curestatus':
        this.emit('message', { type: 'curestatus', target: parts[2], status: parts[3] });
        break;
      case 'faint':
        this.emit('message', { type: 'faint', pokemon: parts[2] });
        break;
      case 'win':
        this.emit('message', { type: 'win', winner: parts[2] });
        this.emit('end', parts[2]);
        break;
      case 'tie':
        this.emit('message', { type: 'tie' });
        this.emit('end', null);
        break;
      case 'turn':
        this.emit('message', { type: 'turn', number: parseInt(parts[2]) });
        break;
      case 'request':
        if (parts[3]) {
          try {
            const req = JSON.parse(parts[3]);
            this.emit('request', { player: parts[2], request: req });
          } catch {}
        }
        break;
      case '-boost':
      case '-unboost':
        this.emit('message', { type: cmd.slice(1), pokemon: parts[2], stat: parts[3], amount: parseInt(parts[4]) });
        break;
      case '-weather':
        this.emit('message', { type: 'weather', weather: parts[2] });
        break;
      case '-fieldstart':
      case '-fieldend':
        this.emit('message', { type: cmd.slice(1), condition: parts[2] });
        break;
      case '-sidestart':
      case '-sideend':
        this.emit('message', { type: cmd.slice(1), side: parts[2], condition: parts[3] });
        break;
      case 'error':
        this.emit('error-msg', parts[2]);
        break;
      default:
        // Pasar el mensaje crudo al cliente para que lo procese
        this.emit('raw', line);
    }
  }

  /**
   * Emite todas las líneas del buffer acumulado
   */
  flushBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop(); // guardar línea incompleta
    for (const line of lines) {
      if (line.trim()) this.parseLine(line.trim());
    }
  }
}

/**
 * SimulatedBattle
 * Implementa el motor de batalla completo sin proceso externo,
 * usando el protocolo de Showdown directamente en Node.js.
 * Funciona tanto si Showdown está compilado como si no.
 */
class SimulatedBattle extends EventEmitter {
  constructor(battleId, format = 'gen9ou') {
    super();
    this.battleId  = battleId;
    this.format    = format;
    this.turn      = 0;
    this.started   = false;
    this.ended     = false;
    this.p1        = null;
    this.p2        = null;
    this.p1Team    = [];
    this.p2Team    = [];
    this.p1Active  = null;
    this.p2Active  = null;
    this.weather   = null;
    this.field     = [];
    this.p1Side    = [];
    this.p2Side    = [];
    this.log       = [];
  }

  /**
   * Inicia la batalla con los dos equipos
   */
  start(p1name, p1team, p2name, p2team) {
    this.p1 = { name: p1name, team: p1team, active: null, fainted: 0 };
    this.p2 = { name: p2name, team: p2team, active: null, fainted: 0 };

    // Preparar equipos con stats calculados
    this.p1.team = p1team.map(p => this.prepareSlot(p, 'p1'));
    this.p2.team = p2team.map(p => this.prepareSlot(p, 'p2'));

    // Enviar init al cliente
    this.sendInit();

    // Enviar al campo el primer Pokémon de cada equipo
    this.p1.active = this.p1.team[0];
    this.p2.active = this.p2.team[0];
    this.p1.active.onField = true;
    this.p2.active.onField = true;

    this.started = true;
    this.turn = 1;

    this.emit('protocol', `|switch|p1a: ${this.p1.active.name}|${this.p1.active.name}, L${this.p1.active.level}|${this.p1.active.hp}/${this.p1.active.maxhp}`);
    this.emit('protocol', `|switch|p2a: ${this.p2.active.name}|${this.p2.active.name}, L${this.p2.active.level}|${this.p2.active.hp}/${this.p2.active.maxhp}`);
    this.emit('protocol', `|turn|1`);

    this.sendRequests();
  }

  prepareSlot(slot, player) {
    const SD = global.SD_POKEMON_ENGINE || {};
    const SD_MOVES_E = global.SD_MOVES_ENGINE || {};

    const poke = SD[slot.id] || { baseStats: { hp:80,atk:80,def:80,spa:80,spd:80,spe:80 }, types:['normal'], abilities:[] };
    const level = slot.level || 100;
    const nature = slot.nature || 'Hardy';
    const evs = slot.evs || { hp:252, atk:252, def:4, spa:252, spd:4, spe:252 };
    const ivs = slot.ivs || { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 };

    const stats = this.calcStats(poke.baseStats, evs, ivs, level, nature);
    const moves = (slot.moves || []).slice(0, 4).map(mname => {
      const mid = mname.toLowerCase().replace(/ /g,'-');
      const mdata = SD_MOVES_E[mid] || { name: mname, type:'normal', category:'physical', power:50, accuracy:100, pp:15, priority:0 };
      return { ...mdata, id: mid, currentPP: mdata.pp || 15 };
    });

    return {
      id:        slot.id,
      name:      slot.name || (poke.name || slot.id),
      level,
      types:     poke.types || ['normal'],
      item:      slot.item || '',
      ability:   slot.ability || (poke.abilities && poke.abilities[0]) || '',
      nature,
      moves,
      hp:        stats.hp,
      maxhp:     stats.hp,
      atk:       stats.atk,
      def:       stats.def,
      spa:       stats.spa,
      spd:       stats.spd,
      spe:       stats.spe,
      boosts:    { atk:0, def:0, spa:0, spd:0, spe:0, acc:0, eva:0 },
      status:    null,
      statusData:{},
      onField:   false,
      fainted:   false,
      player,
      volatiles: {},
    };
  }

  calcStats(base, evs, ivs, level, nature) {
    const NATURE_MODS = {
      Adamant:{atk:1.1,spa:0.9}, Jolly:{spe:1.1,spa:0.9}, Modest:{spa:1.1,atk:0.9},
      Timid:{spe:1.1,atk:0.9}, Bold:{def:1.1,atk:0.9}, Calm:{spd:1.1,atk:0.9},
      Impish:{def:1.1,spa:0.9}, Careful:{spd:1.1,spa:0.9}, Naive:{spe:1.1,spd:0.9},
      Hasty:{spe:1.1,def:0.9}, Mild:{spa:1.1,def:0.9}, Rash:{spa:1.1,spd:0.9},
      Lonely:{atk:1.1,def:0.9}, Naughty:{atk:1.1,spd:0.9}, Brave:{atk:1.1,spe:0.9},
      Relaxed:{def:1.1,spe:0.9}, Lax:{def:1.1,spd:0.9}, Quiet:{spa:1.1,spe:0.9},
      Sassy:{spd:1.1,spe:0.9}, Gentle:{spd:1.1,def:0.9},
    };
    const nm = NATURE_MODS[nature] || {};
    const calc = (b, ev, iv, isHP) => {
      const base_val = Math.floor(((2*b + iv + Math.floor(ev/4)) * level) / 100);
      if (isHP) return base_val + level + 10;
      let s = base_val + 5;
      return s;
    };
    const keys = ['hp','atk','def','spa','spd','spe'];
    const result = {};
    for (const k of keys) {
      let s = calc(base[k]||80, evs[k]||0, ivs[k]||31, k==='hp');
      if (k !== 'hp') {
        if (nm[k] === 1.1) s = Math.floor(s * 1.1);
        if (nm[k] === 0.9) s = Math.floor(s * 0.9);
      }
      result[k] = s;
    }
    return result;
  }

  sendInit() {
    this.emit('protocol', `|player|p1|${this.p1.name}|1|`);
    this.emit('protocol', `|player|p2|${this.p2.name}|2|`);
    this.emit('protocol', `|teamsize|p1|${this.p1.team.length}`);
    this.emit('protocol', `|teamsize|p2|${this.p2.team.length}`);
    this.emit('protocol', `|gametype|singles`);
    this.emit('protocol', `|gen|9`);
    this.emit('protocol', `|tier|[Gen 9] ${this.format.toUpperCase()}`);
    this.emit('protocol', `|start`);
  }

  sendRequests() {
    // Pedir movimiento a p1
    const p1moves = (this.p1.active?.moves || []).map(m => ({
      move: m.name, id: m.id, pp: m.currentPP, maxpp: m.pp,
      target: 'normal', disabled: m.currentPP <= 0
    }));
    this.emit('request', {
      player: 'p1',
      request: { active: [{ moves: p1moves }], side: { name: this.p1.name, pokemon: this.p1.team.map(p => this.pokeStatus(p)) } }
    });
    // Pedir movimiento a p2
    const p2moves = (this.p2.active?.moves || []).map(m => ({
      move: m.name, id: m.id, pp: m.currentPP, maxpp: m.pp,
      target: 'normal', disabled: m.currentPP <= 0
    }));
    this.emit('request', {
      player: 'p2',
      request: { active: [{ moves: p2moves }], side: { name: this.p2.name, pokemon: this.p2.team.map(p => this.pokeStatus(p)) } }
    });
  }

  pokeStatus(p) {
    return {
      ident: `${p.player}a: ${p.name}`,
      details: `${p.name}, L${p.level}`,
      condition: p.fainted ? '0 fnt' : `${p.hp}/${p.maxhp}${p.status ? ' ' + p.status : ''}`,
      active: p.onField,
      stats: { atk: p.atk, def: p.def, spa: p.spa, spd: p.spd, spe: p.spe },
      moves: p.moves.map(m => m.id),
      item:  p.item,
      ability: p.ability,
    };
  }

  /**
   * Procesa un movimiento elegido por un jugador
   */
  chooseMove(player, moveIndex) {
    if (this.ended) return;
    const side   = player === 'p1' ? this.p1 : this.p2;
    const opp    = player === 'p1' ? this.p2 : this.p1;
    const attacker = side.active;
    const defender = opp.active;
    if (!attacker || !defender) return;

    const move = attacker.moves[moveIndex];
    if (!move) return;

    this.emit('protocol', `|move|${player}a: ${attacker.name}|${move.name}|${player === 'p1' ? 'p2' : 'p1'}a: ${defender.name}`);
    move.currentPP = Math.max(0, (move.currentPP || move.pp) - 1);

    this.executeMoveEffect(attacker, defender, move, player);
  }

  executeMoveEffect(attacker, defender, move, atkPlayer) {
    const defPlayer = atkPlayer === 'p1' ? 'p2' : 'p1';

    if (move.category === 'status') {
      this.applyStatusEffect(attacker, defender, move, atkPlayer, defPlayer);
      return;
    }

    // Calcular daño
    const damage = this.calcDamage(attacker, defender, move);
    if (damage === null) {
      this.emit('protocol', `|-miss|${atkPlayer}a: ${attacker.name}`);
      return;
    }

    const actualDamage = Math.min(damage, defender.hp);
    defender.hp -= actualDamage;

    const hpDisplay = `${Math.max(0, defender.hp)}/${defender.maxhp}`;
    this.emit('protocol', `|-damage|${defPlayer}a: ${defender.name}|${hpDisplay}`);

    // Drene
    if (move.drain) {
      const healed = Math.floor(actualDamage * move.drain[0] / move.drain[1]);
      const newHP  = Math.min(attacker.maxhp, attacker.hp + healed);
      attacker.hp  = newHP;
      this.emit('protocol', `|-heal|${atkPlayer}a: ${attacker.name}|${attacker.hp}/${attacker.maxhp}|[from] drain`);
    }

    // Retroceso
    if (move.recoil) {
      const recoil = Math.floor(actualDamage * move.recoil[0] / move.recoil[1]);
      attacker.hp  = Math.max(0, attacker.hp - recoil);
      this.emit('protocol', `|-damage|${atkPlayer}a: ${attacker.name}|${attacker.hp}/${attacker.maxhp}|[from] recoil`);
    }

    // Efecto secundario
    if (move.secondary && move.secondary.chance) {
      if (Math.random() * 100 < move.secondary.chance) {
        if (move.secondary.status && !defender.status && !defender.fainted) {
          defender.status = move.secondary.status;
          this.emit('protocol', `|-status|${defPlayer}a: ${defender.name}|${defender.status}`);
        }
        if (move.secondary.volatileStatus && !defender.fainted) {
          this.emit('protocol', `|-start|${defPlayer}a: ${defender.name}|${move.secondary.volatileStatus}`);
        }
        if (move.secondary.boosts && !defender.fainted) {
          for (const [stat, val] of Object.entries(move.secondary.boosts)) {
            defender.boosts[stat] = Math.max(-6, Math.min(6, (defender.boosts[stat]||0) + val));
            this.emit('protocol', `|-${val>0?'boost':'unboost'}|${defPlayer}a: ${defender.name}|${stat}|${Math.abs(val)}`);
          }
        }
      }
    }

    if (defender.hp <= 0) {
      defender.hp     = 0;
      defender.fainted = true;
      defender.onField = false;
      const side = defPlayer === 'p1' ? this.p1 : this.p2;
      side.fainted++;
      this.emit('protocol', `|faint|${defPlayer}a: ${defender.name}`);
      this.checkEnd();
    }
  }

  applyStatusEffect(attacker, defender, move, atkPlayer, defPlayer) {
    // Movimientos de clima
    if (['sunnyday','raindance','sandstorm','hail','snowscape'].includes(move.id)) {
      this.weather = move.id;
      this.emit('protocol', `|-weather|${move.id}`);
      return;
    }
    // Trampa Rocas, Púas, etc.
    if (['stealthrock','spikes','toxicspikes'].includes(move.id)) {
      const side = defPlayer === 'p1' ? 'p1Side' : 'p2Side';
      if (!this[side].includes(move.id)) {
        this[side].push(move.id);
        this.emit('protocol', `|-sidestart|${defPlayer}|${move.name}`);
      }
      return;
    }
    // Swords Dance, Nasty Plot, etc. (subida de stats)
    if (move.id === 'swordsdance') {
      attacker.boosts.atk = Math.min(6, (attacker.boosts.atk||0) + 2);
      this.emit('protocol', `|-boost|${atkPlayer}a: ${attacker.name}|atk|2`);
      return;
    }
    if (move.id === 'nastplot' || move.id === 'nastyplot') {
      attacker.boosts.spa = Math.min(6, (attacker.boosts.spa||0) + 2);
      this.emit('protocol', `|-boost|${atkPlayer}a: ${attacker.name}|spa|2`);
      return;
    }
    if (move.id === 'dragondance') {
      attacker.boosts.atk = Math.min(6, (attacker.boosts.atk||0) + 1);
      attacker.boosts.spe = Math.min(6, (attacker.boosts.spe||0) + 1);
      this.emit('protocol', `|-boost|${atkPlayer}a: ${attacker.name}|atk|1`);
      this.emit('protocol', `|-boost|${atkPlayer}a: ${attacker.name}|spe|1`);
      return;
    }
    // Tóxico, Parálisis
    if (move.id === 'toxic' && !defender.status) {
      defender.status = 'tox';
      defender.statusData.toxCounter = 1;
      this.emit('protocol', `|-status|${defPlayer}a: ${defender.name}|tox`);
      return;
    }
    if (move.id === 'thunderwave' && !defender.status) {
      defender.status = 'par';
      this.emit('protocol', `|-status|${defPlayer}a: ${defender.name}|par`);
      return;
    }
    if (move.id === 'willowisp' && !defender.status) {
      defender.status = 'brn';
      this.emit('protocol', `|-status|${defPlayer}a: ${defender.name}|brn`);
      return;
    }
    // Recuperación
    if (['recover','roost','softboiled','slackoff','milkdrink'].includes(move.id)) {
      const healed = Math.floor(attacker.maxhp / 2);
      attacker.hp  = Math.min(attacker.maxhp, attacker.hp + healed);
      this.emit('protocol', `|-heal|${atkPlayer}a: ${attacker.name}|${attacker.hp}/${attacker.maxhp}|[from] move: ${move.name}`);
      return;
    }
    // Protección
    if (move.id === 'protect' || move.id === 'detect') {
      attacker.volatiles.protect = true;
      this.emit('protocol', `|-singleturn|${atkPlayer}a: ${attacker.name}|Protect`);
      return;
    }
  }

  calcDamage(attacker, defender, move) {
    if (!move.power || move.power === 0) return null;

    // Precisión
    if (move.accuracy && move.accuracy !== true) {
      const roll = Math.random() * 100;
      if (roll > move.accuracy) return null;
    }

    const isPhys = move.category === 'physical';
    const atkStat = isPhys ? 'atk' : 'spa';
    const defStat = isPhys ? 'def' : 'spd';

    // Stats con boosts
    const atkVal = this.boostedStat(attacker, atkStat);
    const defVal = this.boostedStat(defender, defStat);

    // Fórmula base Gen 9
    let dmg = Math.floor(
      Math.floor(
        Math.floor((2 * attacker.level) / 5 + 2) * move.power * atkVal / defVal
      ) / 50
    ) + 2;

    // STAB
    if (attacker.types && attacker.types.includes(move.type)) dmg = Math.floor(dmg * 1.5);

    // Tipo efectividad
    const eff = this.typeEffectiveness(move.type, defender.types || ['normal']);
    if (eff === 0) {
      this.emit('protocol', `|-immune|${defender.player}a: ${defender.name}`);
      return null;
    }
    dmg = Math.floor(dmg * eff);
    if (eff >= 2)   this.emit('protocol', `|-supereffective|${defender.player}a: ${defender.name}`);
    if (eff <= 0.5) this.emit('protocol', `|-resisted|${defender.player}a: ${defender.name}`);

    // Quemadura reduce ataque físico
    if (isPhys && attacker.status === 'brn') dmg = Math.floor(dmg * 0.5);

    // Random 85-100%
    dmg = Math.floor(dmg * (85 + Math.floor(Math.random() * 16)) / 100);

    return Math.max(1, dmg);
  }

  boostedStat(pokemon, stat) {
    const boost = pokemon.boosts?.[stat] || 0;
    const base  = pokemon[stat];
    if (boost === 0) return base;
    if (boost > 0) return Math.floor(base * (2 + boost) / 2);
    return Math.floor(base * 2 / (2 - boost));
  }

  typeEffectiveness(moveType, defTypes) {
    const CHART = {
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
    let eff = 1;
    for (const dt of defTypes) {
      const row = CHART[moveType] || {};
      eff *= (row[dt] !== undefined ? row[dt] : 1);
    }
    return eff;
  }

  /**
   * Fin de residual: quemadura, veneno, etc.
   */
  applyResidual(side, player) {
    const poke = side.active;
    if (!poke || poke.fainted) return;

    if (poke.status === 'brn') {
      const dmg = Math.floor(poke.maxhp / 16);
      poke.hp = Math.max(0, poke.hp - dmg);
      this.emit('protocol', `|-damage|${player}a: ${poke.name}|${poke.hp}/${poke.maxhp}|[from] brn`);
      if (poke.hp <= 0) { poke.hp=0; poke.fainted=true; poke.onField=false; side.fainted++; this.emit('protocol', `|faint|${player}a: ${poke.name}`); }
    } else if (poke.status === 'psn') {
      const dmg = Math.floor(poke.maxhp / 8);
      poke.hp = Math.max(0, poke.hp - dmg);
      this.emit('protocol', `|-damage|${player}a: ${poke.name}|${poke.hp}/${poke.maxhp}|[from] psn`);
      if (poke.hp <= 0) { poke.hp=0; poke.fainted=true; poke.onField=false; side.fainted++; this.emit('protocol', `|faint|${player}a: ${poke.name}`); }
    } else if (poke.status === 'tox') {
      poke.statusData = poke.statusData || {};
      poke.statusData.toxCounter = (poke.statusData.toxCounter || 1);
      const dmg = Math.floor(poke.maxhp * poke.statusData.toxCounter / 16);
      poke.statusData.toxCounter = Math.min(16, poke.statusData.toxCounter + 1);
      poke.hp = Math.max(0, poke.hp - dmg);
      this.emit('protocol', `|-damage|${player}a: ${poke.name}|${poke.hp}/${poke.maxhp}|[from] tox`);
      if (poke.hp <= 0) { poke.hp=0; poke.fainted=true; poke.onField=false; side.fainted++; this.emit('protocol', `|faint|${player}a: ${poke.name}`); }
    }

    // Leftovers
    if (poke.item === 'Leftovers' && !poke.fainted) {
      const heal = Math.floor(poke.maxhp / 16);
      poke.hp = Math.min(poke.maxhp, poke.hp + heal);
      this.emit('protocol', `|-heal|${player}a: ${poke.name}|${poke.hp}/${poke.maxhp}|[from] item: Leftovers`);
    }
  }

  /**
   * Procesar cambio de Pokémon
   */
  chooseSwitch(player, slotIndex) {
    if (this.ended) return;
    const side    = player === 'p1' ? this.p1 : this.p2;
    const newPoke = side.team[slotIndex];
    if (!newPoke || newPoke.fainted || newPoke.onField) return;

    const old = side.active;
    if (old) old.onField = false;
    side.active = newPoke;
    newPoke.onField = true;

    this.emit('protocol', `|switch|${player}a: ${newPoke.name}|${newPoke.name}, L${newPoke.level}|${newPoke.hp}/${newPoke.maxhp}${newPoke.status?' '+newPoke.status:''}`);

    // Stealth Rock damage al entrar
    const sideHazards = player === 'p1' ? this.p1Side : this.p2Side;
    if (sideHazards.includes('stealthrock')) {
      const eff = this.typeEffectiveness('rock', newPoke.types || ['normal']);
      const dmg = Math.floor(newPoke.maxhp * eff / 8);
      if (dmg > 0) {
        newPoke.hp = Math.max(0, newPoke.hp - dmg);
        this.emit('protocol', `|-damage|${player}a: ${newPoke.name}|${newPoke.hp}/${newPoke.maxhp}|[from] Stealth Rock`);
        if (newPoke.hp <= 0) {
          newPoke.hp=0; newPoke.fainted=true; newPoke.onField=false; side.fainted++;
          this.emit('protocol', `|faint|${player}a: ${newPoke.name}`);
          this.checkEnd();
          return;
        }
      }
    }
  }

  /**
   * Ejecutar un turno completo cuando ambos jugadores han elegido
   */
  executeTurn(p1action, p2action) {
    if (this.ended) return;

    // Determinar orden por velocidad (o prioridad del movimiento)
    const p1active = this.p1.active;
    const p2active = this.p2.active;

    let first = 'p1', second = 'p2';

    if (p1action.type === 'switch') {
      this.chooseSwitch('p1', p1action.slot);
    }
    if (p2action.type === 'switch') {
      this.chooseSwitch('p2', p2action.slot);
    }

    if (p1action.type === 'move' && p2action.type === 'move') {
      const p1move = p1active?.moves[p1action.move];
      const p2move = p2active?.moves[p2action.move];
      const p1pri  = p1move?.priority || 0;
      const p2pri  = p2move?.priority || 0;
      const p1spe  = this.boostedStat(p1active, 'spe');
      const p2spe  = this.boostedStat(p2active, 'spe');

      if (p2pri > p1pri || (p2pri === p1pri && p2spe > p1spe)) {
        first = 'p2'; second = 'p1';
      }

      if (first === 'p1') {
        if (p1active && !p1active.fainted) this.chooseMove('p1', p1action.move);
        if (p2active && !p2active.fainted && !this.ended) this.chooseMove('p2', p2action.move);
      } else {
        if (p2active && !p2active.fainted) this.chooseMove('p2', p2action.move);
        if (p1active && !p1active.fainted && !this.ended) this.chooseMove('p1', p1action.move);
      }
    } else if (p1action.type === 'move') {
      if (p1active && !p1active.fainted) this.chooseMove('p1', p1action.move);
    } else if (p2action.type === 'move') {
      if (p2active && !p2active.fainted) this.chooseMove('p2', p2action.move);
    }

    if (this.ended) return;

    // Residual
    this.applyResidual(this.p1, 'p1');
    if (!this.ended) this.applyResidual(this.p2, 'p2');
    if (this.ended) return;

    this.checkEnd();
    if (this.ended) return;

    this.turn++;
    this.emit('protocol', `|turn|${this.turn}`);

    // Pedir nuevas acciones si no hay que cambiar forzado
    const p1mustSwitch = this.p1.active?.fainted;
    const p2mustSwitch = this.p2.active?.fainted;

    if (p1mustSwitch || p2mustSwitch) {
      if (p1mustSwitch) this.emit('forceswitch', { player: 'p1' });
      if (p2mustSwitch) this.emit('forceswitch', { player: 'p2' });
    } else {
      this.sendRequests();
    }
  }

  checkEnd() {
    const p1alive = this.p1.team.filter(p => !p.fainted).length;
    const p2alive = this.p2.team.filter(p => !p.fainted).length;

    if (p1alive === 0 && p2alive === 0) {
      this.ended = true;
      this.emit('protocol', `|tie`);
      this.emit('end', null);
    } else if (p1alive === 0) {
      this.ended = true;
      this.emit('protocol', `|win|${this.p2.name}`);
      this.emit('end', this.p2.name);
    } else if (p2alive === 0) {
      this.ended = true;
      this.emit('protocol', `|win|${this.p1.name}`);
      this.emit('end', this.p1.name);
    }
  }
}

module.exports = { SimulatedBattle };
