// app.js
// Este archivo controla la navegacion principal de la pagina.
// "navegacion" = moverse entre apartados sin recargar toda la web.

// getElementById = busca UN elemento por su id.
// sidebar = menu lateral de la izquierda.
const sidebar = document.getElementById('sidebar');
// overlay = capa semitransparente que aparece en movil al abrir el menu.
const overlay = document.getElementById('overlay');
// btnOpen = boton que abre el menu lateral.
const btnOpen = document.getElementById('sidebar-open');
// btnClose = boton que cierra el menu lateral.
const btnClose = document.getElementById('sidebar-close');
// querySelectorAll = busca VARIOS elementos que cumplan una condicion CSS.
// navItems = botones del menu lateral.
const navItems = document.querySelectorAll('.nav-item');
// sections = bloques grandes de contenido de la pagina.
const sections = document.querySelectorAll('.section');
// pageTitle = titulo superior que cambia segun la seccion.
const pageTitle = document.getElementById('page-title');
// cards = tarjetas de inicio que llevan a otras secciones.
const cards = document.querySelectorAll('.card[data-goto]');

// isMobile = true o false segun el ancho actual de la ventana.
// innerWidth = ancho visible del navegador en pixeles.
let isMobile = window.innerWidth <= 700;

// Esta funcion traduce el id de una seccion a un titulo legible.
function sectionTitle(sectionId) {
  // window.t = funcion global de traduccion creada en lang.js.
  // `app.${sectionId}` = plantilla de texto. Ejemplo: app.combate.
  return window.t ? window.t(`app.${sectionId}`) : sectionId;
}

// Decide como debe arrancar el sidebar segun si estamos en movil o no.
function initSidebar() {
  if (isMobile) {
    // classList.add = anade una clase CSS al <body>.
    document.body.classList.add('sidebar-closed');
  } else {
    // classList.remove = quita una clase CSS del <body>.
    document.body.classList.remove('sidebar-closed');
  }
}

// Abre el menu lateral.
function openSidebar() {
  if (isMobile) {
    // En movil abrimos un modo especial para que el menu tape la pantalla.
    document.body.classList.add('sidebar-open-mobile');
    overlay.classList.add('active');
  } else {
    // En escritorio simplemente quitamos el estado de "cerrado".
    document.body.classList.remove('sidebar-closed');
  }
}

// Cierra el menu lateral.
function closeSidebar() {
  if (isMobile) {
    document.body.classList.remove('sidebar-open-mobile');
    overlay.classList.remove('active');
  } else {
    document.body.classList.add('sidebar-closed');
  }
}

// Esta es la funcion mas importante del archivo.
// Cambia la seccion visible de la SPA.
// SPA = Single Page Application = web de una sola pagina que cambia por dentro.
function navigateTo(sectionId) {
  // Recorremos todos los botones del menu y les quitamos la clase activa.
  navItems.forEach((item) => item.classList.remove('active'));
  // Hacemos lo mismo con todas las secciones de contenido.
  sections.forEach((section) => section.classList.remove('active'));

  // Buscamos el boton del menu que corresponde al apartado pedido.
  // data-section = atributo HTML personalizado.
  const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  // Buscamos la seccion real de contenido por su id.
  // Ejemplo: si sectionId es "combate", buscamos "section-combate".
  const activeSection = document.getElementById(`section-${sectionId}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Cambiamos el titulo de la barra superior.
  pageTitle.textContent = sectionTitle(sectionId);

  // En movil cerramos el menu al navegar para dejar espacio al contenido.
  if (isMobile) {
    closeSidebar();
  }

  // setTimeout = ejecuta algo un poco despues.
  // Aqui se usa para esperar a que la seccion ya este visible antes de dibujarla.
  if (sectionId === 'calculadora' && typeof buildCalcSection === 'function') {
    setTimeout(buildCalcSection, 50);
  }

  if (sectionId === 'tipos' && typeof buildTypeCalculatorSection === 'function') {
    setTimeout(buildTypeCalculatorSection, 50);
  }

  if (sectionId === 'equipos' && typeof loadSavedTeams === 'function') {
    setTimeout(loadSavedTeams, 50);
  }

  if (sectionId === 'constructor' && typeof renderGrid === 'function') {
    setTimeout(renderGrid, 50);
  }

  if (sectionId === 'glosario' && window.PH_PENDING_GLOSSARY_TAB && typeof window.activateGlossaryTab === 'function') {
    setTimeout(() => {
      window.activateGlossaryTab(window.PH_PENDING_GLOSSARY_TAB);
      window.PH_PENDING_GLOSSARY_TAB = '';
    }, 50);
  }
}

// addEventListener = escuchar un evento del usuario, por ejemplo un click.
btnOpen?.addEventListener('click', openSidebar);
btnClose?.addEventListener('click', closeSidebar);
overlay?.addEventListener('click', closeSidebar);

// A cada boton del menu le damos su comportamiento.
navItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    // preventDefault = evita el comportamiento HTML por defecto.
    event.preventDefault();
    navigateTo(item.dataset.section);
  });
});

// Las tarjetas del inicio tambien sirven para navegar.
cards.forEach((card) => {
  card.addEventListener('click', () => {
    navigateTo(card.dataset.goto);
  });
});

// Este listener captura enlaces internos creados dinamicamente.
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('link-inline') && event.target.dataset.goto) {
    navigateTo(event.target.dataset.goto);
  }
});

// Estos botones sirven para abrir una seccion concreta desde la wiki rapida.
document.addEventListener('click', (event) => {
  const quickBtn = event.target.closest('[data-open-section]');
  if (!quickBtn) return;

  const nextSection = quickBtn.dataset.openSection;
  const nextTab = quickBtn.dataset.openTab || '';

  if (nextTab) {
    // Guardamos temporalmente que pestana del glosario queremos abrir.
    window.PH_PENDING_GLOSSARY_TAB = nextTab;
  }

  navigateTo(nextSection);
});

// Este bloque hace scroll suave en el indice de la guia de inicio.
document.addEventListener('click', (event) => {
  // closest = busca el elemento mas cercano que cumpla la clase indicada.
  const guideLink = event.target.closest('.guide-index-link');
  if (!guideLink) return;

  // href = destino del enlace. Ejemplo: #section-1
  const href = guideLink.getAttribute('href') || '';
  if (!href.startsWith('#')) return;

  // querySelector busca el bloque destino dentro de la misma pagina.
  const target = document.querySelector(href);
  if (!target) return;

  event.preventDefault();

  // offsetHeight = altura real del header.
  // Se resta para que el titulo no quede escondido bajo la barra fija.
  const header = document.querySelector('.topbar');
  const offset = (header?.offsetHeight || 74) + 18;
  // getBoundingClientRect().top = distancia del elemento respecto a la ventana.
  // window.scrollY = cuanto hemos bajado ya en la pagina.
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  // scrollTo mueve la pantalla a la posicion calculada.
  window.scrollTo({ top, behavior: 'smooth' });
});

// Si el usuario cambia el tamano de la ventana, recalculamos si es movil o no.
window.addEventListener('resize', () => {
  const wasMobile = isMobile;
  isMobile = window.innerWidth <= 700;

  // Si pasamos de movil a escritorio, limpiamos clases de movil.
  if (wasMobile && !isMobile) {
    document.body.classList.remove('sidebar-closed');
    document.body.classList.remove('sidebar-open-mobile');
    overlay.classList.remove('active');
  }

  // Si pasamos de escritorio a movil, cerramos el menu por defecto.
  if (!wasMobile && isMobile) {
    document.body.classList.add('sidebar-closed');
  }
});

// langchange = evento personalizado que lanzamos cuando cambia el idioma.
document.addEventListener('langchange', () => {
  const activeSection = document.querySelector('.nav-item.active')?.dataset.section || 'inicio';
  pageTitle.textContent = sectionTitle(activeSection);
});

// Inicializamos el estado del sidebar al cargar la pagina.
initSidebar();

// Dejamos navigateTo disponible en window para poder usarlo desde otros archivos.
window.navigateTo = navigateTo;
