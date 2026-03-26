# PokéHub — Guía de instalación completa

## Qué necesitas tener instalado
- **Node.js** (v18 o superior) — nodejs.org
- El archivo **pokemon-showdown-master.zip** que ya tienes

---

## Estructura de carpetas que tendrás

```
pokehub/
├── backend/
│   ├── src/
│   │   ├── server.js          ← servidor principal
│   │   ├── routes/            ← rutas de la API
│   │   └── db/
│   │       ├── seed.js        ← puebla la base de datos
│   │       ├── prepare-data.js
│   │       └── pokehub.db     ← se crea automáticamente
│   └── package.json
├── frontend/                  ← tu web (HTML/CSS/JS)
├── showdown-data/             ← datos de Showdown (se crea al hacer setup)
└── README.md
```

---

## Instalación paso a paso

### 1. Descomprime pokemon-showdown-master.zip
Colócalo en cualquier carpeta. Anota la ruta donde está la carpeta `data/` dentro.
Por ejemplo: `C:\Users\TuNombre\Downloads\pokemon-showdown-master\data`

### 2. Abre una terminal dentro de la carpeta `pokehub/backend/`
```
cd pokehub/backend
```

### 3. Instala las dependencias de Node.js (solo la primera vez)
```
npm install
```

### 4. Copia los datos de Showdown
```
node src/db/prepare-data.js "C:\ruta\a\pokemon-showdown-master\data"
```
Sustituye la ruta por donde tengas la carpeta `data` de Showdown.

En Mac/Linux la ruta sería algo como:
```
node src/db/prepare-data.js /home/usuario/pokemon-showdown-master/data
```

### 5. Crea la base de datos (tarda ~30 segundos)
```
node src/db/seed.js
```
Verás algo así:
```
📦 Creando tablas...
🔴 Importando Pokémon...
  ✓ 1380 Pokémon insertados
💥 Importando movimientos...
  ✓ 937 movimientos insertados
✨ Importando habilidades...
  ✓ 314 habilidades insertadas
🎒 Importando objetos...
  ✓ 578 objetos insertados
📚 Importando learnsets...
  ✓ 521847 entradas de learnset insertadas
✅ Base de datos creada en src/db/pokehub.db
```

### 6. Arranca el servidor
```
npm start
```

### 7. Abre tu navegador en:
```
http://localhost:3000
```

¡Ya está! Tu PokéHub está corriendo con backend y base de datos completa.

---

## Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm start` | Arranca el servidor |
| `npm run dev` | Arranca con reinicio automático al editar código |
| `node src/db/seed.js` | Recrea la BD desde cero |

## Endpoints de la API

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/status` | Estado del servidor y conteos |
| `GET /api/pokemon?q=pikachu&type=electric&tier=OU` | Buscar Pokémon |
| `GET /api/pokemon/:id` | Datos completos + learnset de un Pokémon |
| `GET /api/moves?q=earthquake&type=ground&category=physical` | Buscar movimientos |
| `GET /api/moves/:id` | Datos completos + Pokémon que lo aprenden |
| `GET /api/abilities?q=intimidate` | Buscar habilidades |
| `GET /api/abilities/:id` | Datos + Pokémon con esa habilidad |
| `GET /api/items?q=leftovers` | Buscar objetos |
| `GET /api/teams` | Lista de equipos guardados |
| `POST /api/teams` | Guardar un equipo nuevo |
| `PUT /api/teams/:id` | Actualizar un equipo |
| `DELETE /api/teams/:id` | Eliminar un equipo |

## ¿Cómo subirlo a internet?
Cuando quieras publicarlo, puedes usar:
- **Railway** (railway.app) — gratis para empezar
- **Render** (render.com) — gratis con límites
- **VPS propio** — máximo control

En cualquier caso el código no cambia nada, solo la URL del servidor.
