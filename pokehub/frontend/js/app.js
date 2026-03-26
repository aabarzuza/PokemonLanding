// app.js
// Este archivo controla la navegación principal de la página.

// Guardamos una referencia al sidebar.
const sidebar = document.getElementById('sidebar');
// Guardamos una referencia al fondo oscuro que aparece en móvil.
const overlay = document.getElementById('overlay');
// Botón para abrir el sidebar.
const btnOpen = document.getElementById('sidebar-open');
// Botón para cerrar el sidebar.
const btnClose = document.getElementById('sidebar-close');
// Todos los enlaces del menú lateral.
const navItems = document.querySelectorAll('.nav-item');
// Todas las secciones principales de la página.
const sections = document.querySelectorAll('.section');
// Título de la barra superior.
const pageTitle = document.getElementById('page-title');
// Tarjetas de la portada que también navegan a secciones.
const cards = document.querySelectorAll('.card[data-goto]');

// Objeto para traducir el id de una sección a un título legible.
const sectionTitles = {
  inicio: 'Inicio',
  combate: 'Combate',
  calculadora: 'Calculadora de daño',
  tipos: 'Calculadora de tipos',
  constructor: 'Constructor de equipos',
  equipos: 'Mis equipos',
  glosario: 'Glosario y guías',
};

// Variable para saber si estamos en pantalla pequeña.
let isMobile = window.innerWidth <= 700;

// Deja el sidebar abierto en escritorio y cerrado en móvil.
function initSidebar() {
  if (isMobile) {
    document.body.classList.add('sidebar-closed');
  } else {
    document.body.classList.remove('sidebar-closed');
  }
}

// Abre el sidebar.
function openSidebar() {
  if (isMobile) {
    document.body.classList.add('sidebar-open-mobile');
    overlay.classList.add('active');
  } else {
    document.body.classList.remove('sidebar-closed');
  }
}

// Cierra el sidebar.
function closeSidebar() {
  if (isMobile) {
    document.body.classList.remove('sidebar-open-mobile');
    overlay.classList.remove('active');
  } else {
    document.body.classList.add('sidebar-closed');
  }
}

// Cambia a la sección indicada.
function navigateTo(sectionId) {
  // Quitamos la clase active de todos los enlaces del menú.
  navItems.forEach((item) => item.classList.remove('active'));

  // Quitamos la clase active de todas las secciones.
  sections.forEach((section) => section.classList.remove('active'));

  // Buscamos el botón del menú que corresponde a la sección.
  const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

  // Si existe, lo marcamos como activo.
  if (activeNav) {
    activeNav.classList.add('active');
  }

  // Buscamos la sección visual que toca mostrar.
  const activeSection = document.getElementById(`section-${sectionId}`);

  // Si existe, la mostramos.
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Actualizamos el título superior.
  pageTitle.textContent = sectionTitles[sectionId] || sectionId;

  // Si estamos en móvil, cerramos el sidebar después de navegar.
  if (isMobile) {
    closeSidebar();
  }

  // Si entramos en la calculadora de daño, la construimos.
  if (sectionId === 'calculadora' && typeof buildCalcSection === 'function') {
    setTimeout(buildCalcSection, 50);
  }

  // Si entramos en la calculadora de tipos, la construimos.
  if (sectionId === 'tipos' && typeof buildTypeCalculatorSection === 'function') {
    setTimeout(buildTypeCalculatorSection, 50);
  }

  // Si entramos en equipos guardados, los cargamos.
  if (sectionId === 'equipos' && typeof loadSavedTeams === 'function') {
    setTimeout(loadSavedTeams, 50);
  }

  // Si entramos en el constructor, pintamos la grid del equipo.
  if (sectionId === 'constructor' && typeof renderGrid === 'function') {
    setTimeout(renderGrid, 50);
  }
}

// Al pulsar el botón de abrir, abrimos el sidebar.
btnOpen.addEventListener('click', openSidebar);
// Al pulsar el botón de cerrar, cerramos el sidebar.
btnClose.addEventListener('click', closeSidebar);
// Al pulsar el fondo oscuro, cerramos el sidebar.
overlay.addEventListener('click', closeSidebar);

// Cada elemento del menú lateral cambia de sección.
navItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo(item.dataset.section);
  });
});

// Cada tarjeta de la portada también cambia de sección.
cards.forEach((card) => {
  card.addEventListener('click', () => {
    navigateTo(card.dataset.goto);
  });
});

// Algunos textos internos tienen enlaces rápidos entre secciones.
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('link-inline') && event.target.dataset.goto) {
    navigateTo(event.target.dataset.goto);
  }
});

// Si cambia el tamaño de la pantalla, reajustamos el sidebar.
window.addEventListener('resize', () => {
  // Guardamos cómo era antes.
  const wasMobile = isMobile;

  // Recalculamos si ahora es móvil o no.
  isMobile = window.innerWidth <= 700;

  // Si antes era móvil y ahora no, quitamos clases móviles sobrantes.
  if (wasMobile && !isMobile) {
    document.body.classList.remove('sidebar-closed');
    document.body.classList.remove('sidebar-open-mobile');
    overlay.classList.remove('active');
  }

  // Si antes no era móvil y ahora sí, cerramos el sidebar.
  if (!wasMobile && isMobile) {
    document.body.classList.add('sidebar-closed');
  }
});

// Llamamos a la función inicial para dejar el sidebar bien desde el principio.
initSidebar();
