# README - PokeHub

## 1. Que es este proyecto

PokeHub es una **landing page interactiva con front-end y back-end** pensada como **wiki y herramienta de consulta para Pokemon competitivo**.

La idea del proyecto es que el usuario pueda tener abierta esta web mientras juega en Pokemon Showdown o en Pokemon Champions y consultar:

- Pokemon
- movimientos
- habilidades
- objetos
- calculadora de dano
- calculadora de tipos
- constructor de equipos
- analisis de equipo
- equipos guardados

No es un simulador de combates. Es una **web de apoyo y consulta competitiva**.

---

## 2. Tecnologias que he usado

He usado solo tecnologias que entiendo y que puedo explicar:

- `HTML`
- `CSS`
- `JavaScript`
- `JSON`

En el back-end tambien uso:

- `Node.js`
- `Express`
- `SQLite`

Importante:

- He limpiado el proyecto para que la parte entregable no dependa de archivos `.ts`, `.tsx` o `.svg` propios.
- Los datos principales que usa la web estan ya en archivos `.js` y `.json`.

---

## 3. Estructura del proyecto

```text
pokehub/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── db/
│       └── routes/
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── data/
├── showdown-data/
│   ├── abilities.js
│   ├── formats-data.js
│   ├── items.js
│   ├── learnsets.js
│   ├── moves.js
│   ├── natures.js
│   └── pokedex.js
├── DOCUMENTACION-TECNICA.md
├── GUIA-DEFENSA-PROYECTO.md
└── README.md
```

### Explicacion simple

- `frontend/` = lo que ve el usuario
- `backend/` = el servidor y la API
- `showdown-data/` = datos base de Pokemon usados para poblar la base de datos
- `README.md` = explicacion general del proyecto
- `DOCUMENTACION-TECNICA.md` = documentacion mas tecnica
- `GUIA-DEFENSA-PROYECTO.md` = guia para defenderlo en clase

---

## 4. Como iniciar el proyecto

### 4.1 Requisitos

- Tener instalado `Node.js`
- Tener instalado `npm`

### 4.2 Instalacion

Abre una terminal dentro de:

```powershell
cd pokehub/backend
```

Instala dependencias:

```powershell
npm install
```

### 4.3 Si la base de datos no estuviera creada

```powershell
node src/db/seed.js
```

### 4.4 Arrancar el proyecto

```powershell
npm start
```

Y luego abrir en el navegador:

```text
http://localhost:3000
```

### 4.5 Si el puerto 3000 esta ocupado

```powershell
$env:PORT=3001
npm start
```

Y abrir:

```text
http://localhost:3001
```

---

## 5. URL del repositorio

Repositorio publico:

`https://github.com/aabarzuza/PokemonLanding`

La rubrica pide al menos 5 commits.

Este proyecto ya tiene mas de 5 commits, por lo que cumple ese requisito.

---

## 6. Requisitos de la rubrica y como los cumplo

### 6.1 Front-end funcional

Si se cumple.

La web tiene interfaz completa con:

- pagina de inicio
- calculadora de dano
- calculadora de tipos
- constructor de equipos
- analisis de equipo
- equipos guardados
- glosario y buscadores

### 6.2 Back-end funcional

Si se cumple.

El back-end sirve la web y responde a rutas API reales como:

- `/api/status`
- `/api/pokemon`
- `/api/moves`
- `/api/abilities`
- `/api/items`
- `/api/teams`

### 6.3 Al menos una animacion de front-end

Si se cumple.

Uso animaciones como:

- `fadeIn` al mostrar secciones
- `spin` en estados de carga
- efectos `hover` en tarjetas y botones

### 6.4 Uso de al menos tres tipografias

Si se cumple.

Uso:

1. `Source Sans 3`
2. `Space Grotesk`
3. `JetBrains Mono`

### 6.5 Responsive design

Si se cumple.

La web esta preparada para:

- escritorio
- tablet vertical
- tablet horizontal
- movil vertical
- movil horizontal

### 6.6 Minimo de cinco funcionalidades

Si se cumple.

Tengo mas de cinco funcionalidades reales:

1. buscador de Pokemon
2. buscador de movimientos
3. buscador de habilidades
4. buscador de objetos
5. calculadora de dano
6. calculadora de tipos
7. constructor de equipos
8. guardado de equipos
9. analisis de equipo
10. sistema bilingue ES / EN

### 6.7 Documentacion tecnica

Si se cumple.

He incluido:

- `README.md`
- `DOCUMENTACION-TECNICA.md`
- `GUIA-DEFENSA-PROYECTO.md`

### 6.8 Proyecto ejecutable

Si se cumple si se lanza con:

```powershell
cd pokehub/backend
npm install
npm start
```

---

## 7. Las 5 funcionalidades minimas explicadas con codigo

Aqui explico las funcionalidades mas importantes como lo diria yo.

---

### Funcion 1. Navegacion por secciones sin recargar la pagina

Esta funcion sirve para que la web se comporte como una SPA simple.

Archivo:

`frontend/js/app.js`

Fragmento:

```js
function navigateTo(sectionId) {
  navItems.forEach((item) => item.classList.remove('active'));
  sections.forEach((section) => section.classList.remove('active'));

  const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (activeNav) activeNav.classList.add('active');

  const activeSection = document.getElementById(`section-${sectionId}`);
  if (activeSection) activeSection.classList.add('active');

  pageTitle.textContent = sectionTitle(sectionId);
}
```

Explicacion sencilla:

- quita la clase activa de todas las secciones
- activa solo la seccion elegida
- cambia el titulo superior
- asi no hace falta recargar toda la pagina

---

### Funcion 2. Busqueda de Pokemon, movimientos, habilidades y objetos

Esta funcion permite consultar informacion competitiva real.

Archivo:

`frontend/js/pokedex-search.js`

Fragmento:

```js
async function searchPokemon(query) {
  const response = await fetch(`/api/pokemon?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  renderPokemonResults(data.results || []);
}
```

Explicacion sencilla:

- el usuario escribe algo
- JavaScript llama al back-end
- el back-end busca en la base de datos
- el resultado vuelve al navegador
- despues se pinta en pantalla

---

### Funcion 3. Calculadora de dano

Esta funcion compara atacante, defensor, movimiento y condiciones.

Archivo:

`frontend/js/damage-calc.js`

Fragmento:

```js
function buildCalcSection() {
  const root = document.getElementById('calc-section');
  if (!root) return;
  root.innerHTML = buildCalcLayout();
}
```

Explicacion sencilla:

- busca el contenedor de la calculadora
- si existe, genera el contenido
- despues el usuario puede cambiar Pokemon, stats, objetos y movimiento

---

### Funcion 4. Constructor de equipos

Esta funcion deja crear un equipo competitivo de 6 Pokemon.

Archivo:

`frontend/js/teambuilder.js`

Fragmento:

```js
let TEAM = [];
for (let i = 0; i < 6; i++) {
  TEAM.push(emptySlot(i));
}
```

Explicacion sencilla:

- creo un array llamado `TEAM`
- ese array tiene 6 huecos
- cada hueco representa un Pokemon del equipo
- luego cada slot se puede editar con nombre, movimientos, EVs, IVs, objeto y habilidad

Otro fragmento:

```js
function renderGrid() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  grid.innerHTML = '';
}
```

Explicacion sencilla:

- borra y vuelve a dibujar la rejilla del equipo
- asi la interfaz siempre refleja el estado actual del equipo

---

### Funcion 5. Guardar equipos en el back-end

Esta funcion sirve para no perder los equipos creados.

Archivo:

`backend/src/routes/teams.js`

Fragmento representativo:

```js
router.post('/', (req, res) => {
  // guarda un equipo nuevo en la base de datos
});
```

Explicacion sencilla:

- el front-end envia un equipo
- el back-end recibe esos datos
- el back-end los guarda en SQLite
- luego se pueden volver a cargar cuando quieras

---

### Funcion 6. Analisis de equipo

Esta es una de las mejoras nuevas y muestra la cobertura defensiva tipo Marriland.

Archivo:

`frontend/js/team-analysis.js`

Fragmento:

```js
function defensiveMultiplier(entry, abilityName, attackType) {
  const baseValue = typeEffect(attackType, entry.types || []);
  if (!abilityName || abilityName === 'auto') return baseValue;
  return applyAbilityModifier(baseValue, attackType, abilityName);
}
```

Explicacion sencilla:

- coge un tipo atacante, por ejemplo Fuego
- mira los tipos del Pokemon defensor
- calcula si recibe dano normal, si resiste o si es debil
- si la habilidad cambia el resultado, tambien lo aplica

---

### Funcion 7. Sistema bilingue ES / EN

Archivo:

`frontend/js/lang.js`

Fragmento:

```js
window.LANG = urlLang === 'es' || urlLang === 'en'
  ? urlLang
  : (savedLang === 'es' || savedLang === 'en' ? savedLang : 'en');
```

Explicacion sencilla:

- mira si el idioma viene en la URL
- si no, mira si hay uno guardado
- si no hay ninguno, usa uno por defecto
- despues la web cambia sus textos segun ese idioma

---

## 8. Tipografias y justificacion visual

### 1. Source Sans 3

La uso para el texto general porque se lee bien.

### 2. Space Grotesk

La uso para titulos y partes importantes porque da mas personalidad.

### 3. JetBrains Mono

La uso para datos tecnicos, ids y bloques que quedan mejor monoespaciados.

Fragmento:

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Source+Sans+3:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
```

---

## 9. Responsive design

He usado media queries para adaptar la pagina a distintos tamanos.

Fragmento:

```css
@media (max-width: 980px) {
  .analysis-row {
    grid-template-columns: 1fr;
  }
}
```

Explicacion sencilla:

- si la pantalla es mas pequena
- los bloques se recolocan uno debajo de otro
- asi sigue siendo usable en movil o tablet

---

## 10. Animaciones de front-end

Fragmento:

```css
.section {
  display: none;
  animation: fadeIn 180ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Explicacion sencilla:

- cuando cambias de seccion
- no aparece de golpe
- entra con una animacion suave

---

## 11. Por que hay front-end y back-end de verdad

### Front-end

Lo que se ve:

- HTML
- CSS
- JavaScript

### Back-end

Lo que responde por detras:

- Node.js
- Express
- SQLite

Ejemplo:

- el usuario busca `Dragonite`
- el front-end manda la peticion
- el back-end busca en la base de datos
- el resultado vuelve al front-end

---

## 12. Que explicaria yo al profesor en una frase

> Mi proyecto es una landing page interactiva con front-end y back-end que sirve como wiki competitiva de Pokemon. Permite buscar informacion, calcular dano, analizar tipos, construir equipos, guardarlos y estudiar su cobertura defensiva.

---

## 13. Comprobacion final para que no de 0

Antes de entregar, yo comprobaria esto:

1. `npm install` funciona
2. `npm start` funciona
3. la web abre en navegador
4. funcionan los buscadores
5. funciona la calculadora de dano
6. funciona la calculadora de tipos
7. funciona el constructor
8. se pueden guardar equipos
9. funciona el analisis de equipo
10. el repositorio publico abre bien

---

## 14. Conclusion

Con este proyecto cumplo la idea de la rubrica porque:

- tengo front-end funcional
- tengo back-end funcional
- tengo animaciones
- uso tres tipografias
- la web es responsive
- tengo mas de cinco funcionalidades reales
- tengo documentacion
- tengo repositorio publico

Y, sobre todo, el proyecto **se puede ejecutar y probar de verdad**.
