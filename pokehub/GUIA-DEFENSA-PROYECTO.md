# Guía De Defensa De PokéHub

## 1. Qué es este proyecto

PokéHub es una página web hecha para aprender y usar Pokémon competitivo.

Tiene dos partes:

- `frontend`: lo que ve el usuario en el navegador.
- `backend`: el servidor que responde peticiones, guarda equipos y gestiona combates.

## 2. Tecnologías que uso

- `HTML`: para la estructura visual de la página.
- `CSS`: para los estilos.
- `JavaScript`: para la lógica del frontend y del backend.
- `Node.js`: para ejecutar JavaScript en el servidor.
- `Express`: para crear rutas HTTP fácilmente.
- `SQLite`: para guardar datos y equipos.
- `WebSocket`: para que la batalla se actualice en tiempo real.
- `pokemon-showdown`: para usar el simulador real de combates.

## 3. Estructura simple del proyecto

```text
pokehub/
├─ frontend/
│  ├─ index.html
│  ├─ css/
│  ├─ js/
│  └─ data/
├─ backend/
│  ├─ package.json
│  └─ src/
│     ├─ server.js
│     ├─ battle/
│     │  ├─ manager.js
│     │  └─ room.js
│     ├─ db/
│     └─ routes/
└─ GUIA-DEFENSA-PROYECTO.md
```

## 4. Qué hace cada archivo importante

### Frontend

- `frontend/index.html`
  - Es la página principal.
  - Tiene la estructura de secciones como combate, calculadoras y constructor.

- `frontend/js/app.js`
  - Controla la navegación del sidebar.
  - Cambia entre secciones sin salir de la página.

- `frontend/js/battle-client.js`
  - Se conecta al servidor por WebSocket.
  - Dibuja la batalla en pantalla.
  - Muestra movimientos, cambios y mensajes del combate.

- `frontend/js/type-calculator.js`
  - Construye la calculadora de tipos.
  - Calcula ventajas y desventajas ofensivas y defensivas.

### Backend

- `backend/src/server.js`
  - Arranca el servidor.
  - Sirve el frontend.
  - Expone la API.
  - Abre el WebSocket para combates.

- `backend/src/battle/manager.js`
  - Gestiona las salas de batalla.
  - Crea partidas privadas.
  - Hace matchmaking con la cola.

- `backend/src/battle/room.js`
  - Controla una batalla concreta.
  - Usa `pokemon-showdown` para simular el combate.
  - Recibe elecciones del jugador y envía eventos al frontend.

## 5. Flujo simple de funcionamiento

1. El usuario abre la web.
2. `index.html` carga el CSS y los scripts.
3. `app.js` permite navegar por las secciones.
4. Si el usuario entra en combate, `battle-client.js` abre un WebSocket.
5. El backend recibe esa conexión en `server.js`.
6. `manager.js` crea o busca una sala.
7. `room.js` ejecuta la batalla con el simulador de Showdown.
8. El frontend recibe mensajes y actualiza la interfaz.

## 6. Por qué aparecen archivos `.ts`

Respuesta corta para clase:

> Mi proyecto principal está hecho en JavaScript, no en TypeScript. Los archivos `.ts` que aparecen vienen sobre todo de librerías externas, especialmente Pokémon Showdown y archivos de tipos de dependencias. Yo no programo directamente la web en TypeScript, pero sí uso una librería que internamente está relacionada con ese ecosistema.

Respuesta un poco mejor:

- `.ts` significa `TypeScript`.
- TypeScript es como JavaScript, pero con tipos.
- Muchas librerías modernas usan TypeScript o generan archivos `.d.ts` para ayudar al editor.
- Aunque mi proyecto esté escrito en `.js`, al instalar dependencias pueden aparecer archivos `.ts` o `.d.ts`.
- Eso no significa que toda mi web esté hecha en TypeScript.

## 7. Qué puedo decir si me preguntan por la arquitectura

Puedes decir algo así:

> He separado el proyecto en frontend y backend. El frontend se encarga de la interfaz y la interacción del usuario. El backend se encarga de la API, la base de datos y la lógica de combate en tiempo real. Para los combates uso WebSocket porque necesito enviar y recibir acciones al instante, y para la simulación uso Pokémon Showdown.

## 8. Qué puedo decir si me preguntan por la base de datos

> Uso SQLite porque es una base de datos sencilla, local y fácil de integrar en un proyecto pequeño o académico. La uso para guardar información como equipos creados y datos del proyecto sin necesidad de montar un servidor de base de datos más complejo.

## 9. Qué puedo decir si me preguntan por WebSocket

> Uso WebSocket en combate porque una batalla necesita comunicación bidireccional en tiempo real. Con HTTP tendría que hacer muchas peticiones continuamente. Con WebSocket el servidor y el cliente pueden enviarse mensajes al momento.

## 10. Qué puedo decir si me preguntan por Showdown

> No he programado desde cero todas las reglas de Pokémon porque eso sería enorme y muy propenso a errores. Por eso reutilizo el simulador de Pokémon Showdown para la parte de combate, mientras que mi código se encarga de la interfaz, la conexión y la integración con el resto de la web.

## 11. Qué partes he programado yo realmente

Una forma honesta y buena de decirlo:

> Yo he montado la estructura de la web, la navegación, la integración entre frontend y backend, el sistema de equipos, las calculadoras, la conexión en tiempo real y la adaptación del simulador de Showdown al proyecto. También he organizado los datos y la interfaz para que todo funcione como una única aplicación web.

## 12. Preguntas típicas y respuesta corta

### ¿Por qué no usaste React o Angular?

> Porque para este trabajo he preferido una estructura más directa con HTML, CSS y JavaScript clásico, que me permite entender mejor qué hace cada parte.

### ¿Por qué separaste frontend y backend?

> Porque cumplen funciones distintas. El frontend muestra la interfaz y el backend procesa datos, guarda información y controla la lógica del combate.

### ¿Qué ventaja tiene usar Express?

> Simplifica mucho la creación de rutas y middleware en Node.js.

### ¿Qué ventaja tiene usar SQLite?

> Es ligera, fácil de usar y suficiente para un proyecto académico o local.

### ¿Qué parte fue la más compleja?

> La integración del sistema de combate en tiempo real, porque mezcla WebSocket, validación de equipos, simulación de Showdown y representación visual en la interfaz.
