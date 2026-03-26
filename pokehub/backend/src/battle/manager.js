/**
 * manager.js
 *
 * Este archivo hace de "recepcionista" de las batallas:
 * - guarda las salas activas
 * - mete jugadores en cola
 * - empareja jugadores
 * - crea salas privadas
 */

// Importamos la clase que representa una batalla concreta.
const { BattleRoom } = require('./room');

// Creamos una clase para centralizar toda la gestión de salas.
class BattleManager {
  constructor() {
    // Mapa de salas activas.
    // La clave es el id de la sala y el valor es un objeto BattleRoom.
    this.rooms = new Map();

    // Cola de matchmaking.
    // Aquí se guardan los jugadores que están esperando rival.
    this.queue = [];

    // Contador simple para ayudar a generar ids únicos.
    this.counter = 0;
  }

  // Genera un id de sala único y fácil de leer.
  newRoomId() {
    // Sumamos 1 al contador interno.
    this.counter++;

    // Devolvemos un id con fecha y contador.
    return `battle-${Date.now()}-${this.counter}`;
  }

  // Mete a un jugador en la cola o lo empareja si ya hay rival esperando.
  joinQueue(ws, { name, team, teamText, teamMode, format = 'gen9ou' }) {
    // Primero limpiamos conexiones cerradas para no dejar basura en la cola.
    this.queue = this.queue.filter((entry) => entry.ws.readyState === 1);

    // Buscamos si ya hay alguien esperando con el mismo formato.
    const opponentIndex = this.queue.findIndex((entry) => entry.format === format);

    // Si encontramos rival, creamos la batalla.
    if (opponentIndex >= 0) {
      // Sacamos al rival de la cola.
      const opponent = this.queue.splice(opponentIndex, 1)[0];

      // Generamos el id de la nueva sala.
      const roomId = this.newRoomId();

      // Creamos la sala de batalla.
      const room = new BattleRoom(roomId, format);

      // Guardamos la sala en el mapa de salas activas.
      this.rooms.set(roomId, room);

      // Añadimos al rival antiguo como p1.
      room.addPlayer('p1', opponent.ws, opponent.name, {
        team: opponent.team,
        teamText: opponent.teamText,
        teamMode: opponent.teamMode,
      });

      // Añadimos al nuevo jugador como p2.
      room.addPlayer('p2', ws, name, {
        team,
        teamText,
        teamMode,
      });

      // Avisamos al jugador 1 de que ya tiene rival.
      room.send('p1', { type: 'match_found', roomId, slot: 'p1', opponent: name });

      // Avisamos al jugador 2 de que ya tiene rival.
      room.send('p2', { type: 'match_found', roomId, slot: 'p2', opponent: opponent.name });

      // Mensaje de depuración en consola.
      console.log(`🥊 Batalla creada: ${roomId} (${opponent.name} vs ${name})`);

      // Devolvemos un pequeño resumen por si hace falta.
      return { matched: true, roomId };
    }

    // Si no había rival, metemos al jugador en la cola.
    this.queue.push({ ws, name, team, teamText, teamMode, format });

    // Avisamos al cliente de que está esperando.
    ws.send(JSON.stringify({ type: 'waiting', message: 'Buscando rival...' }));

    // Mensaje útil en consola.
    console.log(`⏳ ${name} en cola (${format}). Cola: ${this.queue.length}`);

    // Devolvemos que todavía no ha encontrado rival.
    return { matched: false };
  }

  // Crea una sala privada nueva y la guarda.
  createPrivateRoom(format = 'gen9ou') {
    // Generamos un id para la sala.
    const roomId = this.newRoomId();

    // Creamos la sala.
    const room = new BattleRoom(roomId, format);

    // La guardamos en memoria.
    this.rooms.set(roomId, room);

    // La devolvemos.
    return room;
  }

  // Une a un jugador a una sala privada ya existente.
  joinRoom(roomId, ws, name, slot, payload) {
    // Buscamos la sala.
    const room = this.rooms.get(roomId);

    // Si no existe, devolvemos null.
    if (!room) {
      return null;
    }

    // Si existe, añadimos el jugador.
    room.addPlayer(slot, ws, name, payload);

    // Y devolvemos la sala.
    return room;
  }

  // Devuelve una sala por id o null si no existe.
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  // Borra salas demasiado antiguas para no acumular memoria.
  cleanup() {
    // Hora actual en milisegundos.
    const now = Date.now();

    // Definimos 2 horas en milisegundos.
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    // Recorremos todas las salas.
    for (const [roomId, room] of this.rooms) {
      // Si la sala es demasiado antigua, la eliminamos.
      if (now - room.createdAt > TWO_HOURS) {
        this.rooms.delete(roomId);
      }
    }
  }
}

// Creamos una única instancia global del gestor.
const manager = new BattleManager();

// Cada 30 minutos intentamos limpiar salas viejas.
setInterval(() => manager.cleanup(), 30 * 60 * 1000);

// Exportamos el gestor para poder usarlo desde server.js.
module.exports = { manager };
