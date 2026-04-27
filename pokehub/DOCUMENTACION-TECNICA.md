# Documentacion Tecnica De PokeHub

## 1. Enfoque del proyecto

PokeHub es una **landing page interactiva con front-end y back-end** orientada a servir como **wiki y herramienta de consulta competitiva** mientras el usuario juega en Pokemon Showdown o Pokemon Champions.

No intenta sustituir al simulador oficial, sino acompañarlo con:

- buscadores de Pokemon, movimientos, habilidades y objetos
- calculadora de dano
- calculadora de tipos
- constructor de equipos
- sistema de equipos guardados
- sistema bilingue ES / EN

## 2. URL del repositorio

Repositorio publico:

`https://github.com/aabarzuza/PokemonLanding`

## 3. Como iniciar el proyecto

### 3.1 Requisitos

- Node.js 18 o superior
- npm

### 3.2 Instalacion

Entrar en:

```powershell
cd pokehub/backend
npm install
```

### 3.3 Base de datos

Si la base de datos no estuviera creada:

```powershell
node src/db/seed.js
```

### 3.4 Arranque normal

```powershell
npm start
```

Abrir en el navegador:

```text
http://localhost:3000
```

### 3.5 Si el puerto 3000 esta ocupado

```powershell
$env:PORT=3001
npm start
```

Y abrir:

```text
http://localhost:3001
```

## 4. Estructura general

```text
pokehub/
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── data/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── db/
│       └── battle/
├── README.md
├── GUIA-DEFENSA-PROYECTO.md
└── DOCUMENTACION-TECNICA.md
```

## 5. Front-end y back-end reales

### Front-end

El front-end esta hecho con:

- HTML
- CSS
- JavaScript

Su trabajo es:

- mostrar la interfaz
- navegar entre secciones
- recoger acciones del usuario
- pintar resultados de las APIs

### Back-end

El back-end esta hecho con:

- Node.js
- Express
- SQLite

Su trabajo es:

- servir la web
- responder a las rutas `/api/...`
- consultar la base de datos
- guardar equipos

## 6. Tipografias y criterio visual

El proyecto usa **tres tipografias** distintas con funciones separadas:

1. `Source Sans 3`
   - tipografia principal del cuerpo
   - mejora lectura general

2. `Space Grotesk`
   - tipografia de titulos, branding y botones clave
   - da mas personalidad visual

3. `JetBrains Mono`
   - tipografia para datos tecnicos, ids y bloques monoespaciados
   - util para elementos que recuerdan a herramientas o datos competitivos

Fragmento relevante:

Archivo: `frontend/index.html`

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Source+Sans+3:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
```

Archivo: `frontend/css/main.css`

```css
--font-body: 'Source Sans 3', 'Segoe UI', system-ui, sans-serif;
--font-display: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', Consolas, monospace;
```

## 7. Animacion de front-end

La web incluye varias animaciones suaves:

- `fadeIn` al cambiar de seccion
- `spin` en los estados de carga
- `hover` y elevacion en tarjetas

Fragmento relevante:

Archivo: `frontend/css/sections.css`

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

## 8. Responsive design

La web se adapta a:

- escritorio
- tablet vertical
- tablet horizontal
- movil vertical
- movil horizontal

Se usan `@media` para reorganizar grids, espaciados y paneles.

Fragmentos relevantes:

Archivo: `frontend/css/main.css`

```css
@media (max-width: 1024px) {
  .main-content {
    max-width: none;
    padding: 26px 22px;
  }
}

@media (max-width: 700px) {
  .app {
    margin-left: 0 !important;
  }
}

@media (max-height: 520px) and (orientation: landscape) {
  .main-content {
    padding-top: 14px;
    padding-bottom: 14px;
  }
}
```

Archivo: `frontend/css/sections.css`

```css
@media (max-width: 860px) {
  .consult-hero,
  .consult-grid {
    grid-template-columns: 1fr;
  }
}
```

## 9. Funcionalidades implementadas

El proyecto implementa mas de cinco funcionalidades reales. A continuacion se documentan las principales.

### 9.1 Navegacion SPA por secciones

El usuario navega sin recargar la pagina completa.

Que hace:

- cambia la seccion visible
- actualiza el titulo superior
- permite saltar desde botones internos a otras herramientas

Archivo: `frontend/js/app.js`

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

### 9.2 Sistema bilingue ES / EN

La interfaz cambia entre espanol e ingles.

Que hace:

- guarda preferencia del usuario
- traduce menus y textos
- decide que nombre va primero en resultados bilingues

Archivo: `frontend/js/lang.js`

```js
const urlLang = new URLSearchParams(location.search).get('lang');
const savedLang = localStorage.getItem('pokehub-lang');

window.LANG = urlLang === 'es' || urlLang === 'en'
  ? urlLang
  : (savedLang === 'es' || savedLang === 'en' ? savedLang : 'en');

localStorage.setItem('pokehub-lang', window.LANG);
```

### 9.3 Busqueda de Pokemon, movimientos, habilidades y objetos

La web consulta datos reales desde el backend y los muestra en tarjetas.

Que hace:

- permite buscar en ingles o espanol
- muestra resultados detallados
- sirve como wiki rapida durante una partida externa

Archivo: `frontend/js/pokedex-search.js`

```js
fetch(`/api/pokemon?q=${encodeURIComponent(query)}`)
```

Archivo: `backend/src/server.js`

```js
app.use('/api/pokemon', require('./routes/pokemon'));
app.use('/api/moves', require('./routes/moves'));
app.use('/api/abilities', require('./routes/abilities'));
app.use('/api/items', require('./routes/items'));
```

### 9.4 Calculadora de dano

Permite comparar dos Pokemon y estimar dano competitivo.

Que hace:

- seleccion de atacante y defensor
- ajuste de stats
- lectura de dano estimado

Archivo: `frontend/js/app.js`

```js
if (sectionId === 'calculadora' && typeof buildCalcSection === 'function') {
  setTimeout(buildCalcSection, 50);
}
```

Archivo: `frontend/index.html`

```html
<section id="section-calculadora" class="section">
  <div id="calc-section"></div>
</section>
```

### 9.5 Calculadora de tipos

Herramienta para analizar matchups ofensivos y defensivos.

Que hace:

- permite uno o dos tipos
- agrupa resultados por multiplicador
- sirve para coberturas y debilidades

Archivo: `frontend/js/type-calculator.js`

```js
function typeEffect(attackType, defenseTypes) {
  return defenseTypes.reduce((acc, defenseType) => acc * (TYPE_CHART[attackType]?.[defenseType] ?? 1), 1);
}
```

### 9.6 Constructor de equipos

El usuario puede crear su equipo en formato competitivo.

Que hace:

- editar Pokemon por slot
- importar / exportar formato Showdown
- preparar equipos para consulta o guardado

Archivo: `frontend/js/teambuilder.js`

```js
function exportShowdown() {
```

### 9.7 Equipos guardados con back-end real

La web permite persistir equipos en SQLite.

Que hace:

- guardar
- cargar
- borrar

Archivo: `frontend/js/teams-manager.js`

```js
const teams = await window.PH_API?.teams.getAll() || [];
```

Archivo: `backend/src/server.js`

```js
app.use('/api/teams', require('./routes/teams'));
```

### 9.8 Centro de consulta rapida

Se ha creado una seccion intermedia pensada como companion wiki.

Que hace:

- abre directamente Pokemon, movimientos, habilidades u objetos
- redirige a calculadoras y builder
- simplifica el flujo de uso real durante una partida externa

Archivo: `frontend/index.html`

```html
<button class="btn-primary consult-card-btn" data-open-section="glosario" data-open-tab="pokemon">Abrir Pokémon</button>
```

Archivo: `frontend/js/app.js`

```js
document.addEventListener('click', (event) => {
  const quickBtn = event.target.closest('[data-open-section]');
  if (!quickBtn) return;
  navigateTo(quickBtn.dataset.openSection);
});
```

## 10. Integracion real entre front-end y back-end

La integracion es real porque:

- el front-end llama a rutas `/api/...`
- el backend responde con datos desde SQLite
- el usuario puede guardar y recuperar equipos

Ejemplo:

Archivo: `backend/src/server.js`

```js
app.use('/api/teams', require('./routes/teams'));
```

Archivo: `frontend/js/teams-manager.js`

```js
const saved = await window.PH_API?.teams.save(name, format, code);
```

## 11. Estabilidad y entregabilidad

Medidas tomadas para que la entrega sea revisable:

- scripts claros en `package.json`
- mensaje explicativo si el puerto 3000 esta ocupado
- documentacion de arranque y puerto alternativo
- frontend y backend separados
- estructura de carpetas legible

Fragmento relevante:

Archivo: `backend/package.json`

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "setup": "node src/db/seed.js"
}
```

## 12. Resumen final para defensa

PokeHub cumple la idea de landing page interactiva porque combina:

- interfaz visual completa
- backend real
- varias herramientas funcionales
- responsive
- animaciones
- tipografias justificadas
- documentacion tecnica

El enfoque final del proyecto no es ser un simulador, sino una **wiki competitiva util y ejecutable** que acompana al usuario mientras juega en plataformas externas.
