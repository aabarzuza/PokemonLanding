# Guia De Defensa De PokeHub

## 1. Que es PokeHub

PokeHub es una aplicacion web orientada al Pokemon competitivo.

La web permite:

- aprender conceptos basicos del competitivo
- buscar Pokemon, movimientos, habilidades y objetos
- construir equipos
- guardar equipos en base de datos
- calcular dano
- consultar matchups de tipos
- usar una wiki rapida mientras el usuario juega en Showdown o Pokemon Champions

## 2. Como esta dividido el proyecto

El proyecto esta separado en dos partes:

- `frontend`
  - es la parte visual que ve el usuario en el navegador
  - usa `HTML`, `CSS` y `JavaScript`
- `backend`
  - es la parte del servidor
  - usa `Node.js`, `Express`, `SQLite` y `WebSocket`

## 3. Estructura simple

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
│     ├─ db/
│     └─ routes/
└─ GUIA-DEFENSA-PROYECTO.md
```

## 4. Archivos clave que debo saber explicar

### `frontend/index.html`

- contiene la estructura principal de la pagina
- define las secciones del sidebar
- carga todos los archivos `CSS` y `JS`

### `frontend/js/app.js`

- controla la navegacion entre secciones
- abre y cierra el sidebar
- cambia el titulo superior segun la seccion activa

### `frontend/js/lang.js`

- controla el idioma global de la aplicacion
- decide si la web se muestra en espanol o ingles
- cambia textos comunes de la interfaz

### `frontend/js/content-i18n.js`

- traduce el contenido fijo largo de la web
- renderiza la guia de Inicio y otros textos estaticos
- me permite centralizar contenido visible por idioma

### `frontend/js/ui.js`

- sustituye `alert`, `confirm` y `prompt` del navegador
- muestra avisos propios con el estilo de PokeHub
- evita que salga el tipico `localhost dice`

### `frontend/js/pokedex-search.js`

- controla los buscadores de Pokemon, movimientos, habilidades y objetos
- pinta los resultados que vienen del backend
- hace que la web funcione como wiki de consulta

### `frontend/js/type-calculator.js`

- construye la calculadora de tipos
- calcula ventajas, resistencias e inmunidades
- es una de las herramientas principales de consulta

### `backend/src/server.js`

- arranca el servidor
- sirve el frontend
- expone la API REST
- crea el servidor `WebSocket`

### `frontend/js/teams-manager.js`

- guarda y carga equipos usando el backend
- conecta la web visual con la base de datos
- aporta una funcionalidad real de persistencia

## 5. Flujo de funcionamiento

1. El usuario abre la web.
2. `index.html` carga estilos y scripts.
3. `app.js` controla la navegacion.
4. `lang.js` y `content-i18n.js` aplican el idioma.
5. Si el usuario busca Pokemon, movimientos, habilidades u objetos, el frontend llama a la API.
6. `server.js` recibe la peticion.
7. Las rutas del backend consultan SQLite.
8. El frontend recibe los datos y actualiza la interfaz.
9. Si el usuario guarda un equipo, el backend lo persiste en base de datos.

## 6. Tecnologias usadas

- `HTML`
- `CSS`
- `JavaScript`
- `Node.js`
- `Express`
- `SQLite`
- `pokemon-showdown` como fuente de datos y soporte tecnico del ecosistema competitivo

## 6.1 Palabras raras que salen en el codigo y que debo entender

### Palabras del frontend

- `window`
  - es el objeto global del navegador
  - dicho facil: la "caja grande" donde cuelgan variables y funciones visibles para toda la web

- `document`
  - representa la pagina HTML cargada
  - sirve para buscar y modificar elementos de la interfaz

- `getElementById`
  - busca un elemento por su `id`
  - ejemplo: buscar el boton del menu

- `querySelector` / `querySelectorAll`
  - buscan elementos usando selectores CSS
  - `querySelector` devuelve uno
  - `querySelectorAll` devuelve varios

- `addEventListener`
  - sirve para escuchar eventos del usuario
  - ejemplo: click, resize, input

- `classList.add` / `classList.remove`
  - anaden o quitan clases CSS
  - se usan para cambiar el aspecto visual sin tocar el HTML entero

- `dataset`
  - permite leer atributos `data-*` del HTML
  - ejemplo: `data-section="combate"`

- `localStorage`
  - pequena memoria del navegador
  - sirve para guardar cosas simples, como el idioma elegido

- `URLSearchParams`
  - sirve para leer parametros de la URL
  - ejemplo: `?lang=es`

- `setTimeout`
  - ejecuta algo un poco mas tarde
  - se usa para esperar a que una seccion ya este visible antes de dibujarla

- `JSON.parse`
  - convierte texto JSON en objeto JavaScript

- `JSON.stringify`
  - convierte un objeto JavaScript en texto JSON

### Palabras del backend

- `require`
  - importa otro modulo o libreria en Node.js

- `module.exports`
  - exporta algo para que otro archivo pueda usarlo

- `process.env.PORT`
  - lee una variable de entorno
  - sirve para cambiar el puerto sin editar el codigo

- `Map`
  - estructura clave -> valor
  - en este proyecto se usa para guardar salas activas

- `payload`
  - palabra tecnica para decir "paquete de datos"
  - aqui suele contener equipo, modo de equipo y texto importado

- `REST`
  - forma comun de organizar una API por rutas
  - ejemplo: `/api/pokemon`, `/api/moves`

- `WebSocket`
  - canal de comunicacion en tiempo real entre navegador y servidor
  - es clave para que el combate responda al instante

- `uuid`
  - generador de ids unicos
  - se usa para distinguir conexiones

- `vm`
  - herramienta de Node para ejecutar codigo de forma controlada
  - se usa para cargar ciertos datasets sin recurrir a `eval` directo

### Palabras del combate

- `Dex`
  - base de datos interna de Pokemon Showdown
  - contiene informacion de Pokemon, movimientos, tipos y formatos

- `TeamValidator`
  - validador oficial de equipos
  - comprueba si un equipo es legal en el formato elegido

- `BattleStream`
  - flujo principal del simulador
  - por ahi salen los eventos del combate

- `stream`
  - flujo de datos que va llegando poco a poco

- `slot`
  - posicion o lado
  - ejemplo: `p1`, `p2` o un hueco concreto del equipo

- `team preview`
  - fase inicial donde eliges el orden del equipo

- `force switch`
  - cambio forzado
  - ocurre cuando el simulador obliga a sacar otro Pokemon

- `fallback`
  - plan B
  - ejemplo: usar un equipo legal de prueba si el original falla

- `pack` / `import`
  - `import` convierte texto estilo Showdown en objetos
  - `pack` convierte objetos en el formato comprimido que Showdown entiende

## 6.2 Formas cortas de explicar lineas de codigo

- `const PORT = process.env.PORT || 3000;`
  - significa: uso el puerto que me pasen desde fuera, y si no me pasan ninguno uso el 3000

- `const urlLang = new URLSearchParams(location.search).get('lang');`
  - significa: miro si en la URL han puesto un idioma como `?lang=es`

- `localStorage.setItem('pokehub-lang', window.LANG);`
  - significa: guardo el idioma elegido en el navegador

- `app.use(express.static(FRONTEND_DIR));`
  - significa: hago publica la carpeta del frontend para que el navegador pueda cargar sus archivos

- `const msg = JSON.parse(data);`
  - significa: convierto el mensaje recibido en un objeto que JavaScript pueda entender

- `this.rooms = new Map();`
  - significa: creo una estructura para guardar salas usando un id como clave

- `const validator = TeamValidator.get(this.format);`
  - significa: pido a Showdown el comprobador de reglas del formato actual

- `this.streams = getPlayerStreams(this.battleStream);`
  - significa: separo el flujo del simulador para tener una vista para cada jugador

- `navItems.forEach((item) => item.classList.remove('active'));`
  - significa: quito el estado activo de todos los botones del menu

- `window.navigateTo = navigateTo;`
  - significa: dejo esa funcion visible para que otros archivos tambien puedan usarla

## 7. Por que uso JavaScript y no TypeScript

Respuesta corta:

> Mi proyecto principal esta hecho en JavaScript. Si aparecen archivos `.ts` o `.d.ts`, suelen venir de librerias externas instaladas por npm, no de mi codigo principal.

Respuesta un poco mejor:

- `TypeScript` es una extension de JavaScript con tipos
- muchas librerias modernas internamente usan TypeScript
- aunque mi proyecto este en `.js`, algunas dependencias traen archivos `.ts` o `.d.ts`
- eso no significa que yo haya programado toda la web en TypeScript

## 8. Por que tengo frontend y backend separados

Porque hacen trabajos distintos:

- el `frontend` muestra la interfaz y recoge interacciones
- el `backend` guarda datos, responde peticiones y gestiona el combate

Esta separacion hace el proyecto mas ordenado y mas facil de mantener.

## 9. Por que uso SQLite

Respuesta corta:

> Uso SQLite porque es una base de datos ligera, local y suficiente para un proyecto academico.

Ventajas:

- no necesita un servidor aparte
- es facil de integrar
- guarda equipos y datos sin mucha complejidad

## 10. Por que uso WebSocket

Respuesta corta:

> Uso WebSocket porque un combate necesita comunicacion bidireccional en tiempo real.

Con `HTTP` tendria que hacer muchas peticiones continuas.

Con `WebSocket`:

- el cliente envia acciones al instante
- el servidor responde al instante
- el combate se siente en tiempo real

## 11. Por que uso Pokemon Showdown

Respuesta corta:

> Uso el simulador de Pokemon Showdown para no rehacer desde cero todas las reglas del combate Pokemon.

Motivo:

- rehacer todas las reglas reales seria enorme
- seria muy facil cometer errores
- Showdown ya resuelve validacion de equipos, turnos, movimientos y mecanicas

Mi trabajo se centra en:

- la interfaz
- la integracion
- la base de datos
- la navegacion
- las herramientas de apoyo

## 12. Que partes son realmente mias

Una respuesta honesta y buena:

> Yo he desarrollado la estructura de la web, la navegacion, el sistema de idioma, la interfaz de combate, la conexion entre frontend y backend, las calculadoras, el sistema de equipos guardados y la integracion de Pokemon Showdown dentro de una sola aplicacion.

## 13. Que he mejorado para que sea defendible

- estructura mas clara por carpetas
- comentarios explicativos en archivos clave
- sistema de idioma centralizado
- ventanas emergentes propias de la web
- guia de Inicio organizada
- separacion clara entre logica visual y logica de servidor

## 13.1 Archivos comentados para estudiarmelos mejor

- `frontend/js/app.js`
  - aqui he dejado comentarios simples para entender navegacion, eventos y sidebar

- `frontend/js/lang.js`
  - aqui he explicado palabras como `window`, `localStorage`, `URLSearchParams`, `dataset` y el sistema de traduccion

- `backend/src/server.js`
  - aqui he explicado `Express`, `REST`, `WebSocket`, `JSON.parse`, `process.env.PORT`, `uuid` y `vm`

- `backend/src/battle/manager.js`
  - aqui he explicado `Map`, `payload`, `findIndex`, `setInterval` y `module.exports`

- `backend/src/battle/room.js`
  - aqui he explicado `Dex`, `TeamValidator`, `BattleStream`, `pack`, `import`, `slot`, `stream` y otros conceptos del combate

## 13.2 Lo que puedo decir si me piden que explique los comentarios

> He comentado dentro del codigo las palabras en ingles, abreviaturas y conceptos mas tecnicos para poder entender mejor que hace cada linea importante. No he puesto comentarios inutiles en todo, sino en las partes que un alumno de primero podria dudar, como `window`, `JSON.parse`, `payload`, `WebSocket`, `Dex` o `TeamValidator`.

## 14. Preguntas tipicas y respuestas cortas

### Por que no usaste React o Angular

> Porque para este trabajo he preferido una estructura mas directa con HTML, CSS y JavaScript clasico, que me permite entender mejor lo que hace cada parte.

### Por que separaste frontend y backend

> Porque la interfaz y la logica del servidor son responsabilidades distintas.

### Que ventaja tiene Express

> Simplifica mucho la creacion de rutas y middleware en Node.js.

### Que ventaja tiene SQLite

> Es ligera, facil de usar y suficiente para un proyecto academico.

### Que parte fue la mas compleja

> La integracion del combate en tiempo real, porque mezcla WebSocket, validacion de equipos, simulacion de Showdown y representacion visual en la interfaz.

## 15. Frase final para defender el proyecto

> PokeHub es una aplicacion web dividida en frontend y backend. El frontend se encarga de la interfaz y herramientas del usuario, mientras que el backend gestiona datos, equipos y combates en tiempo real. Para la simulacion uso Pokemon Showdown, y para el resto he desarrollado la estructura, la integracion, el sistema de idioma y la experiencia completa de la web.
