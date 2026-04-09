// === POKEMON TYPE CALCULATOR ===

// Datos de tipos
const TIPOS = [
  { id: "normal", nombre: "Normal", color: "#A8A878" },
  { id: "fire", nombre: "Fuego", color: "#F08030" },
  { id: "water", nombre: "Agua", color: "#6890F0" },
  { id: "electric", nombre: "Electrico", color: "#F8D030" },
  { id: "grass", nombre: "Planta", color: "#78C850" },
  { id: "ice", nombre: "Hielo", color: "#98D8D8" },
  { id: "fighting", nombre: "Lucha", color: "#C03028" },
  { id: "poison", nombre: "Veneno", color: "#A040A0" },
  { id: "ground", nombre: "Tierra", color: "#E0C068" },
  { id: "flying", nombre: "Volador", color: "#A890F0" },
  { id: "psychic", nombre: "Psiquico", color: "#F85888" },
  { id: "bug", nombre: "Bicho", color: "#A8B820" },
  { id: "rock", nombre: "Roca", color: "#B8A038" },
  { id: "ghost", nombre: "Fantasma", color: "#705898" },
  { id: "dragon", nombre: "Dragon", color: "#7038F8" },
  { id: "dark", nombre: "Siniestro", color: "#705848" },
  { id: "steel", nombre: "Acero", color: "#B8B8D0" },
  { id: "fairy", nombre: "Hada", color: "#EE99AC" }
];

// Matriz de efectividad: EFECTIVIDAD[atacante][defensor]
// Orden: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy
const EFECTIVIDAD = {
  normal:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 1, 0.5, 1],
  fire:     [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 1, 2, 1],
  water:    [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1],
  electric: [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1, 1],
  grass:    [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 1],
  ice:      [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 0.5, 1],
  fighting: [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2, 0.5],
  poison:   [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 0, 2],
  ground:   [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 1, 2, 1],
  flying:   [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1],
  psychic:  [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 1],
  bug:      [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 2, 0.5, 0.5],
  rock:     [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 0.5, 1],
  ghost:    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 1],
  dragon:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0.5, 0],
  dark:     [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 0.5],
  steel:    [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 2],
  fairy:    [1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 1]
};

// Estado
let seleccionados = [];
let modo = "pokemon"; // "pokemon" o "ataque"

// Iniciar cuando cargue la pagina
document.addEventListener("DOMContentLoaded", init);

function init() {
  crearHTML();
  bindEventos();
  actualizar();
}

function crearHTML() {
  const container = document.getElementById("pokemon-type-calculator");
  if (!container) return;

  // Botones de modo
  let html = `
    <div class="calc-modos">
      <button id="btn-pokemon" class="modo-btn activo">Mi Pokemon</button>
      <button id="btn-ataque" class="modo-btn">Mi Ataque</button>
    </div>
    <p id="modo-desc" class="modo-desc"></p>
    <div class="calc-tipos">
  `;

  // Botones de tipos
  for (const tipo of TIPOS) {
    html += `<button class="tipo-btn" data-tipo="${tipo.id}" style="background:${tipo.color}">${tipo.nombre}</button>`;
  }

  html += `
    </div>
    <div id="seleccion" class="calc-seleccion"></div>
    <div id="resultados" class="calc-resultados"></div>
    <button id="btn-limpiar" class="btn-limpiar">Limpiar</button>
  `;

  container.innerHTML = html;
}

function bindEventos() {
  // Modo pokemon
  document.getElementById("btn-pokemon").onclick = () => {
    modo = "pokemon";
    actualizar();
  };

  // Modo ataque
  document.getElementById("btn-ataque").onclick = () => {
    modo = "ataque";
    actualizar();
  };

  // Botones de tipos
  document.querySelectorAll(".tipo-btn").forEach(btn => {
    btn.onclick = () => toggleTipo(btn.dataset.tipo);
  });

  // Limpiar
  document.getElementById("btn-limpiar").onclick = () => {
    seleccionados = [];
    actualizar();
  };
}

function toggleTipo(tipoId) {
  const idx = seleccionados.indexOf(tipoId);
  if (idx > -1) {
    seleccionados.splice(idx, 1);
  } else if (seleccionados.length < 2) {
    seleccionados.push(tipoId);
  }
  actualizar();
}

function actualizar() {
  // Actualizar botones de modo
  document.getElementById("btn-pokemon").classList.toggle("activo", modo === "pokemon");
  document.getElementById("btn-ataque").classList.toggle("activo", modo === "ataque");

  // Descripcion
  const desc = modo === "pokemon" 
    ? "Selecciona el tipo de tu Pokemon para ver que ataques te hacen dano"
    : "Selecciona el tipo de tu ataque para ver contra que es efectivo";
  document.getElementById("modo-desc").textContent = desc;

  // Actualizar botones de tipos
  document.querySelectorAll(".tipo-btn").forEach(btn => {
    const sel = seleccionados.includes(btn.dataset.tipo);
    const dis = !sel && seleccionados.length >= 2;
    btn.classList.toggle("seleccionado", sel);
    btn.classList.toggle("deshabilitado", dis);
    btn.disabled = dis;
  });

  // Seleccion actual
  const selDiv = document.getElementById("seleccion");
  if (seleccionados.length === 0) {
    selDiv.innerHTML = "<span class='sin-sel'>Ningun tipo seleccionado</span>";
  } else {
    const label = modo === "pokemon" ? "Tu Pokemon:" : "Tu Ataque:";
    let badges = "";
    for (const id of seleccionados) {
      const tipo = TIPOS.find(t => t.id === id);
      badges += `<span class="badge" style="background:${tipo.color}">${tipo.nombre}</span>`;
    }
    selDiv.innerHTML = `<span class="sel-label">${label}</span>${badges}`;
  }

  // Resultados
  mostrarResultados();
}

function mostrarResultados() {
  const resDiv = document.getElementById("resultados");

  if (seleccionados.length === 0) {
    resDiv.innerHTML = "<p class='vacio'>Selecciona al menos un tipo</p>";
    return;
  }

  // Calcular efectividades
  const resultados = calcularEfectividad();

  // Agrupar por multiplicador
  const grupos = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
  for (const [tipoId, mult] of Object.entries(resultados)) {
    const tipo = TIPOS.find(t => t.id === tipoId);
    if (mult === 4) grupos[4].push(tipo);
    else if (mult === 2) grupos[2].push(tipo);
    else if (mult === 1) grupos[1].push(tipo);
    else if (mult === 0.5) grupos[0.5].push(tipo);
    else if (mult === 0.25) grupos[0.25].push(tipo);
    else if (mult === 0) grupos[0].push(tipo);
  }

  // Labels segun modo
  const labels = modo === "pokemon" 
    ? { 4: "Muy debil (x4)", 2: "Debil (x2)", 1: "Normal (x1)", 0.5: "Resiste (x1/2)", 0.25: "Muy resiste (x1/4)", 0: "Inmune (x0)" }
    : { 4: "Super efectivo (x4)", 2: "Efectivo (x2)", 1: "Normal (x1)", 0.5: "Poco efectivo (x1/2)", 0.25: "Muy poco efectivo (x1/4)", 0: "Sin efecto (x0)" };

  // Orden: x4, x2, x1, x1/2, x1/4, x0
  const orden = [4, 2, 1, 0.5, 0.25, 0];
  const clases = { 4: "x4", 2: "x2", 1: "x1", 0.5: "x05", 0.25: "x025", 0: "x0" };

  let html = "";
  for (const mult of orden) {
    if (grupos[mult].length === 0) continue;
    
    let badges = "";
    for (const tipo of grupos[mult]) {
      badges += `<span class="badge-mini" style="background:${tipo.color}">${tipo.nombre}</span>`;
    }
    
    html += `
      <div class="grupo">
        <div class="grupo-titulo">
          <span class="mult ${clases[mult]}">${labels[mult]}</span>
        </div>
        <div class="grupo-tipos">${badges}</div>
      </div>
    `;
  }

  resDiv.innerHTML = html;
}

function calcularEfectividad() {
  const resultados = {};

  if (modo === "pokemon") {
    // Mi pokemon recibe ataques: calculo cuanto dano hace cada tipo de ataque
    for (const atacante of TIPOS) {
      let mult = 1;
      for (const defensorId of seleccionados) {
        const defIdx = TIPOS.findIndex(t => t.id === defensorId);
        mult *= EFECTIVIDAD[atacante.id][defIdx];
      }
      resultados[atacante.id] = mult;
    }
  } else {
    // Mi ataque: calculo cuanto dano hago a cada tipo
    for (const defensor of TIPOS) {
      let mult = 1;
      for (const atacanteId of seleccionados) {
        const defIdx = TIPOS.findIndex(t => t.id === defensor.id);
        mult *= EFECTIVIDAD[atacanteId][defIdx];
      }
      resultados[defensor.id] = mult;
    }
  }

  return resultados;
}
