// Importamos Express para crear el servidor web y la API.
// API = conjunto de rutas que el frontend puede llamar para pedir datos.
const express = require('express');
// Importamos cors para permitir peticiones desde el navegador sin bloqueo por origen.
const cors = require('cors');
// Importamos path para construir rutas de carpetas de forma segura.
const path = require('path');
// Importamos fs para comprobar si existen archivos y leerlos.
const fs = require('fs');
// Importamos vm para ejecutar datasets en un contexto aislado.
// vm = herramienta de Node para ejecutar codigo de forma controlada, mejor que usar eval directo.
const vm = require('vm');
// Importamos http porque el WebSocket va a colgar del mismo servidor HTTP.
const http = require('http');
// Importamos el servidor WebSocket.
// WebSocket = canal en tiempo real entre el navegador y el servidor.
const { WebSocketServer } = require('ws');
// Importamos uuid para dar un identificador corto a cada conexión.
// uuid = generador de ids unicos. Se usa para distinguir conexiones.
const { v4: uuidv4 } = require('uuid');
// Importamos el gestor central de salas de combate.
const { manager } = require('./battle/manager');

// Creamos la aplicación principal de Express.
const app = express();
// Creamos el servidor HTTP real usando la app de Express.
const server = http.createServer(app);
// Elegimos el puerto. Si no hay variable PORT, usamos el 3000.
// process.env.PORT = variable de entorno; permite cambiar el puerto sin tocar el codigo.
const PORT = process.env.PORT || 3000;

// Permitimos peticiones desde el frontend.
app.use(cors());
// Permitimos recibir JSON en el body de las peticiones.
app.use(express.json());

// Guardamos la ruta de la carpeta frontend para servir los archivos estáticos.
// __dirname = carpeta actual de este archivo. path.join une rutas de forma segura.
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
// Hacemos pública la carpeta frontend para que el navegador pueda cargar HTML, CSS y JS.
app.use(express.static(FRONTEND_DIR));

// Guardamos la ruta del archivo de base de datos SQLite.
const DB_PATH = path.join(__dirname, 'db', 'pokehub.db');

// Si no existe la base de datos, paramos el servidor y avisamos.
if (!fs.existsSync(DB_PATH)) {
  console.error('\n❌ BD no encontrada. Ejecuta: node src/db/seed.js\n');
  process.exit(1);
}

// Esta función carga en memoria los datos grandes de Pokémon y movimientos.
function loadEngineData() {
  try {
    // Ruta al dataset de Pokémon del frontend.
    const pokemonFile = path.join(FRONTEND_DIR, 'data', 'sd-pokemon.js');
    // Ruta al dataset de movimientos del frontend.
    const movesFile = path.join(FRONTEND_DIR, 'data', 'sd-moves.js');

    // Si falta alguno de los dos archivos, no seguimos cargando datos.
    if (!fs.existsSync(pokemonFile) || !fs.existsSync(movesFile)) {
      return;
    }

    // Leemos el archivo de Pokémon como texto.
    // readFileSync = leer un archivo y esperar el resultado al instante.
    const pokemonCode = fs
      .readFileSync(pokemonFile, 'utf8')
      // replace cambia un texto por otro dentro del archivo leido.
      // Aqui cambiamos el nombre de la constante para guardarla en una variable global.
      .replace(/const\s+SD_POKEMON\s*=/, 'global.SD_POKEMON_ENGINE =');

    // Leemos el archivo de movimientos como texto.
    const movesCode = fs
      .readFileSync(movesFile, 'utf8')
      // Cambiamos el nombre de la constante para guardarlo en global.
      .replace(/const\s+SD_MOVES\s*=/, 'global.SD_MOVES_ENGINE =');

    // Ejecutamos el código en un contexto aislado en lugar de usar eval directo.
    // global = objeto global de Node donde dejamos guardados los datos para reutilizarlos.
    vm.runInNewContext(pokemonCode, { global });
    // Ejecutamos también el dataset de movimientos en el mismo contexto controlado.
    vm.runInNewContext(movesCode, { global });

    // Mostramos por consola cuántos datos se cargaron.
    console.log(
      `📦 Motor: ${Object.keys(global.SD_POKEMON_ENGINE || {}).length} Pokemon, ` +
      `${Object.keys(global.SD_MOVES_ENGINE || {}).length} movimientos`
    );
  } catch (error) {
    // Si falla la carga, avisamos pero no paramos todo el servidor.
    console.warn('⚠️ Datos SD no cargados:', error.message);
  }
}

// Cargamos los datos del motor una sola vez al arrancar.
loadEngineData();

// Registramos las rutas REST de la API.
// REST = forma comun de organizar la API por recursos.
// Aqui conectamos cada ruta con su archivo correspondiente.
app.use('/api/pokemon', require('./routes/pokemon'));
// Registramos la ruta de movimientos.
app.use('/api/moves', require('./routes/moves'));
// Registramos la ruta de habilidades.
app.use('/api/abilities', require('./routes/abilities'));
// Registramos la ruta de objetos.
app.use('/api/items', require('./routes/items'));
// Registramos la ruta de equipos guardados.
app.use('/api/teams', require('./routes/teams'));

// Ruta simple para crear una sala privada por HTTP.
// app.post = ruta que recibe datos y normalmente crea o modifica algo.
app.post('/api/battle/create', (req, res) => {
  // req = request = datos que llegan desde el cliente.
  // res = response = respuesta que devolvemos al cliente.
  // Creamos la sala usando el formato recibido o uno por defecto.
  const room = manager.createPrivateRoom(req.body.format || 'gen9ou');
  // Devolvemos el id de sala al cliente.
  // res.json = envia un objeto convertido automaticamente a JSON.
  res.json({ roomId: room.roomId, format: room.format });
});

// Ruta de estado para comprobar que la API y la BD están vivas.
app.get('/api/status', (req, res) => {
  // Cargamos la conexión a la base de datos.
  const { getDb } = require('./db/database');
  // Obtenemos la instancia real de SQLite.
  const db = getDb();

  // Devolvemos un resumen útil del estado del proyecto.
  res.json({
    status: 'ok',
    version: '1.0.0',
    pokemon: db.prepare('SELECT COUNT(*) as n FROM pokemon').get().n,
    moves: db.prepare('SELECT COUNT(*) as n FROM moves').get().n,
    abilities: db.prepare('SELECT COUNT(*) as n FROM abilities').get().n,
    items: db.prepare('SELECT COUNT(*) as n FROM items').get().n,
    teams: db.prepare('SELECT COUNT(*) as n FROM teams').get().n,
    activeBattles: manager.rooms.size,
    queue: manager.queue.length,
  });
});

// Cualquier ruta no API devuelve el index para que la web siga siendo una SPA simple.
// Esta ruta comodin devuelve index.html para que la SPA siga funcionando.
// SPA = Single Page Application = una sola pagina que cambia por dentro.
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Creamos el servidor WebSocket usando el mismo server HTTP.
const wss = new WebSocketServer({ server });

// Función auxiliar para mostrar el error de puerto ocupado.
function printPortBusyError() {
  console.error(
    `\nPuerto ${PORT} ocupado. Ya hay otro proceso usando ese puerto.\n` +
    `Cierra el otro servidor o arranca este en otro puerto.\n` +
    `PowerShell: $env:PORT=3001; npm start\n`
  );
}

// Si el WebSocket falla por puerto ocupado, mostramos un mensaje claro.
wss.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    printPortBusyError();
    process.exit(1);
  }
  throw error;
});

// Cuando un cliente se conecta por WebSocket, entra aquí.
// wss.on('connection') se ejecuta cuando un navegador abre un WebSocket.
wss.on('connection', (ws) => {
  // Creamos un id corto para poder identificar esa conexión en consola.
  // slice(0, 8) recorta el id para que sea corto y legible.
  const wsId = uuidv4().slice(0, 8);

  // Avisamos en consola de que se ha conectado alguien.
  console.log(`🔌 WS conectado: ${wsId}`);

  // Cada vez que llega un mensaje por WebSocket, lo procesamos aquí.
  ws.on('message', (data) => {
    try {
      // Convertimos el texto JSON a objeto JavaScript.
      // JSON.parse convierte texto JSON en un objeto JavaScript normal.
      const msg = JSON.parse(data);

      // Miramos qué acción quiere hacer el cliente.
      // switch = estructura para elegir entre varias opciones posibles.
      switch (msg.action) {
        case 'find_battle':
          // Metemos al jugador en la cola para buscar rival.
          manager.joinQueue(ws, {
            name: msg.name || `Trainer_${wsId}`,
            team: msg.team || [],
            teamText: msg.teamText || '',
            teamMode: msg.teamMode || 'builder',
            format: msg.format || 'gen9ou',
          });
          break;

        case 'create_room': {
          // Creamos una sala privada nueva.
          const room = manager.createPrivateRoom(msg.format || 'gen9ou');

          // Añadimos al creador como jugador 1.
          room.addPlayer('p1', ws, msg.name || `Trainer_${wsId}`, {
            team: msg.team || [],
            teamText: msg.teamText || '',
            teamMode: msg.teamMode || 'builder',
          });

          // Avisamos al cliente de que la sala ya existe.
          ws.send(JSON.stringify({ type: 'room_created', roomId: room.roomId, slot: 'p1' }));
          break;
        }

        case 'practice_battle': {
          // Creamos una sala privada para práctica contra bot.
          const practiceRoom = manager.createPrivateRoom(msg.format || 'gen9ou');

          // Añadimos al usuario como jugador 1.
          practiceRoom.addPlayer('p1', ws, msg.name || `Trainer_${wsId}`, {
            team: msg.team || [],
            teamText: msg.teamText || '',
            teamMode: msg.teamMode || 'builder',
          });

          // Añadimos un bot como jugador 2.
          practiceRoom.addBot('p2', msg.botName || 'PokeHub Bot', {
            team: msg.botTeam || msg.team || [],
            teamText: msg.botTeamText || msg.teamText || '',
            teamMode: msg.botTeamMode || msg.teamMode || ((msg.botTeam || msg.team || []).length ? 'builder' : 'random'),
          });

          // Devolvemos al cliente el id de esa sala de práctica.
          ws.send(JSON.stringify({ type: 'room_created', roomId: practiceRoom.roomId, slot: 'p1' }));
          break;
        }

        case 'join_room': {
          // Intentamos unir al cliente a una sala ya existente.
          const room = manager.joinRoom(
            msg.roomId,
            ws,
            msg.name || `Trainer_${wsId}`,
            msg.slot || 'p2',
            {
              team: msg.team || [],
              teamText: msg.teamText || '',
              teamMode: msg.teamMode || 'builder',
            }
          );

          // Si la sala no existe, devolvemos error.
          if (!room) {
            ws.send(JSON.stringify({ type: 'error', code: 'room_not_found' }));
          }
          break;
        }
      }
    } catch (error) {
      // Si el mensaje WebSocket venía mal formado, lo mostramos por consola.
      console.error('WS error:', error.message);
    }
  });

  // Cuando se cierra el socket, quitamos al usuario de la cola.
  // close se lanza cuando el usuario cierra la pestana o pierde la conexion.
  ws.on('close', () => {
    // filter crea un nuevo array dejando fuera el websocket que ya no sirve.
    manager.queue = manager.queue.filter((entry) => entry.ws !== ws);
    console.log(`🔌 WS desconectado: ${wsId}`);
  });

  // Enviamos un saludo inicial con el id de conexión.
  // JSON.stringify hace lo contrario a JSON.parse: convierte objeto a texto JSON.
  ws.send(JSON.stringify({ type: 'hello', id: wsId }));
});

// Si el servidor HTTP falla por puerto ocupado, mostramos el mismo mensaje claro.
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    printPortBusyError();
    process.exit(1);
  }
  throw error;
});

// Arrancamos el servidor.
server.listen(PORT, () => {
  console.log(`\n🚀 PokéHub en http://localhost:${PORT}`);
  console.log(`   API:    http://localhost:${PORT}/api/status`);
  console.log(`   WS:     ws://localhost:${PORT}\n`);
});
